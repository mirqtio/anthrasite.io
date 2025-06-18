'use client'

import { useState } from 'react'

export default function RefinedTestPage() {
  const [activeStep, setActiveStep] = useState<'enter' | 'payment'>('enter')
  const [showModal, setShowModal] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [email, setEmail] = useState('')

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const openPurchase = () => {
    setShowModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closePurchase = () => {
    setShowModal(false)
    document.body.style.overflow = ''
    setActiveStep('enter')
  }

  const goToPayment = () => {
    if (!websiteUrl || !email) {
      alert('Please fill in all fields')
      return
    }
    setActiveStep('payment')
  }

  const completePurchase = () => {
    alert('Purchase complete! Check your email for your report.')
    closePurchase()
  }

  return (
    <>
      {/* Navigation */}
      <nav className="nav-fixed">
        <div className="max-w-[1200px] mx-auto px-10 py-5 flex justify-between items-center">
          <div>
            <div className="text-[40px] font-bold tracking-[0.02em] leading-none">ANTHRASITE</div>
            <div className="text-[14px] font-light tracking-[0.3em] opacity-70 mt-[2px] text-center">VALUE, CRYSTALLIZED</div>
          </div>
          <ul className="flex gap-10 list-none">
            <li><a href="#assessment" className="text-white no-underline text-[20px] font-normal opacity-70 hover:opacity-100 transition-opacity duration-300">Assessment</a></li>
            <li><a href="#faq" className="text-white no-underline text-[20px] font-normal opacity-70 hover:opacity-100 transition-opacity duration-300">FAQ</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content container-narrow">
          <h1 className="text-display mb-8">
            Your website has untapped potential
          </h1>
          <p className="text-header opacity-70 mb-[60px] max-w-[900px] mx-auto">
            We analyze thousands of data points to show you what to fix and what it's worth.
          </p>

          {/* Pressure Visualization */}
          <div className="pressure-visual">
            <div className="pressure-ring" style={{ '--scale': 1 } as React.CSSProperties}></div>
            <div className="pressure-ring" style={{ '--scale': 0.8, animationDelay: '0.3s' } as React.CSSProperties}></div>
            <div className="pressure-ring" style={{ '--scale': 0.6, animationDelay: '0.6s' } as React.CSSProperties}></div>
            <div className="pressure-center">
              <div className="text-display-large">?</div>
              <div className="text-label mt-2">Your Score</div>
            </div>
          </div>

          <button onClick={openPurchase} className="cta-primary">
            Get Your Audit Report
          </button>
        </div>
      </section>

      {/* Assessment Section */}
      <section id="assessment" className="section">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-header text-center">What We Analyze</h2>

          <div className="assessment-grid">
            <div className="text-center">
              <div className="text-number">2.7s</div>
              <h3 className="text-[20px] mb-3">Load Performance</h3>
              <p className="text-[14px] opacity-60 leading-[1.6]">
                How fast your site loads on real devices,
                and what it's costing you in lost customers.
              </p>
            </div>

            <div className="text-center">
              <div className="text-number">47%</div>
              <h3 className="text-[20px] mb-3">Mobile Experience</h3>
              <p className="text-[14px] opacity-60 leading-[1.6]">
                Where mobile visitors fail to convert,
                with specific breakpoints identified.
              </p>
            </div>

            <div className="text-center">
              <div className="text-number">$$</div>
              <h3 className="text-[20px] mb-3">Revenue Impact</h3>
              <p className="text-[14px] opacity-60 leading-[1.6]">
                Exact monthly revenue loss from technical issues,
                calculated for your specific market.
              </p>
            </div>
          </div>

          <p className="text-center text-[20px] font-normal opacity-70">
            No fluff. No 50-page reports. Just what's broken and what it's worth to fix it.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section">
        <div className="container-tight">
          <h2 className="text-header text-center">Questions</h2>

          <div className="space-y-0">
            {[
              {
                q: "What exactly do I get?",
                a: "A focused report showing your 2-3 biggest website issues, their specific impact on your revenue, and exactly what needs to be fixed. One page of critical insights, not 50 pages of data dumps."
              },
              {
                q: "How is this different from free tools?",
                a: "Free tools show you hundreds of issues without context. We analyze your specific business, calculate actual revenue impact, and show only what matters. It's the difference between a medical encyclopedia and a doctor's diagnosis."
              },
              {
                q: "How long does it take?",
                a: "Your report is delivered instantly after purchase. Our AI has already analyzed your site - we're just waiting for you to claim the insights."
              },
              {
                q: "What if I need help implementing fixes?",
                a: "Your report includes clear next steps. If you need professional help, we can connect you with vetted agencies who specialize in your specific issues."
              }
            ].map((item, index) => (
              <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`} onClick={() => toggleFaq(index)}>
                <div className="faq-question">
                  {item.q}
                  <span className="faq-toggle">+</span>
                </div>
                <div className="faq-answer">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-[60px] px-10 border-t border-white/5 text-center">
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/contact">Contact</a>
        </div>
        <p className="text-tiny opacity-30">
          © 2024 Anthrasite. All rights reserved.
        </p>
      </footer>

      {/* Purchase Modal */}
      <div className={`modal ${showModal ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && closePurchase()}>
        <div className="modal-container container-form">
          <button className="modal-close" onClick={closePurchase}>&times;</button>

          {/* Step 1: Enter Website */}
          <div className={activeStep === 'enter' ? 'block' : 'hidden'}>
            <h2 className="text-header-small">Let's analyze your website</h2>

            <div className="form-group">
              <label className="form-label">Your Website URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button className="cta-primary button-full" onClick={goToPayment}>
              Continue to Payment
            </button>
          </div>

          {/* Step 2: Payment */}
          <div className={activeStep === 'payment' ? 'block' : 'hidden'}>
            <h2 className="text-header-small">Complete your purchase</h2>

            <div className="price-display">
              <div className="text-display-large text-accent">$99</div>
              <div className="text-label mt-2">ONE-TIME PAYMENT</div>
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input type="text" className="form-input" placeholder="4242 4242 4242 4242" />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="form-group">
                <label className="form-label">Expiry</label>
                <input type="text" className="form-input" placeholder="MM/YY" />
              </div>
              <div className="form-group">
                <label className="form-label">CVC</label>
                <input type="text" className="form-input" placeholder="123" />
              </div>
            </div>

            <button className="cta-primary button-full" onClick={completePurchase}>
              Get My Report Now
            </button>

            <p className="text-center mt-5 opacity-50 text-[14px]">
              Secure payment via Stripe. Report delivered instantly.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}