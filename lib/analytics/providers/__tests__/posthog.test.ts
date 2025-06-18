import { PostHogProvider } from '../posthog'

// Mock PostHog library
const mockPostHog = {
  init: jest.fn(),
  capture: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
  getFeatureFlag: jest.fn(),
  isFeatureEnabled: jest.fn(),
  onFeatureFlags: jest.fn(),
  reloadFeatureFlags: jest.fn(),
  group: jest.fn(),
  setPersonProperties: jest.fn(),
  opt_in_capturing: jest.fn(),
  opt_out_capturing: jest.fn(),
  has_opted_out_capturing: jest.fn(),
  clear_opt_in_out_capturing: jest.fn(),
  register: jest.fn(),
  unregister: jest.fn(),
  get_distinct_id: jest.fn(),
  alias: jest.fn(),
  set_config: jest.fn(),
  get_config: jest.fn(),
  get_property: jest.fn(),
  toString: jest.fn(),
  _send_request: jest.fn()
}

// Mock dynamic import
jest.mock('posthog-js', () => mockPostHog, { virtual: true })

describe('PostHogProvider', () => {
  let provider: PostHogProvider
  const apiKey = 'phc_test123'

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset window
    global.window = Object.create(window)
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/test',
        pathname: '/test',
        search: '',
        hash: ''
      },
      writable: true
    })
    
    provider = new PostHogProvider(apiKey)
  })

  describe('initialize', () => {
    it('should initialize PostHog with correct config', async () => {
      await provider.initialize()

      expect(mockPostHog.init).toHaveBeenCalledWith(apiKey, {
        api_host: 'https://app.posthog.com',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        opt_out_capturing_by_default: false,
        loaded: expect.any(Function)
      })
    })

    it('should use EU host when specified', async () => {
      const euProvider = new PostHogProvider(apiKey, { host: 'eu' })
      await euProvider.initialize()

      expect(mockPostHog.init).toHaveBeenCalledWith(apiKey, 
        expect.objectContaining({
          api_host: 'https://eu.posthog.com'
        })
      )
    })

    it('should not initialize twice', async () => {
      await provider.initialize()
      await provider.initialize()

      expect(mockPostHog.init).toHaveBeenCalledTimes(1)
    })

    it('should handle initialization errors', async () => {
      mockPostHog.init.mockImplementation(() => {
        throw new Error('Init failed')
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await provider.initialize()

      expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize PostHog:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('track', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should track events with properties', () => {
      provider.track('test_event', { value: 100, category: 'test' })

      expect(mockPostHog.capture).toHaveBeenCalledWith('test_event', {
        value: 100,
        category: 'test'
      })
    })

    it('should track events without properties', () => {
      provider.track('simple_event')

      expect(mockPostHog.capture).toHaveBeenCalledWith('simple_event', {})
    })

    it('should not track when not initialized', () => {
      const uninitializedProvider = new PostHogProvider(apiKey)
      
      uninitializedProvider.track('test_event')
      
      expect(mockPostHog.capture).not.toHaveBeenCalled()
    })
  })

  describe('page', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should track page views', () => {
      provider.page({
        path: '/test-page',
        title: 'Test Page',
        referrer: 'https://google.com'
      })

      expect(mockPostHog.capture).toHaveBeenCalledWith('$pageview', {
        path: '/test-page',
        title: 'Test Page',
        referrer: 'https://google.com'
      })
    })

    it('should use default values when properties not provided', () => {
      provider.page()

      expect(mockPostHog.capture).toHaveBeenCalledWith('$pageview', {
        $current_url: 'http://localhost:3000/test',
        $pathname: '/test',
        $title: ''
      })
    })
  })

  describe('identify', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should identify user with traits', () => {
      provider.identify('user123', {
        email: 'test@example.com',
        name: 'Test User',
        plan: 'premium'
      })

      expect(mockPostHog.identify).toHaveBeenCalledWith('user123', {
        email: 'test@example.com',
        name: 'Test User',
        plan: 'premium'
      })
    })

    it('should identify user without traits', () => {
      provider.identify('user456')

      expect(mockPostHog.identify).toHaveBeenCalledWith('user456', {})
    })
  })

  describe('reset', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should reset PostHog', () => {
      provider.reset()

      expect(mockPostHog.reset).toHaveBeenCalled()
    })
  })

  describe('feature flags', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should get feature flag value', () => {
      mockPostHog.getFeatureFlag.mockReturnValue('variant-a')

      const result = provider.getFeatureFlag('test-flag')

      expect(result).toBe('variant-a')
      expect(mockPostHog.getFeatureFlag).toHaveBeenCalledWith('test-flag')
    })

    it('should check if feature is enabled', () => {
      mockPostHog.isFeatureEnabled.mockReturnValue(true)

      const result = provider.isFeatureEnabled('test-feature')

      expect(result).toBe(true)
      expect(mockPostHog.isFeatureEnabled).toHaveBeenCalledWith('test-feature')
    })

    it('should handle feature flag errors', () => {
      mockPostHog.getFeatureFlag.mockImplementation(() => {
        throw new Error('Flag error')
      })

      const result = provider.getFeatureFlag('error-flag')

      expect(result).toBeUndefined()
    })
  })

  describe('groups', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should set group properties', () => {
      provider.group('company', 'acme-corp', {
        name: 'Acme Corporation',
        plan: 'enterprise'
      })

      expect(mockPostHog.group).toHaveBeenCalledWith('company', 'acme-corp', {
        name: 'Acme Corporation',
        plan: 'enterprise'
      })
    })
  })

  describe('opt-out management', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should opt out of tracking', () => {
      provider.optOut()

      expect(mockPostHog.opt_out_capturing).toHaveBeenCalled()
    })

    it('should opt in to tracking', () => {
      provider.optIn()

      expect(mockPostHog.opt_in_capturing).toHaveBeenCalled()
    })

    it('should check opt-out status', () => {
      mockPostHog.has_opted_out_capturing.mockReturnValue(true)

      const result = provider.hasOptedOut()

      expect(result).toBe(true)
      expect(mockPostHog.has_opted_out_capturing).toHaveBeenCalled()
    })
  })

  describe('super properties', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should register super properties', () => {
      provider.register({
        app_version: '1.0.0',
        environment: 'production'
      })

      expect(mockPostHog.register).toHaveBeenCalledWith({
        app_version: '1.0.0',
        environment: 'production'
      })
    })

    it('should unregister super properties', () => {
      provider.unregister('app_version')

      expect(mockPostHog.unregister).toHaveBeenCalledWith('app_version')
    })
  })

  describe('alias', () => {
    beforeEach(async () => {
      await provider.initialize()
    })

    it('should create alias for user', () => {
      provider.alias('new-user-id')

      expect(mockPostHog.alias).toHaveBeenCalledWith('new-user-id')
    })
  })
})