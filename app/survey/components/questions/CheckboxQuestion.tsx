import type { CheckboxQuestion as CheckboxQuestionType } from '@/lib/survey/types'

interface Props {
  question: CheckboxQuestionType
  value: boolean
  onChange: (value: boolean) => void
  error?: string
}

export default function CheckboxQuestion({
  question,
  value,
  onChange,
  error,
}: Props) {
  return (
    <div>
      <p className="block text-lg font-medium text-gray-900 mb-3">
        {question.question}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </p>

      {question.options.map((option) => (
        <label key={option} className="flex items-center">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="mr-3 w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-gray-700">{option}</span>
        </label>
      ))}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
