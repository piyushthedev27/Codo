/**
 * Interactive Quiz Component
 * Provides quiz functionality within lessons
 */

'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, HelpCircle, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface InteractiveQuizProps {
  id: string
  question: string
  options: QuizOption[]
  explanation: string
  multipleChoice?: boolean
  onAnswer?: (correct: boolean, selectedOptions: string[]) => void
  showHint?: boolean
  hint?: string
}

export function InteractiveQuiz({
  id,
  question,
  options,
  explanation,
  multipleChoice = false,
  onAnswer,
  showHint = false,
  hint
}: InteractiveQuizProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showHintText, setShowHintText] = useState(false)

  const handleOptionSelect = (optionId: string) => {
    if (submitted) return

    if (multipleChoice) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(_id => _id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const handleSubmit = () => {
    if (selectedOptions.length === 0) return

    setSubmitted(true)
    setShowExplanation(true)

    // Check if answer is correct
    const correctOptions = options.filter(opt => opt.isCorrect).map(opt => opt.id)
    const isCorrect = multipleChoice
      ? selectedOptions.length === correctOptions.length &&
      selectedOptions.every(id => correctOptions.includes(id))
      : correctOptions.includes(selectedOptions[0])

    onAnswer?.(isCorrect, selectedOptions)
  }

  const handleReset = () => {
    setSelectedOptions([])
    setSubmitted(false)
    setShowExplanation(false)
    setShowHintText(false)
  }

  const getOptionStatus = (option: QuizOption) => {
    if (!submitted) return 'default'

    if (selectedOptions.includes(option.id)) {
      return option.isCorrect ? 'correct' : 'incorrect'
    }

    return option.isCorrect ? 'missed' : 'default'
  }

  const getOptionStyles = (status: string) => {
    switch (status) {
      case 'correct':
        return 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200'
      case 'incorrect':
        return 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200'
      case 'missed':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
    }
  }

  const getOptionIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'incorrect':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'missed':
        return <CheckCircle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const correctCount = options.filter(opt => opt.isCorrect).length
  const selectedCorrectCount = selectedOptions.filter(id =>
    options.find(opt => opt.id === id)?.isCorrect
  ).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-4">
        <HelpCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {question}
          </h3>
          {multipleChoice && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select all correct answers ({correctCount} correct)
            </p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {options.map((option) => {
          const status = getOptionStatus(option)
          const isSelected = selectedOptions.includes(option.id)

          return (
            <motion.button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={submitted}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${getOptionStyles(status)} ${isSelected && !submitted ? 'ring-2 ring-blue-500' : ''
                } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
              whileHover={!submitted ? { scale: 1.01 } : {}}
              whileTap={!submitted ? { scale: 0.99 } : {}}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1">{option.text}</span>
                {submitted && getOptionIcon(status)}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showHint && hint && (
            <button
              onClick={() => setShowHintText(!showHintText)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              {showHintText ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {submitted && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Try Again
            </button>
          )}

          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Submit Answer
            </button>
          )}
        </div>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHintText && hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{hint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Explanation</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">{explanation}</p>

            {submitted && (
              <div className="mt-3 flex items-center gap-2">
                {selectedCorrectCount === correctCount && selectedOptions.length === correctCount ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Correct! Well done!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {selectedCorrectCount > 0 ? 'Partially correct' : 'Incorrect'} - Review the explanation above
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}