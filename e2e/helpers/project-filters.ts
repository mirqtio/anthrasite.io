import { TestInfo } from '@playwright/test'

/**
 * Helper functions to skip tests based on browser project configuration.
 * Prevents wasteful execution of viewport-specific tests on inappropriate projects.
 *
 * Project naming convention:
 * - Desktop: chromium-desktop, firefox-desktop, webkit-desktop
 * - Mobile: chromium-mobile, webkit-mobile
 */

export function isDesktopProject(testInfo: TestInfo): boolean {
  return testInfo.project.name.includes('desktop')
}

export function isMobileProject(testInfo: TestInfo): boolean {
  return testInfo.project.name.includes('mobile')
}

/**
 * Skip test if running on desktop project (for mobile-only tests)
 */
export function skipOnDesktop(testInfo: TestInfo): void {
  if (isDesktopProject(testInfo)) {
    testInfo.skip()
  }
}

/**
 * Skip test if running on mobile project (for desktop-only tests)
 */
export function skipOnMobile(testInfo: TestInfo): void {
  if (isMobileProject(testInfo)) {
    testInfo.skip()
  }
}
