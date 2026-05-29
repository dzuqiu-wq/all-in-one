"""
Application Configuration
Environment-based settings using Pydantic Settings
Production-grade configuration with rate limiting and security settings
"""
import logging
import sys
from pydantic_settings import BaseSettings
from typing import List
import os


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
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))
    root_logger.handlers = []
    root_logger.addHandler(handler)
    
    return root_logger


# Initialize logging on module import
logger = setup_logging()


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application Info
    APP_NAME: str = "All-in-One Toolbox"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS - Production hardening
    CORS_ORIGINS: List[str] = ["https://333654.xyz"]

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
log = logging.getLogger(__name__)
log.info(f"Loaded settings: {settings.APP_NAME} v{settings.APP_VERSION}")
