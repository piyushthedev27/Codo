#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests page load times and generates performance reports
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const puppeteer = require('puppeteer')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  LCP: 2500,        // Largest Contentful Paint
  FID: 100,         // First Input Delay  
  CLS: 0.1,         // Cumulative Layout Shift
  PAGE_LOAD: 2000,  // Total page load time
  TTI: 3000,        // Time to Interactive
}

// Pages to test
const PAGES_TO_TEST = [
  { name: 'Home', url: '/' },
  { name: 'Dashboard', url: '/dashboard', requiresAuth: true },
  { name: 'Lesson', url: '/lessons/javascript-basics', requiresAuth: true },
  { name: 'Knowledge Graph', url: '/knowledge-graph-demo' },
  { name: 'Voice Demo', url: '/voice-demo' },
  { name: 'Coding Duel', url: '/coding/duel/test' },
]

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  iterations: 3, // Number of test runs per page
  timeout: 30000, // 30 seconds timeout
  viewport: { width: 1920, height: 1080 },
  mobileViewport: { width: 375, height: 667 },
  networkConditions: {
    fast3g: {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40 // 40ms
    },
    slow3g: {
      offline: false,
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 500 * 1024 / 8, // 500 Kbps
      latency: 400 // 400ms
    }
  }
}

class PerformanceTester {
  constructor() {
    this.browser = null
    this.results = []
  }

  async initialize() {
    console.log('🚀 Initializing performance testing...')
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
  }

  async testPage(pageConfig, networkCondition = null, mobile = false) {
    const page = await this.browser.newPage()
    
    try {
      // Set viewport
      await page.setViewport(mobile ? TEST_CONFIG.mobileViewport : TEST_CONFIG.viewport)
      
      // Set network conditions
      if (networkCondition) {
        await page.emulateNetworkConditions(TEST_CONFIG.networkConditions[networkCondition])
      }

      // Enable performance monitoring
      await page.evaluateOnNewDocument(() => {
        window.performanceMetrics = {
          navigationStart: 0,
          domContentLoaded: 0,
          loadComplete: 0,
          firstPaint: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          firstInputDelay: 0,
          cumulativeLayoutShift: 0,
          timeToInteractive: 0
        }

        // Capture navigation timing
        window.addEventListener('load', () => {
          const timing = performance.timing
          window.performanceMetrics.navigationStart = timing.navigationStart
          window.performanceMetrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart
          window.performanceMetrics.loadComplete = timing.loadEventEnd - timing.navigationStart
        })

        // Capture paint metrics
        if ('PerformanceObserver' in window) {
          // Paint timing
          const paintObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry) => {
              if (entry.name === 'first-paint') {
                window.performanceMetrics.firstPaint = entry.startTime
              } else if (entry.name === 'first-contentful-paint') {
                window.performanceMetrics.firstContentfulPaint = entry.startTime
              }
            })
          })
          paintObserver.observe({ entryTypes: ['paint'] })

          // LCP
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            window.performanceMetrics.largestContentfulPaint = lastEntry.startTime
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

          // CLS
          let clsValue = 0
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            })
            window.performanceMetrics.cumulativeLayoutShift = clsValue
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })

          // FID
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry) => {
              window.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime
            })
          })
          fidObserver.observe({ entryTypes: ['first-input'] })
        }
      })

      const url = `${TEST_CONFIG.baseUrl}${pageConfig.url}`
      console.log(`  📊 Testing ${pageConfig.name} (${url})...`)

      const startTime = Date.now()
      
      // Navigate to page
      const response = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: TEST_CONFIG.timeout
      })

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`)
      }

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')
      
      // Get performance metrics
      const metrics = await page.evaluate(() => window.performanceMetrics)
      const loadTime = Date.now() - startTime

      // Calculate TTI (simplified)
      const tti = Math.max(metrics.domContentLoaded, metrics.firstContentfulPaint) + 1000

      const result = {
        page: pageConfig.name,
        url: pageConfig.url,
        loadTime,
        networkCondition: networkCondition || 'default',
        mobile,
        metrics: {
          ...metrics,
          timeToInteractive: tti,
          totalLoadTime: loadTime
        },
        timestamp: new Date().toISOString()
      }

      // Check thresholds
      result.passed = this.checkThresholds(result.metrics)
      result.issues = this.getPerformanceIssues(result.metrics)

      return result

    } catch (error) {
      console.error(`  ❌ Error testing ${pageConfig.name}:`, error.message)
      return {
        page: pageConfig.name,
        url: pageConfig.url,
        error: error.message,
        passed: false,
        timestamp: new Date().toISOString()
      }
    } finally {
      await page.close()
    }
  }

  checkThresholds(metrics) {
    return (
      metrics.largestContentfulPaint <= THRESHOLDS.LCP &&
      metrics.firstInputDelay <= THRESHOLDS.FID &&
      metrics.cumulativeLayoutShift <= THRESHOLDS.CLS &&
      metrics.totalLoadTime <= THRESHOLDS.PAGE_LOAD &&
      metrics.timeToInteractive <= THRESHOLDS.TTI
    )
  }

  getPerformanceIssues(metrics) {
    const issues = []

    if (metrics.largestContentfulPaint > THRESHOLDS.LCP) {
      issues.push(`LCP too slow: ${metrics.largestContentfulPaint}ms (target: <${THRESHOLDS.LCP}ms)`)
    }

    if (metrics.firstInputDelay > THRESHOLDS.FID) {
      issues.push(`FID too slow: ${metrics.firstInputDelay}ms (target: <${THRESHOLDS.FID}ms)`)
    }

    if (metrics.cumulativeLayoutShift > THRESHOLDS.CLS) {
      issues.push(`CLS too high: ${metrics.cumulativeLayoutShift} (target: <${THRESHOLDS.CLS})`)
    }

    if (metrics.totalLoadTime > THRESHOLDS.PAGE_LOAD) {
      issues.push(`Page load too slow: ${metrics.totalLoadTime}ms (target: <${THRESHOLDS.PAGE_LOAD}ms)`)
    }

    if (metrics.timeToInteractive > THRESHOLDS.TTI) {
      issues.push(`TTI too slow: ${metrics.timeToInteractive}ms (target: <${THRESHOLDS.TTI}ms)`)
    }

    return issues
  }

  async runAllTests() {
    console.log('🧪 Running performance tests...\n')

    for (const pageConfig of PAGES_TO_TEST) {
      console.log(`📄 Testing ${pageConfig.name}...`)

      // Test desktop with different network conditions
      for (const networkCondition of [null, 'fast3g']) {
        for (let i = 0; i < TEST_CONFIG.iterations; i++) {
          const result = await this.testPage(pageConfig, networkCondition, false)
          this.results.push(result)
        }
      }

      // Test mobile
      const mobileResult = await this.testPage(pageConfig, 'fast3g', true)
      this.results.push(mobileResult)

      console.log(`  ✅ Completed ${pageConfig.name}\n`)
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.passed).length,
        failedTests: this.results.filter(r => !r.passed).length,
        averageLoadTime: 0,
        testDate: new Date().toISOString()
      },
      thresholds: THRESHOLDS,
      results: this.results,
      recommendations: []
    }

    // Calculate average load time
    const validResults = this.results.filter(r => !r.error && r.metrics)
    if (validResults.length > 0) {
      report.summary.averageLoadTime = Math.round(
        validResults.reduce((sum, r) => sum + r.metrics.totalLoadTime, 0) / validResults.length
      )
    }

    // Generate recommendations
    const failedResults = this.results.filter(r => !r.passed)
    if (failedResults.length > 0) {
      const commonIssues = {}
      failedResults.forEach(result => {
        if (result.issues) {
          result.issues.forEach(issue => {
            commonIssues[issue] = (commonIssues[issue] || 0) + 1
          })
        }
      })

      report.recommendations = Object.entries(commonIssues)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([issue, count]) => ({
          issue,
          frequency: count,
          recommendation: this.getRecommendation(issue)
        }))
    }

    return report
  }

  getRecommendation(issue) {
    if (issue.includes('LCP')) {
      return 'Optimize images, reduce server response time, eliminate render-blocking resources'
    }
    if (issue.includes('FID')) {
      return 'Reduce JavaScript execution time, break up long tasks, use web workers'
    }
    if (issue.includes('CLS')) {
      return 'Set size attributes on images/videos, avoid inserting content above existing content'
    }
    if (issue.includes('Page load')) {
      return 'Enable compression, optimize images, minimize HTTP requests, use CDN'
    }
    if (issue.includes('TTI')) {
      return 'Reduce JavaScript bundle size, eliminate unused code, optimize critical rendering path'
    }
    return 'Review performance best practices and optimize accordingly'
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  printSummary(report) {
    console.log('\n📊 PERFORMANCE TEST RESULTS')
    console.log('=' .repeat(50))
    console.log(`Total Tests: ${report.summary.totalTests}`)
    console.log(`Passed: ${report.summary.passedTests} ✅`)
    console.log(`Failed: ${report.summary.failedTests} ❌`)
    console.log(`Average Load Time: ${report.summary.averageLoadTime}ms`)
    console.log(`Target Load Time: <${THRESHOLDS.PAGE_LOAD}ms`)
    
    if (report.summary.averageLoadTime <= THRESHOLDS.PAGE_LOAD) {
      console.log('\n🎉 PERFORMANCE TARGET MET!')
    } else {
      console.log('\n⚠️  PERFORMANCE TARGET NOT MET')
    }

    if (report.recommendations.length > 0) {
      console.log('\n🔧 TOP RECOMMENDATIONS:')
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec.recommendation} (${rec.frequency} occurrences)`)
      })
    }

    console.log('\n📄 Detailed report saved to: performance-report.json')
  }
}

// Main execution
async function main() {
  const tester = new PerformanceTester()
  
  try {
    await tester.initialize()
    await tester.runAllTests()
    
    const report = tester.generateReport()
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'performance-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    // Print summary
    tester.printSummary(report)
    
    // Exit with appropriate code
    process.exit(report.summary.failedTests > 0 ? 1 : 0)
    
  } catch (error) {
    console.error('❌ Performance testing failed:', error)
    process.exit(1)
  } finally {
    await tester.cleanup()
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { PerformanceTester, THRESHOLDS, TEST_CONFIG }