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
      className="border border-border-default rounded-md overflow-hidden transition-colors duration-fast hover:border-border-strong"
      data-state={isOpen ? 'open' : 'closed'}
    >
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full p-component-md bg-transparent text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
        aria-expanded={isOpen}
        aria-controls={`faq-content-${index}`}
        id={`faq-trigger-${index}`}
      >
        <span className="text-text-primary text-base sm:text-lg font-medium pr-gap-sm">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-text-muted transition-transform duration-normal ${
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
        className="grid transition-[grid-template-rows] duration-normal ease-ease-out"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden">
          <div className="px-component-md pb-component-md">
            <p className="text-text-secondary text-base leading-relaxed">
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
    <div className="space-y-gap-md">
      {/* Section Header */}
      <h2
        id="faq-heading"
        className="text-text-primary text-xl sm:text-2xl font-bold text-center"
      >
        Questions?
      </h2>

      {/* Accordion Items */}
      <div className="space-y-gap-sm">
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
