import type { TextQuestion as TextQuestionType } from '@/lib/survey/types'

interface Props {
  question: TextQuestionType
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function TextQuestion({
  question,
  value,
  onChange,
  error,
}: Props) {
  const Component = question.multiline ? 'textarea' : 'input'

  return (
    <div>
      <label className="block text-lg font-medium text-gray-900 mb-2">
        {question.question}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-600 mb-3">{question.description}</p>
      )}

      <Component
        type={question.multiline ? undefined : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        rows={question.multiline ? 4 : undefined}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-gray-900 bg-white"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
