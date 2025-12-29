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
      className="border border-white/10 rounded-md overflow-hidden transition-colors duration-150 hover:border-white/20"
      data-state={isOpen ? 'open' : 'closed'}
    >
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full p-3 bg-transparent text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066FF]"
        aria-expanded={isOpen}
        aria-controls={`faq-content-${index}`}
        id={`faq-trigger-${index}`}
      >
        <span className="text-white text-base sm:text-lg font-medium pr-2">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-white/50 transition-transform duration-200 ${
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
          <div className="px-3 pb-3">
            <p className="text-white/70 text-base leading-relaxed">
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
    <div className="space-y-4">
      {/* Section Header */}
      <h2
        id="faq-heading"
        className="text-white text-xl sm:text-2xl font-bold text-center"
      >
        Questions?
      </h2>

      {/* Accordion Items */}
      <div className="space-y-2">
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
