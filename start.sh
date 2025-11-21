#!/bin/bash

# Nubank Tracker Startup Script
# This script builds and starts the application

echo "Starting Nubank Tracker Application..."

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm could not be found. Please install it first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application
echo "Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed. Please check the logs above."
    exit 1
fi

echo "Build completed successfully."

# Start the server
echo "Starting the server..."
node scripts/server.js

echo "Server started successfully."