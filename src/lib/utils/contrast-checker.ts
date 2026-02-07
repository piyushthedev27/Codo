/**
 * Contrast Ratio Checker
 * Utilities to verify WCAG AA compliance (4.5:1 minimum contrast ratio)
 */

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100
  
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  
  let r = 0, g = 0, b = 0
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ]
}

/**
 * Calculate relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const lum1 = getLuminance(...color1)
  const lum2 = getLuminance(...color2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1)
 */
export function meetsWCAGAA(contrastRatio: number): boolean {
  return contrastRatio >= 4.5
}

/**
 * Check if contrast ratio meets WCAG AAA standard (7:1)
 */
export function meetsWCAGAAA(contrastRatio: number): boolean {
  return contrastRatio >= 7
}

/**
 * Check if contrast ratio meets WCAG AA for large text (3:1)
 */
export function meetsWCAGAALargeText(contrastRatio: number): boolean {
  return contrastRatio >= 3
}

/**
 * Get WCAG compliance level
 */
export function getWCAGLevel(contrastRatio: number, isLargeText: boolean = false): string {
  if (isLargeText) {
    if (contrastRatio >= 4.5) return 'AAA'
    if (contrastRatio >= 3) return 'AA'
    return 'Fail'
  }
  
  if (contrastRatio >= 7) return 'AAA'
  if (contrastRatio >= 4.5) return 'AA'
  return 'Fail'
}

/**
 * Verify dashboard color combinations
 */
export function verifyDashboardColors() {
  const darkBackground: [number, number, number] = [12, 17, 29] // hsl(222.2 84% 4.9%)
  const lightText: [number, number, number] = [249, 250, 251] // hsl(210 40% 98%)
  const mediumText: [number, number, number] = [148, 163, 184] // hsl(215 20.2% 65.1%)
  
  const results = {
    primaryText: {
      ratio: getContrastRatio(lightText, darkBackground),
      passes: meetsWCAGAA(getContrastRatio(lightText, darkBackground)),
      level: getWCAGLevel(getContrastRatio(lightText, darkBackground))
    },
    secondaryText: {
      ratio: getContrastRatio(mediumText, darkBackground),
      passes: meetsWCAGAA(getContrastRatio(mediumText, darkBackground)),
      level: getWCAGLevel(getContrastRatio(mediumText, darkBackground))
    }
  }
  
  return results
}

/**
 * Test color combination
 */
export function testColorCombination(
  foregroundHSL: [number, number, number],
  backgroundHSL: [number, number, number],
  isLargeText: boolean = false
): {
  ratio: number
  passes: boolean
  level: string
  recommendation: string
} {
  const fg = hslToRgb(...foregroundHSL)
  const bg = hslToRgb(...backgroundHSL)
  
  const ratio = getContrastRatio(fg, bg)
  const passes = isLargeText ? meetsWCAGAALargeText(ratio) : meetsWCAGAA(ratio)
  const level = getWCAGLevel(ratio, isLargeText)
  
  let recommendation = ''
  if (!passes) {
    recommendation = isLargeText
      ? 'Increase contrast to at least 3:1 for large text'
      : 'Increase contrast to at least 4.5:1 for normal text'
  } else if (level === 'AA') {
    recommendation = 'Meets WCAG AA. Consider increasing to 7:1 for AAA compliance'
  } else {
    recommendation = 'Excellent contrast - meets WCAG AAA standards'
  }
  
  return { ratio, passes, level, recommendation }
}

/**
 * Dashboard color palette with contrast verification
 */
export const dashboardColorPalette = {
  // Peer personality colors
  peers: {
    sarah: {
      primary: [236, 72, 79] as [number, number, number],
      name: 'Sarah (Curious)',
      contrastOnDark: 0, // Will be calculated
      contrastOnLight: 0
    },
    alex: {
      primary: [217, 91, 60] as [number, number, number],
      name: 'Alex (Analytical)',
      contrastOnDark: 0,
      contrastOnLight: 0
    },
    jordan: {
      primary: [142, 71, 45] as [number, number, number],
      name: 'Jordan (Supportive)',
      contrastOnDark: 0,
      contrastOnLight: 0
    }
  },
  
  // Status indicators
  status: {
    online: [142, 71, 55] as [number, number, number],
    coding: [217, 91, 70] as [number, number, number],
    away: [38, 92, 60] as [number, number, number],
    studying: [271, 81, 66] as [number, number, number],
    offline: [215, 16, 57] as [number, number, number]
  },
  
  // Backgrounds
  backgrounds: {
    dark: [222, 84, 5] as [number, number, number],
    card: [217, 33, 18] as [number, number, number],
    light: [0, 0, 100] as [number, number, number]
  },
  
  // Text colors
  text: {
    primary: [210, 40, 98] as [number, number, number],
    secondary: [215, 20, 65] as [number, number, number],
    muted: [215, 16, 57] as [number, number, number]
  }
}

/**
 * Run comprehensive contrast checks
 */
export function runContrastChecks() {
  const darkBg = dashboardColorPalette.backgrounds.dark
  const cardBg = dashboardColorPalette.backgrounds.card
  const lightBg = dashboardColorPalette.backgrounds.light
  
  const checks = {
    darkMode: {
      primaryText: testColorCombination(
        dashboardColorPalette.text.primary,
        darkBg
      ),
      secondaryText: testColorCombination(
        dashboardColorPalette.text.secondary,
        darkBg
      ),
      mutedText: testColorCombination(
        dashboardColorPalette.text.muted,
        darkBg
      ),
      onCard: {
        primaryText: testColorCombination(
          dashboardColorPalette.text.primary,
          cardBg
        ),
        secondaryText: testColorCombination(
          dashboardColorPalette.text.secondary,
          cardBg
        )
      }
    },
    lightMode: {
      primaryText: testColorCombination(
        [0, 0, 0] as [number, number, number],
        lightBg
      )
    }
  }
  
  return checks
}

/**
 * Format contrast ratio for display
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`
}

/**
 * Get color recommendation based on contrast
 */
export function getColorRecommendation(
  currentRatio: number,
  targetRatio: number = 4.5
): string {
  if (currentRatio >= targetRatio) {
    return '✓ Contrast ratio meets WCAG standards'
  }
  
  const improvement = ((targetRatio / currentRatio - 1) * 100).toFixed(0)
  return `⚠ Increase contrast by ${improvement}% to meet WCAG AA standards`
}
