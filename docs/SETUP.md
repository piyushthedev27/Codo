# Project Setup Guide

## Prerequisites

Before setting up this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-name>
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Service Setup

### 1. Supabase Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Run the database schema setup:

```bash
# Navigate to the database SQL editor in Supabase dashboard
# Run the following files in order:
# 1. src/lib/database/schema.sql
# 2. src/lib/database/rls-setup.sql
# 3. src/lib/database/security-enhancements.sql
```

### 2. Clerk Authentication Setup

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Get your publishable key and secret key
4. Configure sign-in/sign-up pages in Clerk dashboard

### 3. OpenAI API Setup

1. Create an account at [openai.com](https://openai.com)
2. Generate an API key from the API section
3. Add the key to your environment variables

## Development

### Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Database Operations

### Test Database Connection

Visit `http://localhost:3000/api/database/test` to verify database connectivity.

### Database Schema

The database schema includes:
- User profiles and authentication
- Skill assessments and progress tracking
- Peer interactions and learning sessions
- Knowledge graph data

## Testing

### Run Tests

```bash
npm test
```

### Test Coverage

The project includes tests for:
- React components
- API routes
- Database operations
- Utility functions

## Deployment

### Vercel Deployment (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm run start
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase URL and keys
   - Check database schema is properly set up
   - Ensure RLS policies are configured

2. **Authentication Issues**
   - Verify Clerk keys are correct
   - Check Clerk dashboard configuration
   - Ensure redirect URLs are properly set

3. **AI Service Errors**
   - Verify OpenAI API key
   - Check API usage limits
   - Ensure proper error handling

### Getting Help

- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
- Review component documentation in respective folders
- Check API route documentation in `src/app/api/`

## Development Tips

- Use TypeScript for type safety
- Follow the existing component structure
- Write tests for new features
- Use the provided UI components for consistency
- Follow the established naming conventions