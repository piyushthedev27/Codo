/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Micro-Lesson Generator for Mistake-Driven Learning
 * 
 * This module generates targeted micro-lessons based on specific coding errors
 * to help users understand and fix their mistakes quickly.
 */

import { ParsedError, ERROR_CATEGORIES } from './error-parsing'

export interface MicroLesson {
  id: string
  title: string
  errorType: string
  category: string
  duration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  sections: MicroLessonSection[]
  codeExamples: CodeExample[]
  practiceChallenge?: PracticeChallenge
  relatedConcepts: string[]
  xpReward: number
  metadata: {
    generatedAt: string
    errorId: string
    language: string
    targetAudience: string
  }
}

export interface MicroLessonSection {
  id: string
  title: string
  content: string
  type: 'explanation' | 'example' | 'comparison' | 'tip'
  codeSnippet?: string
  visualAid?: string
}

export interface CodeExample {
  id: string
  title: string
  description: string
  incorrectCode: string
  correctCode: string
  explanation: string
  language: string
  highlights: {
    incorrect: number[]
    correct: number[]
  }
}

export interface PracticeChallenge {
  id: string
  title: string
  description: string
  starterCode: string
  solution: string
  testCases: TestCase[]
  hints: string[]
}

export interface TestCase {
  input: string
  expected: string
  description: string
}

/**
 * Micro-lesson templates for different error categories
 */
const MICRO_LESSON_TEMPLATES = {
  SYNTAX_ERROR: {
    title: 'JavaScript Syntax Fundamentals',
    duration: 5,
    difficulty: 'beginner' as const,
    sections: [
      {
        type: 'explanation' as const,
        title: 'Understanding Syntax Errors',
        content: 'Syntax errors occur when your code doesn\'t follow the proper structure and rules of the programming language. These are like grammar mistakes in writing - the computer can\'t understand what you\'re trying to say.'
      },
      {
        type: 'example' as const,
        title: 'Common Syntax Mistakes',
        content: 'Let\'s look at the most frequent syntax errors and how to fix them.'
      },
      {
        type: 'tip' as const,
        title: 'Prevention Tips',
        content: 'Use a code editor with syntax highlighting and auto-completion to catch these errors as you type. Most modern editors will underline syntax errors in red.'
      }
    ]
  },

  REFERENCE_ERROR: {
    title: 'Variable Scope and Declaration',
    duration: 8,
    difficulty: 'beginner' as const,
    sections: [
      {
        type: 'explanation' as const,
        title: 'Understanding Reference Errors',
        content: 'Reference errors happen when you try to use a variable or function that doesn\'t exist or isn\'t accessible in the current scope. Think of it like trying to use a tool that isn\'t in your toolbox.'
      },
      {
        type: 'comparison' as const,
        title: 'let vs var vs const',
        content: 'Different ways to declare variables have different rules about when and where they can be used.'
      },
      {
        type: 'example' as const,
        title: 'Scope Examples',
        content: 'Let\'s explore how variable scope works and why some variables aren\'t accessible in certain parts of your code.'
      }
    ]
  },

  TYPE_ERROR: {
    title: 'JavaScript Data Types and Methods',
    duration: 10,
    difficulty: 'intermediate' as const,
    sections: [
      {
        type: 'explanation' as const,
        title: 'Understanding Type Errors',
        content: 'Type errors occur when you try to use a value in a way that doesn\'t match its data type. For example, trying to call a method that doesn\'t exist on a particular type of data.'
      },
      {
        type: 'comparison' as const,
        title: 'null vs undefined',
        content: 'Understanding the difference between null and undefined is crucial for preventing type errors.'
      },
      {
        type: 'example' as const,
        title: 'Safe Property Access',
        content: 'Learn techniques to safely access object properties and avoid "Cannot read property" errors.'
      }
    ]
  },

  ASYNC_AWAIT_ERROR: {
    title: 'Mastering Async/Await vs Promises',
    duration: 12,
    difficulty: 'intermediate' as const,
    sections: [
      {
        type: 'explanation' as const,
        title: 'Understanding Asynchronous JavaScript',
        content: 'Asynchronous code allows your program to do other things while waiting for slow operations like network requests. But it requires special syntax to work correctly.'
      },
      {
        type: 'comparison' as const,
        title: 'Promises vs Async/Await',
        content: 'Both approaches handle asynchronous code, but async/await provides a cleaner, more readable syntax.'
      },
      {
        type: 'example' as const,
        title: 'Error Handling with Try/Catch',
        content: 'Learn how to properly handle errors in asynchronous code using try/catch blocks.'
      }
    ]
  },

  ARRAY_METHOD_ERROR: {
    title: 'Array Methods: map, filter, reduce, forEach',
    duration: 15,
    difficulty: 'beginner' as const,
    sections: [
      {
        type: 'explanation' as const,
        title: 'Understanding Array Methods',
        content: 'JavaScript arrays come with powerful built-in methods that make working with data much easier. But you need to make sure you\'re calling them on actual arrays.'
      },
      {
        type: 'comparison' as const,
        title: 'When to Use Each Method',
        content: 'Different array methods serve different purposes. Let\'s learn when to use map vs filter vs reduce vs forEach.'
      },
      {
        type: 'example' as const,
        title: 'Chaining Array Methods',
        content: 'You can chain multiple array methods together to perform complex data transformations.'
      }
    ]
  },

  INDENTATION_ERROR: {
    title: 'Python Indentation and Code Structure',
    duration: 6,
    difficulty: 'beginner' as const,
    sections: [
      {
        type: 'explanation' as const,
        title: 'Why Python Cares About Indentation',
        content: 'Unlike many programming languages that use brackets {}, Python uses indentation (spaces or tabs) to define code blocks. This makes code more readable but requires consistency.'
      },
      {
        type: 'example' as const,
        title: 'Proper Indentation Examples',
        content: 'Let\'s see how to properly indent different Python constructs like functions, classes, and control structures.'
      },
      {
        type: 'tip' as const,
        title: 'Indentation Best Practices',
        content: 'Use 4 spaces per indentation level and be consistent throughout your code. Most Python editors can be configured to show whitespace characters.'
      }
    ]
  }
}

/**
 * Generate a micro-lesson for a specific error
 */
export function generateMicroLesson(parsedError: ParsedError): MicroLesson {
  const template = MICRO_LESSON_TEMPLATES[parsedError.category as keyof typeof MICRO_LESSON_TEMPLATES]

  if (!template) {
    return generateGenericMicroLesson(parsedError)
  }

  const lessonId = generateLessonId(parsedError)
  const codeExamples = generateCodeExamples(parsedError)
  const practiceChallenge = generatePracticeChallenge(parsedError)

  return {
    id: lessonId,
    title: template.title,
    errorType: parsedError.errorType,
    category: parsedError.category,
    duration: template.duration,
    difficulty: template.difficulty,
    sections: template.sections.map((section, index) => ({
      id: `${lessonId}_section_${index}`,
      title: section.title,
      content: section.content,
      type: section.type,
      codeSnippet: generateSectionCodeSnippet(parsedError, section.type),
      visualAid: generateVisualAid(parsedError, section.type)
    })),
    codeExamples,
    practiceChallenge,
    relatedConcepts: parsedError.relatedConcepts,
    xpReward: calculateXPReward(template.duration, template.difficulty),
    metadata: {
      generatedAt: new Date().toISOString(),
      errorId: parsedError.id,
      language: parsedError.language,
      targetAudience: template.difficulty
    }
  }
}

/**
 * Generate code examples specific to the error
 */
function generateCodeExamples(parsedError: ParsedError): CodeExample[] {
  const examples: CodeExample[] = []

  switch (parsedError.category) {
    case 'SYNTAX_ERROR':
      examples.push({
        id: `${parsedError.id}_example_1`,
        title: 'Missing Semicolon',
        description: 'A common syntax error is forgetting semicolons',
        incorrectCode: `let message = "Hello World"\nconsole.log(message)`,
        correctCode: `let message = "Hello World";\nconsole.log(message);`,
        explanation: 'While JavaScript has automatic semicolon insertion, it\'s best practice to include them explicitly.',
        language: parsedError.language,
        highlights: { incorrect: [0], correct: [0, 1] }
      })
      break

    case 'REFERENCE_ERROR':
      examples.push({
        id: `${parsedError.id}_example_1`,
        title: 'Variable Not Declared',
        description: 'Using a variable before declaring it',
        incorrectCode: `console.log(userName);\nlet userName = "John";`,
        correctCode: `let userName = "John";\nconsole.log(userName);`,
        explanation: 'Variables must be declared before they can be used. This is especially important with let and const.',
        language: parsedError.language,
        highlights: { incorrect: [0], correct: [1] }
      })
      break

    case 'TYPE_ERROR':
      examples.push({
        id: `${parsedError.id}_example_1`,
        title: 'Calling Method on Undefined',
        description: 'Trying to call a method on undefined or null',
        incorrectCode: `let user;\nconsole.log(user.name);`,
        correctCode: `let user = { name: "John" };\nconsole.log(user?.name || "No name");`,
        explanation: 'Always check if an object exists before accessing its properties. Use optional chaining (?.) for safety.',
        language: parsedError.language,
        highlights: { incorrect: [1], correct: [1] }
      })
      break

    case 'ASYNC_AWAIT_ERROR':
      examples.push({
        id: `${parsedError.id}_example_1`,
        title: 'Missing async keyword',
        description: 'Using await without async function',
        incorrectCode: `function fetchData() {\n  const data = await fetch('/api/data');\n  return data;\n}`,
        correctCode: `async function fetchData() {\n  const data = await fetch('/api/data');\n  return data;\n}`,
        explanation: 'The await keyword can only be used inside functions marked with async.',
        language: parsedError.language,
        highlights: { incorrect: [0], correct: [0] }
      })
      break

    case 'ARRAY_METHOD_ERROR':
      examples.push({
        id: `${parsedError.id}_example_1`,
        title: 'Calling Array Method on Non-Array',
        description: 'Trying to use array methods on undefined or non-array values',
        incorrectCode: `let items;\nconst doubled = items.map(x => x * 2);`,
        correctCode: `let items = [1, 2, 3];\nconst doubled = items.map(x => x * 2);`,
        explanation: 'Make sure the variable is an array before calling array methods. You can check with Array.isArray().',
        language: parsedError.language,
        highlights: { incorrect: [1], correct: [0, 1] }
      })
      break

    default:
      examples.push(generateGenericCodeExample(parsedError))
  }

  return examples
}

/**
 * Generate a practice challenge for the error
 */
function generatePracticeChallenge(parsedError: ParsedError): PracticeChallenge | undefined {
  switch (parsedError.category) {
    case 'REFERENCE_ERROR':
      return {
        id: `${parsedError.id}_challenge`,
        title: 'Fix the Variable Declaration',
        description: 'Fix the reference error by properly declaring and using variables',
        starterCode: `// Fix this code to avoid reference errors\nconsole.log(greeting);\nlet greeting = "Hello World";`,
        solution: `// Fixed: Declare variable before using it\nlet greeting = "Hello World";\nconsole.log(greeting);`,
        testCases: [
          {
            input: 'Run the code',
            expected: 'Hello World',
            description: 'Should print the greeting without errors'
          }
        ],
        hints: [
          'Variables must be declared before they are used',
          'Move the let statement above the console.log',
          'The order of statements matters in JavaScript'
        ]
      }

    case 'TYPE_ERROR':
      return {
        id: `${parsedError.id}_challenge`,
        title: 'Safe Property Access',
        description: 'Fix the type error by safely accessing object properties',
        starterCode: `// Fix this code to avoid type errors\nlet user;\nconsole.log(user.name);`,
        solution: `// Fixed: Check if object exists before accessing properties\nlet user = { name: "John" };\nif (user && user.name) {\n  console.log(user.name);\n}`,
        testCases: [
          {
            input: 'Run the code',
            expected: 'John',
            description: 'Should safely access the name property'
          }
        ],
        hints: [
          'Check if the object exists before accessing its properties',
          'You can use optional chaining (?.) or conditional checks',
          'Initialize the user object with some data'
        ]
      }

    case 'ARRAY_METHOD_ERROR':
      return {
        id: `${parsedError.id}_challenge`,
        title: 'Array Method Safety',
        description: 'Fix the error by ensuring you\'re calling array methods on actual arrays',
        starterCode: `// Fix this code to avoid array method errors\nlet numbers;\nconst doubled = numbers.map(n => n * 2);`,
        solution: `// Fixed: Initialize array before using array methods\nlet numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log(doubled);`,
        testCases: [
          {
            input: '[1, 2, 3, 4, 5]',
            expected: '[2, 4, 6, 8, 10]',
            description: 'Should double each number in the array'
          }
        ],
        hints: [
          'Initialize the numbers array with some values',
          'Make sure the variable is an array before calling .map()',
          'You can check if something is an array with Array.isArray()'
        ]
      }

    default:
      return undefined
  }
}

/**
 * Generate a generic micro-lesson for unknown error categories
 */
function generateGenericMicroLesson(parsedError: ParsedError): MicroLesson {
  const lessonId = generateLessonId(parsedError)

  return {
    id: lessonId,
    title: `Understanding ${parsedError.errorType}`,
    errorType: parsedError.errorType,
    category: parsedError.category,
    duration: 5,
    difficulty: 'beginner',
    sections: [
      {
        id: `${lessonId}_section_0`,
        title: 'Understanding the Error',
        content: `This error occurred: "${parsedError.originalError}". Let's break down what this means and how to fix it.`,
        type: 'explanation',
        codeSnippet: parsedError.codeContext
      },
      {
        id: `${lessonId}_section_1`,
        title: 'How to Fix It',
        content: parsedError.suggestion,
        type: 'tip'
      }
    ],
    codeExamples: [generateGenericCodeExample(parsedError)],
    relatedConcepts: parsedError.relatedConcepts,
    xpReward: 25,
    metadata: {
      generatedAt: new Date().toISOString(),
      errorId: parsedError.id,
      language: parsedError.language,
      targetAudience: 'beginner'
    }
  }
}

/**
 * Generate a generic code example
 */
function generateGenericCodeExample(parsedError: ParsedError): CodeExample {
  return {
    id: `${parsedError.id}_example_generic`,
    title: 'Error Example',
    description: 'Here\'s an example of the error and how to fix it',
    incorrectCode: parsedError.codeContext || '// Error occurred here',
    correctCode: '// Fixed version would go here',
    explanation: parsedError.suggestion,
    language: parsedError.language,
    highlights: { incorrect: [0], correct: [0] }
  }
}

/**
 * Generate code snippet for lesson section
 */
function generateSectionCodeSnippet(parsedError: ParsedError, sectionType: string): string | undefined {
  if (sectionType !== 'example') return undefined

  return parsedError.codeContext || `// Example code for ${parsedError.category}`
}

/**
 * Generate visual aid for lesson section
 */
function generateVisualAid(parsedError: ParsedError, sectionType: string): string | undefined {
  if (sectionType === 'comparison') {
    return 'side-by-side-comparison'
  }
  if (sectionType === 'example') {
    return 'code-highlight'
  }
  return undefined
}

/**
 * Calculate XP reward based on lesson duration and difficulty
 */
function calculateXPReward(duration: number, difficulty: string): number {
  const baseXP = duration * 5 // 5 XP per minute
  const difficultyMultiplier = {
    beginner: 1.0,
    intermediate: 1.2,
    advanced: 1.5
  }

  return Math.round(baseXP * (difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1.0))
}

/**
 * Generate unique lesson ID
 */
function generateLessonId(parsedError: ParsedError): string {
  const timestamp = Date.now()
  const category = parsedError.category.toLowerCase()
  return `microlesson_${category}_${timestamp}`
}

/**
 * Get all available micro-lesson templates
 */
export function getMicroLessonTemplates(): Record<string, any> {
  return MICRO_LESSON_TEMPLATES
}

/**
 * Check if a micro-lesson template exists for an error category
 */
export function hasMicroLessonTemplate(category: string): boolean {
  return category in MICRO_LESSON_TEMPLATES
}

/**
 * Generate multiple micro-lessons for related errors
 */
export function generateRelatedMicroLessons(parsedError: ParsedError): MicroLesson[] {
  const lessons: MicroLesson[] = []

  // Generate main lesson
  lessons.push(generateMicroLesson(parsedError))

  // Generate related lessons based on concepts
  for (const concept of parsedError.relatedConcepts) {
    const relatedCategory = findCategoryByConcept(concept)
    if (relatedCategory && relatedCategory !== parsedError.category) {
      const relatedError: ParsedError = {
        ...parsedError,
        id: `${parsedError.id}_related_${relatedCategory}`,
        category: relatedCategory
      }
      lessons.push(generateMicroLesson(relatedError))
    }
  }

  return lessons
}

/**
 * Find error category by related concept
 */
function findCategoryByConcept(concept: string): string | null {
  for (const [category, categoryData] of Object.entries(ERROR_CATEGORIES)) {
    if (categoryData.relatedConcepts.includes(concept)) {
      return category
    }
  }
  return null
}