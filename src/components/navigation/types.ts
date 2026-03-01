/**
 * Navigation Types and Interfaces
 * Defines the structure for navigation items and configuration
 */

import type { NavigationIconName } from './navigation-config'

export interface NavigationItem {
  id: string
  label: string
  href: string
  iconName: NavigationIconName
  badge?: number
  description?: string
}

export interface NavigationSection {
  id: string
  title?: string
  items: NavigationItem[]
}

export interface NavigationConfig {
  sections: NavigationSection[]
}
