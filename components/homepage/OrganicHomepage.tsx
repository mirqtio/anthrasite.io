'use client'

import React, { useState } from 'react'
import { useRenderTracking } from '@/lib/monitoring/hooks'
import { Logo } from '@/components/Logo'

export function OrganicHomepage() {
  useRenderTracking('OrganicHomepage')
  const [email, setEmail] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }
  
  const openModal = () => {
    setShowModal(true)
    document.body.style.overflow = 'hidden'
  }
  
  const closeModal = () => {
    setShowModal(false)
    document.body.style.overflow = ''
    setError('')
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, domain: websiteUrl }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to join waitlist')
      }
      
      setShowSuccess(true)
      setEmail('')
      setWebsiteUrl('')
      
      // Auto-dismiss after 5s
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <>
      {/* Navigation */}
      <nav className="nav-fixed">
        <div className="max-w-[1200px] mx-auto px-10 py-5 flex justify-between items-center">
          <div>
            <Logo />
            <div className="text-[17px] font-light tracking-[0.3em] opacity-70 mt-[2px] text-center">VALUE, CRYSTALLIZED</div>
          </div>
          <ul className="hidden md:flex gap-10 list-none">
            <li><a href="#assessment" className="text-white no-underline text-[24px] font-normal opacity-70 hover:opacity-100 transition-opacity duration-300">What We Do</a></li>
            <li><a href="#faq" className="text-white no-underline text-[24px] font-normal opacity-70 hover:opacity-100 transition-opacity duration-300">FAQ</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" data-testid="organic-homepage">
        <div className="hero-content container-narrow">
          <h1 className="text-display mb-8">
            Your website has untapped potential
          </h1>
          <p className="text-header opacity-70 mb-[60px] max-w-[900px] mx-auto">
            We analyze thousands of data points to show you what to fix and what it's worth.
          </p>

          {/* CTA Button with Pulsing Rings */}
          <div className="relative inline-block" data-testid="hero-section">
            <div className="pressure-visual" style={{ width: '400px', height: '400px', margin: '0 auto' }}>
              <div className="pressure-ring" style={{ '--scale': 1 } as React.CSSProperties}></div>
              <div className="pressure-ring" style={{ '--scale': 0.8, animationDelay: '0.3s' } as React.CSSProperties}></div>
              <div className="pressure-ring" style={{ '--scale': 0.6, animationDelay: '0.6s' } as React.CSSProperties}></div>
              <div className="pressure-center">
                <button onClick={openModal} className="cta-primary">
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Section */}
      <section id="assessment" className="section">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-header text-center">What We Analyze</h2>

          <div className="assessment-grid">
            <div className="text-center">
              <div className="text-number" style={{ color: '#FFC107' }}>4.8s</div>
              <h3 className="text-[24px] mb-3">Load Performance</h3>
              <p className="text-[17px] opacity-60 leading-[1.6]">
                How fast your site loads on real devices,
                and what it's costing you in lost customers.
              </p>
            </div>

            <div className="text-center">
              <div className="text-number" style={{ color: '#DC2626' }}>47%</div>
              <h3 className="text-[24px] mb-3">Mobile Experience</h3>
              <p className="text-[17px] opacity-60 leading-[1.6]">
                Where mobile visitors fail to convert,
                with specific breakpoints identified.
              </p>
            </div>

            <div className="text-center">
              <div className="text-number" style={{ color: '#22C55E' }}>$$</div>
              <h3 className="text-[24px] mb-3">Revenue Impact</h3>
              <p className="text-[17px] opacity-60 leading-[1.6]">
                Estimated monthly revenue loss from technical issues,
                calculated for your specific market.
              </p>
            </div>
          </div>

          <p className="text-center text-[24px] font-normal opacity-70">
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
                q: "When will I get my report?",
                a: "We're currently in early access. Join the waitlist and we'll analyze your site as soon as we launch. Early access members get 50% off their first audit."
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

      {/* Waitlist Modal */}
      <div className={`modal ${showModal ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && closeModal()}>
        <div className="modal-container container-form">
          <button className="modal-close" onClick={closeModal}>&times;</button>

          <p className="text-body mb-8">We are currently only analyzing targeted sites. Be among the first to know when we expand.</p>

          {!showSuccess ? (
            <form onSubmit={handleSubmit} data-testid="waitlist-form">
              <div className="form-group">
                <label className="form-label">Your website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="form-input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cta-primary button-full"
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          ) : (
            <div className="carbon-container text-center">
              <h3 className="text-[24px] mb-4">You're on the list!</h3>
              <p className="text-body">We'll analyze {websiteUrl} and send the report when we launch.</p>
              <button onClick={closeModal} className="cta-primary mt-6">
                Close
              </button>
            </div>
          )}
          
          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>
    </>
  )
}