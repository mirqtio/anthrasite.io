'use client'

import React from 'react'
import { Logo } from '@/components/Logo'
import { useState } from 'react'

export default function AboutPage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div id="about-page-wrapper">
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
            <a href="/#assessment" className="text-[17px] opacity-70 hover:opacity-100 transition-opacity">
              Examples
            </a>
            <a href="/#faq" className="text-[17px] opacity-70 hover:opacity-100 transition-opacity">
              FAQ
            </a>
            <a href="/about" className="text-[17px] opacity-100">
              About Us
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
                href="/#assessment" 
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                Examples
              </a>
              <a 
                href="/#faq" 
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                FAQ
              </a>
              <a 
                href="/about" 
                className="px-5 py-3 text-[17px] opacity-100"
              >
                About Us
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-[120px] pb-[60px] px-5 md:px-10">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-[48px] font-light mb-8">About Anthrasite</h1>
          
          <div className="space-y-6 text-[20px] opacity-80 leading-relaxed">
            <p>
              We analyze your website and tell you exactly what's costing you money—and how to fix it.
            </p>
            
            <p>
              No jargon. No fluff. Just clear, actionable insights backed by real data.
            </p>

            <p>
              Get in touch: <a href="mailto:hello@anthrasite.io" className="opacity-100 hover:opacity-70 transition-opacity">hello@anthrasite.io</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-[60px] border-t border-smoke">
        <div className="container-narrow text-center">
          <div className="footer-links">
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