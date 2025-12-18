'use client'

import React from 'react'

export function CleanDraftFocusPitch() {
  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5">
      <div
        className="container mx-auto px-6 text-center"
        style={{ width: '100%', minWidth: '300px', maxWidth: '48rem' }}
      >
        <h2 className="text-3xl md:text-5xl font-light text-white mb-8 leading-tight">
          You don't need another list of everything that's wrong.
        </h2>
        <p className="text-xl text-gray-400 leading-relaxed font-light">
          Most website tools dump hundreds of warnings with no context. This
          report is different: every issue ranked by business impact, every fix
          labeled by effort. You'll know exactly where to focus—and what you can
          safely ignore.
        </p>
      </div>
    </section>
  )
}

export function CleanDraftUseIt() {
  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5">
      <div
        className="container mx-auto px-6 text-center"
        style={{ width: '100%', minWidth: '300px', maxWidth: '56rem' }}
      >
        <p className="text-2xl md:text-3xl text-white font-light leading-relaxed">
          Some owners tackle the easy fixes themselves. Others hand the report
          to their web person. Either way, you're starting with the facts—not a
          sales pitch.
        </p>
      </div>
    </section>
  )
}

export function CleanDraftMethodology() {
  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5">
      <div
        className="container mx-auto px-6 text-center"
        style={{ width: '100%', minWidth: '300px', maxWidth: '48rem' }}
      >
        <h3 className="text-2xl text-white font-light mb-6">
          "How do you calculate the revenue impact?"
        </h3>
        <p
          className="text-lg text-gray-400 leading-relaxed mx-auto"
          style={{ maxWidth: '42rem' }}
        >
          We use a model based on your industry, estimated business size, and
          the severity of issues detected. The methodology section in your
          report explains exactly how we derived the numbers. If it doesn't hold
          up, ask for your money back.
        </p>
      </div>
    </section>
  )
}

export function CleanDraftFinalCTA({ price = 199 }: { price?: number }) {
  const scrollToCheckout = () => {
    const el = document.getElementById('checkout-target')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="py-32 bg-[#0A0A0A]" id="checkout-target-anchor">
      <div
        className="container mx-auto px-6 text-center"
        style={{ width: '100%', minWidth: '300px' }}
      >
        <h2 className="text-display mb-12 text-white">Your report is ready.</h2>

        <button
          onClick={scrollToCheckout}
          className="bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded text-2xl font-medium transition-all shadow-button hover:-translate-y-1 mb-6"
        >
          Download Your Report — ${price}
        </button>

        <p className="text-gray-500 font-medium tracking-wide">
          Instant delivery. Money-back guarantee.
        </p>
      </div>
    </section>
  )
}
