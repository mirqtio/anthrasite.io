/**
 * Unit tests for e2e/_utils/ui.ts
 *
 * Purpose: Prevent regression where required exports go missing
 * Added: 2025-10-13 after discovering gotoHome/gotoReady were missing
 *
 * This test file ensures critical navigation helpers are always exported
 * and would have caught the CI failure that affected 40+ tests.
 */

import { test, expect } from '@playwright/test'
import * as ui from './ui'

test.describe('e2e/_utils/ui exports', () => {
  test('exports primary navigation helpers', () => {
    // These going missing caused 40+ test failures in CI
    expect(typeof ui.goto).toBe('function')
    expect(typeof ui.gotoHome).toBe('function')
    expect(typeof ui.gotoReady).toBe('function')
  })

  test('exports stable navigation helper', () => {
    expect(typeof ui.gotoStable).toBe('function')
  })

  test('exports consent helpers', () => {
    expect(typeof ui.gotoAndDismissConsent).toBe('function')
    expect(typeof ui.acceptConsentIfPresent).toBe('function')
    // Backward compatibility alias
    expect(typeof ui.gotoAndDismissCookies).toBe('function')
  })

  test('exports modal interaction helpers', () => {
    expect(typeof ui.openModal).toBe('function')
    expect(typeof ui.waitForStable).toBe('function')
  })

  test('exports page-based interaction helpers', () => {
    expect(typeof ui.safeClick).toBe('function')
    expect(typeof ui.safeFill).toBe('function')
  })

  test('all exports are functions', () => {
    const exports = Object.values(ui)
    exports.forEach((exp) => {
      expect(typeof exp).toBe('function')
    })
  })
})
