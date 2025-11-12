'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import SurveyContainer from './components/SurveyContainer'

function SurveyPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Survey Link
          </h1>
          <p className="text-gray-600">
            This survey link is missing required information. Please use the
            link from your email.
          </p>
        </div>
      </div>
    )
  }

  return <SurveyContainer token={token} />
}

export default function Survey() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading survey...</div>
        </div>
      }
    >
      <SurveyPage />
    </Suspense>
  )
}
