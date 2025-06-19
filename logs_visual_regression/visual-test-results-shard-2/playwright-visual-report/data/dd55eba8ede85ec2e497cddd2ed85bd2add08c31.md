# Page snapshot

```yaml
- alert
- main:
  - img
  - heading "Invalid Purchase Link" [level=2]
  - paragraph: Invalid UTM format
  - button "Return to Homepage"
- region "Cookie consent":
  - heading "We value your privacy" [level=2]
  - paragraph: We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept all", you consent to our use of cookies. You can manage your preferences or learn more about our cookie policy.
  - button "Manage cookie preferences": Manage preferences
  - button "Reject all cookies": Reject all
  - button "Accept all cookies": Accept all
```