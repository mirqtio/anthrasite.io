/**
 * Types for the Help Widget system
 */

/**
 * FAQ Item structure
 */
export interface FAQItem {
  id: string
  question: string
  answer: string
  category: FAQCategory
  tags?: string[]
  relatedQuestions?: string[] // IDs of related FAQs
}

/**
 * FAQ Categories
 */
export enum FAQCategory {
  GENERAL = 'general',
  PURCHASE = 'purchase',
  TECHNICAL = 'technical',
  REPORT = 'report',
  ACCOUNT = 'account',
  PRIVACY = 'privacy',
}

/**
 * Help context based on current page
 */
export interface HelpContext {
  page: PageContext
  searchQuery?: string
  userState?: UserState
}

/**
 * Page contexts for context-aware FAQ loading
 */
export enum PageContext {
  HOME = 'home',
  PURCHASE = 'purchase',
  CHECKOUT = 'checkout',
  SUCCESS = 'success',
  REPORT = 'report',
  PRIVACY = 'privacy',
  TERMS = 'terms',
  CONTACT = 'contact',
}

/**
 * User state for personalized help
 */
export interface UserState {
  hasPurchased?: boolean
  isReturningVisitor?: boolean
  hasOpenCart?: boolean
}

/**
 * Search result for FAQ items
 */
export interface FAQSearchResult {
  item: FAQItem
  score: number
  highlights?: {
    question?: string
    answer?: string
  }
}

/**
 * Help widget state
 */
export interface HelpWidgetState {
  isOpen: boolean
  isMinimized: boolean
  activeTab: HelpTab
  searchQuery: string
  searchResults: FAQSearchResult[]
  isSearching: boolean
  selectedFAQ?: FAQItem
  hasUnreadNotifications: boolean
}

/**
 * Available tabs in help widget
 */
export enum HelpTab {
  FAQ = 'faq',
  CONTACT = 'contact',
  SEARCH = 'search',
}

/**
 * Animation variants for framer-motion
 */
export interface AnimationVariants {
  hidden: any
  visible: any
  exit?: any
}

/**
 * Help widget configuration
 */
export interface HelpWidgetConfig {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  offset: {
    x: number
    y: number
  }
  enableKeyboardShortcuts: boolean
  enableSearch: boolean
  enableContactForm: boolean
  maxSearchResults: number
  animationDuration: number
}

/**
 * Default configuration values
 */
export const DEFAULT_HELP_CONFIG: HelpWidgetConfig = {
  position: 'bottom-right',
  offset: {
    x: 24,
    y: 24,
  },
  enableKeyboardShortcuts: true,
  enableSearch: true,
  enableContactForm: false, // Start with FAQ only
  maxSearchResults: 10,
  animationDuration: 0.3,
}

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_HELP: '?',
  CLOSE: 'Escape',
  SEARCH: '/',
} as const

/**
 * ARIA labels for accessibility
 */
export const ARIA_LABELS = {
  HELP_BUTTON: 'Open help menu',
  CLOSE_BUTTON: 'Close help menu',
  SEARCH_INPUT: 'Search frequently asked questions',
  FAQ_LIST: 'Frequently asked questions',
  FAQ_ITEM: 'FAQ item',
  MINIMIZE_BUTTON: 'Minimize help menu',
  EXPAND_BUTTON: 'Expand help menu',
} as const
