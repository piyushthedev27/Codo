/* eslint-disable @typescript-eslint/no-explicit-any */
// Voice hints system for coding challenges
import { speakCoachingResponse } from './speech-synthesis'

export interface VoiceHint {
  id: string
  trigger: 'time_spent' | 'error_pattern' | 'user_request' | 'code_analysis'
  condition: string
  hint_text: string
  priority: 'low' | 'medium' | 'high'
  delay_ms?: number
}

export interface CodingContext {
  code: string
  language: string
  challenge_type: string
  time_spent_ms: number
  error_count: number
  last_error?: string
}

export class VoiceHintsManager {
  private hints: VoiceHint[] = []
  private deliveredHints: Set<string> = new Set()
  private isEnabled: boolean = true

  constructor() {
    this.initializeDefaultHints()
  }

  private initializeDefaultHints() {
    this.hints = [
      // Time-based hints
      {
        id: 'time_hint_1',
        trigger: 'time_spent',
        condition: 'time_spent_ms > 120000', // 2 minutes
        hint_text: "You've been working on this for a while. Would you like a hint about the approach?",
        priority: 'medium',
        delay_ms: 3000
      },
      {
        id: 'time_hint_2',
        trigger: 'time_spent',
        condition: 'time_spent_ms > 300000', // 5 minutes
        hint_text: "Let me suggest a different approach. Try breaking this problem into smaller steps.",
        priority: 'high',
        delay_ms: 2000
      },

      // Error pattern hints
      {
        id: 'syntax_error_hint',
        trigger: 'error_pattern',
        condition: 'error_count > 3 && last_error.includes("SyntaxError")',
        hint_text: "I notice you're getting syntax errors. Check your brackets and semicolons carefully.",
        priority: 'high',
        delay_ms: 1000
      },
      {
        id: 'undefined_hint',
        trigger: 'error_pattern',
        condition: 'last_error.includes("undefined")',
        hint_text: "You're getting an undefined error. Make sure your variables are declared before using them.",
        priority: 'medium',
        delay_ms: 2000
      },
      {
        id: 'async_hint',
        trigger: 'error_pattern',
        condition: 'last_error.includes("Promise") || code.includes("async")',
        hint_text: "I see you're working with async code. Remember to use await with async functions.",
        priority: 'medium',
        delay_ms: 2000
      },

      // Code analysis hints
      {
        id: 'loop_optimization',
        trigger: 'code_analysis',
        condition: 'code.includes("for") && challenge_type === "array_methods"',
        hint_text: "You're using a for loop. For this challenge, try using array methods like map or filter.",
        priority: 'medium',
        delay_ms: 5000
      },
      {
        id: 'function_hint',
        trigger: 'code_analysis',
        condition: 'code.length > 100 && !code.includes("function") && !code.includes("=>")',
        hint_text: "Your code is getting long. Consider breaking it into smaller functions.",
        priority: 'low',
        delay_ms: 10000
      },
      {
        id: 'variable_naming',
        trigger: 'code_analysis',
        condition: 'code.includes("var ") || code.match(/\\b[a-z]\\b/)',
        hint_text: "Good code uses descriptive variable names. Consider using more meaningful names.",
        priority: 'low',
        delay_ms: 15000
      }
    ]
  }

  public async analyzeAndProvideHints(context: CodingContext): Promise<void> {
    if (!this.isEnabled) return

    const applicableHints = this.hints.filter(hint => 
      !this.deliveredHints.has(hint.id) && this.evaluateCondition(hint, context)
    )

    // Sort by priority and deliver the most important hint
    const sortedHints = applicableHints.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    if (sortedHints.length > 0) {
      const hint = sortedHints[0]
      await this.deliverHint(hint)
    }
  }

  private evaluateCondition(hint: VoiceHint, context: CodingContext): boolean {
    try {
      // Create a safe evaluation context
      const evalContext = {
        time_spent_ms: context.time_spent_ms,
        error_count: context.error_count,
        last_error: context.last_error || '',
        code: context.code,
        challenge_type: context.challenge_type,
        language: context.language
      }

      // Simple condition evaluation (in production, use a proper expression evaluator)
      return this.simpleConditionEvaluator(hint.condition, evalContext)
    } catch (error) {
      console.warn('Error evaluating hint condition:', error)
      return false
    }
  }

  private simpleConditionEvaluator(condition: string, context: any): boolean {
    // Basic condition evaluation for demo purposes
    // In production, use a proper expression parser
    
    if (condition.includes('time_spent_ms >')) {
      const threshold = parseInt(condition.match(/time_spent_ms > (\d+)/)?.[1] || '0')
      return context.time_spent_ms > threshold
    }

    if (condition.includes('error_count >')) {
      const threshold = parseInt(condition.match(/error_count > (\d+)/)?.[1] || '0')
      return context.error_count > threshold
    }

    if (condition.includes('last_error.includes')) {
      const searchTerm = condition.match(/last_error\.includes\("([^"]+)"/)?.[1]
      return searchTerm ? context.last_error.includes(searchTerm) : false
    }

    if (condition.includes('code.includes')) {
      const searchTerm = condition.match(/code\.includes\("([^"]+)"/)?.[1]
      return searchTerm ? context.code.includes(searchTerm) : false
    }

    if (condition.includes('challenge_type ===')) {
      const expectedType = condition.match(/challenge_type === "([^"]+)"/)?.[1]
      return context.challenge_type === expectedType
    }

    return false
  }

  private async deliverHint(hint: VoiceHint): Promise<void> {
    try {
      // Add delay if specified
      if (hint.delay_ms) {
        await new Promise(resolve => setTimeout(resolve, hint.delay_ms))
      }

      // Speak the hint
      await speakCoachingResponse(hint.hint_text)

      // Mark as delivered
      this.deliveredHints.add(hint.id)

      console.log(`Voice hint delivered: ${hint.hint_text}`)
    } catch (error) {
      console.warn('Error delivering voice hint:', error)
    }
  }

  public requestHint(context: CodingContext): Promise<void> {
    // User explicitly requested a hint
    const userRequestHint: VoiceHint = {
      id: `user_request_${Date.now()}`,
      trigger: 'user_request',
      condition: 'true',
      hint_text: this.generateContextualHint(context),
      priority: 'high'
    }

    return this.deliverHint(userRequestHint)
  }

  private generateContextualHint(context: CodingContext): string {
    const { code, challenge_type, error_count, time_spent_ms } = context

    // Generate contextual hints based on current state
    if (error_count > 2) {
      return "You've had several errors. Take a step back and check your syntax carefully."
    }

    if (time_spent_ms > 300000) { // 5 minutes
      return "You've been working hard on this! Try explaining your approach out loud - it often helps clarify your thinking."
    }

    if (challenge_type === 'array_methods' && code.includes('for')) {
      return "For this array challenge, try using built-in methods like map, filter, or reduce instead of loops."
    }

    if (challenge_type === 'async_programming' && !code.includes('await')) {
      return "This is an async challenge. Remember to use await when calling async functions."
    }

    if (code.length < 10) {
      return "Start by writing the basic structure of your solution, then fill in the details."
    }

    return "Break the problem down into smaller steps. What's the first thing you need to do?"
  }

  public enableHints(): void {
    this.isEnabled = true
  }

  public disableHints(): void {
    this.isEnabled = false
  }

  public resetDeliveredHints(): void {
    this.deliveredHints.clear()
  }

  public addCustomHint(hint: VoiceHint): void {
    this.hints.push(hint)
  }
}

// Singleton instance
export const voiceHintsManager = new VoiceHintsManager()

// Utility functions
export const analyzeCodeForHints = async (context: CodingContext): Promise<void> => {
  return voiceHintsManager.analyzeAndProvideHints(context)
}

export const requestVoiceHint = async (context: CodingContext): Promise<void> => {
  return voiceHintsManager.requestHint(context)
}

export const enableVoiceHints = (): void => {
  voiceHintsManager.enableHints()
}

export const disableVoiceHints = (): void => {
  voiceHintsManager.disableHints()
}