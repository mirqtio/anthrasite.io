# ADR-P14: Robust Modal Layout Strategy

## Status

Accepted

## Context

We encountered persistent issues with "pinched" modal layouts where delete confirmation modals would appear extremely narrow (one word per line) or fail to cover the full screen. This was caused by two interacting factors:

1.  **Stacking Contexts**: Parent components (like `PipelineActionsToolbar`) often have `transform`, `filter`, or `z-index` properties that create new stacking contexts. This traps `fixed` position elements inside the parent's coordinate space rather than the viewport.
2.  **Layout Constraints**: Even when "lifting state up", modals rendered inside complex flex/grid layouts can be crushed by parent padding or width constraints, especially when using utility classes like `w-full` which resolve relative to the nearest positioned ancestor.

## Decision

To guarantee robust, full-screen modal presentation regardless of where a component is used, we are adopting a **"Portal + Explicit Width"** strategy for all critical modals (like Delete Confirmation).

### 1. Portals for Escape

All global modals MUST use `React.createPortal` to render directly into `document.body`. This definitively breaks them out of any parent stacking contexts, ensuring `fixed inset-0` correctly covers the entire viewport.

```typescript
return createPortal(
  <div className="fixed inset-0 z-[9999] ...">
    {/* Modal Content */}
  </div>,
  document.body
);
```

### 2. Inline Styles for Critical Dimensions

For the modal container itself, we will use **inline styles** for critical dimensions (`width`, `max-width`, `min-width`) instead of relying solely on Tailwind utility classes.

- **Why?** Tailwind classes can be subject to specificity conflicts, purging issues, or unexpected interactions with global resets.
- **The Pattern:**
  ```typescript
  <div
      className="bg-[#111] ..."
      style={{ width: '90vw', maxWidth: '28rem', minWidth: '300px' }}
  >
  ```
  - `width: 90vw`: Forces the modal to be wide enough on mobile.
  - `maxWidth: 28rem`: Caps the width on desktop (approx `max-w-md`).
  - `minWidth: 300px`: Prevents the "pinched" layout failure mode entirely.

## Global Utility Classes

To avoid repeating this pattern, we've added utility classes in `globals.css`:

```css
/* Page-level containers */
.landing-container {
  width: 90vw;
  max-width: 760px;
  min-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.content-container {
  width: 90vw;
  min-width: 300px;
  margin-left: auto;
  margin-right: auto;
}
.content-container--narrow { max-width: 640px; }
.content-container--medium { max-width: 760px; }
.content-container--wide { max-width: 1024px; }

/* Card-level containers */
.card-container {
  min-width: 280px;
  width: 100%;
}
```

**Usage:**
- Use `.landing-container` for landing page main content
- Use `.content-container` + size modifier for other pages
- Use `.card-container` on any card/panel that might collapse

## Consequences

- **Pros**: Modals and containers are guaranteed to look correct regardless of where they are embedded in the component tree. We eliminate a whole class of "it works on my machine" layout bugs.
- **Cons**: Slightly more verbose code. Inline styles bypass the design system tokens (though we stick to values that map to our grid).
- **Compliance**: Future modals and page containers should use the utility classes or follow this pattern if they face similar layout constraints.
