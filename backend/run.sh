#!/bin/bash

# Load environment variables from .env and start the backend

set -a
source .env
set +a

echo "🚀 Starting backend server on port $PORT..."
go run main.go
