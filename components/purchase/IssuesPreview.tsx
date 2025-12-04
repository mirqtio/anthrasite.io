'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import type { HeroIssue } from '@/lib/purchase/types'

interface IssuesPreviewProps {
  issues: HeroIssue[]
  impactLow: string
  impactHigh: string
}

/**
 * Displays the top 3 issues from Phase C with their impact ranges
 */
export function IssuesPreview({
  issues,
  impactLow,
  impactHigh,
}: IssuesPreviewProps) {
  if (!issues || issues.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24">
      <div className="px-10 max-w-[1200px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-[40px] font-light mb-4">Top Issues Identified</h2>
          <p className="text-[20px] opacity-70">
            Our assessment found these critical issues affecting your revenue
          </p>
        </motion.div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {issues.slice(0, 3).map((issue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              className="carbon-container p-8"
            >
              {/* Issue Icon */}
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>

              {/* Issue Title */}
              <h3 className="text-[20px] font-medium mb-4 leading-tight">
                {issue.title}
              </h3>

              {/* Issue Description */}
              <p className="text-[16px] opacity-60 mb-6 leading-relaxed">
                {issue.description}
              </p>

              {/* Impact Range */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-[14px] font-medium">
                    ${issue.impact_low} – ${issue.impact_high}/mo at risk
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Impact Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="carbon-container p-12 text-center"
        >
          <p className="text-[17px] opacity-60 mb-4">
            Total monthly revenue at risk:
          </p>
          <p className="text-[48px] font-light text-accent mb-6">
            {impactLow} – {impactHigh}
          </p>
          <p className="text-[16px] opacity-50 max-w-2xl mx-auto">
            Your full report includes detailed analysis, prioritized
            recommendations, and a transparent methodology showing exactly how
            we calculated these figures.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
