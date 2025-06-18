'use client'

export default function CarbonTestPage() {
  return (
    <>
      {/* Radial gradient background */}
      <div className="radial-gradient" />

      {/* Two-column grid layout */}
      <div className="carbon-grid">
        {/* Left column - Hero content */}
        <div className="carbon-left">
          <div>
            <h1 className="text-display mb-8">Anthrasite</h1>
            <p className="text-subheader mb-12">
              Automated website performance audits delivered to your inbox
            </p>
            <div className="text-accent mb-8">$2,400</div>
            <p className="text-body mb-12">
              Average value discovered per audit
            </p>
            <button className="carbon-button">Get Your Report</button>
          </div>
        </div>

        {/* Right column - Content sections */}
        <div className="carbon-right">
          {/* What we analyze */}
          <section className="mb-20">
            <h2 className="text-header mb-8 pulse-underline">
              What we analyze
            </h2>
            <ul className="carbon-list">
              <li>Core Web Vitals and page speed metrics</li>
              <li>SEO opportunities and technical issues</li>
              <li>Conversion optimization potential</li>
              <li>Competitor performance benchmarks</li>
              <li>Mobile experience and accessibility</li>
            </ul>
          </section>

          {/* How it works */}
          <section className="mb-20">
            <h2 className="text-header mb-8">How it works</h2>
            <div className="space-y-12">
              <div className="carbon-container">
                <div className="text-small opacity-40 mb-2">01</div>
                <h3 className="text-subheader mb-2">Submit your domain</h3>
                <p className="text-body">
                  We analyze your entire website automatically
                </p>
              </div>
              <div className="carbon-container">
                <div className="text-small opacity-40 mb-2">02</div>
                <h3 className="text-subheader mb-2">Receive detailed report</h3>
                <p className="text-body">
                  15-page PDF with actionable recommendations
                </p>
              </div>
              <div className="carbon-container">
                <div className="text-small opacity-40 mb-2">03</div>
                <h3 className="text-subheader mb-2">Implement changes</h3>
                <p className="text-body">
                  Follow our prioritized roadmap for maximum impact
                </p>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="mb-20">
            <h2 className="text-header mb-8">Simple pricing</h2>
            <div className="carbon-container">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-accent">$99</span>
                <span className="text-body">per audit</span>
              </div>
              <p className="text-body mb-6">
                One-time payment. No subscription required.
              </p>
              <ul className="carbon-list">
                <li>Complete website analysis</li>
                <li>15-page detailed report</li>
                <li>Actionable recommendations</li>
                <li>30-day support included</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-header mb-8">Questions?</h2>
            <p className="text-body mb-4">hello@anthrasite.io</p>
            <p className="text-body opacity-40">
              We typically respond within 24 hours
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
