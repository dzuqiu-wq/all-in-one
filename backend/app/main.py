"""
All-in-One Toolbox Backend API
FastAPI Application Entry Point - Production Grade

Key Features:
- File size pre-validation (5MB hard limit)
- Sliding window rate limiting (5 req/min per IP)
- Semaphore concurrency control (2 concurrent conversions max)
- 5-second hard timeout for Gotenberg operations
- 100% memory-based streaming (no disk I/O)
"""
import asyncio
import io
import time
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

import httpx
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from app.config import (
    settings,
    rate_limiter,
    conversion_semaphore,
    start_cleanup_task
)


# ============================================================================
# Lifespan Management
# ============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"Rate Limit: {settings.RATE_LIMIT_MAX_REQUESTS} req/min per IP")
    print(f"Max Concurrent: {settings.MAX_CONCURRENT_CONVERSIONS} conversions")
    print(f"Max File Size: {settings.MAX_FILE_SIZE_BYTES / 1024 / 1024:.1f}MB")
    print(f"Gotenberg URL: {settings.GOTENBERG_URL}")

    # Start background cleanup task
    cleanup_task = asyncio.create_task(start_cleanup_task())

    yield

    # Shutdown
    cleanup_task.cancel()
    print("Shutting down...")


# ============================================================================
# FastAPI Application
# ============================================================================
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="All-in-One Toolbox Backend API - Production Grade",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Helper Functions
# ============================================================================
def get_client_ip(request: Request) -> str:
    """Extract client IP from request, handling proxies"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def validate_file_size(file: UploadFile) -> bytes:
    """
    Read file content and validate size BEFORE processing.
    Returns file bytes if valid.
    Raises HTTPException if file exceeds limit.
    """
    content = await file.read()

    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)}MB"
        )

    # Reset file position for potential re-read
    await file.seek(0)

    return content


async def call_gotenberg(file_bytes: bytes, filename: str) -> bytes:
    """
    Call Gotenberg service with in-memory file.
    Uses asyncio.Semaphore for concurrency control.
    Implements 5-second hard timeout.

    Returns:
        PDF bytes from Gotenberg

    Raises:
        HTTPException on timeout or error
    """
    async with conversion_semaphore:
        async with httpx.AsyncClient(timeout=settings.GOTENBERG_TIMEOUT) as client:
            # Prepare multipart form data - NO disk I/O
            files = {
                "files": (filename, io.BytesIO(file_bytes), file_bytes.content_type or "application/octet-stream")
            }

            try:
                response = await client.post(
                    f"{settings.GOTENBERG_URL}/forms/libreoffice/convert",
                    files=files
                )
                response.raise_for_status()
                return response.content

            except httpx.TimeoutException:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="Conversion timeout: Gotenberg service took too long (>5s). Please try again."
                )
            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Gotenberg service error: {e.response.status_code}"
                )
            except httpx.RequestError as e:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Gotenberg connection failed: {str(e)}"
                )


# ============================================================================
# Health Check Endpoints
# ============================================================================
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "max_concurrent": settings.MAX_CONCURRENT_CONVERSIONS,
        "max_file_size_mb": settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)
    }


@app.get("/health/gotenberg")
async def gotenberg_health():
    """Check Gotenberg service connectivity"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.GOTENBERG_URL}/health")
            return {
                "status": "connected",
                "gotenberg": "healthy",
                "response_time_ms": response.elapsed.total_seconds() * 1000
            }
    except httpx.TimeoutException:
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={"status": "timeout", "gotenberg": "unreachable"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "gotenberg": str(e)}
        )


# ============================================================================
# Rate Limit Check Middleware
# ============================================================================
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limiting to conversion endpoints"""
    # Only rate limit specific paths
    if request.url.path.startswith("/api/v1/convert/"):
        client_ip = get_client_ip(request)
        is_allowed, remaining, reset_in = await rate_limiter.is_allowed(client_ip)

        if not is_allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {settings.RATE_LIMIT_MAX_REQUESTS} conversions per minute",
                    "retry_after_seconds": reset_in
                },
                headers={
                    "Retry-After": str(reset_in),
                    "X-RateLimit-Limit": str(settings.RATE_LIMIT_MAX_REQUESTS),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_in)
                }
            )

    response = await call_next(request)
    return response


# ============================================================================
# Conversion Endpoints
# ============================================================================
@app.post("/api/v1/convert/word-to-pdf")
async def convert_word_to_pdf(
    request: Request,
    file: UploadFile = File(...)
):
    """
    Convert Word document to PDF using Gotenberg.

    Security Features:
    - 5MB file size limit (validated before processing)
    - 5 requests/minute per IP (sliding window)
    - 2 concurrent conversions max (semaphore)
    - 5 second timeout (hard circuit breaker)

    Memory Flow:
    - Upload -> Memory bytes -> Gotenberg -> Memory bytes -> Stream Response
    - ZERO disk operations
    """
    start_time = time.time()
    client_ip = get_client_ip(request)

    # Log request
    print(f"[REQUEST] {client_ip} -> {request.url.path} | {file.filename}")

    # 1. Validate file size (pre-read, reject early)
    try:
        file_bytes = await validate_file_size(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read file: {str(e)}"
        )

    # 2. Validate file extension
    if file.filename:
        ext = "." + file.filename.split(".")[-1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {ext}. Allowed: {settings.ALLOWED_EXTENSIONS}"
            )

    # 3. Process with 5-second timeout using asyncio.wait_for
    try:
        pdf_bytes = await asyncio.wait_for(
            call_gotenberg(file_bytes, file.filename or "document.docx"),
            timeout=settings.GOTENBERG_TIMEOUT
        )
    except asyncio.TimeoutError:
        elapsed = time.time() - start_time
        print(f"[TIMEOUT] {client_ip} conversion timeout after {elapsed:.2f}s")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Conversion timeout after {settings.GOTENBERG_TIMEOUT}s. Gotenberg may be overloaded."
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] {client_ip} conversion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conversion failed: {str(e)}"
        )

    # 4. Stream response (memory -> response, no disk)
    elapsed = time.time() - start_time
    print(f"[SUCCESS] {client_ip} conversion completed in {elapsed:.2f}s")

    output_filename = file.filename.replace(
        file.filename.split(".")[-1], "pdf"
    ) if file.filename else "converted.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{output_filename}"',
            "X-Processing-Time": f"{elapsed:.3f}s",
            "X-Content-Length": str(len(pdf_bytes))
        }
    )


@app.post("/api/v1/convert/excel-to-pdf")
async def convert_excel_to_pdf(
    request: Request,
    file: UploadFile = File(...)
):
    """Convert Excel spreadsheet to PDF"""
    start_time = time.time()
    client_ip = get_client_ip(request)

    print(f"[REQUEST] {client_ip} -> {request.url.path} | {file.filename}")

    # Validate
    try:
        file_bytes = await validate_file_size(file)
    except HTTPException:
        raise

    ext = "." + file.filename.split(".")[-1].lower() if file.filename else ""
    if ext not in [".xlsx", ".xls"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel files (.xlsx, .xls) are supported"
        )

    # Process
    try:
        pdf_bytes = await asyncio.wait_for(
            call_gotenberg(file_bytes, file.filename or "spreadsheet.xlsx"),
            timeout=settings.GOTENBERG_TIMEOUT
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Conversion timeout. Please try again."
        )

    elapsed = time.time() - start_time
    print(f"[SUCCESS] {client_ip} Excel conversion in {elapsed:.2f}s")

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{file.filename or "converted"}.pdf"',
            "X-Processing-Time": f"{elapsed:.3f}s"
        }
    )


@app.post("/api/v1/convert/powerpoint-to-pdf")
async def convert_powerpoint_to_pdf(
    request: Request,
    file: UploadFile = File(...)
):
    """Convert PowerPoint presentation to PDF"""
    start_time = time.time()
    client_ip = get_client_ip(request)

    print(f"[REQUEST] {client_ip} -> {request.url.path} | {file.filename}")

    try:
        file_bytes = await validate_file_size(file)
    except HTTPException:
        raise

    ext = "." + file.filename.split(".")[-1].lower() if file.filename else ""
    if ext not in [".pptx", ".ppt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PowerPoint files (.pptx, .ppt) are supported"
        )

    try:
        pdf_bytes = await asyncio.wait_for(
            call_gotenberg(file_bytes, file.filename or "presentation.pptx"),
            timeout=settings.GOTENBERG_TIMEOUT
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Conversion timeout. Please try again."
        )

    elapsed = time.time() - start_time
    print(f"[SUCCESS] {client_ip} PPT conversion in {elapsed:.2f}s")

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{file.filename or "converted"}.pdf"',
            "X-Processing-Time": f"{elapsed:.3f}s"
        }
    )


# ============================================================================
# Root Endpoint
# ============================================================================
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "All-in-One Toolbox Backend API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "word_to_pdf": "/api/v1/convert/word-to-pdf",
            "excel_to_pdf": "/api/v1/convert/excel-to-pdf",
            "powerpoint_to_pdf": "/api/v1/convert/powerpoint-to-pdf",
            "gotenberg_health": "/health/gotenberg"
        }
    }