"""
Application Configuration
Environment-based settings using Pydantic Settings
Production-grade configuration with rate limiting and security settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application Info
    APP_NAME: str = "All-in-One Toolbox"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
    ]

    # Gotenberg Service
    GOTENBERG_URL: str = "http://gotenberg:7000"
    GOTENBERG_TIMEOUT: float = 5.0  # 5 seconds hard timeout

    # File Upload Limits
    MAX_FILE_SIZE_BYTES: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: List[str] = [".docx", ".doc", ".odt", ".xlsx", ".xls", ".pptx", ".ppt", ".txt"]

    # Rate Limiting (Sliding Window)
    RATE_LIMIT_WINDOW_SECONDS: int = 60  # 1 minute window
    RATE_LIMIT_MAX_REQUESTS: int = 5     # 5 requests per window per IP

    # Concurrency Control
    MAX_CONCURRENT_CONVERSIONS: int = 2  # Semaphore limit for LibreOffice instances

    # Security
    RUN_AS_NON_ROOT: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


# ============================================================================
# Rate Limiter - In-Memory Sliding Window Implementation
# ============================================================================
import asyncio
import time
from collections import defaultdict
from typing import Dict, List, Tuple
from dataclasses import dataclass, field


@dataclass
class RateLimitEntry:
    """Single rate limit bucket with timestamps"""
    timestamps: List[float] = field(default_factory=list)


class SlidingWindowRateLimiter:
    """
    In-memory sliding window rate limiter.
    No external dependencies (no Redis) - perfect for single VPS deployment.

    Thread-safe using asyncio.Lock for concurrent access.
    """

    def __init__(
        self,
        window_seconds: int = 60,
        max_requests: int = 5
    ):
        self.window_seconds = window_seconds
        self.max_requests = max_requests
        self._storage: Dict[str, RateLimitEntry] = defaultdict(RateLimitEntry)
        self._lock = asyncio.Lock()

    async def is_allowed(self, client_ip: str) -> Tuple[bool, int, int]:
        """
        Check if request is allowed and remaining quota.

        Returns:
            Tuple of (is_allowed, remaining_requests, reset_in_seconds)
        """
        async with self._lock:
            current_time = time.time()
            window_start = current_time - self.window_seconds

            entry = self._storage[client_ip]

            # Filter out expired timestamps
            entry.timestamps = [
                ts for ts in entry.timestamps
                if ts > window_start
            ]

            # Check rate limit
            if len(entry.timestamps) >= self.max_requests:
                # Calculate when the oldest request will expire
                oldest = min(entry.timestamps)
                reset_in = int(oldest + self.window_seconds - current_time)
                return False, 0, max(1, reset_in)

            # Record this request
            entry.timestamps.append(current_time)

            remaining = self.max_requests - len(entry.timestamps)

            # Calculate reset time
            if entry.timestamps:
                oldest = min(entry.timestamps)
                reset_in = int(oldest + self.window_seconds - current_time)
            else:
                reset_in = self.window_seconds

            return True, remaining, max(1, reset_in)

    async def cleanup_expired(self) -> int:
        """Remove expired entries to prevent memory bloat"""
        async with self._lock:
            current_time = time.time()
            window_start = current_time - self.window_seconds

            removed_count = 0
            for client_ip in list(self._storage.keys()):
                entry = self._storage[client_ip]
                entry.timestamps = [ts for ts in entry.timestamps if ts > window_start]
                if not entry.timestamps:
                    del self._storage[client_ip]
                    removed_count += 1

            return removed_count


# Global rate limiter instance
rate_limiter = SlidingWindowRateLimiter(
    window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS,
    max_requests=settings.RATE_LIMIT_MAX_REQUESTS
)


# ============================================================================
# Concurrency Semaphore - Async Semaphore for LibreOffice Control
# ============================================================================
# Global semaphore limiting concurrent LibreOffice conversions
# This prevents VPS from running out of memory when many conversions happen
conversion_semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_CONVERSIONS)


# ============================================================================
# Cleanup Task - Periodic maintenance
# ============================================================================
async def start_cleanup_task():
    """Background task to clean up expired rate limit entries"""
    while True:
        try:
            await asyncio.sleep(300)  # Run every 5 minutes
            removed = await rate_limiter.cleanup_expired()
            if removed > 0:
                print(f"[CLEANUP] Removed {removed} expired rate limit entries")
        except Exception as e:
            print(f"[CLEANUP] Error during cleanup: {e}")