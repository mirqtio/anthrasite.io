import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Purchase - Anthrasite Website Audit',
  description: 'Get your comprehensive website audit report',
  robots: 'noindex, nofollow', // Don't index purchase pages
  alternates: {
    canonical: 'https://www.anthrasite.io/purchase',
  },
}

export default function PurchaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}