"""Tests for the main FastAPI application endpoints."""
import pytest


@pytest.mark.unit
async def test_root_endpoint(client):
    """The root endpoint returns 200 with a welcome message."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data or "status" in data


@pytest.mark.unit
async def test_health_endpoint(client):
    """The /health endpoint returns 200 with status payload."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data


@pytest.mark.integration
async def test_gotenberg_health(client):
    """The /health/gotenberg endpoint responds.

    - 200 if Gotenberg is reachable
    - 503 if Gotenberg is unreachable (service down)
    - 504 if Gotenberg DNS or connection times out (no network)
    """
    response = await client.get("/health/gotenberg")
    assert response.status_code in (200, 503, 504)


@pytest.mark.unit
async def test_invalid_file_type_rejected(client):
    """Uploading a plain text file to word-to-pdf returns 415."""
    files = {"file": ("test.txt", b"hello world", "text/plain")}
    response = await client.post("/api/v1/convert/word-to-pdf", files=files)
    assert response.status_code in (415, 422)


@pytest.mark.unit
async def test_missing_file_rejected(client):
    """Posting without a file returns 422 (validation error)."""
    response = await client.post("/api/v1/convert/word-to-pdf")
    assert response.status_code == 422


@pytest.mark.unit
async def test_excel_invalid_file_type(client):
    """Uploading invalid file type to excel-to-pdf returns 415."""
    files = {"file": ("test.txt", b"not an excel", "text/plain")}
    response = await client.post("/api/v1/convert/excel-to-pdf", files=files)
    assert response.status_code in (415, 422)


@pytest.mark.unit
async def test_excel_missing_file(client):
    """Posting without a file to excel endpoint returns 422."""
    response = await client.post("/api/v1/convert/excel-to-pdf")
    assert response.status_code == 422


@pytest.mark.unit
async def test_powerpoint_invalid_file_type(client):
    """Uploading invalid file type to powerpoint-to-pdf returns 415."""
    files = {"file": ("test.txt", b"not a pptx", "text/plain")}
    response = await client.post("/api/v1/convert/powerpoint-to-pdf", files=files)
    assert response.status_code in (415, 422)


@pytest.mark.unit
async def test_powerpoint_missing_file(client):
    """Posting without a file to powerpoint endpoint returns 422."""
    response = await client.post("/api/v1/convert/powerpoint-to-pdf")
    assert response.status_code == 422