# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

All-in-One Toolbox is a monorepo with Next.js frontend and FastAPI backend for document conversion and web tools. Production deployment uses Docker Compose with Nginx reverse proxy.

## Architecture

```
[User] -> [Nginx:80/443] -> [Frontend:3000] (Next.js)
                              |-> [Backend:8000] (FastAPI) -> [Gotenberg:7000]
```

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS, next-intl (i18n)
- **Backend**: FastAPI with sliding window rate limiter, semaphore concurrency control
- **PDF Service**: Gotenberg 8 for document-to-PDF conversion
- **Security**: Only Nginx port 80 exposed; internal services communicate via Docker network

## Common Commands

### Frontend (cd frontend)
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint check
```

### Backend (cd backend)
```bash
# Python dependencies
pip install -r requirements.txt

# Development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Python syntax check
python -m py_compile app/main.py app/config.py
```

### Docker
```bash
docker-compose up -d          # Start all services
docker-compose logs -f        # View logs
docker-compose ps             # Check status
docker-compose down            # Stop services
```

## Security Architecture

### IP Extraction
Backend extracts client IP from `X-Real-IP` header (set by Nginx). Do NOT trust `X-Forwarded-For` as it can be spoofed by clients.

### Rate Limiting
- 5 requests/minute per IP (sliding window)
- Uses `async with self._lock` for thread-safe atomic operations
- Located in `backend/app/config.py:SlidingWindowRateLimiter`

### File Validation
- MIME type whitelist validation for upload endpoints
- Extension suffix validation using `str.endswith()` (not `split()[-1]`)
- Content-Type must match allowed types, returns HTTP 415 if invalid

## Key Files

| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI app, conversion endpoints, rate limiter middleware |
| `backend/app/config.py` | Settings, rate limiter, semaphore, cleanup task |
| `frontend/src/app/[locale]/tools/` | Tool pages (word-to-pdf, pdf-merge-split, etc.) |
| `frontend/src/middleware.ts` | Next-intl locale routing |
| `nginx/default.conf` | HTTP reverse proxy config |
| `docker-compose.yml` | Service orchestration |

## Development Notes

### i18n
- Frontend uses next-intl with locale prefix (`/en/`, `/zh/`)
- Use `useLocalizedHref()` utility for locale-aware links
- Translation files in `frontend/src/i18n/messages/`

### Frontend Tool Pages
Tool pages are located in `frontend/src/app/[locale]/tools/`:
- `word-to-pdf/WordToPdfClient.tsx` - Server-side conversion (calls backend API)
- `pdf-merge-split/PdfMergeSplitClient.tsx` - Client-side PDF operations (pdf-lib)
- `image-optimizer/` - Client-side image compression
- `qrcode-generator/` - Client-side QR code generation

### Backend API Endpoints
- `POST /api/v1/convert/word-to-pdf` - Word to PDF (MIME validated)
- `POST /api/v1/convert/excel-to-pdf` - Excel to PDF (MIME validated)
- `POST /api/v1/convert/powerpoint-to-pdf` - PPT to PDF (MIME validated)
- `GET /health` - Health check
- `GET /health/gotenberg` - Gotenberg connectivity check

### Environment Variables
Backend uses pydantic-settings with case-sensitive env var loading. Key settings:
- `GOTENBERG_URL` - Default: `http://gotenberg:7000`
- `GOTENBERG_TIMEOUT` - Default: 5.0 seconds
- `RATE_LIMIT_MAX_REQUESTS` - Default: 5 per window
- `MAX_FILE_SIZE_BYTES` - Default: 5MB