/**
 * Navigation Configuration
 * Centralized configuration for all navigation items
 */

import {
  Home,
  Network,
  BookOpen,
  Code,
  Users,
  BarChart,
  Settings
} from 'lucide-react'
import { NavigationConfig } from './types'

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
        {
          id: 'knowledge-graph',
          label: 'Knowledge Graph',
          href: '/knowledge-graph-demo',
          icon: Network,
          description: 'Visual skill progression'
        },
        {
          id: 'lessons',
          label: 'Lessons',
          href: '/lessons',
          icon: BookOpen,
          description: 'Interactive learning content'
        },
        {
          id: 'code-challenges',
          label: 'Code Challenges',
          href: '/coding/duel/test',
          icon: Code,
          description: 'Practice coding skills'
        },
        {
          id: 'ai-peers',
          label: 'AI Peers',
          href: '/dashboard#ai-peers',
          icon: Users,
          description: 'Your study companions'
        },
        {
          id: 'progress',
          label: 'Progress Analytics',
          href: '/insights',
          icon: BarChart,
          description: 'Track your improvement'
        }
      ]
    },
    {
      id: 'settings',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          href: '/dashboard#settings',
          icon: Settings,
          description: 'Preferences and account'
        }
      ]
    }
  ]
}
