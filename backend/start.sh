#!/bin/bash
set -e

echo "--- Starting EconoNigeria Backend ---"
echo "1. Seeding Database..."
python -m app.services.seed

echo "2. Starting Uvicorn Server..."
# Railway automatically provides the $PORT environment variable
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
