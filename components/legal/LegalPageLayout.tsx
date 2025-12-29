// components/legal/LegalPageLayout.tsx
'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { Logo } from '@/components/Logo'

interface LegalPageLayoutProps {
  title: string
  children: React.ReactNode
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div>
      {/* Navigation */}
      <nav className="nav-fixed">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5 flex items-center justify-between">
          <div className="logo-container">
            <Link href="/" className="flex flex-col">
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
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#assessment"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              Method
            </Link>
            <Link
              href="/#faq"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              About Us
            </Link>
          </div>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-transform ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-opacity ${showMobileMenu ? 'opacity-0' : ''}`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-transform ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`}
            ></span>
          </button>
        </div>
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#141414] border-t border-white/10">
            <div className="flex flex-col py-4">
              <Link
                href="/#assessment"
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                Method
              </Link>
              <Link
                href="/#faq"
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                FAQ
              </Link>
              <Link
                href="/about"
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                About Us
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-[120px] pb-[60px] px-10">
        <div className="max-w-[800px] mx-auto prose prose-invert">
          <h1 className="text-[48px] font-light mb-8">{title}</h1>
          <p className="text-[17px] opacity-60 mb-12">
            Last updated: October 14, 2025
          </p>
          <hr className="border-white/10 my-12" />
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-[60px] px-10 border-t border-white/5 text-center">
        <div className="footer-links">
          <Link href="/legal/privacy">Privacy Policy</Link>
          <Link href="/legal/terms">Terms of Service</Link>
          <Link href="/legal/do-not-sell">Do Not Sell or Share</Link>
          <a href="mailto:hello@anthrasite.io">Contact</a>
        </div>
        <p className="text-tiny opacity-50">
          © {new Date().getFullYear()} Anthrasite. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
