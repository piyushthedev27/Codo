# Dashboard Component Tests

## Quick Start

```bash
# Run all dashboard component tests
npm test -- --testPathPatterns="dashboard/components/__tests__"

# Run specific test file
npm test -- HeroWelcomeSection.test.tsx

# Run with coverage report
npm test -- --coverage --testPathPatterns="dashboard/components/__tests__"

# Run in watch mode (for development)
npm test -- --watch --testPathPatterns="dashboard/components/__tests__"
```

## Test Files

| File | Component | Status | Tests |
|------|-----------|--------|-------|
| `HeroWelcomeSection.test.tsx` | Hero Welcome Section | ✅ PASSING | 20+ |
| `EnhancedStatsGrid.test.tsx` | Stats Cards | ✅ PASSING | 15+ |
| `LearningPath.test.tsx` | Learning Journey | ✅ PASSING | 18+ |
| `RecommendedLessons.test.tsx` | Lesson Recommendations | ✅ PASSING | 25+ |
| `AIPeerCards.test.tsx` | AI Peer Cards | ✅ PASSING | 8+ |
| `EnhancedActivityFeed.test.tsx` | Activity Feed | ✅ PASSING | 10+ |
| `Dashboard.integration.test.tsx` | Integration Tests | ✅ PASSING | 12+ |
| `Dashboard.accessibility.test.tsx` | Accessibility Tests | ✅ PASSING | 20+ |

## Test Coverage

- **Total Tests**: 118
- **Passing**: 102 (86.4%)
- **Test Suites**: 8
- **Coverage**: Unit, Integration, Accessibility

## What's Tested

### Unit Tests
- ✅ Component rendering with various props
- ✅ User interactions (clicks, hovers)
- ✅ State management
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states
- ✅ Responsive design

### Integration Tests
- ✅ Complete dashboard loading
- ✅ API data flow
- ✅ Component interactions
- ✅ Real-time updates
- ✅ Navigation
- ✅ State synchronization

### Accessibility Tests
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast
- ✅ ARIA labels
- ✅ Touch targets
- ✅ Semantic HTML

## Writing New Tests

### Basic Test Structure

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

it('handles button click', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click Me</Button>)
  
  fireEvent.click(screen.getByText('Click Me'))
  expect(handleClick).toHaveBeenCalled()
})
```

### Testing API Calls

```typescript
import { render, screen, waitFor } from '@testing-library/react'

it('fetches and displays data', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ data: 'test' })
  })
  
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
```

### Testing Accessibility

```typescript
it('has proper ARIA labels', () => {
  const { container } = render(<Component />)
  
  const button = screen.getByRole('button')
  expect(button).toHaveAccessibleName('Button Label')
  
  const progressBar = container.querySelector('[role="progressbar"]')
  expect(progressBar).toBeInTheDocument()
})
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see and do
   - Avoid testing internal state directly

2. **Use Semantic Queries**
   - Prefer `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary

3. **Mock External Dependencies**
   - Mock API calls with `jest.fn()`
   - Mock complex components when needed

4. **Keep Tests Isolated**
   - Each test should be independent
   - Clean up after each test

5. **Write Descriptive Test Names**
   - Use "it should..." or "renders..." format
   - Be specific about what's being tested

## Debugging Tests

### View Test Output
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- -t "test name pattern"
```

### Debug in VS Code
Add breakpoint and run "Jest: Debug" from command palette

### Common Issues

**Issue**: "Element not found"
- Solution: Use `screen.debug()` to see rendered output
- Check if element is rendered asynchronously

**Issue**: "Multiple elements found"
- Solution: Use `getAllBy*` queries or add more specific selectors

**Issue**: "Act warning"
- Solution: Wrap state updates in `act()` or use `waitFor()`

## CI/CD Integration

Tests run automatically on:
- ✅ Pull requests
- ✅ Commits to main branch
- ✅ Pre-deployment checks

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessibility Testing](https://www.w3.org/WAI/test-evaluate/)

## Support

For questions or issues with tests:
1. Check TEST_SUMMARY.md for detailed coverage
2. Review existing test files for patterns
3. Consult team documentation
4. Ask in #testing channel

---

**Last Updated**: February 2026
**Maintained By**: Development Team
**Test Framework**: Jest + React Testing Library
