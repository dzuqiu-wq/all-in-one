"""Pytest fixtures for the All-in-One Toolbox backend tests."""
import sys
from pathlib import Path

import pytest_asyncio

# Ensure app is importable
sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest_asyncio.fixture
async def client():
    """Create an httpx AsyncClient bound to the FastAPI ASGI app.

    Uses LifespanManager so the application's startup/shutdown hooks run
    (the lifespan creates the long-lived httpx client on app.state).
    """
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    # Manually invoke the lifespan context so app.state is initialized.
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac