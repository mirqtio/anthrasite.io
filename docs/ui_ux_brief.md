# UI/UX Design Brief: The Control Room

**Philosophy:** "Lead with the Conclusion."
**Aesthetic:** Dark Mode (Carbon), High Contrast, Data-Dense but Scannable.
**Inspiration:** Anthrasite Brand + Premium Audit Report (Hero Page).

---

## 1. Visual Language (The "Vibe")

- **Theme:** **Deep Carbon (`#0A0A0A`)**. The interface feels like a cockpit or a developer console.
- **Typography:** `Inter`.
  - **Headings:** Thin/Light weights (`300`/`200`). Large sizes for KPIs.
  - **Data:** Monospace numbers for tabular data (`JetBrains Mono` or `Inter` tabular-nums).
  - **Labels:** Uppercase, wide tracking (`0.08em`), low opacity (`0.5`).
- **Color Palette:**
  - **Background:** `#0A0A0A` (Main), `#111111` (Cards/Panels).
  - **Primary Action:** `#0066FF` (Anthrasite Blue).
  - **Status:**
    - 🟢 **Good/Online:** `#22C55E` (Emerald)
    - 🟡 **Warning/Pending:** `#FFC107` (Amber)
    - 🔴 **Critical/Offline:** `#DC2626` (Red)
    - 🟣 **System/Magic:** `#7C3AED` (Violet - for AI/LLM actions)

---

## 2. Layout Strategy

### A. The "Master List" (Grid View)

- **Concept:** A high-performance HUD (Heads-Up Display).
- **Structure:**
  - **Header:** "Live Feed" style. Search bar is a "Command Line" input (`cmd+k`).
  - **Rows:** Compact. No wasted space.
  - **Columns:**
    1.  **Status:** Traffic light dot (Phase A/B/C/D).
    2.  **Company:** Bold white text.
    3.  **Revenue:** Right-aligned, tabular numbers.
    4.  **Action:** Hover-only "Quick Actions" (Run, Edit).
- **Interaction:**
  - **Hover:** Row highlights with a subtle "Pressure Ring" glow (Blue).
  - **Click:** Opens "Lead Detail" in a **Slide-Over Panel** (keeping context of the list).

### B. The "Lead Detail" (Slide-Over)

- **Concept:** The "Hero Page" of the Lead.
- **Layout:** 3-Column Grid.
  - **Col 1: Identity (The "Who")**
    - Large Company Name (Hero style).
    - URL & Domain (Subtle).
    - Revenue Badge (Pill shape).
  - **Col 2: Journey (The "What")**
    - **Vertical Timeline:**
      - **Phase A:** "Validating..." (Completed)
      - **Phase B:** "Enriching..." (Completed)
      - **Phase C:** "Synthesizing..." (Completed - View Memo)
      - **Phase D:** "Generating PDF..." (Pending)
    - **Visuals:** Connecting lines light up as phases complete.
  - **Col 3: Control (The "How")**
    - **Primary Button:** Large, full-width. "Generate Report" (if ready) or "View Report" (if done).
    - **Repair Actions:** Low-contrast text links below ("Resend Email", "Regenerate").

---

## 3. Key Components

### The "Worker Beacon"

- **Location:** Top Right of Global Nav.
- **Design:**
  - **Online:** Pulsing Green Dot + "SYSTEM ONLINE".
  - **Offline:** Static Red Dot + "SYSTEM OFFLINE" (Blinking).
- **Interaction:** Hover shows detailed stats (Active Pollers, Queue Depth).

### The "Safety Latch" (Batch Ops)

- **Trigger:** Selecting > 10 leads -> "Batch Action Bar" slides up from bottom.
- **Action:** "Run Phase D".
- **Modal:**
  - **Dark Overlay:** 95% opacity. Focus is absolute.
  - **Input:** "Type CONFIRM to launch 105 reports."
  - **Visual:** Red border glow. Serious tone.

---

## 4. Implementation Notes (Tailwind)

- **Glassmorphism:** Use `backdrop-blur-md` and `bg-white/5` for panels.
- **Borders:** `border-white/10` for subtle separation.
- **Animations:**
  - `animate-pulse` for active states.
  - `transition-all duration-200` for hover effects.

---

**Next Step:** Build the `LeadIngestModal` and `WorkerBeacon` using these tokens.
