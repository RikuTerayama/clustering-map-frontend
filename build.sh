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

# Build the frontend
echo "Building frontend..."
npm run build

echo "Frontend build completed successfully!"
