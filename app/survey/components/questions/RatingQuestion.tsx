import type { RatingQuestion as RatingQuestionType } from '@/lib/survey/types'

interface Props {
  question: RatingQuestionType
  value: number | undefined
  onChange: (value: number) => void
  error?: string
}

export default function RatingQuestion({
  question,
  value,
  onChange,
  error,
}: Props) {
  const stars = Array.from({ length: question.max }, (_, i) => i + 1)

  return (
    <div>
      <label className="block text-lg font-medium text-gray-900 mb-2">
        {question.question}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-600 mb-3">{question.description}</p>
      )}

      <div className="flex gap-2">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-12 h-12 rounded-full font-semibold transition-all ${
              value && star <= value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            aria-label={`Rating ${star} out of ${question.max}`}
          >
            {star}
          </button>
        ))}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
