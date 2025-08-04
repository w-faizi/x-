# Overview

This is a minimal universal video downloader application with a clean interface featuring just an X logo, input field, and download button. The app supports downloading videos from all major platforms including YouTube, Twitter/X, Instagram, TikTok, Facebook, Reddit, Vimeo, Twitch, Dailymotion, LinkedIn, Terabox, and many more.

The application features a modern React frontend with Tailwind CSS and shadcn/ui components, backed by an Express.js server that handles video downloading using yt-dlp. The system automatically detects the platform from provided URLs and starts downloads immediately without any obstacles or processing delays.

## Recent Changes (August 2025)
- Fixed all TypeScript validation errors and API request handling
- Enhanced yt-dlp configuration with better error handling 
- Removed unreliable platforms (YouTube, Instagram, TikTok, Facebook) from supported list
- Updated to focus on platforms that work reliably: Twitter/X, Reddit, Dailymotion, Streamable, Vimeo, Twitch, Terabox, BitChute, Archive.org, Bandcamp
- Improved error messages with specific feedback for rate limits and authentication issues
- Optimized download formats for better compatibility and faster processing
- Fixed port conflicts and server restart issues
- Successfully tested Twitter/X downloads (644KB video downloaded at 7.58MiB/s)
- Prepared project for GitHub export and Vercel deployment with proper configuration files
- Created Vercel-specific API endpoints and deployment configuration
- Added comprehensive deployment documentation (DEPLOYMENT_README.md)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming support (light/dark modes)
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework using ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schema definitions between client and server
- **Video Processing**: yt-dlp external process spawning for video downloads
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)

## Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon (serverless Postgres)
- **ORM**: Drizzle ORM with migrations support for schema evolution
- **File Storage**: Local filesystem for downloaded video files with organized directory structure
- **Session Storage**: PostgreSQL-backed session store for user session persistence

## Download Management System
- **Platform Detection**: Regex-based URL pattern matching for supported platforms
- **Status Tracking**: Database-backed job status management (pending, processing, completed, failed)
- **Process Management**: Child process spawning for yt-dlp with proper error handling
- **File Organization**: Structured file naming and storage with metadata preservation

## Development and Build System
- **Development**: Vite dev server with HMR and Replit integration
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Shared TypeScript configuration across client, server, and shared modules
- **Path Resolution**: Absolute imports with path mapping for clean module resolution

# External Dependencies

## Core Technologies
- **Database**: Neon PostgreSQL serverless database
- **Video Downloader**: yt-dlp command-line tool for video extraction
- **UI Components**: Radix UI primitives for accessible component foundation

## Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Error Tracking**: Runtime error overlay for development debugging
- **Code Analysis**: Cartographer plugin for Replit code understanding

## API Integrations
- **Platform Support**: Direct integration with video platforms through yt-dlp
  - YouTube (youtube.com, youtu.be)
  - Twitter/X (twitter.com, x.com)
  - Instagram (instagram.com)
  - TikTok (tiktok.com, vm.tiktok.com)
  - Facebook (facebook.com)
  - Terabox (terabox.com)

## Infrastructure
- **Session Management**: PostgreSQL-backed session storage for scalability
- **File Serving**: Express static file serving for downloaded content
- **Process Management**: Node.js child processes for external tool integration