# Codo System Guide

This guide provides a technical overview of the Codo platform, explaining how the different components work together to deliver an AI-powered learning experience.

## 🏗️ Architecture Overview

Codo is built on a modern, serverless-ready architecture leveraging Next.js and specialized cloud services.

### Core Technology Stack
- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, Framer Motion.
- **Backend**: Next.js Server Components and Route Handlers.
- **Database**: Supabase (PostgreSQL) with Row-Level Security (RLS).
- **Authentication**: Clerk for secure user management and session handling.
- **AI Engine**: OpenAI GPT-4 for peer personality simulation and content generation.
- **Real-time**: Supabase Realtime for collaborative coding and live dashboard updates.

## 🧱 System Structure

- `src/app/`: The heart of the application, containing all routes, layouts, and API endpoints.
- `src/components/`: Modular UI components categorized by feature (e.g., `landing`, `dashboard`, `navigation`).
- `src/lib/`: Core services and utilities:
    - `ai/`: Tools for interacting with OpenAI.
    - `database/`: Supabase client, operations, and [migration guides](file:///d:/Piyush%20Dev/Development/Next%20js/Codo%20v1.1/src/lib/database/README.md).
    - `voice/`: Logic for speech recognition and synthesis.
- `src/types/`: Centralized TypeScript definitions to ensure type safety across the project.

## 🚀 Key Features Implementation

### AI Voice Coaching
The voice coach uses the browser's native `SpeechRecognition` and `SpeechSynthesis` APIs. It's designed to provide contextual help without requiring user input via a keyboard.
- **Hook**: `useVoiceCoaching` manages the state of the voice interaction.
- **Database Backend**: Responses can be dynamically configured in the `coaching_responses` table.

### Collaborative Coding
Real-time collaboration is achieved through Supabase Realtime's broadcast and presence features.
- **Sync**: Code changes are broadcasted to all participants in a session.
- **Cursors**: Live cursor tracking shows where each peer is currently working.

### Learning Dashboard
A unified interface that aggregates data from multiple sources to provide a comprehensive view of the user's progress.
- **Real-time Stats**: Uses WebSockets to update stats immediately as lessons are completed.

## 📡 API Reference Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/dashboard` | GET | Aggregates user stats, peer status, and recommended lessons. |
| `/api/onboarding` | POST | Processes the initial skill assessment and sets up the user profile. |
| `/api/user/profile` | GET/PUT | Handles user settings and proficiency level updates. |
| `/api/ai/coach` | POST | Interfaces with OpenAI to generate contextual coaching advice. |

## 🛠️ Maintenance & Deployment

- **Deployment**: Optimized for Vercel.
- **Database Migrations**: SQL migrations are located in `src/lib/database/migrations/`. See the [Database Guide](file:///d:/Piyush%20Dev/Development/Next%20js/Codo%20v1.1/src/lib/database/README.md) for more details.
- **Type Checking**: Run `npm run type-check` to verify types across the codebase.

---

**Last Updated**: March 1, 2026
