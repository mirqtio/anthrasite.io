import { FAQService, faqService } from '../faq-service';
import { HelpContext, PageContext, FAQCategory } from '../types';
import { ALL_FAQS, GENERAL_FAQS, PURCHASE_FAQS } from '../content';

describe('FAQService', () => {
  let service: FAQService;

  beforeEach(() => {
    // Create a new instance for each test
    service = FAQService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = FAQService.getInstance();
      const instance2 = FAQService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export a singleton instance', () => {
      expect(faqService).toBe(FAQService.getInstance());
    });
  });

  describe('getFAQsForContext', () => {
    it('should return general FAQs for home page', () => {
      const context: HelpContext = {
        page: PageContext.HOME,
      };

      const faqs = service.getFAQsForContext(context);
      
      expect(faqs.length).toBeGreaterThan(0);
      expect(faqs.length).toBeLessThanOrEqual(15);
      expect(faqs.some(f => f.category === FAQCategory.GENERAL)).toBe(true);
    });

    it('should return purchase FAQs for purchase page', () => {
      const context: HelpContext = {
        page: PageContext.PURCHASE,
      };

      const faqs = service.getFAQsForContext(context);
      
      expect(faqs.some(f => f.category === FAQCategory.PURCHASE)).toBe(true);
      expect(faqs.some(f => f.id === 'pricing')).toBe(true);
    });

    it('should return privacy FAQs for privacy page', () => {
      const context: HelpContext = {
        page: PageContext.PRIVACY,
      };

      const faqs = service.getFAQsForContext(context);
      
      expect(faqs.some(f => f.category === FAQCategory.PRIVACY)).toBe(true);
    });

    it('should enrich FAQs based on user state', () => {
      const context: HelpContext = {
        page: PageContext.HOME,
        userState: {
          hasOpenCart: true,
          hasPurchased: false,
        },
      };

      const faqs = service.getFAQsForContext(context);
      
      // Should include payment-related FAQs for users with open cart
      expect(faqs.some(f => f.id === 'payment-methods')).toBe(true);
    });

    it('should include report FAQs for users who purchased', () => {
      const context: HelpContext = {
        page: PageContext.HOME,
        userState: {
          hasPurchased: true,
        },
      };

      const faqs = service.getFAQsForContext(context);
      
      expect(faqs.some(f => f.id === 'report-updates')).toBe(true);
      expect(faqs.some(f => f.id === 'team-sharing')).toBe(true);
    });

    it('should remove duplicates', () => {
      const context: HelpContext = {
        page: PageContext.PURCHASE,
        userState: {
          hasOpenCart: true,
        },
      };

      const faqs = service.getFAQsForContext(context);
      const uniqueIds = new Set(faqs.map(f => f.id));
      
      expect(uniqueIds.size).toBe(faqs.length);
    });

    it('should limit results to 15 FAQs', () => {
      const context: HelpContext = {
        page: PageContext.HOME,
        userState: {
          hasOpenCart: true,
          hasPurchased: true,
          isReturningVisitor: true,
        },
      };

      const faqs = service.getFAQsForContext(context);
      
      expect(faqs.length).toBeLessThanOrEqual(15);
    });
  });

  describe('searchFAQs', () => {
    it('should return empty array for empty query', async () => {
      const results = await service.searchFAQs('');
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace query', async () => {
      const results = await service.searchFAQs('   ');
      expect(results).toEqual([]);
    });

    it('should find FAQs by question text', async () => {
      const results = await service.searchFAQs('what is anthrasite');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.id).toBe('what-is-anthrasite');
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should find FAQs by answer text', async () => {
      const results = await service.searchFAQs('performance analytics');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.answer.toLowerCase().includes('performance'))).toBe(true);
    });

    it('should find FAQs by tags', async () => {
      const results = await service.searchFAQs('pricing');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.tags?.includes('pricing'))).toBe(true);
    });

    it('should score question matches higher than answer matches', async () => {
      const results = await service.searchFAQs('report');
      
      const questionMatch = results.find(r => r.item.question.toLowerCase().includes('report'));
      const answerOnlyMatch = results.find(r => 
        !r.item.question.toLowerCase().includes('report') &&
        r.item.answer.toLowerCase().includes('report')
      );
      
      if (questionMatch && answerOnlyMatch) {
        expect(questionMatch.score).toBeGreaterThan(answerOnlyMatch.score);
      }
    });

    it('should provide highlights for matches', async () => {
      const results = await service.searchFAQs('pricing');
      
      expect(results.length).toBeGreaterThan(0);
      const resultWithHighlight = results.find(r => r.highlights);
      
      if (resultWithHighlight?.highlights?.question) {
        expect(resultWithHighlight.highlights.question).toContain('<mark>');
        expect(resultWithHighlight.highlights.question).toContain('</mark>');
      }
    });

    it('should limit results to 10', async () => {
      const results = await service.searchFAQs('the'); // Common word
      
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should apply context boost', async () => {
      const context: HelpContext = {
        page: PageContext.PURCHASE,
      };

      const results = await service.searchFAQs('cost', context);
      
      // Purchase-related FAQs should rank higher
      expect(results[0].item.category).toBe(FAQCategory.PURCHASE);
    });

    it('should handle case-insensitive search', async () => {
      const results1 = await service.searchFAQs('ANTHRASITE');
      const results2 = await service.searchFAQs('anthrasite');
      
      expect(results1.length).toBe(results2.length);
      expect(results1[0].item.id).toBe(results2[0].item.id);
    });

    it('should tokenize and search multiple words', async () => {
      const results = await service.searchFAQs('payment methods accept');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.id).toBe('payment-methods');
    });

    it('should ignore very short words', async () => {
      const results = await service.searchFAQs('a an the it');
      
      expect(results).toEqual([]);
    });
  });

  describe('getRelatedFAQs', () => {
    it('should return related FAQs', () => {
      const relatedFAQs = service.getRelatedFAQs('whats-included');
      
      expect(relatedFAQs.length).toBeGreaterThan(0);
      expect(relatedFAQs.some(f => f.id === 'pricing')).toBe(true);
    });

    it('should return FAQs from same category', () => {
      const faq = ALL_FAQS.find(f => f.category === FAQCategory.TECHNICAL)!;
      const relatedFAQs = service.getRelatedFAQs(faq.id);
      
      expect(relatedFAQs.some(f => f.category === FAQCategory.TECHNICAL)).toBe(true);
    });

    it('should not include the original FAQ', () => {
      const faqId = 'what-is-anthrasite';
      const relatedFAQs = service.getRelatedFAQs(faqId);
      
      expect(relatedFAQs.every(f => f.id !== faqId)).toBe(true);
    });

    it('should limit to 5 related FAQs', () => {
      const relatedFAQs = service.getRelatedFAQs('what-is-anthrasite');
      
      expect(relatedFAQs.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array for invalid FAQ ID', () => {
      const relatedFAQs = service.getRelatedFAQs('invalid-id');
      
      expect(relatedFAQs).toEqual([]);
    });
  });

  describe('getFAQById', () => {
    it('should return FAQ by ID', () => {
      const faq = service.getFAQById('what-is-anthrasite');
      
      expect(faq).toBeDefined();
      expect(faq?.id).toBe('what-is-anthrasite');
      expect(faq?.question).toContain('What is Anthrasite');
    });

    it('should return undefined for invalid ID', () => {
      const faq = service.getFAQById('invalid-id');
      
      expect(faq).toBeUndefined();
    });
  });

  describe('getPopularFAQs', () => {
    it('should return popular FAQs', () => {
      const popularFAQs = service.getPopularFAQs();
      
      expect(popularFAQs.length).toBeGreaterThan(0);
      expect(popularFAQs.some(f => f.id === 'what-is-anthrasite')).toBe(true);
      expect(popularFAQs.some(f => f.id === 'pricing')).toBe(true);
    });

    it('should respect limit parameter', () => {
      const popularFAQs = service.getPopularFAQs(3);
      
      expect(popularFAQs.length).toBe(3);
    });

    it('should return valid FAQs only', () => {
      const popularFAQs = service.getPopularFAQs();
      
      expect(popularFAQs.every(f => f.id && f.question && f.answer)).toBe(true);
    });
  });

  describe('Search Index', () => {
    it('should build search index on initialization', () => {
      // Test that search works immediately without explicit index building
      const results = service.searchFAQs('anthrasite');
      
      expect(results).toBeDefined();
    });

    it('should index all FAQs', () => {
      // Verify all FAQs are searchable
      ALL_FAQS.forEach(faq => {
        const results = service.searchFAQs(faq.id);
        expect(results.some(r => r.item.id === faq.id)).toBe(true);
      });
    });
  });
});