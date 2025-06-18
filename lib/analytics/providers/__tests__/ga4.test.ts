import { GoogleAnalytics4Provider } from '../ga4'
import { getCookieConsent } from '@/lib/cookies/consent'

// Mock consent
jest.mock('@/lib/cookies/consent', () => ({
  getCookieConsent: jest.fn(() => ({
    analytics: true,
    marketing: true,
    performance: true,
    functional: true,
    timestamp: new Date().toISOString(),
  })),
}))

// Mock gtag
declare global {
  interface Window {
    gtag: jest.Mock
    dataLayer: any[]
  }
}

describe('GoogleAnalytics4Provider', () => {
  let provider: GoogleAnalytics4Provider
  const measurementId = 'G-TEST123'
  const apiSecret = 'test-secret'

  beforeEach(() => {
    // Reset window objects
    delete (window as any).gtag
    window.dataLayer = []

    // Clear document head
    document.head.innerHTML = ''

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    provider = new GoogleAnalytics4Provider(measurementId, apiSecret)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialize', () => {
    it('should load GA4 script and configure', async () => {
      await provider.initialize()

      // Check if script was added by checking all scripts
      const scripts = document.querySelectorAll('script')
      const ga4Script = Array.from(scripts).find(
        (s) =>
          s.src &&
          s.src.includes(`googletagmanager.com/gtag/js?id=${measurementId}`)
      )

      expect(ga4Script).toBeTruthy()
      expect(ga4Script?.async).toBe(true)

      // Check if gtag was configured via dataLayer
      expect(window.dataLayer).toContainEqual(['js', expect.any(Date)])
      expect(window.dataLayer).toContainEqual([
        'config',
        measurementId,
        {
          send_page_view: false,
          cookie_flags: 'SameSite=None;Secure',
        },
      ])
    })

    it('should not initialize without analytics consent', async () => {
      jest.mocked(getCookieConsent).mockReturnValue({
        analytics: false,
        marketing: false,
        performance: false,
      })

      await provider.initialize()

      // Should not add script
      const scripts = document.querySelectorAll('script')
      const ga4Script = Array.from(scripts).find(
        (s) => s.src && s.src.includes('googletagmanager.com')
      )
      expect(ga4Script).toBeFalsy()
    })

    it('should not initialize if already initialized', async () => {
      await provider.initialize()
      const scriptCount = document.querySelectorAll('script').length

      await provider.initialize()

      expect(document.querySelectorAll('script').length).toBe(scriptCount)
    })
  })

  describe('track', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should track custom events', () => {
      provider.track('test_event', { value: 100 })

      expect(window.dataLayer).toContainEqual([
        'event',
        'test_event',
        {
          value: 100,
        },
      ])
    })

    it('should track standard e-commerce events', () => {
      provider.track('purchase', {
        transaction_id: '12345',
        value: 99.99,
        currency: 'USD',
        items: [],
      })

      expect(window.dataLayer).toContainEqual([
        'event',
        'purchase',
        {
          transaction_id: '12345',
          value: 99.99,
          currency: 'USD',
          items: '',
        },
      ])
    })

    it('should not track when not initialized', () => {
      const uninitializedProvider = new GoogleAnalytics4Provider(
        measurementId,
        apiSecret
      )

      uninitializedProvider.track('test_event', {})

      // dataLayer should not contain event calls since provider wasn't initialized
      const eventCalls = window.dataLayer.filter(
        (call) => Array.isArray(call) && call[0] === 'event'
      )
      expect(eventCalls).toHaveLength(0)
    })

    it('should handle missing window.gtag gracefully', () => {
      delete (window as any).gtag

      expect(() => provider.track('test_event', {})).not.toThrow()
    })
  })

  describe('page', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should track page views', () => {
      provider.page({
        page_path: '/test',
        page_title: 'Test Page',
      })

      expect(window.dataLayer).toContainEqual([
        'event',
        'page_view',
        {
          page_path: '/test',
          page_title: 'Test Page',
        },
      ])
    })

    it('should include default page properties', () => {
      provider.page()

      expect(window.dataLayer).toContainEqual([
        'event',
        'page_view',
        {
          page_path: window.location.pathname,
          page_location: window.location.href,
          page_title: document.title,
        },
      ])
    })
  })

  describe('identify', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should set user properties', () => {
      provider.identify('user123', {
        email: 'test@example.com',
        plan: 'premium',
      })

      expect(window.dataLayer).toContainEqual([
        'set',
        {
          user_id: 'user123',
          user_properties: {
            email: 'test@example.com',
            plan: 'premium',
          },
        },
      ])
    })

    it('should handle identify without traits', () => {
      provider.identify('user123')

      expect(window.dataLayer).toContainEqual([
        'set',
        {
          user_id: 'user123',
          user_properties: undefined,
        },
      ])
    })
  })

  describe('reset', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should clear user data and reset client ID', () => {
      // Set user first
      provider.identify('user123')

      // Reset
      provider.reset()

      expect(window.dataLayer).toContainEqual([
        'set',
        {
          user_id: null,
        },
      ])
    })
  })

  describe('server-side tracking', () => {
    it('should send events to Measurement Protocol', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 204,
      })

      await provider.trackServer('test_event', {
        client_id: 'test-client',
        user_id: 'test-user',
        value: 100,
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('google-analytics.com/mp/collect'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test_event'),
        })
      )
    })

    it('should handle server tracking errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await provider.trackServer('test_event', {
        client_id: 'test-client',
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'GA4 server tracking error:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('enhanced e-commerce', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should track view_item event', () => {
      provider.track('view_item', {
        currency: 'USD',
        value: 99.99,
        items: [
          {
            item_id: 'SKU123',
            item_name: 'Test Product',
            price: 99.99,
            quantity: 1,
          },
        ],
      })

      expect(window.dataLayer).toContainEqual([
        'event',
        'view_item',
        expect.objectContaining({
          currency: 'USD',
          value: 99.99,
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: 'SKU123',
            }),
          ]),
        }),
      ])
    })

    it('should track add_to_cart event', () => {
      provider.track('add_to_cart', {
        currency: 'USD',
        value: 49.99,
        items: [
          {
            item_id: 'SKU456',
            item_name: 'Another Product',
            price: 49.99,
            quantity: 1,
          },
        ],
      })

      expect(window.dataLayer).toContainEqual([
        'event',
        'add_to_cart',
        expect.objectContaining({
          value: 49.99,
        }),
      ])
    })
  })
})
