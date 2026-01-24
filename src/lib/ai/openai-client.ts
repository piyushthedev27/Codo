import OpenAI from 'openai'
import { config } from '../config'

// Create OpenAI client
export const openai = new OpenAI({
  apiKey: config.openai.apiKey,
})

// Rate limiting configuration
export const RATE_LIMITS = {
  requestsPerMinute: 500,
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 16000, // 16 seconds
} as const

// Exponential backoff retry logic
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = RATE_LIMITS.maxRetries
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && error?.status === 429) {
      const delay = Math.min(
        RATE_LIMITS.baseDelay * Math.pow(2, RATE_LIMITS.maxRetries - retries),
        RATE_LIMITS.maxDelay
      )
      
      console.warn(`Rate limited. Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}