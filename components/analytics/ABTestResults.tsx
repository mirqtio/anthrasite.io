'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface ABTestVariant {
  id: string
  name: string
  visitors: number
  conversions: number
  conversionRate: number
  confidence: number
  isControl?: boolean
  isWinner?: boolean
}

export interface ABTestResult {
  id: string
  name: string
  status: 'running' | 'completed' | 'paused'
  startDate: Date
  variants: ABTestVariant[]
}

interface ABTestResultsProps {
  test: ABTestResult
  onDeploy?: (variantId: string) => void
  className?: string
}

export function ABTestResults({
  test,
  onDeploy,
  className = '',
}: ABTestResultsProps) {
  const control = test.variants.find((v) => v.isControl)
  const winner = test.variants.find((v) => v.isWinner)

  const getImprovementPercent = (variant: ABTestVariant) => {
    if (!control || variant.isControl) return 0
    return (
      ((variant.conversionRate - control.conversionRate) /
        control.conversionRate) *
      100
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600'
    if (confidence >= 90) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0)
      return <TrendingUp className="w-4 h-4 text-green-600" />
    if (improvement < 0)
      return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-anthracite-black">
            {test.name}
          </h3>
          <p className="text-sm text-anthracite-gray mt-1">
            Started {test.startDate.toLocaleDateString()}
          </p>
        </div>

        <span
          className={`
          inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
          ${test.status === 'running' ? 'bg-blue-100 text-blue-800' : ''}
          ${test.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
          ${test.status === 'paused' ? 'bg-gray-100 text-gray-800' : ''}
        `}
        >
          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
        </span>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        {test.variants.map((variant, index) => {
          const improvement = getImprovementPercent(variant)
          const isSignificant = variant.confidence >= 95

          return (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${variant.isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}
              `}
            >
              {/* Winner badge */}
              {variant.isWinner && (
                <div className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Winner
                </div>
              )}

              {/* Variant details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Name */}
                <div>
                  <p className="text-sm text-anthracite-gray">Variant</p>
                  <p className="font-medium text-anthracite-black">
                    {variant.name}
                    {variant.isControl && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Control)
                      </span>
                    )}
                  </p>
                </div>

                {/* Visitors */}
                <div>
                  <p className="text-sm text-anthracite-gray">Visitors</p>
                  <p className="font-medium text-anthracite-black">
                    {variant.visitors.toLocaleString()}
                  </p>
                </div>

                {/* Conversion rate */}
                <div>
                  <p className="text-sm text-anthracite-gray">
                    Conversion Rate
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-anthracite-black">
                      {variant.conversionRate.toFixed(2)}%
                    </p>
                    {!variant.isControl && (
                      <div className="flex items-center gap-1">
                        {getImprovementIcon(improvement)}
                        <span
                          className={`text-sm ${improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-400'}`}
                        >
                          {improvement > 0 ? '+' : ''}
                          {improvement.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <p className="text-sm text-anthracite-gray">Confidence</p>
                  <p
                    className={`font-medium ${getConfidenceColor(variant.confidence)}`}
                  >
                    {variant.confidence}%
                    {isSignificant && <span className="ml-1 text-xs">✓</span>}
                  </p>
                </div>
              </div>

              {/* Deploy button */}
              {test.status === 'completed' && variant.isWinner && onDeploy && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onDeploy(variant.id)}
                  >
                    Deploy Winner
                  </Button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Statistical significance note */}
      {test.status === 'running' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Test is still running. Wait for 95%
            confidence before making decisions.
          </p>
        </div>
      )}
    </Card>
  )
}
