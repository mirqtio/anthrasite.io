// Minimal API shim used only in E2E builds
export default {
  init() {},
  capture() {},
  identify() {},
  reset() {},
  isFeatureEnabled() {
    return false
  },
  getFeatureFlag() {
    return undefined
  },
}
