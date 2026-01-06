'use client'

const TESTIMONIALS = [
  {
    quote:
      "We thought we'd nailed it—professional photos, premium look, clear calls to action. Then I saw how few people were actually finding us in local searches. That one insight changed our whole priority list.",
    name: 'Chelsea',
    titleCompany: 'Partner, Invest in Yakima',
  },
  {
    quote:
      "I was bracing for a laundry list of expensive fixes. Instead, I got two things I could do this week—and suddenly all the branding work we'd already done would actually get seen. That's the kind of clarity you can act on.",
    name: 'Kelly',
    titleCompany: 'Owner, Mandala Integrative Veterinary Care',
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

      {/* Desktop: 2-column grid */}
      <div className="hidden gap-6 min-[800px]:grid min-[800px]:grid-cols-2 min-[800px]:max-w-4xl min-[800px]:mx-auto">
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
