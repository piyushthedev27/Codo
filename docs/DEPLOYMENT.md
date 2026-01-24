# Deployment Guide

## Overview

This guide covers deploying the application to various platforms. The recommended deployment platform is Vercel due to its seamless Next.js integration.

## Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed and configured
- [ ] External services (Clerk, OpenAI, Supabase) set up
- [ ] Build process tested locally
- [ ] Tests passing
- [ ] Security configurations reviewed

## Vercel Deployment (Recommended)

### 1. Prepare Your Repository

Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect to Vercel

1. Visit [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect it's a Next.js project

### 3. Configure Environment Variables

In the Vercel dashboard, add all environment variables:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
CLERK_SECRET_KEY=your_production_clerk_secret

# AI Services
OPENAI_API_KEY=your_production_openai_key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Your app will be available at `https://your-project.vercel.app`

### 5. Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Alternative Deployment Options

### Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Build and Run

```bash
# Build the Docker image
docker build -t your-app-name .

# Run the container
docker run -p 3000:3000 --env-file .env.production your-app-name
```

### AWS Deployment

#### Using AWS Amplify

1. Connect your Git repository to AWS Amplify
2. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. Add environment variables in Amplify console
4. Deploy

#### Using EC2 with PM2

```bash
# On your EC2 instance
npm install -g pm2
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'your-app',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Database Deployment

### Supabase Production Setup

1. Create a production project in Supabase
2. Run database migrations:

```sql
-- Run these in order in Supabase SQL editor
-- 1. schema.sql
-- 2. rls-setup.sql  
-- 3. security-enhancements.sql
```

3. Configure Row Level Security policies
4. Set up database backups
5. Update connection strings in environment variables

### Database Migration Strategy

```bash
# For future schema changes, create migration files
mkdir migrations
echo "-- Migration: Add new feature table
CREATE TABLE feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);" > migrations/001_add_feature_requests.sql
```

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file for production-specific settings:

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Database
DATABASE_URL=postgresql://production_connection_string
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret

# AI Services
OPENAI_API_KEY=your_production_openai_key

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Security
NEXTAUTH_SECRET=your_super_secret_key_for_production
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use different keys for production vs development
- Rotate API keys regularly

### 2. Database Security
- Enable Row Level Security (RLS)
- Use connection pooling
- Regular security updates
- Monitor for suspicious activity

### 3. Application Security
- Enable HTTPS only
- Configure proper CORS settings
- Implement rate limiting
- Use security headers

### 4. Content Security Policy

Add to `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}
```

## Monitoring and Logging

### 1. Application Monitoring

```typescript
// lib/monitoring.ts
export const logError = (error: Error, context?: any) => {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // Send to monitoring service (e.g., Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: context });
  }
};
```

### 2. Performance Monitoring

- Set up Vercel Analytics
- Monitor Core Web Vitals
- Track API response times
- Monitor database query performance

## Backup and Recovery

### 1. Database Backups
- Configure automated daily backups in Supabase
- Test backup restoration process
- Store backups in multiple locations

### 2. Code Backups
- Use Git for version control
- Tag releases for easy rollback
- Maintain staging environment

## Rollback Strategy

### Quick Rollback (Vercel)
1. Go to Vercel dashboard
2. Navigate to "Deployments"
3. Click "Promote to Production" on previous working deployment

### Manual Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

## Performance Optimization

### 1. Build Optimization
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-image-domains.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
}
```

### 2. CDN Configuration
- Use Vercel's global CDN
- Optimize images with Next.js Image component
- Enable gzip compression
- Set proper cache headers

## Troubleshooting Deployment Issues

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies are installed
   - Check for missing environment variables

2. **Runtime Errors**
   - Check application logs
   - Verify database connectivity
   - Confirm API keys are valid

3. **Performance Issues**
   - Monitor bundle size
   - Check for memory leaks
   - Optimize database queries
   - Review API response times

### Debug Commands

```bash
# Check build locally
npm run build
npm run start

# Analyze bundle size
npm run analyze

# Check for security vulnerabilities
npm audit

# Test production build
NODE_ENV=production npm start
```