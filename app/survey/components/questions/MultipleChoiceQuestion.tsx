import { useState } from 'react'
import type { MultipleChoiceQuestion as MultipleChoiceQuestionType } from '@/lib/survey/types'

interface Props {
  question: MultipleChoiceQuestionType
  value: string | undefined
  onChange: (value: string) => void
  error?: string
}

export default function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  error,
}: Props) {
  const [showOther, setShowOther] = useState<boolean>(
    Boolean(question.allowOther && value && !question.options.includes(value))
  )
  const [otherValue, setOtherValue] = useState(
    value && !question.options.includes(value) ? value : ''
  )

  function handleOptionChange(option: string) {
    if (option === 'Other' && question.allowOther) {
      setShowOther(true)
      onChange(otherValue || '')
    } else {
      setShowOther(false)
      onChange(option)
    }
  }

  function handleOtherChange(newValue: string) {
    setOtherValue(newValue)
    onChange(newValue)
  }

  return (
    <div>
      <label className="block text-lg font-medium text-gray-900 mb-2">
        {question.question}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="space-y-2">
        {question.options.map((option) => (
          <label key={option} className="flex items-center">
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={value === option || (option === 'Other' && showOther)}
              onChange={() => handleOptionChange(option)}
              className="mr-3 w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}

        {question.allowOther && (
          <label className="flex items-center">
            <input
              type="radio"
              name={question.id}
              value="Other"
              checked={showOther}
              onChange={() => handleOptionChange('Other')}
              className="mr-3 w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">Other</span>
          </label>
        )}

        {showOther && (
          <input
            type="text"
            value={otherValue}
            onChange={(e) => handleOtherChange(e.target.value)}
            placeholder="Please specify..."
            className="ml-7 mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
          />
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
