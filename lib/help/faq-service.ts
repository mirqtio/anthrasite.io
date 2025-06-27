/**
 * FAQ Service for context-aware help and search functionality
 */

import {
  FAQItem,
  FAQSearchResult,
  HelpContext,
  PageContext,
  FAQCategory,
} from './types'
import {
  ALL_FAQS,
  getFAQsByContext,
  getFAQsByCategory,
  GENERAL_FAQS,
  PURCHASE_FAQS,
  TECHNICAL_FAQS,
  REPORT_FAQS,
  PRIVACY_FAQS,
} from './content'

/**
 * FAQ Service class for managing FAQ operations
 */
export class FAQService {
  private static instance: FAQService
  private searchIndex: Map<string, Set<string>> = new Map()
  private faqMap: Map<string, FAQItem> = new Map()

  private constructor() {
    this.buildSearchIndex()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): FAQService {
    if (!FAQService.instance) {
      FAQService.instance = new FAQService()
    }
    return FAQService.instance
  }

  /**
   * Build search index for faster searching
   */
  private buildSearchIndex(): void {
    ALL_FAQS.forEach((faq) => {
      this.faqMap.set(faq.id, faq)

      // Index by words in question and answer
      const words = this.tokenize(faq.question + ' ' + faq.answer)
      words.forEach((word) => {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set())
        }
        this.searchIndex.get(word)!.add(faq.id)
      })

      // Index by tags
      faq.tags?.forEach((tag) => {
        const tagWords = this.tokenize(tag)
        tagWords.forEach((word) => {
          if (!this.searchIndex.has(word)) {
            this.searchIndex.set(word, new Set())
          }
          this.searchIndex.get(word)!.add(faq.id)
        })
      })
    })
  }

  /**
   * Tokenize text for indexing
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2) // Ignore very short words
  }

  /**
   * Get FAQs based on context
   */
  getFAQsForContext(context: HelpContext): FAQItem[] {
    const { page, userState } = context

    // Start with page-specific FAQs
    let faqs = this.getPageSpecificFAQs(page)

    // Add user-state specific FAQs
    if (userState) {
      faqs = this.enrichWithUserStateFAQs(faqs, userState)
    }

    // Remove duplicates and limit
    const uniqueFAQs = Array.from(new Map(faqs.map((f) => [f.id, f])).values())
    return uniqueFAQs.slice(0, 15) // Limit to 15 FAQs for performance
  }

  /**
   * Get page-specific FAQs
   */
  private getPageSpecificFAQs(page: PageContext): FAQItem[] {
    switch (page) {
      case PageContext.HOME:
        return [
          ...GENERAL_FAQS,
          ...TECHNICAL_FAQS.slice(0, 2),
          ...PURCHASE_FAQS.slice(0, 1),
        ]

      case PageContext.PURCHASE:
        return [...PURCHASE_FAQS]

      case PageContext.CHECKOUT:
        return [
          ...PURCHASE_FAQS.filter(
            (f) =>
              f.tags?.includes('payment') ||
              f.tags?.includes('security') ||
              f.tags?.includes('refund')
          ),
          ...PRIVACY_FAQS.filter((f) => f.tags?.includes('security')),
        ]

      case PageContext.SUCCESS:
        return [
          ...REPORT_FAQS,
          ...PURCHASE_FAQS.filter(
            (f) => f.tags?.includes('sharing') || f.tags?.includes('updates')
          ),
        ]

      case PageContext.REPORT:
        return [
          ...REPORT_FAQS,
          ...TECHNICAL_FAQS.filter((f) => f.tags?.includes('analysis')),
        ]

      case PageContext.PRIVACY:
        return [
          ...PRIVACY_FAQS,
          ...TECHNICAL_FAQS.filter((f) => f.tags?.includes('security')),
        ]

      case PageContext.TERMS:
        return [
          ...PURCHASE_FAQS.filter((f) => f.tags?.includes('policy')),
          ...PRIVACY_FAQS,
        ]

      case PageContext.CONTACT:
        return GENERAL_FAQS

      default:
        return GENERAL_FAQS
    }
  }

  /**
   * Enrich FAQs based on user state
   */
  private enrichWithUserStateFAQs(faqs: FAQItem[], userState: any): FAQItem[] {
    const additionalFAQs: FAQItem[] = []

    if (userState.hasOpenCart && !userState.hasPurchased) {
      // User has items in cart but hasn't purchased
      additionalFAQs.push(
        ...PURCHASE_FAQS.filter(
          (f) =>
            f.id === 'payment-methods' ||
            f.id === 'refund-policy' ||
            f.id === 'whats-included'
        )
      )
    }

    if (userState.hasPurchased) {
      // User has already purchased
      additionalFAQs.push(
        ...PURCHASE_FAQS.filter(
          (f) => f.id === 'report-updates' || f.id === 'team-sharing'
        )
      )
    }

    if (userState.isReturningVisitor && !userState.hasPurchased) {
      // Returning visitor who hasn't purchased
      additionalFAQs.push(
        ...PURCHASE_FAQS.filter(
          (f) => f.id === 'pricing' || f.id === 'whats-included'
        )
      )
    }

    return [...faqs, ...additionalFAQs]
  }

  /**
   * Search FAQs with scoring and highlighting
   */
  async searchFAQs(
    query: string,
    context?: HelpContext
  ): Promise<FAQSearchResult[]> {
    if (!query.trim()) {
      return []
    }

    const queryWords = this.tokenize(query)
    const scores = new Map<string, number>()
    const highlights = new Map<string, { question?: string; answer?: string }>()

    // Score each FAQ
    queryWords.forEach((word) => {
      const faqIds = this.searchIndex.get(word) || new Set()
      faqIds.forEach((faqId) => {
        const faq = this.faqMap.get(faqId)
        if (!faq) return

        // Calculate score
        let score = scores.get(faqId) || 0

        // Higher score for question matches
        if (faq.question.toLowerCase().includes(word)) {
          score += 3
          // Store highlight
          const current = highlights.get(faqId) || {}
          current.question = this.highlightText(faq.question, word)
          highlights.set(faqId, current)
        }

        // Lower score for answer matches
        if (faq.answer.toLowerCase().includes(word)) {
          score += 1
          const current = highlights.get(faqId) || {}
          current.answer = this.highlightText(faq.answer, word)
          highlights.set(faqId, current)
        }

        // Tag matches
        if (faq.tags?.some((tag) => tag.toLowerCase().includes(word))) {
          score += 2
        }

        scores.set(faqId, score)
      })
    })

    // Convert to results array and sort by score
    const results: FAQSearchResult[] = Array.from(scores.entries())
      .map(([faqId, score]) => ({
        item: this.faqMap.get(faqId)!,
        score,
        highlights: highlights.get(faqId),
      }))
      .sort((a, b) => b.score - a.score)

    // Apply context boost if provided
    if (context) {
      const contextFAQs = this.getFAQsForContext(context)
      const contextIds = new Set(contextFAQs.map((f) => f.id))

      results.forEach((result) => {
        if (contextIds.has(result.item.id)) {
          result.score *= 1.5 // Boost context-relevant results
        }
      })

      // Re-sort after context boost
      results.sort((a, b) => b.score - a.score)
    }

    return results.slice(0, 10) // Return top 10 results
  }

  /**
   * Highlight search terms in text
   */
  private highlightText(text: string, term: string): string {
    const regex = new RegExp(`(${term})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  /**
   * Get related FAQs
   */
  getRelatedFAQs(faqId: string): FAQItem[] {
    const faq = this.faqMap.get(faqId)
    if (!faq) return []

    const related: FAQItem[] = []

    // Get explicitly related questions
    if (faq.relatedQuestions) {
      faq.relatedQuestions.forEach((relatedId) => {
        const relatedFAQ = this.faqMap.get(relatedId)
        if (relatedFAQ) {
          related.push(relatedFAQ)
        }
      })
    }

    // Add FAQs from same category
    const sameCategoryFAQs = getFAQsByCategory(faq.category)
      .filter((f) => f.id !== faqId && !related.some((r) => r.id === f.id))
      .slice(0, 3)

    related.push(...sameCategoryFAQs)

    return related.slice(0, 5) // Limit to 5 related FAQs
  }

  /**
   * Get FAQ by ID
   */
  getFAQById(id: string): FAQItem | undefined {
    return this.faqMap.get(id)
  }

  /**
   * Get popular FAQs (for initial display)
   */
  getPopularFAQs(limit: number = 5): FAQItem[] {
    // In a real app, this would be based on analytics
    // For now, return a curated list
    const popularIds = [
      'what-is-anthrasite',
      'pricing',
      'report-delivery-time',
      'whats-included',
      'refund-policy',
    ]

    return popularIds
      .map((id) => this.faqMap.get(id))
      .filter((faq): faq is FAQItem => faq !== undefined)
      .slice(0, limit)
  }
}

/**
 * Export singleton instance
 */
export const faqService = FAQService.getInstance()

/**
 * React hook for FAQ search with debouncing
 */
export function useFAQSearch(debounceMs: number = 300) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<FAQSearchResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(async () => {
      const searchResults = await faqService.searchFAQs(query)
      setResults(searchResults)
      setIsSearching(false)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [query, debounceMs])

  return {
    query,
    setQuery,
    results,
    isSearching,
  }
}

// Import React for the hook
import React from 'react'
