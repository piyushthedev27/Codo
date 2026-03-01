/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Error Parsing System for Codo AI Learning Platform
 * 
 * This module provides comprehensive error parsing and categorization
 * for coding mistakes to enable mistake-driven learning paths.
 */

export interface ParsedError {
  id: string
  originalError: string
  errorType: string
  category: string
  severity: 'low' | 'medium' | 'high'
  _language: string
  codeContext?: string
  lineNumber?: number
  columnNumber?: number
  suggestion: string
  microLessonNeeded: boolean
  relatedConcepts: string[]
  commonMistake: boolean
  metadata: Record<string, any>
}

export interface ErrorCategory {
  name: string
  description: string
  commonPatterns: string[]
  severity: 'low' | 'medium' | 'high'
  microLessonTemplate: string
  relatedConcepts: string[]
}

/**
 * Comprehensive error categories for different programming languages
 */
export const ERROR_CATEGORIES: Record<string, ErrorCategory> = {
  // JavaScript/TypeScript Errors
  SYNTAX_ERROR: {
    name: 'Syntax Error',
    description: 'Code structure or syntax violations',
    commonPatterns: [
      'SyntaxError',
      'Unexpected token',
      'Missing semicolon',
      'Unclosed bracket',
      'Invalid character'
    ],
    severity: 'high',
    microLessonTemplate: 'JavaScript Syntax Fundamentals',
    relatedConcepts: ['syntax', 'punctuation', 'code structure']
  },
  
  REFERENCE_ERROR: {
    name: 'Reference Error',
    description: 'Variable or function not defined or accessible',
    commonPatterns: [
      'ReferenceError',
      'is not defined',
      'Cannot access before initialization',
      'Identifier has already been declared'
    ],
    severity: 'high',
    microLessonTemplate: 'Variable Scope and Declaration',
    relatedConcepts: ['scope', 'hoisting', 'variable declaration', 'let vs var vs const']
  },
  
  TYPE_ERROR: {
    name: 'Type Error',
    description: 'Incorrect data type usage or method calls',
    commonPatterns: [
      'TypeError',
      'Cannot read property',
      'is not a function',
      'Cannot set property',
      'null is not an object'
    ],
    severity: 'medium',
    microLessonTemplate: 'JavaScript Data Types and Methods',
    relatedConcepts: ['data types', 'null vs undefined', 'object methods', 'array methods']
  },
  
  ASYNC_AWAIT_ERROR: {
    name: 'Async/Await Error',
    description: 'Incorrect usage of asynchronous JavaScript patterns',
    commonPatterns: [
      'await is only valid in async function',
      'Promise rejection unhandled',
      'Cannot use await in non-async function',
      'Mixing .then() with async/await'
    ],
    severity: 'medium',
    microLessonTemplate: 'Mastering Async/Await vs Promises',
    relatedConcepts: ['promises', 'async/await', 'error handling', 'try/catch']
  },
  
  ARRAY_METHOD_ERROR: {
    name: 'Array Method Error',
    description: 'Incorrect usage of array methods and iteration',
    commonPatterns: [
      'map is not a function',
      'forEach is not a function',
      'Cannot read property of undefined',
      'filter is not a function',
      'reduce is not a function'
    ],
    severity: 'low',
    microLessonTemplate: 'Array Methods: map, filter, reduce, forEach',
    relatedConcepts: ['array methods', 'iteration', 'functional programming', 'callbacks']
  },
  
  OBJECT_PROPERTY_ERROR: {
    name: 'Object Property Error',
    description: 'Issues with object property access and manipulation',
    commonPatterns: [
      'Cannot read property of undefined',
      'Cannot read property of null',
      'Property does not exist',
      'Cannot assign to read only property'
    ],
    severity: 'medium',
    microLessonTemplate: 'Object Properties and Methods',
    relatedConcepts: ['object properties', 'destructuring', 'optional chaining', 'null checking']
  },
  
  // Python Errors
  INDENTATION_ERROR: {
    name: 'Indentation Error',
    description: 'Python indentation and code block structure issues',
    commonPatterns: [
      'IndentationError',
      'expected an indented block',
      'unindent does not match',
      'inconsistent use of tabs and spaces'
    ],
    severity: 'high',
    microLessonTemplate: 'Python Indentation and Code Structure',
    relatedConcepts: ['indentation', 'code blocks', 'whitespace', 'python syntax']
  },
  
  NAME_ERROR: {
    name: 'Name Error',
    description: 'Variable or function name not found in Python',
    commonPatterns: [
      'NameError',
      'name is not defined',
      'global name is not defined',
      'local variable referenced before assignment'
    ],
    severity: 'high',
    microLessonTemplate: 'Python Variable Scope and Naming',
    relatedConcepts: ['variable scope', 'global vs local', 'variable naming', 'imports']
  },
  
  ATTRIBUTE_ERROR: {
    name: 'Attribute Error',
    description: 'Object attribute or method access issues in Python',
    commonPatterns: [
      'AttributeError',
      'has no attribute',
      'object has no attribute',
      'module has no attribute'
    ],
    severity: 'medium',
    microLessonTemplate: 'Python Objects and Attributes',
    relatedConcepts: ['object attributes', 'methods', 'classes', 'modules']
  },
  
  // General Logic Errors
  LOGIC_ERROR: {
    name: 'Logic Error',
    description: 'Code runs but produces incorrect results',
    commonPatterns: [
      'infinite loop',
      'off by one error',
      'wrong comparison operator',
      'incorrect condition'
    ],
    severity: 'medium',
    microLessonTemplate: 'Debugging Logic and Control Flow',
    relatedConcepts: ['debugging', 'control flow', 'conditions', 'loops']
  },
  
  PERFORMANCE_ERROR: {
    name: 'Performance Error',
    description: 'Code that works but is inefficient',
    commonPatterns: [
      'nested loops',
      'unnecessary iterations',
      'memory leak',
      'blocking operations'
    ],
    severity: 'low',
    microLessonTemplate: 'Code Optimization and Performance',
    relatedConcepts: ['performance', 'optimization', 'time complexity', 'memory usage']
  }
}

/**
 * Language-specific error patterns for better parsing accuracy
 */
export const LANGUAGE_PATTERNS = {
  javascript: {
    errorPrefixes: ['SyntaxError:', 'ReferenceError:', 'TypeError:', 'RangeError:', 'Error:'],
    commonKeywords: ['function', 'const', 'let', 'var', 'async', 'await', 'Promise', 'undefined', 'null'],
    fileExtensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  python: {
    errorPrefixes: ['SyntaxError:', 'NameError:', 'TypeError:', 'AttributeError:', 'IndentationError:', 'ValueError:'],
    commonKeywords: ['def', 'class', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'try', 'except'],
    fileExtensions: ['.py', '.pyw']
  },
  java: {
    errorPrefixes: ['Error:', 'Exception:', 'CompileError:', 'RuntimeException:'],
    commonKeywords: ['public', 'private', 'class', 'interface', 'extends', 'implements', 'static', 'void'],
    fileExtensions: ['.java']
  }
}

/**
 * Parse and categorize a coding error
 */
export function parseError(
  errorMessage: string,
  codeContext?: string,
  _language: string = 'javascript',
  lineNumber?: number,
  columnNumber?: number
): ParsedError {
  const errorId = generateErrorId(errorMessage, _codeContext)
  
  // Determine error category
  const category = categorizeError(errorMessage, _codeContext, _language)
  const errorCategory = ERROR_CATEGORIES[category]
  
  // Extract additional context
  const severity = errorCategory?.severity || 'medium'
  const suggestion = generateSuggestion(errorMessage, category, _codeContext)
  const relatedConcepts = errorCategory?.relatedConcepts || []
  const commonMistake = isCommonMistake(errorMessage, category)
  
  return {
    id: errorId,
    originalError: errorMessage,
    errorType: extractErrorType(errorMessage, _language),
    category,
    severity,
    _language,
    _codeContext,
    lineNumber,
    columnNumber,
    suggestion,
    microLessonNeeded: shouldGenerateMicroLesson(category, severity, commonMistake),
    relatedConcepts,
    commonMistake,
    metadata: {
      timestamp: new Date().toISOString(),
      parsedAt: Date.now(),
      languageDetected: _language,
      categoryConfidence: calculateCategoryConfidence(errorMessage, category)
    }
  }
}

/**
 * Categorize error based on message and context
 */
function categorizeError(errorMessage: string, codeContext?: string, _language: string = 'javascript'): string {
  const message = errorMessage.toLowerCase()
  const context = codeContext?.toLowerCase() || ''
  
  // Special case for async/await errors - check first
  if (message.includes('await is only valid') || 
      (message.includes('syntaxerror') && (context.includes('await') || context.includes('async')))) {
    return 'ASYNC_AWAIT_ERROR'
  }
  
  // Special case for array method errors
  if (message.includes('map is not a function') || 
      message.includes('filter is not a function') || 
      message.includes('reduce is not a function') ||
      (message.includes('typeerror') && (context.includes('.map') || context.includes('.filter') || context.includes('.reduce')))) {
    return 'ARRAY_METHOD_ERROR'
  }
  
  // Check each category for pattern matches
  for (const [categoryKey, category] of Object.entries(ERROR_CATEGORIES)) {
    for (const pattern of category.commonPatterns) {
      if (message.includes(pattern.toLowerCase())) {
        // Additional context validation for better accuracy
        if (validateCategoryWithContext(categoryKey, context, _language)) {
          return categoryKey
        }
      }
    }
  }
  
  // Fallback categorization based on language-specific patterns
  const languagePatterns = LANGUAGE_PATTERNS[language as keyof typeof LANGUAGE_PATTERNS]
  if (languagePatterns) {
    for (const prefix of languagePatterns.errorPrefixes) {
      if (message.includes(prefix.toLowerCase())) {
        return mapErrorPrefixToCategory(prefix, _language)
      }
    }
  }
  
  return 'LOGIC_ERROR' // Default fallback
}

/**
 * Validate category assignment with additional context
 */
function validateCategoryWithContext(category: string, context: string, _language: string): boolean {
  switch (category) {
    case 'ASYNC_AWAIT_ERROR':
      return context.includes('async') || context.includes('await') || context.includes('promise')
    
    case 'ARRAY_METHOD_ERROR':
      return context.includes('map') || context.includes('filter') || context.includes('reduce') || 
             context.includes('foreach') || context.includes('[') || context.includes('array')
    
    case 'INDENTATION_ERROR':
      return _language === 'python'
    
    case 'OBJECT_PROPERTY_ERROR':
      return context.includes('.') || context.includes('object') || context.includes('{')
    
    default:
      return true // Accept category for others
  }
}

/**
 * Map error prefix to appropriate category
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapErrorPrefixToCategory(prefix: string, _language: string): string {
  const prefixMap: Record<string, string> = {
    'SyntaxError:': 'SYNTAX_ERROR',
    'ReferenceError:': 'REFERENCE_ERROR',
    'TypeError:': 'TYPE_ERROR',
    'NameError:': 'NAME_ERROR',
    'AttributeError:': 'ATTRIBUTE_ERROR',
    'IndentationError:': 'INDENTATION_ERROR'
  }
  
  return prefixMap[prefix] || 'LOGIC_ERROR'
}

/**
 * Extract the specific error type from the message
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractErrorType(errorMessage: string, _language: string): string {
  // First try to extract from the error message directly
  const colonIndex = errorMessage.indexOf(':')
  if (colonIndex > 0) {
    const errorType = errorMessage.substring(0, colonIndex).trim()
    if (errorType) return errorType
  }
  
  const languagePatterns = LANGUAGE_PATTERNS[language as keyof typeof LANGUAGE_PATTERNS]
  if (!languagePatterns) return 'Unknown Error'
  
  for (const prefix of languagePatterns.errorPrefixes) {
    if (errorMessage.includes(prefix)) {
      return prefix.replace(':', '')
    }
  }
  
  return 'Runtime Error'
}

/**
 * Generate contextual suggestion for fixing the error
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateSuggestion(errorMessage: string, category: string, codeContext?: string): string {
  const errorCategory = ERROR_CATEGORIES[category]
  const message = errorMessage.toLowerCase()
  
  // Category-specific suggestions
  switch (category) {
    case 'SYNTAX_ERROR':
      if (message.includes('unexpected token')) {
        return 'Check for missing or extra punctuation marks like semicolons, brackets, or quotes.'
      }
      if (message.includes('missing semicolon')) {
        return 'Add a semicolon (;) at the end of the statement.'
      }
      return 'Review your code syntax for missing or incorrect punctuation.'
    
    case 'REFERENCE_ERROR':
      if (message.includes('is not defined')) {
        return 'Make sure the variable or function is declared before using it.'
      }
      if (message.includes('cannot access before initialization')) {
        return 'Move the variable declaration above where you\'re trying to use it.'
      }
      return 'Check variable names and ensure they are properly declared.'
    
    case 'TYPE_ERROR':
      if (message.includes('is not a function')) {
        return 'Verify that you\'re calling a function on the correct data type.'
      }
      if (message.includes('cannot read property')) {
        return 'Check if the object exists and is not null or undefined before accessing its properties.'
      }
      return 'Verify the data types you\'re working with match what your code expects.'
    
    case 'ASYNC_AWAIT_ERROR':
      if (message.includes('await is only valid')) {
        return 'Add the "async" keyword to the function that contains "await".'
      }
      return 'Review your async/await syntax and error handling with try/catch blocks.'
    
    case 'ARRAY_METHOD_ERROR':
      return 'Make sure you\'re calling array methods on actual arrays. Check if the variable is defined and is an array.'
    
    case 'INDENTATION_ERROR':
      return 'Fix the indentation by using consistent spaces or tabs. Python requires proper indentation for code blocks.'
    
    case 'NAME_ERROR':
      return 'Check the spelling of variable and function names, and ensure they are defined before use.'
    
    default:
      return errorCategory?.description || 'Review your code logic and syntax.'
  }
}

/**
 * Determine if this is a common mistake that beginners make
 */
function isCommonMistake(errorMessage: string, category: string): boolean {
  const commonMistakeCategories = [
    'REFERENCE_ERROR',
    'TYPE_ERROR', 
    'ARRAY_METHOD_ERROR',
    'ASYNC_AWAIT_ERROR',
    'INDENTATION_ERROR',
    'SYNTAX_ERROR'
  ]
  
  return commonMistakeCategories.includes(category)
}

/**
 * Determine if a micro-lesson should be generated
 */
function shouldGenerateMicroLesson(category: string, severity: string, commonMistake: boolean): boolean {
  // Generate micro-lessons for high severity errors or common mistakes
  return severity === 'high' || commonMistake
}

/**
 * Calculate confidence score for category assignment
 */
function calculateCategoryConfidence(errorMessage: string, category: string): number {
  const errorCategory = ERROR_CATEGORIES[category]
  if (!errorCategory) return 0.5
  
  const message = errorMessage.toLowerCase()
  let matchCount = 0
  
  for (const pattern of errorCategory.commonPatterns) {
    if (message.includes(pattern.toLowerCase())) {
      matchCount++
    }
  }
  
  // Confidence based on pattern matches
  const confidence = Math.min(0.9, 0.3 + (matchCount * 0.2))
  return Math.round(confidence * 100) / 100
}

/**
 * Generate unique error ID for tracking
 */
function generateErrorId(errorMessage: string, codeContext?: string): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const hash = simpleHash(errorMessage + (codeContext || ''))
  return `error_${hash}_${timestamp}_${randomSuffix}`
}

/**
 * Simple hash function for generating error IDs
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get all available error categories
 */
export function getErrorCategories(): ErrorCategory[] {
  return Object.values(ERROR_CATEGORIES)
}

/**
 * Get error category by name
 */
export function getErrorCategory(categoryName: string): ErrorCategory | null {
  return ERROR_CATEGORIES[categoryName] || null
}

/**
 * Check if an error message matches a specific category
 */
export function matchesCategory(errorMessage: string, categoryName: string): boolean {
  const category = ERROR_CATEGORIES[categoryName]
  if (!category) return false
  
  const message = errorMessage.toLowerCase()
  return category.commonPatterns.some(pattern => 
    message.includes(pattern.toLowerCase())
  )
}