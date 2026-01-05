'use client'

const TESTIMONIALS = [
  {
    quote:
      "Finally, an SEO audit that speaks English, not 'Developer.' I stopped guessing what was broken and actually understood why my site was struggling.",
    name: 'Alex',
    titleCompany: 'Owner, Midtown Coffee',
  },
  {
    quote:
      'Other free tools gave me a 50-page panic attack. Anthrasite gave me a focused list of 6 things to fix. It made a massive project feel manageable.',
    name: 'Sarah',
    titleCompany: 'Founder, Brightpath Design',
  },
  {
    quote:
      'I thought my website was fine until I saw the breakdown. Seeing exactly where local customers were getting stuck was the wake-up call I needed.',
    name: 'Marcus',
    titleCompany: 'Partner, Invest In Yakima',
  },
]

export function TestimonialsSection() {
  return (
    <div className="flex flex-col gap-10">
      <h2
        id="testimonials-heading"
        className="text-[28px] min-[800px]:text-[32px] font-semibold text-slate-900 text-center tracking-[0.02em]"
      >
        What Our Customers Say
      </h2>

      {/* Desktop: 3-column grid */}
      <div className="hidden gap-6 min-[800px]:grid min-[800px]:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5"
          >
            <blockquote>
              <p className="text-[18px] leading-relaxed text-black">
                &ldquo;{t.quote}&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-6 text-slate-600">
              <span className="font-semibold">{t.name}</span>
              {', '}
              <span>{t.titleCompany}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Mobile: horizontal scroll w/ peeking + mandatory snap */}
      <div className="min-[800px]:hidden">
        <div
          className="
            flex gap-4 overflow-x-auto overscroll-x-contain
            scroll-smooth
            snap-x snap-mandatory
            px-6
            -mx-6
            pb-2
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="
                snap-center
                shrink-0
                w-[85%]
                rounded-2xl bg-white p-8
                shadow-sm ring-1 ring-black/5
              "
            >
              <blockquote>
                <p className="text-[18px] leading-relaxed text-black">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-6 text-slate-600">
                <span className="font-semibold">{t.name}</span>
                {', '}
                <span>{t.titleCompany}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
