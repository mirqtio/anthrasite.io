# Anthrasite Design System (v1.0)

**Core Philosophy:** "Value, Crystallized." The design must feel precise, premium, and calm—never "hacker" or "terminal."

## 1. Color Palette: The "Anthracite" Theme

_Source Logic:_ Pure black causes eye strain and "smearing" on OLED screens. We use deep charcoal to convey luxury and reduce harshness.

| Context              | Hex Code    | Usage Rule                                                                                   |
| :------------------- | :---------- | :------------------------------------------------------------------------------------------- |
| **Surface (Bg)**     | **#121212** | **Primary Background.** Do not use #000000. This is "Anthracite."                            |
| **Surface (Card)**   | **#1E1E1E** | **Bento Cells & Modals.** Use lighter values to create depth, never drop shadows.            |
| **Text (Primary)**   | **#E0E0E0** | **Headlines & Body.** 87% White. Pure white (#FFF) vibrates against dark backgrounds.        |
| **Text (Secondary)** | **#A0A0A0** | **Labels & Metadata.** 60% White.                                                            |
| **Accent (Action)**  | **#007BFF** | **Electric Blue.** Used _only_ for primary CTAs and active states. Must pass 4.5:1 contrast. |
| **Status (Bad)**     | **#CF6679** | **Error/Risk.** Muted red (not bright red) for failing metrics in the Bento grid.            |
| **Status (Good)**    | **#03DAC6** | **Success.** Muted teal/green for passing metrics.                                           |

**Gradient Note:** You may use a subtle "glow" gradient behind the Hero Screenshot (e.g., deeply muted blue to transparent) to create depth, but the UI itself is flat.

## 2. Typography: Optical Adjustments

_Source Logic:_ Text looks thinner on dark backgrounds. We must mechanically adjust weight and spacing to ensure legibility.

**Font Family:** System Sans-Serif (Inter, SF Pro, Roboto) to ensure fast load times and "native" feel.

| Element              | Desktop Size  | Mobile Size           | Weight (Dark Mode)  | Letter Spacing (Tracking) | Line Height |
| :------------------- | :------------ | :-------------------- | :------------------ | :------------------------ | :---------- |
| **H1 (Hero)**        | 48px          | 34px                  | **Bold (700)**      | -0.02em                   | 1.1         |
| **H2 (Section)**     | 32px          | 28px                  | **Semi-Bold (600)** | Normal                    | 1.2         |
| **H3 (Bento Title)** | 24px          | 20px                  | **Medium (500)**    | Normal                    | 1.3         |
| **Body Copy**        | **18px-20px** | **16px** (Strict Min) | **Medium (500)**    | **+0.02em**               | **1.6**     |
| **Labels/Tags**      | 14px          | 14px                  | Medium (500)        | +0.05em                   | 1.0         |

- **Critical Rule:** In Dark Mode, use **Medium (500)** weight where you would normally use Regular (400) in Light Mode. Regular weight disappears against charcoal.
- **Body Size:** Do not go below 16px on mobile. It prevents iOS zoom-in on form inputs.

## 3. Layout & Spacing

_Source Logic:_ "Space is substance." Dark interfaces feel heavy and cramped without aggressive negative space.

- **Section Spacing:** **80px** minimum between major vertical sections (Hero → Problem → Solution).
- **Content Grouping:** **24px** gap between Headlines and Body text.
- **Max Width:** Text blocks should never exceed **65–75 characters** wide to prevent reading fatigue.

### The Bento Grid (Desktop vs. Mobile)

- **Desktop:** Asymmetric grid. The "Screenshot/Proof" cell should be the largest (2x2 or 2x1). Metric cells are smaller (1x1).
- **Mobile:** **Do not use a grid.** Stack cells vertically in a single column.
- **Corner Radius:** **16px** on all cards/cells. This softens the "industrial" feel of the charcoal.

## 4. UI Components & Interaction

### Buttons (CTA)

- **Height:** Minimum **48px** (Mobile Touch Target).
- **Color:** Electric Blue (#007BFF) background, White text.
- **Style:** Solid fill. No borders (borders look like "ghost buttons" and convert poorly).
- **Placement:**
  - Desktop: Inline.
  - Mobile: **Sticky Bottom Bar.** Fixed to the bottom of the viewport so it is always in the "Thumb Zone".

### The Header

- **Behavior:** Static (Disappears on scroll).
- **Logic:** Maintain a 1:1 Attention Ratio. Do not let users navigate backward or "home." Once they scroll past the hero, the only way out is the Sticky Bottom CTA.

### Forms

- **Layout:** Single column only.
- **Inputs:** Background #2C2C2C (Lighter than page bg), Text #E0E0E0.
- **Validation:** Inline, "On Blur" (after they leave the field), not after they click submit.

## 5. Visual Trust Assets

### The Hero Screenshot

- **Treatment:** Do not place the raw screenshot on the background. Place it inside a "Device Frame" or a window container with a subtle border (#333333) and drop shadow to lift it off the charcoal background.
- **Annotation:** Overlay a "Badge" (e.g., Red circle or "Slow Load Time" tag) directly on the image to prove you analyzed it.

### Data Visualization

- **Logic:** Business Impact First.
- **Format:**
  1.  **Headline:** "Revenue at Risk" (The Business)
  2.  **Subtext:** "$4,200/mo estimated" (The Value)
  3.  **Label:** "Based on LCP of 4.2s" (The Proof)
- _Note:_ The technical metric (LCP) is the footnote, not the headline.

## 6. Mobile Quality Assurance (The "False Bottom" Check)

_Source Logic:_ High contrast black/white often creates visual illusions where the page looks like it ends.

- **The Fix:** Ensure elements (like the bottom of the Hero or the top of the Bento grid) visually **straddle the fold**. The user must see that "there is more below" to trigger the scroll.
- **Sticky CTA:** Ensure the sticky bar has a slight transparency or blur (backdrop-filter: blur(10px)) so users can see content scrolling behind it, preventing a claustrophobic feel.
