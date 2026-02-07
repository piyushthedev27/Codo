/**
 * Design System Verification Script
 * Verifies that all design system files are properly integrated
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Verifying Design System Implementation...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}`);
    checks.passed++;
    return true;
  } else {
    console.log(`❌ ${description} - File not found: ${filePath}`);
    checks.failed++;
    return false;
  }
}

function checkImport(filePath, importStatement, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(importStatement)) {
      console.log(`✅ ${description}`);
      checks.passed++;
      return true;
    } else {
      console.log(`⚠️  ${description} - Import not found`);
      checks.warnings++;
      return false;
    }
  } else {
    console.log(`❌ ${description} - File not found: ${filePath}`);
    checks.failed++;
    return false;
  }
}

function checkCSSVariable(filePath, variable, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(variable)) {
      console.log(`✅ ${description}`);
      checks.passed++;
      return true;
    } else {
      console.log(`⚠️  ${description} - Variable not found: ${variable}`);
      checks.warnings++;
      return false;
    }
  } else {
    console.log(`❌ ${description} - File not found: ${filePath}`);
    checks.failed++;
    return false;
  }
}

console.log('📁 Checking Core Files...\n');

checkFile('src/styles/dashboard-colors.css', 'Dashboard color system file exists');
checkFile('src/styles/dark-mode-enhancements.css', 'Dark mode enhancements file exists');
checkFile('src/lib/utils/contrast-checker.ts', 'Contrast checker utility exists');
checkFile('src/lib/utils/__tests__/contrast-checker.test.ts', 'Contrast checker tests exist');
checkFile('src/styles/DESIGN_SYSTEM.md', 'Design system documentation exists');
checkFile('src/styles/IMPLEMENTATION_SUMMARY.md', 'Implementation summary exists');
checkFile('src/styles/QUICK_REFERENCE.md', 'Quick reference guide exists');

console.log('\n📦 Checking Imports...\n');

checkImport('src/app/globals.css', 'dashboard-colors.css', 'Dashboard colors imported in globals.css');
checkImport('src/app/globals.css', 'dark-mode-enhancements.css', 'Dark mode enhancements imported in globals.css');

console.log('\n🎨 Checking CSS Variables...\n');

// Peer colors
checkCSSVariable('src/styles/dashboard-colors.css', '--peer-sarah-primary', 'Sarah peer color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--peer-alex-primary', 'Alex peer color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--peer-jordan-primary', 'Jordan peer color defined');

// Status colors
checkCSSVariable('src/styles/dashboard-colors.css', '--status-online', 'Online status color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--status-coding', 'Coding status color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--status-away', 'Away status color defined');

// Trend colors
checkCSSVariable('src/styles/dashboard-colors.css', '--trend-up', 'Trend up color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--trend-down', 'Trend down color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--trend-stable', 'Trend stable color defined');

// Activity colors
checkCSSVariable('src/styles/dashboard-colors.css', '--activity-lesson', 'Lesson activity color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--activity-achievement', 'Achievement activity color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--activity-collaboration', 'Collaboration activity color defined');

// Difficulty colors
checkCSSVariable('src/styles/dashboard-colors.css', '--difficulty-beginner', 'Beginner difficulty color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--difficulty-intermediate', 'Intermediate difficulty color defined');
checkCSSVariable('src/styles/dashboard-colors.css', '--difficulty-advanced', 'Advanced difficulty color defined');

console.log('\n🌙 Checking Dark Mode Support...\n');

checkCSSVariable('src/styles/dark-mode-enhancements.css', '.dark', 'Dark mode class defined');
checkCSSVariable('src/styles/dark-mode-enhancements.css', 'transition-property', 'Theme transitions defined');
checkCSSVariable('src/styles/dark-mode-enhancements.css', 'prefers-reduced-motion', 'Reduced motion support defined');
checkCSSVariable('src/styles/dark-mode-enhancements.css', 'prefers-contrast: high', 'High contrast mode support defined');
checkCSSVariable('src/styles/dark-mode-enhancements.css', 'forced-colors: active', 'Forced colors mode support defined');

console.log('\n🧪 Checking Utility Classes...\n');

checkCSSVariable('src/styles/dashboard-colors.css', '.peer-sarah-text', 'Sarah text utility class defined');
checkCSSVariable('src/styles/dashboard-colors.css', '.status-online', 'Online status utility class defined');
checkCSSVariable('src/styles/dashboard-colors.css', '.trend-up', 'Trend up utility class defined');
checkCSSVariable('src/styles/dashboard-colors.css', '.activity-lesson-bg', 'Lesson activity utility class defined');
checkCSSVariable('src/styles/dashboard-colors.css', '.difficulty-beginner', 'Beginner difficulty utility class defined');
checkCSSVariable('src/styles/dashboard-colors.css', '.stat-gradient-progress', 'Progress gradient utility class defined');

console.log('\n📊 Verification Summary\n');
console.log('='.repeat(50));
console.log(`✅ Passed: ${checks.passed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log('='.repeat(50));

if (checks.failed > 0) {
  console.log('\n❌ Design system verification failed!');
  console.log('Please fix the issues above before proceeding.\n');
  process.exit(1);
} else if (checks.warnings > 0) {
  console.log('\n⚠️  Design system verification completed with warnings.');
  console.log('Review the warnings above to ensure everything is correct.\n');
  process.exit(0);
} else {
  console.log('\n✅ Design system verification passed!');
  console.log('All files are properly integrated and configured.\n');
  process.exit(0);
}
