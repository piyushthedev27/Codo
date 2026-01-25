/**
 * Tests for Error Parsing System
 */

import { 
  parseError, 
  getErrorCategories, 
  getErrorCategory, 
  matchesCategory,
  ERROR_CATEGORIES 
} from '../error-parsing'

describe('Error Parsing System', () => {
  describe('parseError', () => {
    it('should parse JavaScript ReferenceError correctly', () => {
      const errorMessage = "ReferenceError: userName is not defined"
      const codeContext = "console.log(userName);\nlet userName = 'John';"
      
      const result = parseError(errorMessage, codeContext, 'javascript')
      
      expect(result.errorType).toBe('ReferenceError')
      expect(result.category).toBe('REFERENCE_ERROR')
      expect(result.severity).toBe('high')
      expect(result.language).toBe('javascript')
      expect(result.microLessonNeeded).toBe(true)
      expect(result.commonMistake).toBe(true)
      expect(result.suggestion).toContain('declared before using')
    })

    it('should parse JavaScript TypeError correctly', () => {
      const errorMessage = "TypeError: Cannot read property 'name' of undefined"
      const codeContext = "let user;\nconsole.log(user.name);"
      
      const result = parseError(errorMessage, codeContext, 'javascript')
      
      expect(result.errorType).toBe('TypeError')
      expect(result.category).toBe('TYPE_ERROR')
      expect(result.severity).toBe('medium')
      expect(result.suggestion).toContain('null or undefined')
    })

    it('should parse async/await errors correctly', () => {
      const errorMessage = "SyntaxError: await is only valid in async function"
      const codeContext = "function fetchData() {\n  const data = await fetch('/api/data');\n}"
      
      const result = parseError(errorMessage, codeContext, 'javascript')
      
      expect(result.category).toBe('ASYNC_AWAIT_ERROR')
      expect(result.suggestion).toContain('async')
      expect(result.relatedConcepts).toContain('async/await')
    })

    it('should parse Python IndentationError correctly', () => {
      const errorMessage = "IndentationError: expected an indented block"
      const codeContext = "if x > 5:\nprint('Greater than 5')"
      
      const result = parseError(errorMessage, codeContext, 'python')
      
      expect(result.category).toBe('INDENTATION_ERROR')
      expect(result.severity).toBe('high')
      expect(result.language).toBe('python')
      expect(result.suggestion).toContain('indentation')
    })

    it('should handle unknown errors with fallback', () => {
      const errorMessage = "UnknownError: Something went wrong"
      
      const result = parseError(errorMessage, undefined, 'javascript')
      
      expect(result.category).toBe('LOGIC_ERROR')
      expect(result.errorType).toBe('UnknownError')
      expect(result.suggestion).toBeDefined()
    })

    it('should generate unique error IDs', () => {
      const errorMessage = "ReferenceError: test error"
      
      const result1 = parseError(errorMessage, undefined, 'javascript')
      const result2 = parseError(errorMessage, undefined, 'javascript')
      
      expect(result1.id).not.toBe(result2.id)
      expect(result1.id).toMatch(/^error_/)
    })

    it('should calculate category confidence correctly', () => {
      const errorMessage = "ReferenceError: userName is not defined"
      
      const result = parseError(errorMessage, undefined, 'javascript')
      
      expect(result.metadata.categoryConfidence).toBeGreaterThan(0.5)
      expect(result.metadata.categoryConfidence).toBeLessThanOrEqual(0.9)
    })
  })

  describe('getErrorCategories', () => {
    it('should return all available error categories', () => {
      const categories = getErrorCategories()
      
      expect(categories).toBeInstanceOf(Array)
      expect(categories.length).toBeGreaterThan(0)
      expect(categories[0]).toHaveProperty('name')
      expect(categories[0]).toHaveProperty('description')
      expect(categories[0]).toHaveProperty('commonPatterns')
    })
  })

  describe('getErrorCategory', () => {
    it('should return specific error category', () => {
      const category = getErrorCategory('REFERENCE_ERROR')
      
      expect(category).toBeDefined()
      expect(category?.name).toBe('Reference Error')
      expect(category?.severity).toBe('high')
    })

    it('should return null for non-existent category', () => {
      const category = getErrorCategory('NON_EXISTENT_CATEGORY')
      
      expect(category).toBeNull()
    })
  })

  describe('matchesCategory', () => {
    it('should match error message to correct category', () => {
      const errorMessage = "ReferenceError: userName is not defined"
      
      const matches = matchesCategory(errorMessage, 'REFERENCE_ERROR')
      
      expect(matches).toBe(true)
    })

    it('should not match error message to incorrect category', () => {
      const errorMessage = "ReferenceError: userName is not defined"
      
      const matches = matchesCategory(errorMessage, 'TYPE_ERROR')
      
      expect(matches).toBe(false)
    })

    it('should be case insensitive', () => {
      const errorMessage = "referenceerror: username is not defined"
      
      const matches = matchesCategory(errorMessage, 'REFERENCE_ERROR')
      
      expect(matches).toBe(true)
    })
  })

  describe('Error Categories', () => {
    it('should have all required properties for each category', () => {
      Object.values(ERROR_CATEGORIES).forEach(category => {
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('description')
        expect(category).toHaveProperty('commonPatterns')
        expect(category).toHaveProperty('severity')
        expect(category).toHaveProperty('microLessonTemplate')
        expect(category).toHaveProperty('relatedConcepts')
        
        expect(category.commonPatterns).toBeInstanceOf(Array)
        expect(category.commonPatterns.length).toBeGreaterThan(0)
        expect(['low', 'medium', 'high']).toContain(category.severity)
        expect(category.relatedConcepts).toBeInstanceOf(Array)
      })
    })
  })

  describe('Context Validation', () => {
    it('should validate async/await context correctly', () => {
      const errorMessage = "SyntaxError: await is only valid in async function"
      const codeContext = "async function test() { await fetch(); }"
      
      const result = parseError(errorMessage, codeContext, 'javascript')
      
      expect(result.category).toBe('ASYNC_AWAIT_ERROR')
    })

    it('should validate array method context correctly', () => {
      const errorMessage = "TypeError: items.map is not a function"
      const codeContext = "let items = 'not an array'; items.map(x => x)"
      
      const result = parseError(errorMessage, codeContext, 'javascript')
      
      expect(result.category).toBe('ARRAY_METHOD_ERROR')
    })

    it('should validate Python indentation context correctly', () => {
      const errorMessage = "IndentationError: expected an indented block"
      const codeContext = "if True:\nprint('hello')"
      
      const result = parseError(errorMessage, codeContext, 'python')
      
      expect(result.category).toBe('INDENTATION_ERROR')
    })
  })

  describe('Suggestion Generation', () => {
    it('should generate specific suggestions for reference errors', () => {
      const errorMessage = "ReferenceError: userName is not defined"
      
      const result = parseError(errorMessage, undefined, 'javascript')
      
      expect(result.suggestion).toContain('declared before using')
    })

    it('should generate specific suggestions for type errors', () => {
      const errorMessage = "TypeError: Cannot read property 'name' of undefined"
      
      const result = parseError(errorMessage, undefined, 'javascript')
      
      expect(result.suggestion).toContain('null or undefined')
    })

    it('should generate specific suggestions for syntax errors', () => {
      const errorMessage = "SyntaxError: Unexpected token ';'"
      
      const result = parseError(errorMessage, undefined, 'javascript')
      
      expect(result.suggestion).toContain('punctuation')
    })
  })
})