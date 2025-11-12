import type { SurveyStep } from '@/lib/survey/types'

const STEPS = ['before', 'report', 'after'] as const

export default function ProgressBar({
  currentStep,
}: {
  currentStep: SurveyStep
}) {
  const currentIndex = STEPS.indexOf(currentStep as any)
  const progress =
    currentIndex >= 0 ? ((currentIndex + 1) / STEPS.length) * 100 : 0

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-white">
          Step {currentIndex + 1} of {STEPS.length}
        </span>
        <span className="text-sm text-gray-400">
          {Math.round(progress)}% complete
        </span>
      </div>
      <div
        className="w-full rounded-full h-2"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: '#0066ff' }}
        />
      </div>
    </div>
  )
}
