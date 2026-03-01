/**
 * Code Example Component
 * Displays syntax-highlighted code with interactive features
 */

'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Play, Eye, EyeOff, CheckCircle, RotateCcw, Lightbulb } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'

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
  const [result, setResult] = useState<string | null>(null)
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
    setResult(null)

    try {
      if (onRun) {
        await onRun(code)
      }

      // Simulate code execution for visual feedback
      await new Promise(resolve => setTimeout(resolve, 800))

      // Determine dummy output based on language
      let dummyOutput = '> Execution successful\n> Output: 42'
      if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') {
        dummyOutput = '> [JS Runtime] Execution complete\n> Result: Hello, Codo Developer!'
      } else if (language.toLowerCase() === 'python') {
        dummyOutput = '> python main.py\n> Process finished with exit code 0'
      }

      setResult(dummyOutput)
    } catch (error) {
      console.error('Error running code:', error)
      setResult(`> Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsRunning(false)
    }
  }

  const codeStyle = theme === 'dark' ? oneDark : oneLight

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl transition-optimized hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold text-slate-400 border-slate-700 bg-slate-900/50">
            {language}
          </Badge>
          {highlightLines.length > 0 && (
            <span className="text-[10px] uppercase font-black text-blue-400 tracking-tighter">
              Highlights: {highlightLines.join(', ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-1.5 text-slate-400 hover:text-white transition-all hover:bg-slate-700/50 rounded-lg"
            title={showExplanation ? 'Hide explanation' : 'Show explanation'}
          >
            {showExplanation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white transition-all hover:bg-slate-700/50 rounded-lg"
            title="Copy code"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {runnable && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-600 disabled:to-slate-700 text-white text-xs font-black rounded-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              title="Run code"
            >
              {isRunning ? (
                <RotateCcw className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              {isRunning ? 'EXECUTING' : 'RUN'}
            </button>
          )}
        </div>
      </div>

      {/* Code Area */}
      <div className="relative group">
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
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'transparent',
                borderLeft: isHighlighted
                  ? '4px solid rgb(96, 165, 250)'
                  : '4px solid transparent',
                paddingLeft: '12px',
                display: 'block'
              }
            }
          }}
          customStyle={{
            margin: 0,
            padding: '24px',
            fontSize: '14px',
            lineHeight: '1.7',
            background: 'transparent',
            letterSpacing: '-0.01em',
            color: '#f8fafc', // Force high contrast base color
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        >
          {code}
        </SyntaxHighlighter>

        {/* Floating Play Button Overlay on hover */}
        {runnable && !isRunning && !result && (
          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="bg-emerald-500/20 backdrop-blur-sm p-4 rounded-full border border-emerald-500/30 scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-8 h-8 text-emerald-400 fill-current opacity-60" />
            </div>
          </div>
        )}
      </div>

      {/* Result Area */}
      {result && (
        <div className="px-5 py-4 bg-slate-950/80 border-t border-slate-700/50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Console Output</span>
            <button
              onClick={() => setResult(null)}
              className="text-[10px] font-bold text-slate-500 hover:text-white uppercase"
            >
              Clear
            </button>
          </div>
          <pre className="text-xs font-mono text-emerald-300/90 bg-black/30 p-3 rounded-lg border border-emerald-500/10 overflow-x-auto">
            {result}
          </pre>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && explanation && (
        <div className="px-5 py-5 bg-blue-500/5 border-t border-slate-700/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg mt-0.5">
              <Lightbulb className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-300 mb-1">Coach Insight</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
