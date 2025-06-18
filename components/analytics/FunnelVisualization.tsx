'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/Card'

export interface FunnelStep {
  name: string
  count: number
  percentage: number
}

interface FunnelVisualizationProps {
  title: string
  steps: FunnelStep[]
  className?: string
}

export function FunnelVisualization({ title, steps, className = '' }: FunnelVisualizationProps) {
  const maxCount = Math.max(...steps.map(s => s.count))

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-anthracite-black mb-6">{title}</h3>
      
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isFirst = index === 0
          const previousStep = index > 0 ? steps[index - 1] : null
          const dropoffRate = previousStep 
            ? ((previousStep.count - step.count) / previousStep.count * 100).toFixed(1)
            : '0'
          
          return (
            <div key={step.name} className="relative">
              {/* Dropoff indicator */}
              {!isFirst && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-sm text-red-600">
                  -{dropoffRate}%
                </div>
              )}
              
              {/* Funnel step */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Background bar */}
                <div className="h-12 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Filled bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-ignition-blue to-blue-500 flex items-center px-4"
                  >
                    <span className="text-white font-medium text-sm">
                      {step.count.toLocaleString()}
                    </span>
                  </motion.div>
                </div>
                
                {/* Step details */}
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-anthracite-gray">{step.name}</span>
                  <span className="text-sm font-medium text-anthracite-black">
                    {step.percentage.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
      
      {/* Summary stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-anthracite-gray">Total Conversion</p>
            <p className="text-2xl font-semibold text-anthracite-black">
              {steps[steps.length - 1].percentage.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-anthracite-gray">Total Drop-off</p>
            <p className="text-2xl font-semibold text-red-600">
              {(100 - steps[steps.length - 1].percentage).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}