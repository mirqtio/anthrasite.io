/**
 * Anthrasite Design System Style Guide
 * Complete visual reference for all design tokens
 */

import { useState } from "react";
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
  AlertTriangleIcon,
  XIcon,
  LoaderIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";

export function AnthrasiteStyleguidePage() {
  const [darkMode, setDarkMode] = useState(true);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={darkMode ? "" : "light"}>
      <div className="min-h-screen bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]">
        {/* Header with Theme Toggle */}
        <div className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-bold)] mb-2">
                Anthrasite Design System
              </h1>
              <p className="text-[var(--color-text-secondary)] text-[var(--font-size-base)]">
                Complete token reference with light and dark mode support
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 bg-[var(--color-interactive-secondary-default)] hover:bg-[var(--color-interactive-secondary-hover)] text-[var(--color-interactive-secondary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] font-[var(--font-weight-medium)] transition-[var(--duration-normal)]"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-12 space-y-16">
          {/* ========== COLOR TOKENS ========== */}
          <section>
            <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
              Color Tokens
            </h2>

            {/* Background Colors */}
            <div className="mb-8">
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                Background Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ColorSwatch name="bg-canvas" var="--color-bg-canvas" />

                <ColorSwatch name="bg-surface" var="--color-bg-surface" />

                <ColorSwatch name="bg-elevated" var="--color-bg-elevated" />

                <ColorSwatch name="bg-subtle" var="--color-bg-subtle" />

                <ColorSwatch name="bg-hover" var="--color-bg-hover" />

                <ColorSwatch name="bg-scrim" var="--color-bg-scrim" />
              </div>
            </div>

            {/* Text Colors */}
            <div className="mb-8">
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                Text Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextSwatch name="text-primary" var="--color-text-primary" />

                <TextSwatch
                  name="text-secondary"
                  var="--color-text-secondary"
                />

                <TextSwatch name="text-muted" var="--color-text-muted" />

                <TextSwatch name="text-disabled" var="--color-text-disabled" />

                <TextSwatch name="text-link" var="--color-text-link" />

                <TextSwatch
                  name="text-link-hover"
                  var="--color-text-link-hover"
                />
              </div>
            </div>

            {/* Border Colors */}
            <div className="mb-8">
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                Border Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BorderSwatch
                  name="border-default"
                  var="--color-border-default"
                />

                <BorderSwatch
                  name="border-subtle"
                  var="--color-border-subtle"
                />

                <BorderSwatch
                  name="border-strong"
                  var="--color-border-strong"
                />

                <BorderSwatch name="border-focus" var="--color-border-focus" />
              </div>
            </div>

            {/* Interactive Colors */}
            <div className="mb-8">
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                Interactive Colors (CTA)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InteractiveSwatch
                  name="cta-default"
                  var="--color-interactive-cta-default"
                  textVar="--color-interactive-cta-text"
                />

                <InteractiveSwatch
                  name="cta-hover"
                  var="--color-interactive-cta-hover"
                  textVar="--color-interactive-cta-text"
                />

                <InteractiveSwatch
                  name="cta-active"
                  var="--color-interactive-cta-active"
                  textVar="--color-interactive-cta-text"
                />

                <InteractiveSwatch
                  name="cta-disabled"
                  var="--color-interactive-cta-disabled"
                  textVar="--color-interactive-cta-text"
                />
              </div>
            </div>

            {/* Status Colors */}
            <div className="mb-8">
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                Status Colors
              </h3>
              <div className="space-y-4">
                <StatusSwatch type="success" />

                <StatusSwatch type="warning" />

                <StatusSwatch type="error" />

                <StatusSwatch type="info" />
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--color-border-default)]" />

          {/* ========== BUTTONS ========== */}
          <section>
            <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
              Buttons
            </h2>

            <div className="space-y-8">
              <ButtonGroup title="Primary CTA" type="cta" />

              <ButtonGroup title="Secondary" type="secondary" />

              <ButtonGroup title="Tertiary/Ghost" type="tertiary" />

              <ButtonGroup title="Destructive" type="destructive" />
            </div>
          </section>

          <div className="border-t border-[var(--color-border-default)]" />

          {/* ========== FORM INPUTS ========== */}
          <section>
            <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
              Form Inputs
            </h2>

            <div className="space-y-8 max-w-2xl">
              {/* Text Input */}
              <div>
                <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-medium)] mb-3 text-[var(--color-text-secondary)]">
                  Text Input
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Default state"
                    className="w-full bg-[var(--color-interactive-input-default)] hover:bg-[var(--color-interactive-input-hover)] focus:bg-[var(--color-interactive-input-focus)] border border-[var(--color-border-default)] focus:border-[var(--color-border-focus)] rounded-[var(--radius-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-[var(--color-text-primary)] transition-[var(--duration-normal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-focus-ring-offset)]"
                  />

                  <input
                    type="text"
                    placeholder="Disabled state"
                    disabled
                    className="w-full bg-[var(--color-interactive-input-disabled)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-[var(--color-text-disabled)] cursor-not-allowed"
                  />

                  <input
                    type="text"
                    placeholder="Error state"
                    className="w-full bg-[var(--color-interactive-input-error)] border border-[var(--color-status-error-border)] rounded-[var(--radius-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-status-error-trim)] focus:ring-offset-2"
                  />
                </div>
              </div>

              {/* Textarea */}
              <div>
                <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-medium)] mb-3 text-[var(--color-text-secondary)]">
                  Textarea
                </h3>
                <textarea
                  placeholder="Enter your message..."
                  rows={4}
                  className="w-full bg-[var(--color-interactive-input-default)] hover:bg-[var(--color-interactive-input-hover)] focus:bg-[var(--color-interactive-input-focus)] border border-[var(--color-border-default)] focus:border-[var(--color-border-focus)] rounded-[var(--radius-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-[var(--color-text-primary)] transition-[var(--duration-normal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2"
                />
              </div>

              {/* Checkbox */}
              <div>
                <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-medium)] mb-3 text-[var(--color-text-secondary)]">
                  Checkbox & Toggle
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-[var(--radius-sm)]"
                    />

                    <span className="text-[var(--color-text-primary)]">
                      Checkbox option
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative w-11 h-6 bg-[var(--color-interactive-cta-default)] rounded-[var(--radius-full)]">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-[var(--radius-full)]" />
                    </div>
                    <span className="text-[var(--color-text-primary)]">
                      Toggle switch
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--color-border-default)]" />

          {/* ========== BADGES & ALERTS ========== */}
          <section>
            <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
              Badges & Alerts
            </h2>

            {/* Badges */}
            <div className="mb-8">
              <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-medium)] mb-3 text-[var(--color-text-secondary)]">
                Badges
              </h3>
              <div className="flex flex-wrap gap-3">
                <Badge type="default" label="Default" />

                <Badge type="success" label="Success" />

                <Badge type="warning" label="Warning" />

                <Badge type="error" label="Error" />

                <Badge type="info" label="Info" />
              </div>
            </div>

            {/* Alerts */}
            <div>
              <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-medium)] mb-3 text-[var(--color-text-secondary)]">
                Alerts
              </h3>
              <div className="space-y-4 max-w-2xl">
                <Alert
                  type="info"
                  title="Info Alert"
                  message="This is an informational message."
                />

                <Alert
                  type="success"
                  title="Success Alert"
                  message="Your action was completed successfully."
                />

                <Alert
                  type="warning"
                  title="Warning Alert"
                  message="Please review this information carefully."
                />

                <Alert
                  type="error"
                  title="Error Alert"
                  message="An error occurred. Please try again."
                />
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--color-border-default)]" />

          {/* ========== CARDS ========== */}
          <section>
            <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
              Cards
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)] shadow-[var(--shadow-md)]">
                <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-2">
                  Surface Card
                </h3>
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                  Basic card with surface background
                </p>
              </div>
              <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)] shadow-[var(--shadow-lg)]">
                <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-2">
                  Elevated Card
                </h3>
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                  Card with elevated background
                </p>
              </div>
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-strong)] transition-[var(--duration-normal)] cursor-pointer">
                <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-2">
                  Interactive Card
                </h3>
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                  Hover to see interaction
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--color-border-default)]" />

          {/* ========== MODAL ========== */}
          <section>
            <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
              Modal
            </h2>
            <button
              onClick={() => setShowModal(!showModal)}
              className="bg-[var(--color-interactive-cta-default)] hover:bg-[var(--color-interactive-cta-hover)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]"
            >
              {showModal ? "Close" : "Open"} Modal
            </button>

            {showModal && (
              <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-[var(--color-bg-scrim)]"
                  onClick={() => setShowModal(false)}
                />

                <div className="relative bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-[var(--spacing-component-xl)] shadow-[var(--shadow-2xl)] max-w-md w-full">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-[var(--font-size-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]">
                      Modal Title
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[var(--font-size-base)] text-[var(--color-text-secondary)] mb-6">
                    This modal demonstrates elevated background with backdrop
                    overlay.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-[var(--color-interactive-secondary-default)] hover:bg-[var(--color-interactive-secondary-hover)] text-[var(--color-interactive-secondary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] font-[var(--font-weight-medium)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-[var(--color-interactive-cta-default)] hover:bg-[var(--color-interactive-cta-hover)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="border-t border-[var(--color-border-default)]" />

          {/* ========== SKELETON LOADERS ========== */}
          <section>
            <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
              Skeleton Loaders
            </h2>
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-3">
                <div className="h-8 w-3/4 bg-[var(--color-skeleton-base)] rounded-[var(--radius-md)] animate-pulse" />

                <div className="h-4 w-full bg-[var(--color-skeleton-base)] rounded-[var(--radius-md)] animate-pulse" />

                <div className="h-4 w-5/6 bg-[var(--color-skeleton-base)] rounded-[var(--radius-md)] animate-pulse" />
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--color-border-default)]" />

          {/* ========== TYPOGRAPHY ========== */}
          <section>
            <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
              Typography
            </h2>

            {/* Font Sizes */}
            <div className="mb-8">
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                Font Sizes
              </h3>
              <div className="space-y-3">
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-xs)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    xs (0.75rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-sm)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    sm (0.875rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-base)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    base (1rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-lg)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    lg (1.125rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-xl)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    xl (1.25rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-2xl)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    2xl (1.5rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-3xl)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    3xl (1.875rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-4xl)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    4xl (2.25rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-5xl)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    5xl (3rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-6xl)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    6xl (3.75rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-7xl)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    7xl (4.5rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-8xl)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    8xl (6rem)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[var(--color-text-primary)]"
                    style={{ fontSize: "var(--font-size-9xl)" }}
                  >
                    The quick brown fox
                  </span>
                  <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] font-mono">
                    9xl (8rem)
                  </span>
                </div>
              </div>
            </div>

            {/* Font Weights & Usage Examples */}
            <div className="mb-8">
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                Font Weights & Usage Examples
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[var(--font-size-6xl)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)]">
                    6XL Bold - Heading 1
                  </p>
                </div>
                <div>
                  <p className="text-[var(--font-size-5xl)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]">
                    5XL Semibold - Heading 2
                  </p>
                </div>
                <div>
                  <p className="text-[var(--font-size-4xl)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]">
                    4XL Semibold - Heading 3
                  </p>
                </div>
                <div>
                  <p className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]">
                    3XL Semibold - Heading 4
                  </p>
                </div>
                <div>
                  <p className="text-[var(--font-size-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]">
                    2XL Semibold - Heading 5
                  </p>
                </div>
                <div>
                  <p className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]">
                    XL Medium - Heading 6
                  </p>
                </div>
                <div>
                  <p className="text-[var(--font-size-lg)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]">
                    LG Medium - Subheading
                  </p>
                </div>
                <div>
                  <p className="text-[var(--font-size-base)] font-[var(--font-weight-regular)] text-[var(--color-text-primary)]">
                    Base Regular - Body text
                  </p>
                </div>
                <div>
                  <p className="text-[var(--font-size-sm)] font-[var(--font-weight-regular)] text-[var(--color-text-secondary)]">
                    SM Regular - Small text
                  </p>
                </div>
                <div>
                  <p className="text-[var(--font-size-xs)] font-[var(--font-weight-regular)] text-[var(--color-text-muted)]">
                    XS Regular - Caption text
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--color-border-default)]" />

          {/* ========== SPACING ========== */}
          <section>
            <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
              Spacing Scale
            </h2>
            <div className="space-y-4">
              <SpacingDemo size="xs" />

              <SpacingDemo size="sm" />

              <SpacingDemo size="md" />

              <SpacingDemo size="lg" />

              <SpacingDemo size="xl" />

              <SpacingDemo size="2xl" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Helper Components
type ColorSwatchProps = {
  name: string;
  var: string;
};

function ColorSwatch({ name, var: cssVar }: ColorSwatchProps) {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-4">
      <div
        className="w-full h-16 rounded-[var(--radius-sm)] mb-3 border border-[var(--color-border-default)]"
        style={{ backgroundColor: `var(${cssVar})` }}
      />

      <p className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]">
        {name}
      </p>
      <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)] font-mono">
        var({cssVar})
      </p>
    </div>
  );
}

type TextSwatchProps = {
  name: string;
  var: string;
};

function TextSwatch({ name, var: cssVar }: TextSwatchProps) {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-4">
      <p
        className="text-[var(--font-size-lg)] font-[var(--font-weight-medium)] mb-3"
        style={{ color: `var(${cssVar})` }}
      >
        The quick brown fox
      </p>
      <p className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]">
        {name}
      </p>
      <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)] font-mono">
        var({cssVar})
      </p>
    </div>
  );
}

type BorderSwatchProps = {
  name: string;
  var: string;
};

function BorderSwatch({ name, var: cssVar }: BorderSwatchProps) {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-4">
      <div
        className="w-full h-16 rounded-[var(--radius-sm)] mb-3 border-2"
        style={{
          borderColor: `var(${cssVar})`,
          backgroundColor: "var(--color-bg-canvas)",
        }}
      />

      <p className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]">
        {name}
      </p>
      <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)] font-mono">
        var({cssVar})
      </p>
    </div>
  );
}

type InteractiveSwatchProps = {
  name: string;
  var: string;
  textVar: string;
};

function InteractiveSwatch({
  name,
  var: cssVar,
  textVar,
}: InteractiveSwatchProps) {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-4">
      <div
        className="w-full h-16 rounded-[var(--radius-sm)] mb-3 flex items-center justify-center font-[var(--font-weight-medium)]"
        style={{ backgroundColor: `var(${cssVar})`, color: `var(${textVar})` }}
      >
        Button Text
      </div>
      <p className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]">
        {name}
      </p>
      <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)] font-mono">
        var({cssVar})
      </p>
    </div>
  );
}

type StatusSwatchProps = {
  type: "success" | "warning" | "error" | "info";
};

function StatusSwatch({ type }: StatusSwatchProps) {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-4">
      <div className="grid grid-cols-4 gap-3">
        <div>
          <div
            className="w-full h-12 rounded-[var(--radius-sm)] mb-2 border"
            style={{
              backgroundColor: `var(--color-status-${type}-bg)`,
              borderColor: `var(--color-status-${type}-border)`,
            }}
          />

          <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
            bg
          </p>
        </div>
        <div>
          <div
            className="w-full h-12 rounded-[var(--radius-sm)] mb-2 border border-[var(--color-border-default)]"
            style={{ backgroundColor: `var(--color-status-${type}-border)` }}
          />

          <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
            border
          </p>
        </div>
        <div>
          <div
            className="w-full h-12 rounded-[var(--radius-sm)] mb-2 border border-[var(--color-border-default)] flex items-center justify-center font-[var(--font-weight-medium)]"
            style={{
              backgroundColor: "var(--color-bg-surface)",
              color: `var(--color-status-${type}-text)`,
            }}
          >
            Text
          </div>
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
            text
          </p>
        </div>
        <div>
          <div
            className="w-full h-12 rounded-[var(--radius-sm)] mb-2 border border-[var(--color-border-default)]"
            style={{ backgroundColor: `var(--color-status-${type}-trim)` }}
          />

          <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
            trim
          </p>
        </div>
      </div>
      <p className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)] mt-3 capitalize">
        {type}
      </p>
    </div>
  );
}

type ButtonGroupProps = {
  title: string;
  type: "cta" | "secondary" | "tertiary" | "destructive";
};

function ButtonGroup({ title, type }: ButtonGroupProps) {
  const getClasses = (state: "default" | "hover" | "active" | "disabled") => {
    const base =
      "px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]";

    if (type === "cta") {
      if (state === "disabled")
        return `${base} bg-[var(--color-interactive-cta-disabled)] text-[var(--color-interactive-cta-text)] opacity-50 cursor-not-allowed`;
      return `${base} bg-[var(--color-interactive-cta-${state})] text-[var(--color-interactive-cta-text)]`;
    }
    if (type === "secondary") {
      if (state === "disabled")
        return `${base} bg-[var(--color-interactive-secondary-disabled)] text-[var(--color-interactive-secondary-text)] border border-[var(--color-border-subtle)] opacity-50 cursor-not-allowed`;
      return `${base} bg-[var(--color-interactive-secondary-${state})] text-[var(--color-interactive-secondary-text)] border border-[var(--color-border-default)]`;
    }
    if (type === "tertiary") {
      if (state === "disabled")
        return `${base} bg-[var(--color-interactive-tertiary-disabled)] text-[var(--color-interactive-tertiary-text)] opacity-50 cursor-not-allowed`;
      return `${base} bg-[var(--color-interactive-tertiary-${state})] text-[var(--color-interactive-tertiary-text)]`;
    }
    if (type === "destructive") {
      if (state === "disabled")
        return `${base} bg-[var(--color-interactive-destructive-disabled)] text-[var(--color-interactive-destructive-text)] opacity-50 cursor-not-allowed`;
      return `${base} bg-[var(--color-interactive-destructive-${state})] text-[var(--color-interactive-destructive-text)]`;
    }
    return base;
  };

  return (
    <div>
      <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-medium)] mb-3 text-[var(--color-text-secondary)]">
        {title}
      </h3>
      <div className="flex flex-wrap gap-3">
        <button className={getClasses("default")}>Default</button>
        <button className={getClasses("hover")}>Hover</button>
        <button className={getClasses("active")}>Active</button>
        <button className={getClasses("disabled")} disabled>
          Disabled
        </button>
      </div>
    </div>
  );
}

type BadgeProps = {
  type: "default" | "success" | "warning" | "error" | "info";
  label: string;
};

function Badge({ type, label }: BadgeProps) {
  const getClasses = () => {
    const base =
      "inline-flex items-center px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-[var(--radius-full)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)]";

    if (type === "default") {
      return `${base} bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-[var(--color-text-primary)]`;
    }
    return `${base} bg-[var(--color-status-${type}-bg)] border border-[var(--color-status-${type}-border)] text-[var(--color-status-${type}-text)]`;
  };

  return <span className={getClasses()}>{label}</span>;
}

type AlertProps = {
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
};

function Alert({ type, title, message }: AlertProps) {
  const icons = {
    success: CheckCircle2Icon,
    warning: AlertTriangleIcon,
    error: AlertCircleIcon,
    info: InfoIcon,
  };

  const Icon = icons[type];

  return (
    <div
      className="flex gap-3 p-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border"
      style={{
        backgroundColor: `var(--color-status-${type}-bg)`,
        borderColor: `var(--color-status-${type}-border)`,
      }}
    >
      <Icon
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        style={{ color: `var(--color-status-${type}-text)` }}
      />

      <div>
        <h4 className="font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-1">
          {title}
        </h4>
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          {message}
        </p>
      </div>
    </div>
  );
}

type SpacingDemoProps = {
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
};

function SpacingDemo({ size }: SpacingDemoProps) {
  // Handle 2xl separately since CSS variable syntax doesn't support it directly
  const spacingVar =
    size === "2xl" ? "--spacing-gap-2xl" : `--spacing-component-${size}`;
  const displayName =
    size === "2xl" ? "spacing-gap-2xl" : `spacing-component-${size}`;

  return (
    <div className="flex items-center gap-4">
      <div
        className="bg-[var(--color-interactive-cta-default)] rounded-[var(--radius-sm)]"
        style={{
          width: `var(${spacingVar})`,
          height: "24px",
        }}
      />

      <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] font-mono">
        {displayName}
      </p>
    </div>
  );
}
