/**
 * Contrast Checker Tests
 * Verify WCAG AA compliance for dashboard colors
 */

import {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getWCAGLevel,
  testColorCombination,
  runContrastChecks,
  formatContrastRatio
} from '../contrast-checker'

describe('Contrast Checker', () => {
  describe('getContrastRatio', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const black: [number, number, number] = [0, 0, 0]
      const white: [number, number, number] = [255, 255, 255]
      const ratio = getContrastRatio(black, white)
      expect(ratio).toBeCloseTo(21, 0) // Maximum contrast ratio
    })

    it('should calculate correct contrast ratio for same colors', () => {
      const gray: [number, number, number] = [128, 128, 128]
      const ratio = getContrastRatio(gray, gray)
      expect(ratio).toBe(1) // No contrast
    })

    it('should be symmetric', () => {
      const color1: [number, number, number] = [100, 150, 200]
      const color2: [number, number, number] = [50, 75, 100]
      const ratio1 = getContrastRatio(color1, color2)
      const ratio2 = getContrastRatio(color2, color1)
      expect(ratio1).toBe(ratio2)
    })
  })

  describe('WCAG Compliance', () => {
    it('should pass WCAG AA for 4.5:1 ratio', () => {
      expect(meetsWCAGAA(4.5)).toBe(true)
      expect(meetsWCAGAA(4.49)).toBe(false)
    })

    it('should pass WCAG AAA for 7:1 ratio', () => {
      expect(meetsWCAGAAA(7)).toBe(true)
      expect(meetsWCAGAAA(6.99)).toBe(false)
    })

    it('should return correct WCAG level', () => {
      expect(getWCAGLevel(7)).toBe('AAA')
      expect(getWCAGLevel(4.5)).toBe('AA')
      expect(getWCAGLevel(3)).toBe('Fail')
    })

    it('should handle large text correctly', () => {
      expect(getWCAGLevel(4.5, true)).toBe('AAA')
      expect(getWCAGLevel(3, true)).toBe('AA')
      expect(getWCAGLevel(2.9, true)).toBe('Fail')
    })
  })

  describe('Dashboard Color Verification', () => {
    it('should verify primary text on dark background meets WCAG AA', () => {
      // Dark background: hsl(222.2 84% 4.9%) ≈ rgb(12, 17, 29)
      // Light text: hsl(210 40% 98%) ≈ rgb(249, 250, 251)
      const darkBg: [number, number, number] = [12, 17, 29]
      const lightText: [number, number, number] = [249, 250, 251]
      
      const ratio = getContrastRatio(lightText, darkBg)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
      expect(meetsWCAGAA(ratio)).toBe(true)
    })

    it('should verify secondary text on dark background meets WCAG AA', () => {
      // Dark background: hsl(222.2 84% 4.9%)
      // Medium text: hsl(215 20.2% 65.1%) ≈ rgb(148, 163, 184)
      const darkBg: [number, number, number] = [12, 17, 29]
      const mediumText: [number, number, number] = [148, 163, 184]
      
      const ratio = getContrastRatio(mediumText, darkBg)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
      expect(meetsWCAGAA(ratio)).toBe(true)
    })

    it('should verify blue button text on dark background', () => {
      // Blue button: hsl(217 91% 60%) ≈ rgb(59, 130, 246)
      // Dark background: hsl(222.2 84% 4.9%)
      const blueBg: [number, number, number] = [59, 130, 246]
      const darkText: [number, number, number] = [12, 17, 29]
      
      const ratio = getContrastRatio(darkText, blueBg)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })
  })

  describe('testColorCombination', () => {
    it('should test HSL color combinations', () => {
      // Test light text on dark background
      const result = testColorCombination(
        [210, 40, 98], // Light text
        [222, 84, 5]   // Dark background
      )
      
      expect(result.ratio).toBeGreaterThan(0)
      expect(result.passes).toBeDefined()
      expect(result.level).toMatch(/^(AAA|AA|Fail)$/)
      expect(result.recommendation).toBeTruthy()
    })

    it('should provide recommendations for failing combinations', () => {
      // Test low contrast combination
      const result = testColorCombination(
        [0, 0, 50],  // Medium gray
        [0, 0, 60]   // Slightly lighter gray
      )
      
      expect(result.passes).toBe(false)
      expect(result.recommendation).toContain('Increase contrast')
    })

    it('should handle large text differently', () => {
      const normalText = testColorCombination(
        [0, 0, 50],
        [0, 0, 80],
        false
      )
      
      const largeText = testColorCombination(
        [0, 0, 50],
        [0, 0, 80],
        true
      )
      
      // Large text has more lenient requirements (3:1 vs 4.5:1)
      // If normal text passes, large text should also pass
      // If normal text fails, large text might still pass
      if (normalText.passes) {
        expect(largeText.passes).toBe(true)
      }
      // Both should have the same ratio
      expect(largeText.ratio).toBe(normalText.ratio)
    })
  })

  describe('runContrastChecks', () => {
    it('should run comprehensive contrast checks', () => {
      const checks = runContrastChecks()
      
      expect(checks.darkMode).toBeDefined()
      expect(checks.darkMode.primaryText).toBeDefined()
      expect(checks.darkMode.secondaryText).toBeDefined()
      expect(checks.darkMode.mutedText).toBeDefined()
      expect(checks.darkMode.onCard).toBeDefined()
      expect(checks.lightMode).toBeDefined()
    })

    it('should verify all dark mode text meets WCAG AA', () => {
      const checks = runContrastChecks()
      
      // Primary text should meet WCAG AA
      expect(checks.darkMode.primaryText.passes).toBe(true)
      expect(checks.darkMode.primaryText.ratio).toBeGreaterThanOrEqual(4.5)
      
      // Secondary text should meet WCAG AA
      expect(checks.darkMode.secondaryText.passes).toBe(true)
      expect(checks.darkMode.secondaryText.ratio).toBeGreaterThanOrEqual(4.5)
    })
  })

  describe('formatContrastRatio', () => {
    it('should format contrast ratio correctly', () => {
      expect(formatContrastRatio(4.5)).toBe('4.50:1')
      expect(formatContrastRatio(7.123)).toBe('7.12:1')
      expect(formatContrastRatio(21)).toBe('21.00:1')
    })
  })

  describe('Peer Personality Colors', () => {
    it('should verify Sarah pink color has sufficient contrast', () => {
      // Sarah: hsl(236 72% 79%) - Pink
      const sarahColor: [number, number, number] = [236, 72, 79]
      const darkBg: [number, number, number] = [222, 84, 5]
      
      const result = testColorCombination(sarahColor, darkBg)
      // Peer colors are used for accents, not primary text, so we're more lenient
      expect(result.ratio).toBeGreaterThan(3)
    })

    it('should verify Alex blue color has sufficient contrast', () => {
      // Alex: hsl(217 91% 60%) - Blue
      const alexColor: [number, number, number] = [217, 91, 60]
      const darkBg: [number, number, number] = [222, 84, 5]
      
      const result = testColorCombination(alexColor, darkBg)
      expect(result.ratio).toBeGreaterThan(3)
    })

    it('should verify Jordan green color has sufficient contrast', () => {
      // Jordan: hsl(142 71% 45%) - Green
      const jordanColor: [number, number, number] = [142, 71, 45]
      const darkBg: [number, number, number] = [222, 84, 5]
      
      const result = testColorCombination(jordanColor, darkBg)
      expect(result.ratio).toBeGreaterThan(3)
    })
  })

  describe('Status Indicator Colors', () => {
    it('should verify status colors are distinguishable', () => {
      const darkBg: [number, number, number] = [222, 84, 5]
      
      // Online (green)
      const online = testColorCombination([142, 71, 55], darkBg)
      expect(online.ratio).toBeGreaterThan(3)
      
      // Coding (blue)
      const coding = testColorCombination([217, 91, 70], darkBg)
      expect(coding.ratio).toBeGreaterThan(3)
      
      // Away (orange)
      const away = testColorCombination([38, 92, 60], darkBg)
      expect(away.ratio).toBeGreaterThan(3)
    })
  })

  describe('Activity Type Colors', () => {
    it('should verify activity colors meet minimum contrast', () => {
      const cardBg: [number, number, number] = [217, 33, 18]
      
      // Lesson (blue)
      const lesson = testColorCombination([217, 91, 70], cardBg)
      expect(lesson.ratio).toBeGreaterThan(3)
      
      // Achievement (gold)
      const achievement = testColorCombination([45, 93, 57], cardBg)
      expect(achievement.ratio).toBeGreaterThan(3)
      
      // Collaboration (green)
      const collaboration = testColorCombination([142, 71, 55], cardBg)
      expect(collaboration.ratio).toBeGreaterThan(3)
    })
  })
})
