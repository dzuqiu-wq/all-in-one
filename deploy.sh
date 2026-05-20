#!/bin/bash
# =============================================================================
# All-in-One Toolbox - Production Deployment Script
# =============================================================================
# Usage: ./deploy.sh [OPTIONS]
#   Options:
#     --no-build    Skip Docker build (use existing images)
#     --force       Force remove existing containers
#     --logs        Show logs after deployment
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="all-in-one-toolbox"
COMPOSE_FILE="docker-compose.yml"

# Parse arguments
SKIP_BUILD=false
FORCE_REMOVE=false
SHOW_LOGS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --no-build)
      SKIP_BUILD=true
      shift
      ;;
    --force)
      FORCE_REMOVE=true
      shift
      ;;
    --logs)
      SHOW_LOGS=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Helper functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# Pre-flight Checks
# =============================================================================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  All-in-One Toolbox Deployment${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Docker is installed
log_info "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
  log_error "Docker is not installed!"
  echo ""
  echo "Please install Docker first:"
  echo "  curl -fsSL https://get.docker.com | sh"
  echo ""
  echo "Or visit: https://docs.docker.com/get-docker/"
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  log_error "Docker Compose is not installed!"
  echo ""
  echo "Please install Docker Compose first:"
  echo "  curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose"
  echo "  chmod +x /usr/local/bin/docker-compose"
  echo ""
  echo "Or install Docker Desktop which includes Compose."
  exit 1
fi

# Get docker compose command
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  DOCKER_COMPOSE="docker compose"
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
  log_error "Docker daemon is not running!"
  echo ""
  echo "Please start Docker:"
  echo "  sudo systemctl start docker"
  echo "  sudo systemctl enable docker"
  exit 1
fi

log_success "All prerequisites satisfied"

# =============================================================================
# Pull Latest Code (if git available)
# =============================================================================
if [ -d ".git" ] && command -v git &> /dev/null; then
  log_info "Checking for updates..."
  if git fetch origin && git status | grep -q "Your branch is behind"; then
    log_warn "There are updates available in the repository"
    read -p "Do you want to pull the latest changes? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git pull origin main
      log_success "Code updated"
    fi
  else
    log_info "Already at latest version"
  fi
else
  log_info "Not a git repository - skipping code sync"
fi

# =============================================================================
# Stop Existing Containers
# =============================================================================
log_info "Stopping existing containers..."
if [ -f "$COMPOSE_FILE" ]; then
  $DOCKER_COMPOSE -f "$COMPOSE_FILE" down $([ "$FORCE_REMOVE" = true ] && echo "--remove-orphans")
  log_success "Containers stopped"
else
  log_error "docker-compose.yml not found!"
  exit 1
fi

# =============================================================================
# Build and Start Services
# =============================================================================
echo ""
log_info "Building and starting services..."

if [ "$SKIP_BUILD" = true ]; then
  log_info "Skipping build (using existing images)..."
  $DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d
else
  $DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d --build
fi

# =============================================================================
# Wait for Health Checks
# =============================================================================
echo ""
log_info "Waiting for services to become healthy..."

# Wait for Nginx (max 60 seconds)
TIMEOUT=60
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if $DOCKER_COMPOSE -f "$COMPOSE_FILE" ps nginx | grep -q "healthy"; then
    log_success "Nginx is healthy"
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
  log_warn "Health check timeout - services may still be starting"
fi

# =============================================================================
# Show Status
# =============================================================================
echo ""
log_success "=========================================="
log_success "  Deployment Complete!"
log_success "=========================================="
echo ""
$DOCKER_COMPOSE -f "$COMPOSE_FILE" ps
echo ""

# =============================================================================
# Service URLs
# =============================================================================
echo -e "${GREEN}Service URLs:${NC}"
echo -e "  Main Site:     http://localhost"
echo -e "  API Health:    http://localhost/health"
echo -e "  API Docs:      http://localhost/docs"
echo ""

# =============================================================================
# Show Logs if Requested
# =============================================================================
if [ "$SHOW_LOGS" = true ]; then
  echo ""
  log_info "Showing logs (Ctrl+C to exit)..."
  $DOCKER_COMPOSE -f "$COMPOSE_FILE" logs -f
fi

echo ""
log_success "Deployment finished at $(date)"
echo ""