'use client'

import { motion } from 'framer-motion'
import {
  Zap,
  Search,
  Shield,
  Eye,
  TrendingUp,
  CheckCircle,
  FileText,
  BarChart3,
} from 'lucide-react'
import { ReportPreviewData } from '@/lib/purchase/purchase-service'

interface ReportPreviewProps {
  preview: ReportPreviewData
}

const metricIcons = {
  performanceScore: Zap,
  seoScore: Search,
  securityScore: Shield,
  accessibilityScore: Eye,
}

const metricLabels = {
  performanceScore: 'Performance',
  seoScore: 'SEO',
  securityScore: 'Security',
  accessibilityScore: 'Accessibility',
}

export function ReportPreview({ preview }: ReportPreviewProps) {
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
          <h2 className="text-[40px] font-light mb-4">
            Your Website's Current Performance
          </h2>
          <p className="text-[20px] opacity-70">
            Here's a preview of what we discovered about {preview.domain}
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {Object.entries(preview.metrics).map(([key, score], index) => {
            const Icon = metricIcons[key as keyof typeof metricIcons]
            const label = metricLabels[key as keyof typeof metricLabels]
            const color =
              score >= 90
                ? 'text-accent'
                : score >= 70
                  ? 'text-yellow-500'
                  : 'text-red-500'

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                className="carbon-container p-8 text-center"
              >
                <Icon
                  className={`w-10 h-10 ${color} mx-auto mb-4 opacity-80`}
                />
                <div className={`text-[40px] font-light ${color} mb-2`}>
                  {score}
                </div>
                <div className="text-[17px] opacity-60">{label}</div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Key Improvements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="carbon-container p-12 mb-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <TrendingUp className="w-8 h-8 text-accent" />
            <h3 className="text-[32px] font-light">Key Improvements Found</h3>
          </div>

          <div className="space-y-6">
            {preview.improvements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: 0.5 + index * 0.1,
                  ease: 'easeOut',
                }}
                className="flex items-start gap-4"
              >
                <div className="w-[2px] h-8 bg-accent flex-shrink-0 mt-0.5" />
                <span className="text-[20px]">{improvement}</span>
              </motion.div>
            ))}
          </div>

          <div
            className="mt-12 p-8 bg-accent/10 rounded-lg"
            data-testid="value-proposition"
          >
            <p className="text-[17px] opacity-60 mb-2">
              Estimated monthly value of improvements:
            </p>
            <p className="text-[40px] font-light text-accent">
              {preview.estimatedValue}
            </p>
          </div>
        </motion.div>

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="carbon-container p-10">
            <FileText className="w-12 h-12 text-accent mb-6" />
            <h3 className="text-[24px] font-light mb-6">Detailed Analysis</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-[2px] h-6 bg-accent/60 flex-shrink-0 mt-0.5" />
                <span className="text-[17px] opacity-80">
                  50+ page comprehensive report
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[2px] h-6 bg-accent/60 flex-shrink-0 mt-0.5" />
                <span className="text-[17px] opacity-80">
                  Technical SEO audit
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[2px] h-6 bg-accent/60 flex-shrink-0 mt-0.5" />
                <span className="text-[17px] opacity-80">
                  Performance optimization guide
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[2px] h-6 bg-accent/60 flex-shrink-0 mt-0.5" />
                <span className="text-[17px] opacity-80">
                  Security vulnerability assessment
                </span>
              </li>
            </ul>
          </div>

          <div className="carbon-container p-10">
            <BarChart3 className="w-12 h-12 text-accent mb-6" />
            <h3 className="text-[24px] font-light mb-6">Actionable Insights</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-[2px] h-6 bg-accent/60 flex-shrink-0 mt-0.5" />
                <span className="text-[17px] opacity-80">
                  Priority-ranked improvements
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[2px] h-6 bg-accent/60 flex-shrink-0 mt-0.5" />
                <span className="text-[17px] opacity-80">
                  Step-by-step implementation guides
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[2px] h-6 bg-accent/60 flex-shrink-0 mt-0.5" />
                <span className="text-[17px] opacity-80">
                  ROI estimates for each fix
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[2px] h-6 bg-accent/60 flex-shrink-0 mt-0.5" />
                <span className="text-[17px] opacity-80">
                  Competitor comparison data
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
