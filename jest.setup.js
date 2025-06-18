import '@testing-library/jest-dom'

// Mock Next.js NextRequest and NextResponse
// eslint-disable-next-line no-undef
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init?.method || 'GET'
      this.headers = new Map()
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value)
        })
      }
      this._body = init?.body
    }

    async json() {
      return typeof this._body === 'string'
        ? JSON.parse(this._body)
        : this._body
    }

    async text() {
      return typeof this._body === 'string'
        ? this._body
        : JSON.stringify(this._body)
    }
  },
  NextResponse: {
    json: (data, init) => {
      const response = {
        _body: data,
        status: init?.status || 200,
        headers: new Map(),
        async json() {
          return this._body
        },
        async text() {
          return JSON.stringify(this._body)
        },
      }
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      }
      return response
    },
  },
}))

// Add fetch polyfill for Node.js environment
if (typeof global.fetch === 'undefined') {
  // eslint-disable-next-line no-undef
  global.fetch = jest.fn()
}

// Add Request/Response polyfills for Next.js API routes
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      Object.defineProperty(this, 'url', {
        value: typeof input === 'string' ? input : input.url,
        writable: false,
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(this, 'method', {
        value: init?.method || 'GET',
        writable: false,
        enumerable: true,
        configurable: true,
      })
      this.headers = new Map()
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value)
        })
      }
      this.body = init?.body
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
    }

    async text() {
      return typeof this.body === 'string'
        ? this.body
        : JSON.stringify(this.body)
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.headers = new Map()
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value)
        })
      }
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
    }

    async text() {
      return typeof this.body === 'string'
        ? this.body
        : JSON.stringify(this.body)
    }
  }
}

// Add TextEncoder and TextDecoder to jsdom environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder } = require('util')
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  const { TextDecoder } = require('util')
  global.TextDecoder = TextDecoder
}

// Add crypto.subtle for Web Crypto API
const { webcrypto } = require('crypto')
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
  writable: true,
  configurable: true,
  enumerable: true,
})
