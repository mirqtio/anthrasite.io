'use client'

import { useState } from 'react'
import { Button } from '@/components/Button/Button'
import { HelpWidget } from '@/components/help/HelpWidget'
import { HelpWidgetProvider } from '@/components/help/HelpProvider'

export default function DesignTestPage() {
  const [showWidget, setShowWidget] = useState(false)

  return (
    <HelpWidgetProvider>
      <main className="min-h-screen bg-white p-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Typography Test */}
          <section>
            <h2 className="text-2xl font-medium mb-8">Typography</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-anthracite-black/60 mb-1">Hero (64px/40px mobile)</p>
                <h1 className="text-hero-mobile md:text-hero font-light text-anthracite-black">
                  Your website has untapped potential
                </h1>
              </div>
              <div>
                <p className="text-sm text-anthracite-black/60 mb-1">Subheadline (18px)</p>
                <p className="text-subheadline text-anthracite-black/60">
                  Join the waitlist for automated website audits
                </p>
              </div>
              <div>
                <p className="text-sm text-anthracite-black/60 mb-1">Business Name (32px)</p>
                <p className="text-business-name font-medium text-anthracite-black">
                  Acme Corporation
                </p>
              </div>
              <div>
                <p className="text-sm text-anthracite-black/60 mb-1">Value Prop (48px)</p>
                <p className="text-value-prop font-light text-anthracite-blue">
                  $2,400
                </p>
              </div>
            </div>
          </section>

          {/* Color Palette */}
          <section>
            <h2 className="text-2xl font-medium mb-8">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-24 bg-anthracite-black rounded mb-2" />
                <p className="text-sm">Black #0A0A0A</p>
              </div>
              <div>
                <div className="h-24 bg-anthracite-white border border-anthracite-gray-200 rounded mb-2" />
                <p className="text-sm">White #FFFFFF</p>
              </div>
              <div>
                <div className="h-24 bg-anthracite-blue rounded mb-2" />
                <p className="text-sm">Blue #0066FF</p>
              </div>
              <div>
                <div className="h-24 bg-anthracite-gray-100 rounded mb-2" />
                <p className="text-sm">Gray 100 #F5F5F5</p>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-2xl font-medium mb-8">Buttons</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button size="lg">Get Your Report for $99</Button>
                <Button size="lg" variant="secondary">Secondary Button</Button>
                <Button size="lg" variant="outline">Outline Button</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="md">Medium Button</Button>
                <Button size="sm">Small Button</Button>
              </div>
              <div>
                <p className="text-sm text-anthracite-black/60 mb-2">Full Width (Mobile)</p>
                <div className="max-w-md">
                  <Button size="lg" fullWidth>Get Your Report for $99</Button>
                </div>
              </div>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-2xl font-medium mb-8">Cards</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-anthracite-gray-100 p-10 rounded-card shadow-card">
                <div className="text-center">
                  <div className="text-value-prop font-light text-anthracite-blue mb-2">
                    $2,400
                  </div>
                  <p className="text-base text-anthracite-black/80">
                    in potential improvements identified
                  </p>
                </div>
              </div>
              <div className="bg-white border border-anthracite-gray-200 p-10 rounded-card">
                <h3 className="text-xl font-medium mb-4">Report Includes</h3>
                <ul className="space-y-3">
                  <li className="flex gap-4">
                    <div className="w-0.5 h-6 bg-anthracite-blue flex-shrink-0 mt-0.5" />
                    <span>Complete website audit</span>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-0.5 h-6 bg-anthracite-blue flex-shrink-0 mt-0.5" />
                    <span>SEO recommendations</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Animations */}
          <section>
            <h2 className="text-2xl font-medium mb-8">Animations</h2>
            <div className="space-y-4">
              <div className="animate-fade-in bg-anthracite-gray-100 p-4 rounded">
                <p>Fade In (0.8s ease-out)</p>
              </div>
              <div className="animate-fade-in-delay-1 bg-anthracite-gray-100 p-4 rounded">
                <p>Fade In Delayed 200ms</p>
              </div>
              <div className="animate-fade-in-delay-2 bg-anthracite-gray-100 p-4 rounded">
                <p>Fade In Delayed 400ms</p>
              </div>
            </div>
          </section>

          {/* Help Widget */}
          <section>
            <h2 className="text-2xl font-medium mb-8">Help Widget</h2>
            <p className="text-anthracite-black/60 mb-4">
              The help widget appears in the bottom right corner. Look for the blue circle with "?" icon.
            </p>
            <Button onClick={() => setShowWidget(!showWidget)}>
              {showWidget ? 'Help widget is visible' : 'Show help widget'}
            </Button>
          </section>

          {/* Grain Texture */}
          <section>
            <h2 className="text-2xl font-medium mb-8">Grain Texture</h2>
            <div className="relative grain-texture bg-white border border-anthracite-gray-200 rounded h-48 flex items-center justify-center">
              <p className="text-anthracite-black/60">Subtle 2% grain texture overlay</p>
            </div>
          </section>
        </div>

        {/* Help Widget Component */}
        {showWidget && <HelpWidget />}
      </main>
    </HelpWidgetProvider>
  )
}