'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export function LandingNav() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <>
      <nav className="nav-fixed">
        <div className="max-w-[1200px] mx-auto px-5 min-[800px]:px-10 py-4 min-[800px]:py-5 flex items-center justify-between">
          <div className="logo-container">
            <Link href="/" className="flex flex-col w-fit">
              <Logo size="medium" darkMode />
              <div className="tagline text-[10px] min-[800px]:text-[13px] font-light opacity-70 mt-1 flex justify-between">
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

          {/* Desktop Navigation */}
          <div className="hidden min-[800px]:flex items-center space-x-8">
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

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="min-[800px]:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 relative z-50"
            aria-label="Toggle menu"
            aria-expanded={showMobileMenu}
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                showMobileMenu ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                showMobileMenu ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                showMobileMenu ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#232323] z-40 transition-opacity duration-300 min-[800px]:hidden ${
          showMobileMenu
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <Link
            href="/#assessment"
            className="text-[24px] opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          >
            Method
          </Link>
          <Link
            href="/#faq"
            className="text-[24px] opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          >
            FAQ
          </Link>
          <Link
            href="/about"
            className="text-[24px] opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          >
            About Us
          </Link>
        </div>
      </div>
    </>
  )
}
