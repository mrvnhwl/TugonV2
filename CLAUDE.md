# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands
- Install dependencies: `npm install`
- Start development server (Frontend): `npm run dev`
- Start development server (API): `npm run dev:api`
- Start both Frontend and API: `npm run dev:all`
- Build project: `npm run build`
- Lint codebase: `npm run lint`

## Architecture & Structure
The project is a Quiz Platform built with a modern JavaScript stack.

### Core Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Zustand (State Management), React Router (Routing).
- **Backend/Database**: Supabase (PostgreSQL) for data storage and authentication.
- **API**: A Node.js API layer (`/api`) used for specialized server-side logic and AI integrations.

### Key Directories
- `src/`: Contains the React frontend application logic, components, and styles.
- `api/`: Contains server-side scripts and the development API server.
- `supabase/`: Contains database migrations, seed data, and Supabase-specific configurations.
- `public/`: Static assets used by the frontend.

### Data Flow
- The frontend interacts primarily with Supabase via the `@supabase/supabase-js` client.
- Complex operations or AI-driven tasks are routed through the custom API layer.
- State is managed globally using Zustand.
