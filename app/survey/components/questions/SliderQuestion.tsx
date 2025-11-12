import type { SliderQuestion as SliderQuestionType } from '@/lib/survey/types'

interface Props {
  question: SliderQuestionType
  value: number | undefined
  onChange: (value: number) => void
  error?: string
}

export default function SliderQuestion({
  question,
  value,
  onChange,
  error,
}: Props) {
  const displayValue = value !== undefined ? value : question.min

  return (
    <div>
      <label className="block text-lg font-medium text-gray-900 mb-2">
        {question.question}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={question.min}
            max={question.max}
            value={displayValue}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-label={question.question}
          />
          <div className="w-16 text-center">
            <span className="text-2xl font-bold text-blue-600">
              {displayValue}%
            </span>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>{question.min}%</span>
          <span>{question.max}%</span>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
