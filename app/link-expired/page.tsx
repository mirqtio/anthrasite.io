'use client'

import Link from 'next/link'
import { Button } from '@/components/Button/Button'
import { Card } from '@/components/Card/Card'

export const dynamic = 'force-dynamic'

export default function LinkExpiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card variant="elevated" className="max-w-md text-center p-8">
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-anthracite-error/10 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-anthracite-error"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-anthracite-black">
            Link Expired
          </h1>

          <p className="text-anthracite-black/60">
            This purchase link has expired. Purchase links are valid for 24
            hours from when they were sent.
          </p>

          <p className="text-anthracite-black/60">
            Please contact the sender to request a new link, or return to our
            homepage to learn more about Anthrasite.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/">
              <Button variant="primary">Return to Homepage</Button>
            </Link>

            <Link href="/contact">
              <Button variant="secondary">Contact Support</Button>
            </Link>
          </div>
        </div>
      </Card>
    </main>
  )
}
