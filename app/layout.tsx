import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MonitoringProvider } from '@/components/MonitoringProvider'
import { SiteModeProvider } from '@/lib/context/SiteModeContext'
import { ConsentProvider } from '@/lib/context/ConsentContext'
import { ConsentManager } from '@/components/consent'
import { HelpWidgetProvider } from '@/components/help'
import { ConditionalHelpWidget } from '@/components/help/ConditionalHelpWidget'
import {
  AnalyticsWrapper,
  AnalyticsNoScriptWrapper,
} from '@/app/_components/Analytics/AnalyticsWrapper'
import { HydrationFlag } from '@/app/_components/HydrationFlag'
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
  title: 'Anthrasite - Website Audit Tool',
  description: 'Automated website audits that uncover untapped potential',
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
                  <ConsentManager />
                  <ConditionalHelpWidget />
                  <AnalyticsWrapper />
                  <AnalyticsNoScriptWrapper />
                  <HydrationFlag />
                </HelpWidgetProvider>
              </SiteModeProvider>
            </ConsentProvider>
          </MonitoringProvider>
        </div>
      </body>
    </html>
  )
}
