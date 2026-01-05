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
      className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 transition-shadow duration-150 hover:shadow-md"
      data-state={isOpen ? 'open' : 'closed'}
    >
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full p-5 min-[800px]:p-6 bg-transparent text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066FF]"
        aria-expanded={isOpen}
        aria-controls={`faq-content-${index}`}
        id={`faq-trigger-${index}`}
      >
        <span className="text-slate-900 text-[18px] min-[800px]:text-[20px] font-semibold pr-2 tracking-[0.02em]">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
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
          <div className="px-5 pb-5">
            <p className="text-slate-600 text-[18px] min-[800px]:text-[20px] leading-[1.6] tracking-[0.02em]">
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
    <div className="space-y-12">
      {/* Section Header */}
      <h2
        id="faq-heading"
        className="text-slate-900 text-[28px] min-[800px]:text-[32px] font-semibold text-center tracking-[0.02em]"
      >
        Questions?
      </h2>

      {/* Accordion Items */}
      <div className="space-y-8">
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
