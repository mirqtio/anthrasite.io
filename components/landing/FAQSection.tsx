'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FAQItem } from '@/lib/landing/types'

interface FAQSectionProps {
  items: FAQItem[]
}

interface FAQAccordionItemProps {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
  index: number
}

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: FAQAccordionItemProps) {
  return (
    <div
      className="border border-white/10 rounded-xl overflow-hidden transition-colors duration-150 hover:border-white/20"
      data-state={isOpen ? 'open' : 'closed'}
    >
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full p-4 md:p-5 bg-transparent text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066FF]"
        aria-expanded={isOpen}
        aria-controls={`faq-content-${index}`}
        id={`faq-trigger-${index}`}
      >
        <span className="text-white text-[18px] md:text-[20px] font-semibold pr-2 tracking-[0.02em]">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-white/40 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Content wrapper with grid animation */}
      <div
        id={`faq-content-${index}`}
        role="region"
        aria-labelledby={`faq-trigger-${index}`}
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            <p className="text-white/60 text-[18px] md:text-[20px] leading-[1.6] tracking-[0.02em]">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection({ items }: FAQSectionProps) {
  // Default: first item open
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <h2
        id="faq-heading"
        className="text-white text-[28px] md:text-[32px] font-semibold text-center tracking-[0.02em]"
      >
        Questions?
      </h2>

      {/* Accordion Items */}
      <div className="space-y-6">
        {items.map((item, index) => (
          <FAQAccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
