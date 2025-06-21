'use client'

import React from 'react'
import { Logo } from '@/components/Logo'
import { useState } from 'react'

export default function AboutPage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div>
      {/* Navigation */}
      <nav className="nav-fixed">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5 flex items-center justify-between">
          <div className="logo-container">
            <a href="/" className="flex flex-col">
              <Logo size="medium" className="logo-mobile" />
              <div className="tagline text-[10px] md:text-[13px] font-light opacity-70 mt-1 flex justify-between">
                <span>V</span>
                <span>A</span>
                <span>L</span>
                <span>U</span>
                <span>E</span>
                <span>,</span>
                <span>&nbsp;</span>
                <span>C</span>
                <span>R</span>
                <span>Y</span>
                <span>S</span>
                <span>T</span>
                <span>A</span>
                <span>L</span>
                <span>L</span>
                <span>I</span>
                <span>Z</span>
                <span>E</span>
                <span>D</span>
              </div>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/about" className="text-[17px] opacity-100">
              About Us
            </a>
            <a href="/#faq" className="text-[17px] opacity-70 hover:opacity-100 transition-opacity">
              FAQ
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${showMobileMenu ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-carbon border-t border-smoke">
            <div className="flex flex-col py-4">
              <a 
                href="/about" 
                className="px-5 py-3 text-[17px] opacity-100"
              >
                About Us
              </a>
              <a 
                href="/#faq" 
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                FAQ
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-[120px] pb-[60px] px-5 md:px-10">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-[48px] font-light mb-8">About Anthrasite</h1>
          
          <div className="space-y-6 text-[17px] opacity-80 leading-relaxed">
            <p>
              We're building the future of website optimization—where data meets action.
            </p>
            
            <p>
              Founded by a team of engineers and data scientists who were frustrated by the gap between website analytics and actual business results, Anthrasite transforms complex performance data into clear, revenue-focused recommendations.
            </p>

            <p>
              Our proprietary assessment engine analyzes thousands of data points across performance, SEO, trust, UX, mobile, and social signals. But unlike traditional tools that overwhelm you with technical jargon, we translate everything into one simple metric: revenue impact.
            </p>

            <h2 className="text-[32px] font-light mt-12 mb-6">Our Mission</h2>
            
            <p>
              To democratize website optimization by making enterprise-grade insights accessible to every business owner. No technical expertise required. No guesswork. Just clear answers about what to fix and what it's worth.
            </p>

            <h2 className="text-[32px] font-light mt-12 mb-6">How We're Different</h2>
            
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Revenue-first approach:</strong> Every recommendation is ranked by its estimated dollar impact on your specific business.
              </li>
              <li>
                <strong>Local market intelligence:</strong> We factor in your ZIP code and industry to provide hyper-relevant insights.
              </li>
              <li>
                <strong>Actionable brevity:</strong> Our reports are designed to be implemented, not filed away.
              </li>
              <li>
                <strong>Complete transparency:</strong> We show all our data and calculations—no black box algorithms.
              </li>
            </ul>

            <h2 className="text-[32px] font-light mt-12 mb-6">Get In Touch</h2>
            
            <p>
              Have questions? Want to learn more about our methodology? We'd love to hear from you.
            </p>
            
            <p>
              Email us at <a href="mailto:hello@anthrasite.io" className="text-accent hover:underline">hello@anthrasite.io</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-[60px] border-t border-smoke">
        <div className="container-narrow text-center">
          <Logo size="medium" />
          <div className="footer-links mt-[30px]">
            <a href="/legal">Privacy & Terms</a>
            <a href="mailto:hello@anthrasite.io">Contact</a>
          </div>
          <p className="text-[14px] opacity-30 mt-[20px]">
            © {new Date().getFullYear()} Anthrasite. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}