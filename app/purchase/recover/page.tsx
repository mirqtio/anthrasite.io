import { Suspense } from 'react'
import { RecoverPageContent } from './RecoverPageContent'

function RecoverPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ignition-blue mx-auto mb-4"></div>
        <p className="text-anthracite-gray">Loading recovery page...</p>
      </div>
    </div>
  )
}

export default function RecoverPage() {
  return (
    <Suspense fallback={<RecoverPageFallback />}>
      <RecoverPageContent />
    </Suspense>
  )
}
