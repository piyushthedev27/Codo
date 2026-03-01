import OpenAI from 'openai'

// Lazy-loaded OpenAI client to ensure environment variables are available
let _openai: OpenAI | null = null

// Get OpenAI client instance
export const getOpenAIClient = (): OpenAI => {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('Missing OpenAI API key: OPENAI_API_KEY environment variable is required')
    }

    _openai = new OpenAI({
      apiKey,
    })
  }
  return _openai
}

// Backward compatibility export
export const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    return getOpenAIClient()[prop as keyof OpenAI]
  }
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
  } catch (error: unknown) {
    if (retries > 0 && (error as { status?: number })?.status === 429) {
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