/**
 * Mobile Layout Optimization Utilities
 * Provides responsive layout adjustments for small screens
 */

export interface ViewportInfo {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  devicePixelRatio: number
}

export interface LayoutBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

export class LayoutOptimizer {
  private breakpoints: LayoutBreakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  }

  private listeners: ((viewport: ViewportInfo) => void)[] = []
  private currentViewport: ViewportInfo | null = null

  constructor(customBreakpoints?: Partial<LayoutBreakpoints>) {
    if (customBreakpoints) {
      this.breakpoints = { ...this.breakpoints, ...customBreakpoints }
    }

    if (typeof window !== 'undefined') {
      this.updateViewport()
      window.addEventListener('resize', this.handleResize.bind(this))
      window.addEventListener('orientationchange', this.handleOrientationChange.bind(this))
    }
  }

  /**
   * Get current viewport information
   */
  public getViewport(): ViewportInfo {
    if (!this.currentViewport) {
      this.updateViewport()
    }
    return this.currentViewport!
  }

  /**
   * Subscribe to viewport changes
   */
  public subscribe(callback: (viewport: ViewportInfo) => void): () => void {
    this.listeners.push(callback)
    
    // Call immediately with current viewport
    if (this.currentViewport) {
      callback(this.currentViewport)
    }

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Optimize element layout for mobile
   */
  public optimizeForMobile(element: HTMLElement): void {
    const viewport = this.getViewport()
    
    if (viewport.isMobile) {
      // Add mobile-specific classes
      element.classList.add('mobile-optimized')
      
      // Adjust spacing
      this.adjustSpacing(element, 'mobile')
      
      // Optimize text size
      this.optimizeTextSize(element, viewport)
      
      // Adjust grid layouts
      this.optimizeGridLayouts(element)
      
      // Optimize form elements
      this.optimizeFormElements(element)
    }
  }

  /**
   * Create responsive grid system
   */
  public createResponsiveGrid(
    element: HTMLElement,
    config: {
      mobile: number
      tablet: number
      desktop: number
      gap?: string
    }
  ): void {
    const viewport = this.getViewport()
    let columns: number

    if (viewport.isMobile) {
      columns = config.mobile
    } else if (viewport.isTablet) {
      columns = config.tablet
    } else {
      columns = config.desktop
    }

    element.style.display = 'grid'
    element.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    element.style.gap = config.gap || '1rem'
    
    // Add responsive class
    element.classList.add('responsive-grid')
  }

  /**
   * Optimize card layouts for mobile
   */
  public optimizeCardLayout(container: HTMLElement): void {
    const viewport = this.getViewport()
    const cards = container.querySelectorAll('.card, [class*="card"]')

    cards.forEach((card) => {
      const cardElement = card as HTMLElement
      
      if (viewport.isMobile) {
        // Stack cards vertically on mobile
        cardElement.style.width = '100%'
        cardElement.style.marginBottom = '1rem'
        
        // Reduce padding
        cardElement.style.padding = '1rem'
        
        // Optimize card content
        this.optimizeCardContent(cardElement)
      } else if (viewport.isTablet) {
        // Two columns on tablet
        cardElement.style.width = 'calc(50% - 0.5rem)'
        cardElement.style.marginBottom = '1rem'
      } else {
        // Reset to default on desktop
        cardElement.style.width = ''
        cardElement.style.marginBottom = ''
        cardElement.style.padding = ''
      }
    })
  }

  /**
   * Optimize navigation for mobile
   */
  public optimizeNavigation(nav: HTMLElement): void {
    const viewport = this.getViewport()
    
    if (viewport.isMobile) {
      nav.classList.add('mobile-nav')
      
      // Convert horizontal nav to hamburger menu
      const navItems = nav.querySelectorAll('a, button')
      if (navItems.length > 3) {
        this.createHamburgerMenu(nav, Array.from(navItems) as HTMLElement[])
      }
      
      // Make nav items touch-friendly
      navItems.forEach((item) => {
        const element = item as HTMLElement
        element.style.minHeight = '44px'
        element.style.padding = '12px 16px'
        element.style.fontSize = '16px'
      })
    }
  }

  /**
   * Optimize tables for mobile
   */
  public optimizeTable(table: HTMLElement): void {
    const viewport = this.getViewport()
    
    if (viewport.isMobile) {
      // Convert table to card layout
      table.classList.add('mobile-table')
      
      const rows = table.querySelectorAll('tr')
      const headers = table.querySelectorAll('th')
      
      rows.forEach((row, index) => {
        if (index === 0) return // Skip header row
        
        const cells = row.querySelectorAll('td')
        cells.forEach((cell, cellIndex) => {
          const cellElement = cell as HTMLElement
          const header = headers[cellIndex]?.textContent || ''
          
          // Add header label to each cell
          cellElement.setAttribute('data-label', header)
          cellElement.classList.add('mobile-table-cell')
        })
      })
    }
  }

  private updateViewport(): void {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    const isMobile = width < this.breakpoints.mobile
    const isTablet = width >= this.breakpoints.mobile && width < this.breakpoints.desktop
    const isDesktop = width >= this.breakpoints.desktop
    const orientation = width > height ? 'landscape' : 'portrait'
    const devicePixelRatio = window.devicePixelRatio || 1

    this.currentViewport = {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      orientation,
      devicePixelRatio
    }

    // Notify listeners
    this.listeners.forEach(callback => callback(this.currentViewport!))
  }

  private handleResize(): void {
    // Debounce resize events
    clearTimeout((this as any).resizeTimeout)
    ;(this as any).resizeTimeout = setTimeout(() => {
      this.updateViewport()
    }, 100)
  }

  private handleOrientationChange(): void {
    // Wait for orientation change to complete
    setTimeout(() => {
      this.updateViewport()
    }, 100)
  }

  private adjustSpacing(element: HTMLElement, device: 'mobile' | 'tablet' | 'desktop'): void {
    const spacingMap = {
      mobile: {
        padding: '0.75rem',
        margin: '0.5rem',
        gap: '0.75rem'
      },
      tablet: {
        padding: '1rem',
        margin: '0.75rem',
        gap: '1rem'
      },
      desktop: {
        padding: '1.5rem',
        margin: '1rem',
        gap: '1.5rem'
      }
    }

    const spacing = spacingMap[device]
    
    // Apply spacing based on element type
    if (element.classList.contains('card') || element.classList.contains('p-')) {
      element.style.padding = spacing.padding
    }
    
    if (element.classList.contains('space-y-') || element.classList.contains('gap-')) {
      element.style.gap = spacing.gap
    }
  }

  private optimizeTextSize(element: HTMLElement, viewport: ViewportInfo): void {
    const textElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div')
    
    textElements.forEach((textElement) => {
      const el = textElement as HTMLElement
      const computedStyle = window.getComputedStyle(el)
      const currentSize = parseFloat(computedStyle.fontSize)
      
      if (viewport.isMobile) {
        // Ensure minimum font size for readability
        if (currentSize < 14) {
          el.style.fontSize = '14px'
        }
        
        // Adjust line height for mobile
        el.style.lineHeight = '1.5'
      }
    })
  }

  private optimizeGridLayouts(element: HTMLElement): void {
    const grids = element.querySelectorAll('[class*="grid-cols-"]')
    
    grids.forEach((grid) => {
      const gridElement = grid as HTMLElement
      gridElement.classList.add('mobile-grid')
      
      // Force single column on mobile
      gridElement.style.gridTemplateColumns = '1fr'
    })
  }

  private optimizeFormElements(element: HTMLElement): void {
    const inputs = element.querySelectorAll('input, select, textarea, button')
    
    inputs.forEach((input) => {
      const inputElement = input as HTMLElement
      
      // Ensure minimum touch target size
      inputElement.style.minHeight = '44px'
      inputElement.style.fontSize = '16px' // Prevents zoom on iOS
      inputElement.style.padding = '12px 16px'
      
      // Add mobile-friendly styling
      inputElement.classList.add('mobile-input')
    })
  }

  private optimizeCardContent(card: HTMLElement): void {
    // Optimize images in cards
    const images = card.querySelectorAll('img')
    images.forEach((img) => {
      img.style.width = '100%'
      img.style.height = 'auto'
    })
    
    // Optimize button layouts
    const buttons = card.querySelectorAll('button')
    if (buttons.length > 1) {
      buttons.forEach((button) => {
        const buttonElement = button as HTMLElement
        buttonElement.style.width = '100%'
        buttonElement.style.marginBottom = '0.5rem'
      })
    }
  }

  private createHamburgerMenu(nav: HTMLElement, items: HTMLElement[]): void {
    // Create hamburger button
    const hamburger = document.createElement('button')
    hamburger.className = 'hamburger-menu'
    hamburger.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `
    
    // Create mobile menu
    const mobileMenu = document.createElement('div')
    mobileMenu.className = 'mobile-menu hidden'
    
    // Move nav items to mobile menu
    items.forEach((item) => {
      mobileMenu.appendChild(item.cloneNode(true))
    })
    
    // Toggle functionality
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden')
      hamburger.classList.toggle('active')
    })
    
    // Replace nav content
    nav.innerHTML = ''
    nav.appendChild(hamburger)
    nav.appendChild(mobileMenu)
  }
}

/**
 * React hook for layout optimization
 */
export function useLayoutOptimization(customBreakpoints?: Partial<LayoutBreakpoints>) {
  const optimizer = new LayoutOptimizer(customBreakpoints)
  
  return {
    viewport: optimizer.getViewport(),
    subscribe: optimizer.subscribe.bind(optimizer),
    optimizeForMobile: optimizer.optimizeForMobile.bind(optimizer),
    createResponsiveGrid: optimizer.createResponsiveGrid.bind(optimizer),
    optimizeCardLayout: optimizer.optimizeCardLayout.bind(optimizer),
    optimizeNavigation: optimizer.optimizeNavigation.bind(optimizer),
    optimizeTable: optimizer.optimizeTable.bind(optimizer)
  }
}

/**
 * CSS for mobile layout optimizations
 */
export const MOBILE_LAYOUT_CSS = `
/* Mobile optimized elements */
.mobile-optimized {
  padding: 0.75rem;
  font-size: 14px;
  line-height: 1.5;
}

/* Responsive grid */
.responsive-grid {
  display: grid;
  gap: 1rem;
}

@media (max-width: 768px) {
  .responsive-grid {
    grid-template-columns: 1fr !important;
  }
}

/* Mobile navigation */
.mobile-nav {
  position: relative;
}

.hamburger-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger-menu span {
  width: 24px;
  height: 3px;
  background: currentColor;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-menu.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-menu.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-menu.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.mobile-menu.hidden {
  display: none;
}

/* Mobile table */
.mobile-table {
  border: none;
}

.mobile-table thead {
  display: none;
}

.mobile-table tr {
  display: block;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
}

.mobile-table-cell {
  display: block;
  text-align: right;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.mobile-table-cell:last-child {
  border-bottom: none;
}

.mobile-table-cell::before {
  content: attr(data-label) ": ";
  float: left;
  font-weight: bold;
  color: #374151;
}

/* Mobile inputs */
.mobile-input {
  min-height: 44px;
  font-size: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  width: 100%;
  box-sizing: border-box;
}

.mobile-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Mobile grid override */
@media (max-width: 768px) {
  .mobile-grid {
    grid-template-columns: 1fr !important;
  }
  
  [class*="grid-cols-"] {
    grid-template-columns: 1fr !important;
  }
  
  [class*="md:grid-cols-"] {
    grid-template-columns: 1fr !important;
  }
  
  [class*="lg:grid-cols-"] {
    grid-template-columns: 1fr !important;
  }
}

/* Safe area handling for mobile devices */
@supports (padding: max(0px)) {
  .mobile-safe-area {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-top: max(1rem, env(safe-area-inset-top));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
}
`