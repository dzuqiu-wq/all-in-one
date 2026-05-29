"""
Application Configuration
Environment-based settings using Pydantic Settings
Production-grade configuration with rate limiting and security settings
"""
import asyncio
import logging
import os
import sys
import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Tuple

from pydantic_settings import BaseSettings


# ============================================================================
# Logging Configuration
# ============================================================================
def setup_logging():
    """Configure application-wide logging."""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, log_level, logging.INFO))
    
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))
    root_logger.handlers = []
    root_logger.addHandler(handler)
    
    return root_logger


logger = setup_logging()


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    APP_NAME: str = "All-in-One Toolbox"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["https://333654.xyz"]
    GOTENBERG_URL: str = "http://gotenberg:7000"
    GOTENBERG_TIMEOUT: float = 5.0
    MAX_FILE_SIZE_BYTES: int = 5 * 1024 * 1024
    ALLOWED_EXTENSIONS: List[str] = [".docx", ".doc", ".odt", ".xlsx", ".xls", ".pptx", ".ppt", ".txt"]
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_MAX_REQUESTS: int = 5
    MAX_CONCURRENT_CONVERSIONS: int = 2
    RUN_AS_NON_ROOT: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


# ============================================================================
# Rate Limiter
# ============================================================================
@dataclass
class RateLimitEntry:
    timestamps: List[float] = field(default_factory=list)


class SlidingWindowRateLimiter:
    def __init__(self, window_seconds: int = 60, max_requests: int = 5):
        self.window_seconds = window_seconds
        self.max_requests = max_requests
        self._storage: Dict[str, RateLimitEntry] = defaultdict(RateLimitEntry)
        self._lock = asyncio.Lock()
        self._denied_count: int = 0

    async def is_allowed(self, client_ip: str) -> Tuple[bool, int, int]:
        async with self._lock:
            current_time = time.time()
            window_start = current_time - self.window_seconds
            entry = self._storage[client_ip]
            entry.timestamps = [ts for ts in entry.timestamps if ts > window_start]
            
            if len(entry.timestamps) >= self.max_requests:
                self._denied_count += 1
                oldest = min(entry.timestamps)
                reset_in = int(oldest + self.window_seconds - current_time)
                return False, 0, max(1, reset_in)
            
            entry.timestamps.append(current_time)
            remaining = self.max_requests - len(entry.timestamps)
            oldest = min(entry.timestamps) if entry.timestamps else current_time
            reset_in = int(oldest + self.window_seconds - current_time)
            return True, remaining, max(1, reset_in)

    async def cleanup_expired(self) -> int:
        async with self._lock:
            current_time = time.time()
            window_start = current_time - self.window_seconds
            removed = 0
            for client_ip in list(self._storage.keys()):
                entry = self._storage[client_ip]
                entry.timestamps = [ts for ts in entry.timestamps if ts > window_start]
                if not entry.timestamps:
                    del self._storage[client_ip]
                    removed += 1
            return removed

    def get_denied_count(self) -> int:
        """Return total rate-limit denials since startup."""
        return self._denied_count


rate_limiter = SlidingWindowRateLimiter(
    window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS,
    max_requests=settings.RATE_LIMIT_MAX_REQUESTS
)


# ============================================================================
# Concurrency Control
# ============================================================================
conversion_semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_CONVERSIONS)


# ============================================================================
# Cleanup Task
# ============================================================================
async def start_cleanup_task():
    while True:
        try:
            await asyncio.sleep(300)
            removed = await rate_limiter.cleanup_expired()
            if removed > 0:
                print(f"[CLEANUP] Removed {removed} expired rate limit entries")
        except Exception as e:
            print(f"[CLEANUP] Error during cleanup: {e}")
