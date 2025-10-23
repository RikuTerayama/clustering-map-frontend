# Clustering Map Frontend

This is the frontend application for Clustering Map, built with React, TypeScript, and Vite.

## Overview

Clustering Map is a web application that analyzes Excel survey data and generates clustering maps for data visualization. This frontend provides an intuitive interface for uploading Excel files, configuring analysis parameters, and visualizing the results.

## Features

- **Excel File Upload**: Upload and process Excel survey data
- **Column Mapping**: Map Excel columns to analysis parameters
- **Tag Management**: Edit and manage data tags
- **Interactive Visualization**: View clustering results with interactive charts
- **Export Options**: Export results as PDF or PNG

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: ECharts
- **Icons**: Lucide React

## Development

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Clean

```bash
npm run clean
```

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: https://clustering-map-api.onrender.com)
- `NODE_ENV`: Environment (production/development)

## Deployment

This application is deployed on Render as a Static Site.

### Manual Deployment

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

## Project Structure

```
clustering-map-frontend/
├── src/
│   ├── components/     # React components
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
├── dist/              # Build output
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # TailwindCSS configuration
└── render.yaml        # Render deployment configuration
```

## API Integration

The frontend communicates with the Clustering Map API backend for:

- File upload and processing
- Data analysis and clustering
- Result visualization
- Export functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
