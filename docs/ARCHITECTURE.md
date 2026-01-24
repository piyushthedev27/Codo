# Architecture Overview

## System Architecture

This is a Next.js application built with TypeScript that provides AI-powered peer learning and collaborative coding features.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   External      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                      │                      │
├─ React Components   ├─ Dashboard API       ├─ Supabase DB
├─ UI Components      ├─ Onboarding API      ├─ OpenAI API
├─ Context Providers  ├─ User Profile API    ├─ Clerk Auth
└─ Styling (CSS)      └─ Database Test API   └─ Voice Services
```

## Core Components

### Frontend Layer
- **Pages**: Route-based pages using Next.js App Router
  - Marketing pages (`(marketing)`)
  - Authentication pages (`(auth)`)
  - Feature pages (coding, lessons, insights)
- **Components**: Reusable UI components organized by purpose
  - `landing/`: Landing page specific components
  - `shared/`: Common components used across the app
  - `ui/`: Base UI components (buttons, cards, etc.)
  - `unique-features/`: Feature-specific components

### API Layer
- **REST Endpoints**: Next.js API routes for server-side logic
  - `/api/dashboard`: Dashboard data management
  - `/api/onboarding`: User onboarding flow
  - `/api/user/profile`: User profile management
  - `/api/database/test`: Database connectivity testing

### Data Layer
- **Database**: Supabase PostgreSQL database
- **Authentication**: Clerk for user management
- **AI Services**: OpenAI integration for AI-powered features

## Key Features

### 1. AI-Powered Peer Learning
- Synthetic peer generation and interaction
- Skill assessment and personalized learning paths
- Knowledge graph visualization

### 2. Collaborative Coding
- Real-time collaborative coding sessions
- Coding duels with live leaderboards
- Cursor presence and live collaboration

### 3. User Management
- Onboarding flow with skill assessment
- User profiles and progress tracking
- Dashboard with peer interactions

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **AI**: OpenAI API
- **Testing**: Jest + React Testing Library
- **UI Components**: Custom components with Radix UI primitives

## File Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Protected routes
│   ├── (marketing)/    # Public marketing pages
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── landing/        # Landing page components
│   ├── shared/         # Shared components
│   ├── ui/             # Base UI components
│   └── unique-features/ # Feature-specific components
├── contexts/           # React context providers
├── lib/                # Utility libraries
│   ├── ai/             # AI service integrations
│   ├── database/       # Database operations
│   └── voice/          # Voice service configuration
├── styles/             # Additional CSS files
└── types/              # TypeScript type definitions
```

## Development Workflow

1. **Local Development**: Use `npm run dev` for development server
2. **Testing**: Run `npm test` for unit tests
3. **Type Checking**: TypeScript compilation with `npm run build`
4. **Database**: Supabase local development or cloud instance

## Security Considerations

- Row Level Security (RLS) implemented in Supabase
- Environment variables for sensitive configuration
- Clerk authentication for secure user management
- API route protection for authenticated endpoints