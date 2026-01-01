'use client'

export function LandingFooter() {
  return (
    <footer className="mt-16 pt-8 pb-24 min-[800px]:pb-8 border-t border-white/10">
      <div className="text-center px-6">
        {/* Links row - compact inline on desktop, tighter wrap on mobile */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 min-[800px]:gap-x-6 text-[13px] min-[800px]:text-[14px] leading-tight">
          <a
            href="/legal/privacy"
            className="text-white/50 hover:text-white/80 transition-opacity leading-tight !min-h-0 !min-w-0"
          >
            Privacy Policy
          </a>
          <a
            href="/legal/terms"
            className="text-white/50 hover:text-white/80 transition-opacity leading-tight !min-h-0 !min-w-0"
          >
            Terms of Service
          </a>
          <a
            href="/legal/refund-policy"
            className="text-white/50 hover:text-white/80 transition-opacity leading-tight !min-h-0 !min-w-0"
          >
            Refund policy
          </a>
          <a
            href="/legal/do-not-sell"
            className="text-white/50 hover:text-white/80 transition-opacity leading-tight !min-h-0 !min-w-0"
          >
            Do Not Sell or Share My Personal Information
          </a>
          <a
            href="mailto:hello@anthrasite.io"
            className="text-white/50 hover:text-white/80 transition-opacity leading-tight !min-h-0 !min-w-0"
          >
            Contact
          </a>
        </div>
        {/* Copyright - stays above mobile sticky CTA */}
        <p className="text-[13px] text-white/40 mt-4">
          © {new Date().getFullYear()} Anthrasite. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
