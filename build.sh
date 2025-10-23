#!/bin/bash
# Frontend build script - Python dependencies should not be installed

echo "Building frontend..."

# Ensure we're using Node.js
echo "Node version:"
node --version

echo "NPM version:"
npm --version

# Install all dependencies (including dev dependencies for build)
echo "Installing Node.js dependencies..."
npm install

# Build the frontend using npm run build (which uses local packages)
echo "Building frontend..."
npm run build

# Check if dist directory exists
if [ -d "dist" ]; then
    echo "Build successful! dist directory created."
    ls -la dist/
else
    echo "ERROR: dist directory not found!"
    exit 1
fi

echo "Frontend build completed successfully!"
