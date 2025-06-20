import { ArrowLeft, XCircle } from 'lucide-react'
import { Button } from '@/components/Button'
import Link from 'next/link'

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-semibold mb-4">Purchase Cancelled</h1>

        <p className="text-gray-600 mb-8">
          Your purchase was cancelled and no charges were made. You can return
          to complete your purchase at any time.
        </p>

        {/* Why purchase section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-medium mb-3">Still on the fence?</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• 30-day money-back guarantee</li>
            <li>• Comprehensive 50+ page report</li>
            <li>• Actionable recommendations</li>
            <li>• Priority email support</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>

          <p className="text-sm text-gray-500">
            Questions? Contact us at{' '}
            <a
              href="mailto:support@anthrasite.io"
              className="text-anthracite-blue hover:underline"
            >
              support@anthrasite.io
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
