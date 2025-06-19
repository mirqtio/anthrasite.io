import { Suspense } from 'react'
import { CheckoutSimulatorContent } from './CheckoutSimulatorContent'

function CheckoutSimulatorFallback() {
  return (
    <div className="min-h-screen bg-carbon text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/60">Loading checkout simulator...</p>
      </div>
    </div>
  )
}

export default function CheckoutSimulator() {
  return (
    <Suspense fallback={<CheckoutSimulatorFallback />}>
      <CheckoutSimulatorContent />
    </Suspense>
  )
}
