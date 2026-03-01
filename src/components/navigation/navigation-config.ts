/**
 * Navigation Configuration
 * Centralized configuration for all navigation items
 */

import { NavigationConfig } from './types'

// Icon name type for serialization
export type NavigationIconName =
  | 'Home'
  | 'Network'
  | 'BookOpen'
  | 'Code'
  | 'Users'
  | 'BarChart'
  | 'Settings'
  | 'Trophy'
  | 'Target'
  | 'Lightbulb'

export const navigationConfig: NavigationConfig = {
  sections: [
    {
      id: 'main',
      title: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          iconName: 'Home',
          description: 'Your learning overview'
        },
        {
          id: 'lessons',
          label: 'Lessons',
          href: '/lessons',
          iconName: 'BookOpen',
          description: 'Interactive learning content'
        },
        {
          id: 'knowledge-graph',
          label: 'Knowledge Graph',
          href: '/knowledge-graph-demo',
          iconName: 'Network',
          description: 'Visual skill progression'
        },
        {
          id: 'progress',
          label: 'Progress',
          href: '/insights',
          iconName: 'BarChart',
          description: 'Track your improvement'
        }
      ]
    },
    {
      id: 'practice',
      title: 'Practice',
      items: [
        {
          id: 'code-challenges',
          label: 'Code Challenges',
          href: '/coding/duel',
          iconName: 'Code',
          description: 'Practice coding skills'
        },
        {
          id: 'ai-peers',
          label: 'AI Peers',
          href: '/ai-peers',
          iconName: 'Users',
          description: 'Your study companions'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          href: '/settings',
          iconName: 'Settings',
          description: 'Preferences and account'
        }
      ]
    }
  ]
}
