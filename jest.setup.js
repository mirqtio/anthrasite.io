import '@testing-library/jest-dom'

// Add fetch polyfill for Node.js environment
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn()
}
