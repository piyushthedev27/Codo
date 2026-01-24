# Contributing Guide

## Welcome Contributors!

Thank you for your interest in contributing to this project! This guide will help you get started with contributing code, documentation, and other improvements.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/your-username/project-name.git
cd project-name

# Add the original repository as upstream
git remote add upstream https://github.com/original-owner/project-name.git
```

### 2. Set Up Development Environment

Follow the [SETUP.md](./SETUP.md) guide to configure your local development environment.

### 3. Create a Branch

```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

## Development Workflow

### Code Style and Standards

#### TypeScript Guidelines
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

#### React Component Guidelines
```typescript
// ✅ Good: Functional component with proper typing
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// ❌ Avoid: Untyped components
export const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

#### File Organization
- Components in `src/components/` with descriptive folder names
- Utilities in `src/lib/` organized by purpose
- Types in `src/types/` with clear naming
- Tests co-located with components using `.test.tsx` suffix

#### CSS and Styling
- Use Tailwind CSS classes for styling
- Create custom CSS only when Tailwind is insufficient
- Follow mobile-first responsive design
- Use CSS variables for theme consistency

```typescript
// ✅ Good: Tailwind classes with responsive design
<div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-gray-800">
  <div className="flex-1 min-w-0">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
      Title
    </h2>
  </div>
</div>
```

### Testing Requirements

#### Unit Tests
Write unit tests for all new components and utilities:

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

#### Integration Tests
Test component interactions and API integrations:

```typescript
// Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';

// Mock API calls
jest.mock('../lib/api', () => ({
  getDashboardData: jest.fn(() => Promise.resolve({
    user: { name: 'Test User' },
    stats: { completedLessons: 5 }
  }))
}));

describe('Dashboard', () => {
  it('displays user data after loading', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('5 lessons completed')).toBeInTheDocument();
    });
  });
});
```

### API Development

#### API Route Guidelines
```typescript
// api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Input validation
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (limit > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100' },
        { status: 400 }
      );
    }

    // Business logic
    const data = await fetchData(userId, limit);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Database Changes

#### Schema Migrations
When making database changes:

1. Create a migration file in `src/lib/database/migrations/`
2. Use descriptive names: `001_add_user_preferences.sql`
3. Include both UP and DOWN migrations
4. Test migrations on a copy of production data

```sql
-- migrations/001_add_user_preferences.sql
-- UP Migration
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_style VARCHAR(20) CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic')),
  peer_interaction_level VARCHAR(10) CHECK (peer_interaction_level IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- DOWN Migration (for rollback)
-- DROP TABLE user_preferences;
```

## Commit Guidelines

### Commit Message Format
Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples
```bash
feat(auth): add social login with Google
fix(dashboard): resolve loading state issue
docs(api): update authentication documentation
test(components): add tests for Button component
refactor(utils): simplify date formatting function
```

### Pull Request Process

#### 1. Before Submitting
- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] No console.log statements left in code
- [ ] TypeScript compilation succeeds

#### 2. Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
```

#### 3. Review Process
1. Automated checks must pass (tests, linting, type checking)
2. At least one code review approval required
3. Address all review feedback
4. Squash commits before merging (if requested)

## Issue Reporting

### Bug Reports
Use the bug report template:

```markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node.js version: [e.g., 18.0.0]

**Screenshots**
Add screenshots if applicable.
```

### Feature Requests
```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Any other relevant information.
```

## Code Review Guidelines

### For Reviewers
- Be constructive and respectful
- Focus on code quality, not personal preferences
- Suggest improvements with explanations
- Approve when code meets standards
- Test the changes locally when possible

### Review Checklist
- [ ] Code is readable and well-documented
- [ ] No obvious bugs or security issues
- [ ] Tests cover new functionality
- [ ] Performance considerations addressed
- [ ] Accessibility guidelines followed
- [ ] Mobile responsiveness maintained

## Documentation

### Code Documentation
```typescript
/**
 * Calculates the user's skill level based on completed lessons and assessments.
 * 
 * @param completedLessons - Number of lessons completed by the user
 * @param assessmentScores - Array of assessment scores (0-100)
 * @returns The calculated skill level ('beginner', 'intermediate', 'advanced')
 * 
 * @example
 * ```typescript
 * const skillLevel = calculateSkillLevel(15, [85, 92, 78]);
 * console.log(skillLevel); // 'intermediate'
 * ```
 */
export function calculateSkillLevel(
  completedLessons: number,
  assessmentScores: number[]
): 'beginner' | 'intermediate' | 'advanced' {
  // Implementation...
}
```

### README Updates
When adding new features, update relevant documentation:
- Component usage examples
- API endpoint documentation
- Configuration options
- Troubleshooting guides

## Performance Guidelines

### Bundle Size
- Monitor bundle size with `npm run analyze`
- Use dynamic imports for large components
- Optimize images and assets
- Remove unused dependencies

### React Performance
```typescript
// ✅ Good: Memoized component
import { memo } from 'react';

interface ExpensiveComponentProps {
  data: ComplexData[];
  onUpdate: (id: string) => void;
}

export const ExpensiveComponent = memo<ExpensiveComponentProps>(({ 
  data, 
  onUpdate 
}) => {
  return (
    <div>
      {data.map(item => (
        <ComplexItem 
          key={item.id} 
          item={item} 
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
});

// ✅ Good: Optimized event handlers
const handleUpdate = useCallback((id: string) => {
  // Update logic
}, []);
```

## Security Guidelines

### Input Validation
```typescript
// ✅ Good: Validate and sanitize inputs
import { z } from 'zod';

const UserInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(13).max(120)
});

export async function createUser(input: unknown) {
  const validatedInput = UserInputSchema.parse(input);
  // Proceed with validated data
}
```

### Environment Variables
- Never commit secrets to version control
- Use different keys for development/production
- Validate required environment variables at startup

## Getting Help

### Resources
- [Architecture Documentation](./ARCHITECTURE.md)
- [Setup Guide](./SETUP.md)
- [API Documentation](./API.md)
- [Testing Checklist](./TESTING_CHECKLIST.md)

### Communication
- Create GitHub issues for bugs and feature requests
- Use GitHub Discussions for questions and ideas
- Join our Discord/Slack for real-time communication

### Mentorship
New contributors are welcome! Don't hesitate to:
- Ask questions in issues or discussions
- Request code review feedback
- Suggest improvements to this guide

Thank you for contributing to making this project better! 🚀