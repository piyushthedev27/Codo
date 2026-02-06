# Navigation Architecture

Comprehensive navigation system for the Codo learning platform with sidebar navigation, top bar, and responsive mobile support.

## Components

### SidebarNavigation
Vertical navigation bar with icon-based menu.

**Features:**
- Active page highlighting with animated indicator
- Hover effects and smooth transitions
- Collapsible sidebar for desktop (80px collapsed, 240px expanded)
- User profile section at bottom
- Tooltip labels when collapsed
- Badge support for notifications

**Usage:**
```tsx
import { SidebarNavigation } from '@/components/navigation'

<SidebarNavigation 
  collapsed={false}
  onCollapsedChange={(collapsed) => console.log(collapsed)}
/>
```

### TopNavigationBar
Horizontal navigation with notifications, search, and quick actions.

**Features:**
- Notification center with badge counts
- Global search functionality
- Quick action buttons (Start Learning, Ask AI Peer)
- Theme toggle integration
- User profile dropdown
- Responsive design with mobile menu button

**Usage:**
```tsx
import { TopNavigationBar } from '@/components/navigation'

<TopNavigationBar 
  onMenuClick={() => setMobileMenuOpen(true)}
  showMenuButton={true}
/>
```

### DashboardLayout
Complete layout wrapper combining sidebar and top navigation.

**Features:**
- Responsive layout management
- Mobile hamburger menu with overlay
- Automatic sidebar collapse on mobile
- Body scroll prevention when mobile menu open
- Smooth transitions between states

**Usage:**
```tsx
import { DashboardLayout } from '@/components/navigation'

export default function Page() {
  return (
    <DashboardLayout>
      <YourPageContent />
    </DashboardLayout>
  )
}
```

## Navigation Configuration

Navigation items are centrally configured in `navigation-config.ts`:

```typescript
export const navigationConfig: NavigationConfig = {
  sections: [
    {
      id: 'main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: Home,
          description: 'Your learning overview'
        },
        // ... more items
      ]
    }
  ]
}
```

## Responsive Behavior

### Desktop (≥1024px)
- Sidebar visible on left (collapsible)
- Full top navigation with all features
- Content area adjusts based on sidebar state

### Tablet (768px-1023px)
- Sidebar hidden by default
- Hamburger menu button in top bar
- Mobile menu slides in from left

### Mobile (<768px)
- Compact top navigation
- Hamburger menu for navigation
- Touch-optimized interactions

## Active State Management

The navigation automatically highlights the active page based on the current pathname:

```typescript
const isActive = (item: NavigationItem) => {
  if (item.href === '/dashboard') {
    return pathname === '/dashboard'
  }
  return pathname.startsWith(item.href)
}
```

## Customization

### Adding New Navigation Items

Edit `navigation-config.ts`:

```typescript
{
  id: 'new-feature',
  label: 'New Feature',
  href: '/new-feature',
  icon: YourIcon,
  badge: 5, // Optional notification badge
  description: 'Feature description'
}
```

### Styling

All components use Tailwind CSS with dark mode support:
- Light mode: `bg-white text-gray-900`
- Dark mode: `dark:bg-gray-900 dark:text-white`

### Animations

Powered by Framer Motion:
- Sidebar collapse/expand
- Mobile menu slide-in
- Notification dropdown
- Active indicator transition

## Accessibility

- Keyboard navigation support
- ARIA labels for interactive elements
- Focus management in mobile menu
- Screen reader friendly
- Proper semantic HTML

## Performance

- Lazy loading of dropdown content
- Optimized animations (60fps)
- Efficient re-renders with React hooks
- Minimal bundle size impact

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `framer-motion`: Animations
- `lucide-react`: Icons
- `@clerk/nextjs`: User authentication
- `next/navigation`: Routing
