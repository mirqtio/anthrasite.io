'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  HelpWidgetState, 
  HelpTab, 
  FAQItem,
  ARIA_LABELS,
  DEFAULT_HELP_CONFIG,
  KEYBOARD_SHORTCUTS,
  PageContext,
  HelpContext,
} from '@/lib/help/types';
import { faqService } from '@/lib/help/faq-service';
import { useHelpWidget } from './HelpProvider';
import { cn } from '@/lib/utils';

/**
 * Animation variants matching design spec
 */
const buttonVariants = {
  hidden: { 
    scale: 0,
    opacity: 0,
  },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: { 
      type: 'spring' as const,
      stiffness: 200,
      damping: 20 
    }
  },
};

const panelVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
  },
};

/**
 * FAQ Item Component
 */
const FAQItemComponent: React.FC<{
  faq: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ faq, isExpanded, onToggle }) => {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={onToggle}
        className="w-full text-left py-4 px-0 flex items-center justify-between group
                 hover:text-anthracite-blue transition-colors duration-200
                 focus-minimal"
        aria-expanded={isExpanded}
        aria-label={`${faq.question}. ${isExpanded ? 'Collapse' : 'Expand'} answer`}
      >
        <span className="text-base font-medium pr-4">{faq.question}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-label text-white/80 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Main Help Widget Component - Matching PRD design spec
 */
export const HelpWidget: React.FC = () => {
  const { 
    isOpen, 
    setIsOpen, 
    config 
  } = useHelpWidget();
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [contextFAQs, setContextFAQs] = useState<FAQItem[]>([]);
  const widgetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get current page context
  const getCurrentContext = useCallback((): HelpContext => {
    const pathname = window.location.pathname;
    let page = PageContext.HOME;
    
    if (pathname.includes('/purchase')) page = PageContext.PURCHASE;
    else if (pathname.includes('/checkout')) page = PageContext.CHECKOUT;
    else if (pathname.includes('/success')) page = PageContext.SUCCESS;
    
    return { page };
  }, []);

  // Load context-specific FAQs
  useEffect(() => {
    const context = getCurrentContext();
    const faqs = faqService.getFAQsForContext(context);
    setContextFAQs(faqs);
  }, [getCurrentContext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, setIsOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && 
          widgetRef.current && 
          !widgetRef.current.contains(e.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  const toggleItem = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <>
      {/* Floating Help Button - 56px diameter as per design */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            ref={buttonRef}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-help-button h-help-button 
                     bg-anthracite-blue text-white rounded-full shadow-help
                     flex items-center justify-center spring-scale
                     focus-minimal transition-all duration-200 hover:opacity-80"
            aria-label={ARIA_LABELS.HELP_BUTTON}
          >
            <span className="text-[24px] font-normal">?</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Help Panel - morphs from button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 bg-carbon rounded-2xl shadow-help border border-white/5
                     w-help-panel-mobile md:w-help-panel max-h-[600px] overflow-hidden"
            role="dialog"
            aria-label="Help menu"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-medium text-white">
                Quick Help
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full
                         hover:bg-white/10 transition-colors duration-200
                         focus-minimal"
                aria-label={ARIA_LABELS.CLOSE_BUTTON}
              >
                <X className="w-5 h-5 text-white/60" strokeWidth={2} />
              </button>
            </div>

            {/* FAQ List with slide-in animation */}
            <div className="p-6 overflow-y-auto max-h-[450px]">
              <div className="space-y-0">
                {contextFAQs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: 'easeOut'
                    }}
                  >
                    <FAQItemComponent
                      faq={faq}
                      isExpanded={expandedItems.has(faq.id)}
                      onToggle={() => toggleItem(faq.id)}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Additional help text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 pt-6 border-t border-white/10"
              >
                <p className="text-sm text-white/60 text-center">
                  Need more help? Email us at{' '}
                  <a 
                    href="mailto:support@anthrasite.io" 
                    className="text-anthracite-blue hover:underline"
                  >
                    support@anthrasite.io
                  </a>
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};