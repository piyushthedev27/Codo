/**
 * Code Example Component
 * Displays syntax-highlighted code with interactive features
 */

'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Play, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useTheme } from 'next-themes'

export interface CodeExampleProps {
  id: string
  language: string
  code: string
  explanation: string
  runnable?: boolean
  showLineNumbers?: boolean
  highlightLines?: number[]
  onRun?: (code: string) => void
  onCopy?: () => void
}

export function CodeExample({
  id,
  language,
  code,
  explanation,
  runnable = false,
  showLineNumbers = true,
  highlightLines = [],
  onRun,
  onCopy
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false)
  const [showExplanation, setShowExplanation] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const { theme } = useTheme()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const handleRun = async () => {
    if (!runnable || isRunning) return
    
    setIsRunning(true)
    try {
      await onRun?.(code)
    } catch (error) {
      console.error('Error running code:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const codeStyle = theme === 'dark' ? oneDark : oneLight

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {language}
          </span>
          {highlightLines.length > 0 && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              Lines {highlightLines.join(', ')} highlighted
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={showExplanation ? 'Hide explanation' : 'Show explanation'}
          >
            {showExplanation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleCopy}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Copy code"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          
          {runnable && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
              title="Run code"
            >
              <Play className="w-3 h-3" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
          )}
        </div>
      </div>

      {/* Code */}
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={codeStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const isHighlighted = highlightLines.includes(lineNumber)
            return {
              style: {
                backgroundColor: isHighlighted 
                  ? theme === 'dark' 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(59, 130, 246, 0.05)'
                  : 'transparent',
                borderLeft: isHighlighted 
                  ? '3px solid rgb(59, 130, 246)' 
                  : '3px solid transparent',
                paddingLeft: '8px',
                display: 'block'
              }
            }
          }}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Explanation */}
      {showExplanation && explanation && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium text-blue-700 dark:text-blue-300">Explanation:</span> {explanation}
          </p>
        </div>
      )}
    </div>
  )
}