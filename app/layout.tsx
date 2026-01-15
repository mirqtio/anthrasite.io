import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import { ToasterClient } from '@/components/ToasterClient'
import { MonitoringProvider } from '@/components/MonitoringProvider'
import { SiteModeProvider } from '@/lib/context/SiteModeContext'
import { ConsentProvider } from '@/lib/context/ConsentContext'
import { HelpWidgetProvider } from '@/components/help'
import { ConditionalHelpWidget } from '@/components/help/ConditionalHelpWidget'
import {
  AnalyticsWrapper,
  AnalyticsNoScriptWrapper,
} from '@/app/_components/Analytics/AnalyticsWrapper'
import { ClarityWrapper } from '@/app/_components/Analytics/ClarityWrapper'
import ReadyGate from '@/app/_components/ReadyGate'
import { AuthListener } from '@/components/auth/AuthListener'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap', // Use font-display: swap for better performance
  preload: true, // Preload the font
  adjustFontFallback: true, // Reduce CLS
})

export const metadata: Metadata = {
  title: 'Anthrasite | Website Audits That Show What to Fix',
  description:
    "Find what's costing you customers. Website audits that show exactly what to fix—and what it's worth. Prioritized by business impact, not technical jargon.",
  metadataBase: new URL('https://www.anthrasite.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Anthrasite | Website Audits That Show What to Fix',
    description:
      "Find what's costing you customers. Website audits that show exactly what to fix—and what it's worth. Prioritized by business impact, not technical jargon.",
    type: 'website',
    siteName: 'Anthrasite',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anthrasite | Website Audits That Show What to Fix',
    description:
      "Find what's costing you customers. Website audits that show exactly what to fix—and what it's worth. Prioritized by business impact, not technical jargon.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to critical third-party domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <div data-app-shell>
          <MonitoringProvider>
            <ConsentProvider>
              <SiteModeProvider>
                <HelpWidgetProvider>
                  {children}
                  <ToasterClient />
                  <ConditionalHelpWidget />
                  <AnalyticsWrapper />
                  <AnalyticsNoScriptWrapper />
                  <ClarityWrapper />
                  <ReadyGate />
                  <Suspense fallback={null}>
                    <AuthListener />
                  </Suspense>
                </HelpWidgetProvider>
              </SiteModeProvider>
            </ConsentProvider>
          </MonitoringProvider>
        </div>
      </body>
    </html>
  )
}
