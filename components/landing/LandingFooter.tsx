'use client'

export function LandingFooter() {
  return (
    <footer className="py-[60px] border-t border-white/5">
      <div className="container-narrow text-center px-6">
        <div className="footer-links mt-[30px]">
          <a href="/legal/privacy">Privacy Policy</a>
          <a href="/legal/terms">Terms of Service</a>
          <a href="/legal/do-not-sell">
            Do Not Sell or Share My Personal Information
          </a>
          <a href="mailto:hello@anthrasite.io">Contact</a>
        </div>
        <p className="text-[14px] opacity-50 mt-[20px]">
          © {new Date().getFullYear()} Anthrasite. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
