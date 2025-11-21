# Nubank Tracker

A financial tracking application for Nubank investments.

## Features

- Track your Nubank investments and their performance
- Store data in a local SQLite database
- User authentication system
- Responsive design for all devices

## Quick Start

### Development Mode

To run the application in development mode:
```bash
npm run dev
```

This will start the Vite development server, typically on http://localhost:8080

### Production Mode

To build and serve the application in production mode:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm run server
   ```

This will start the Express server on http://localhost:3000

## Deployment

For deploying to your home server (192.168.100.117), please refer to the deployment guides:

- [Portuguese Deployment Guide](DEPLOYMENT_GUIDE.md) - Complete instructions in Portuguese
- [English Deployment Guide](DEPLOYMENT_GUIDE_EN.md) - Complete instructions in English

## Project Structure

```
src/
  components/    # React components
  contexts/      # React contexts (AuthContext)
  hooks/         # Custom hooks
  lib/           # Utility functions
  pages/         # Page components
  services/      # Business logic and data services
  types/         # TypeScript types
  utils/         # Utility functions
```

## Technology Stack

- React 18 with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- shadcn/ui components
- SQLite for data storage
- Express.js for server functionality

## Data Persistence

The application stores data in two ways:

1. **Browser Mode**: Uses localStorage to persist data between sessions
2. **Server Mode**: Uses a local SQLite database file in the `data/` directory

In both cases, your data is stored locally on your machine and is not sent to any external servers.