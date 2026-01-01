'use client'

import React from 'react'

export function FooterV2() {
  return (
    <footer className="bg-anthracite-black border-t border-white/10 py-8 px-6">
      <div className="flex flex-col md:flex-row md:justify-center items-center gap-2 md:gap-0 text-[12px] text-white/50">
        {/* Mobile: 2 lines. Desktop: 1 line. */}
        <div className="md:after:content-['·'] md:after:mx-2">
          © 2025 Anthrasite
        </div>
        <div className="flex gap-4 md:gap-0">
          <a
            href="/legal/privacy"
            className="hover:text-white transition-colors md:after:content-['·'] md:after:mx-2"
          >
            Privacy Policy
          </a>
          <a
            href="/legal/terms"
            className="hover:text-white transition-colors md:after:content-['·'] md:after:mx-2"
          >
            Terms of Service
          </a>
          <a
            href="/legal/refund-policy"
            className="hover:text-white transition-colors"
          >
            Refund policy
          </a>
        </div>
      </div>
    </footer>
  )
}
