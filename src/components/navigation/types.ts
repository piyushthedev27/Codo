/**
 * Navigation Types and Interfaces
 * Defines the structure for navigation items and configuration
 */

import { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
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
