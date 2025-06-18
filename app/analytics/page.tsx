'use client'

import {
  FunnelVisualization,
  FunnelStep,
} from '@/components/analytics/FunnelVisualization'
import { ABTestResults } from '@/components/analytics/ABTestResults'
import { Card } from '@/components/Card'

// Mock data for demonstration
const mockFunnelData: FunnelStep[] = [
  { name: 'Homepage Visit', count: 10000, percentage: 100 },
  { name: 'UTM Validated', count: 7500, percentage: 75 },
  { name: 'Purchase Page', count: 6000, percentage: 60 },
  { name: 'Checkout Started', count: 3000, percentage: 30 },
  { name: 'Payment Completed', count: 1500, percentage: 15 },
]

export default function AnalyticsPage() {
  const handleDeployVariant = (variantId: string) => {
    console.log('Deploying variant:', variantId)
    // Implementation would update the active variant
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-anthracite-black">
              Analytics Dashboard
            </h1>
            <p className="text-anthracite-gray mt-2">
              Track performance, conversions, and A/B test results
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <p className="text-sm text-anthracite-gray">Total Visitors</p>
              <p className="text-3xl font-bold text-anthracite-black mt-2">
                45,678
              </p>
              <p className="text-sm text-green-600 mt-2">
                +12.5% from last week
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-anthracite-gray">Conversion Rate</p>
              <p className="text-3xl font-bold text-anthracite-black mt-2">
                15.2%
              </p>
              <p className="text-sm text-green-600 mt-2">
                +2.1% from last week
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-anthracite-gray">Revenue</p>
              <p className="text-3xl font-bold text-anthracite-black mt-2">
                $148,500
              </p>
              <p className="text-sm text-green-600 mt-2">
                +18.3% from last week
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-anthracite-gray">Active Tests</p>
              <p className="text-3xl font-bold text-anthracite-black mt-2">3</p>
              <p className="text-sm text-anthracite-gray mt-2">
                2 nearing significance
              </p>
            </Card>
          </div>

          {/* Funnel Visualization */}
          <div className="mb-8">
            <FunnelVisualization
              title="Main Purchase Funnel"
              steps={mockFunnelData}
            />
          </div>

          {/* A/B Test Results */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-anthracite-black mb-6">
              A/B Test Results
            </h2>

            <ABTestResults onDeploy={handleDeployVariant} />
          </div>

          {/* Additional sections could include:
              - Real-time activity feed
              - Geographic distribution
              - Device/browser breakdown
              - Custom event tracking
          */}
        </div>
      </div>
    </main>
  )
}
