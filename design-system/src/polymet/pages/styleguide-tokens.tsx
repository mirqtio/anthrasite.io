/**
 * Anthrasite Token Style Guide
 * Phase 5A: Complete visual reference for all tokenized UI states
 *
 * This page demonstrates every token in action with all interactive states
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
  AlertTriangleIcon,
  XIcon,
  LoaderIcon,
} from "lucide-react";
import {
  ContextHeader,
  AssessmentSummary,
  FindingsList,
  CTABlock,
  CredibilityAnchor,
  SecondaryButton,
  ProblemHeader,
  ValueProposition,
  SampleAssessmentPreview,
  MethodologySection,
  TrustSection,
  Footer,
} from "@/polymet/components/index";
import { Link } from "react-router-dom";
import { StatusTextDemo } from "@/polymet/components/status-text-demo";
import { WhiteBackgroundDemo } from "@/polymet/components/white-background-demo";

export function StyleguideTokensPage() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-bold)] mb-2">
            Anthrasite Token Style Guide
          </h1>
          <p className="text-[var(--color-text-secondary)] text-[var(--font-size-base)]">
            Complete visual reference for all tokenized UI states
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-16">
        {/* ========== BUTTONS ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            Buttons
          </h2>

          {/* Primary CTA Button */}
          <div className="mb-8">
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
              Primary CTA Button
            </h3>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[var(--color-interactive-cta-default)] hover:bg-[var(--color-interactive-cta-hover)] active:bg-[var(--color-interactive-cta-active)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] shadow-[var(--shadow-cta)] hover:shadow-[var(--shadow-cta-hover)] transition-[var(--duration-normal)] font-[var(--font-weight-medium)]">
                Default
              </button>
              <button className="bg-[var(--color-interactive-cta-hover)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] shadow-[var(--shadow-cta-hover)] font-[var(--font-weight-medium)]">
                Hover
              </button>
              <button className="bg-[var(--color-interactive-cta-active)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]">
                Active
              </button>
              <button className="bg-[var(--color-interactive-cta-default)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] ring-2 ring-[var(--color-focus-ring)] ring-offset-2 ring-offset-[var(--color-focus-ring-offset)] font-[var(--font-weight-medium)]">
                Focus
              </button>
              <button
                disabled
                className="bg-[var(--color-interactive-cta-disabled)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] opacity-50 cursor-not-allowed font-[var(--font-weight-medium)]"
              >
                Disabled
              </button>
              <button className="bg-[var(--color-interactive-cta-default)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] flex items-center gap-2 font-[var(--font-weight-medium)]">
                <LoaderIcon className="w-4 h-4 animate-spin" />
                Loading
              </button>
            </div>
          </div>

          {/* Secondary Button */}
          <div className="mb-8">
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
              Secondary Button
            </h3>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[var(--color-interactive-secondary-default)] hover:bg-[var(--color-interactive-secondary-hover)] active:bg-[var(--color-interactive-secondary-active)] text-[var(--color-interactive-secondary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] transition-[var(--duration-normal)] font-[var(--font-weight-medium)]">
                Default
              </button>
              <button className="bg-[var(--color-interactive-secondary-hover)] text-[var(--color-interactive-secondary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] font-[var(--font-weight-medium)]">
                Hover
              </button>
              <button className="bg-[var(--color-interactive-secondary-active)] text-[var(--color-interactive-secondary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] font-[var(--font-weight-medium)]">
                Active
              </button>
              <button className="bg-[var(--color-interactive-secondary-default)] text-[var(--color-interactive-secondary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] ring-2 ring-[var(--color-focus-ring)] ring-offset-2 ring-offset-[var(--color-focus-ring-offset)] font-[var(--font-weight-medium)]">
                Focus
              </button>
              <button
                disabled
                className="bg-[var(--color-interactive-secondary-disabled)] text-[var(--color-interactive-secondary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] opacity-50 cursor-not-allowed font-[var(--font-weight-medium)]"
              >
                Disabled
              </button>
            </div>
          </div>

          {/* Tertiary/Ghost Button */}
          <div className="mb-8">
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
              Tertiary/Ghost Button
            </h3>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[var(--color-interactive-tertiary-default)] hover:bg-[var(--color-interactive-tertiary-hover)] active:bg-[var(--color-interactive-tertiary-active)] text-[var(--color-interactive-tertiary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] transition-[var(--duration-normal)] font-[var(--font-weight-medium)]">
                Default
              </button>
              <button className="bg-[var(--color-interactive-tertiary-hover)] text-[var(--color-interactive-tertiary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]">
                Hover
              </button>
              <button className="bg-[var(--color-interactive-tertiary-active)] text-[var(--color-interactive-tertiary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]">
                Active
              </button>
              <button className="bg-[var(--color-interactive-tertiary-default)] text-[var(--color-interactive-tertiary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] ring-2 ring-[var(--color-focus-ring)] ring-offset-2 ring-offset-[var(--color-focus-ring-offset)] font-[var(--font-weight-medium)]">
                Focus
              </button>
              <button
                disabled
                className="bg-[var(--color-interactive-tertiary-disabled)] text-[var(--color-interactive-tertiary-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] opacity-50 cursor-not-allowed font-[var(--font-weight-medium)]"
              >
                Disabled
              </button>
            </div>
          </div>

          {/* Destructive Button */}
          <div>
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
              Destructive Button
            </h3>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[var(--color-interactive-destructive-default)] hover:bg-[var(--color-interactive-destructive-hover)] active:bg-[var(--color-interactive-destructive-active)] text-[var(--color-interactive-destructive-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] transition-[var(--duration-normal)] font-[var(--font-weight-medium)]">
                Default
              </button>
              <button className="bg-[var(--color-interactive-destructive-hover)] text-[var(--color-interactive-destructive-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]">
                Hover
              </button>
              <button className="bg-[var(--color-interactive-destructive-active)] text-[var(--color-interactive-destructive-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]">
                Active
              </button>
              <button
                disabled
                className="bg-[var(--color-interactive-destructive-disabled)] text-[var(--color-interactive-destructive-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] opacity-50 cursor-not-allowed font-[var(--font-weight-medium)]"
              >
                Disabled
              </button>
            </div>
          </div>
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== INPUTS ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            Form Inputs
          </h2>

          {/* Text Input */}
          <div className="mb-8 space-y-4">
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
              Text Input
            </h3>
            <input
              type="text"
              placeholder="Default state"
              className="w-full max-w-md bg-[var(--color-interactive-input-default)] hover:bg-[var(--color-interactive-input-hover)] focus:bg-[var(--color-interactive-input-focus)] border border-[var(--color-border-default)] focus:border-[var(--color-border-focus)] rounded-[var(--radius-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-[var(--color-text-primary)] transition-[var(--duration-normal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-focus-ring-offset)]"
            />

            <input
              type="text"
              placeholder="Disabled state"
              disabled
              className="w-full max-w-md bg-[var(--color-interactive-input-disabled)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-[var(--color-text-disabled)] cursor-not-allowed"
            />

            <input
              type="text"
              placeholder="Error state"
              className="w-full max-w-md bg-[var(--color-interactive-input-error)] border border-[var(--color-status-error-border)] rounded-[var(--radius-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-status-error-trim)] focus:ring-offset-2 focus:ring-offset-[var(--color-focus-ring-offset)]"
            />
          </div>

          {/* Textarea */}
          <div className="mb-8">
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
              Textarea
            </h3>
            <textarea
              placeholder="Enter your message..."
              rows={4}
              className="w-full max-w-md bg-[var(--color-interactive-input-default)] hover:bg-[var(--color-interactive-input-hover)] focus:bg-[var(--color-interactive-input-focus)] border border-[var(--color-border-default)] focus:border-[var(--color-border-focus)] rounded-[var(--radius-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-[var(--color-text-primary)] transition-[var(--duration-normal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-focus-ring-offset)]"
            />
          </div>

          {/* Select */}
          <div className="mb-8">
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
              Select Dropdown
            </h3>
            <select
              className="w-full max-w-md bg-[var(--color-interactive-input-default)] hover:bg-[var(--color-interactive-input-hover)] focus:bg-[var(--color-interactive-input-focus)] border border-[var(--color-border-default)] focus:border-[var(--color-border-focus)] rounded-[var(--radius-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-[var(--color-text-primary)] transition-[var(--duration-normal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-focus-ring-offset)] appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "40px",
              }}
            >
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>

          {/* Checkbox */}
          <div className="mb-8">
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
              Checkbox
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 bg-[var(--color-interactive-input-default)] border-2 border-[var(--color-border-default)] rounded-[var(--radius-sm)] checked:bg-[var(--color-interactive-cta-default)] checked:border-[var(--color-interactive-cta-default)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-focus-ring-offset)] transition-[var(--duration-normal)] appearance-none cursor-pointer relative"
                  style={{
                    backgroundImage: "none",
                  }}
                />

                <span className="text-[var(--color-text-primary)]">
                  Default checkbox
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="w-5 h-5 bg-[var(--color-interactive-cta-default)] border-2 border-[var(--color-interactive-cta-default)] rounded-[var(--radius-sm)] appearance-none cursor-pointer"
                  />

                  <svg
                    className="absolute inset-0 w-5 h-5 pointer-events-none"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 10L9 13L14 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <span className="text-[var(--color-text-primary)]">
                  Checked checkbox
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
                <input
                  type="checkbox"
                  disabled
                  className="w-5 h-5 bg-[var(--color-interactive-input-disabled)] border-2 border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] appearance-none"
                />

                <span className="text-[var(--color-text-disabled)]">
                  Disabled checkbox
                </span>
              </label>
            </div>
          </div>

          {/* Toggle/Switch */}
          <div>
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
              Toggle Switch
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative w-11 h-6 bg-[var(--color-interactive-secondary-default)] rounded-[var(--radius-full)] transition-[var(--duration-normal)]">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-[var(--color-text-primary)] rounded-[var(--radius-full)] transition-transform" />
                </div>
                <span className="text-[var(--color-text-primary)]">Off</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative w-11 h-6 bg-[var(--color-interactive-cta-default)] rounded-[var(--radius-full)]">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-[var(--color-text-primary)] rounded-[var(--radius-full)]" />
                </div>
                <span className="text-[var(--color-text-primary)]">On</span>
              </label>
              <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
                <div className="relative w-11 h-6 bg-[var(--color-interactive-secondary-disabled)] rounded-[var(--radius-full)]">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-[var(--color-text-disabled)] rounded-[var(--radius-full)]" />
                </div>
                <span className="text-[var(--color-text-disabled)]">
                  Disabled
                </span>
              </label>
            </div>
          </div>
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== LINKS ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            Links
          </h2>
          <div className="space-y-4">
            <div>
              <a
                href="#"
                className="text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] underline transition-[var(--duration-normal)]"
                style={{ color: "var(--color-text-link)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-link-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-link)")
                }
              >
                Default link (hover to see color change)
              </a>
            </div>
            <div>
              <a
                href="#"
                className="text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] underline"
                style={{ color: "var(--color-text-link-hover)" }}
              >
                Hover state (permanent)
              </a>
            </div>
            <div>
              <a
                href="#"
                className="text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] underline ring-2 ring-offset-2 rounded-[var(--radius-sm)] px-1 inline-block"
                style={{
                  color: "var(--color-text-link)",
                  ringColor: "var(--color-focus-ring)",
                  ringOffsetColor: "var(--color-focus-ring-offset)",
                }}
              >
                Focus state (with ring)
              </a>
            </div>
          </div>
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== BADGES ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-[var(--radius-full)] bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)]">
              Default
            </span>
            <span className="inline-flex items-center px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-[var(--radius-full)] bg-[var(--color-status-success-bg)] border border-[var(--color-status-success-border)] text-[var(--color-status-success-text)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)]">
              Success
            </span>
            <span className="inline-flex items-center px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-[var(--radius-full)] bg-[var(--color-status-warning-bg)] border border-[var(--color-status-warning-border)] text-[var(--color-status-warning-text)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)]">
              Warning
            </span>
            <span className="inline-flex items-center px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-[var(--radius-full)] bg-[var(--color-status-error-bg)] border border-[var(--color-status-error-border)] text-[var(--color-status-error-text)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)]">
              Error
            </span>
            <span className="inline-flex items-center px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-[var(--radius-full)] bg-[var(--color-status-info-bg)] border border-[var(--color-status-info-border)] text-[var(--color-status-info-text)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)]">
              Info
            </span>
          </div>
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== STATUS TEXT ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            Status Text Colors
          </h2>
          <StatusTextDemo />
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== ALERTS ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            Alerts
          </h2>
          <div className="space-y-4 max-w-2xl">
            <div className="flex gap-3 p-[var(--spacing-component-md)] bg-[var(--color-status-info-bg)] border border-[var(--color-status-info-border)] rounded-[var(--radius-lg)]">
              <InfoIcon className="w-5 h-5 text-[var(--color-status-info-text)] flex-shrink-0 mt-0.5" />

              <div>
                <h4 className="font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-1">
                  Info Alert
                </h4>
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                  This is an informational message to help guide users.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-[var(--spacing-component-md)] bg-[var(--color-status-success-bg)] border border-[var(--color-status-success-border)] rounded-[var(--radius-lg)]">
              <CheckCircle2Icon className="w-5 h-5 text-[var(--color-status-success-text)] flex-shrink-0 mt-0.5" />

              <div>
                <h4 className="font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-1">
                  Success Alert
                </h4>
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                  Your action was completed successfully.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-[var(--spacing-component-md)] bg-[var(--color-status-warning-bg)] border border-[var(--color-status-warning-border)] rounded-[var(--radius-lg)]">
              <AlertTriangleIcon className="w-5 h-5 text-[var(--color-status-warning-text)] flex-shrink-0 mt-0.5" />

              <div>
                <h4 className="font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-1">
                  Warning Alert
                </h4>
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                  Please review this information carefully before proceeding.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-[var(--spacing-component-md)] bg-[var(--color-status-error-bg)] border border-[var(--color-status-error-border)] rounded-[var(--radius-lg)]">
              <AlertCircleIcon className="w-5 h-5 text-[var(--color-status-error-text)] flex-shrink-0 mt-0.5" />

              <div>
                <h4 className="font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-1">
                  Error Alert
                </h4>
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                  An error occurred. Please try again or contact support.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== TOASTS ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            Toasts
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => setShowToast(!showToast)}
              className="bg-[var(--color-interactive-cta-default)] hover:bg-[var(--color-interactive-cta-hover)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]"
            >
              {showToast ? "Hide" : "Show"} Toast Examples
            </button>

            {showToast && (
              <div className="space-y-3 max-w-md">
                <div className="flex items-center justify-between gap-3 p-[var(--spacing-component-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]">
                  <div className="flex items-center gap-3">
                    <CheckCircle2Icon className="w-5 h-5 text-[var(--color-status-success-text)] flex-shrink-0" />

                    <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]">
                      Changes saved successfully
                    </p>
                  </div>
                  <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 p-[var(--spacing-component-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]">
                  <div className="flex items-center gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-[var(--color-status-error-text)] flex-shrink-0" />

                    <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]">
                      Failed to save changes
                    </p>
                  </div>
                  <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== CARDS ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            Cards
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)] shadow-[var(--shadow-md)]">
              <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-2">
                Default Card
              </h3>
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                Basic card with surface background and default border.
              </p>
            </div>

            <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)] shadow-[var(--shadow-lg)]">
              <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-2">
                Elevated Card
              </h3>
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                Elevated card with stronger shadow for emphasis.
              </p>
            </div>

            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-strong)] transition-[var(--duration-normal)] cursor-pointer">
              <h3 className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-2">
                Interactive Card
              </h3>
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                Card with hover state for clickable content.
              </p>
            </div>
          </div>
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

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
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-[var(--color-bg-scrim)]"
                onClick={() => setShowModal(false)}
              />

              {/* Modal Content */}
              <div className="relative bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-[var(--spacing-component-xl)] shadow-[var(--shadow-2xl)] max-w-md w-full">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-[var(--font-size-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]">
                    Modal Title
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-[var(--duration-normal)]"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[var(--font-size-base)] text-[var(--color-text-secondary)] mb-6">
                  This is a modal dialog with backdrop overlay. It uses elevated
                  background and strong shadow for prominence.
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

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== SKELETONS ========== */}
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

            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--color-skeleton-base)] rounded-[var(--radius-full)] animate-pulse" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-[var(--color-skeleton-base)] rounded-[var(--radius-md)] animate-pulse" />

                  <div className="h-3 w-1/2 bg-[var(--color-skeleton-base)] rounded-[var(--radius-md)] animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-[var(--color-skeleton-base)] rounded-[var(--radius-md)] animate-pulse" />

                <div className="h-3 w-4/5 bg-[var(--color-skeleton-base)] rounded-[var(--radius-md)] animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== WHITE BACKGROUND TEST ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            White Background Compatibility
          </h2>
          <WhiteBackgroundDemo />
        </section>

        <Separator className="bg-[var(--color-border-default)]" />

        {/* ========== PHASE 2 COMPONENTS ========== */}
        <section>
          <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] mb-6">
            Phase 2 Components
          </h2>
          <p className="text-[var(--color-text-secondary)] text-[var(--font-size-base)] mb-8">
            Production-ready components implementing Phase 2 contracts with
            token-based styling
          </p>

          <div className="space-y-12">
            {/* ContextHeader */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                ContextHeader
              </h3>
              <div className="space-y-4">
                <ContextHeader
                  businessName="Acme Corporation"
                  assessmentDate="December 15, 2024"
                />

                <ContextHeader businessName="TechStart Industries" />
              </div>
            </div>

            {/* AssessmentSummary */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                AssessmentSummary
              </h3>
              <div className="space-y-4">
                <AssessmentSummary
                  businessName="Acme Corporation"
                  score={78}
                  impactRange="$2.4M–$3.8M potential impact"
                  interpretation="Your business shows strong fundamentals with significant growth opportunities."
                  data_source="real"
                />

                <AssessmentSummary
                  businessName="Sample Business"
                  score="B+"
                  interpretation="This sample demonstrates our analysis format."
                  data_source="sample"
                />
              </div>
            </div>

            {/* FindingsList */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                FindingsList
              </h3>
              <FindingsList
                findings={[
                  {
                    title: "Strong Customer Retention",
                    description:
                      "Your customer retention rate of 94% significantly exceeds industry average.",
                    impact: "$1.2M annual recurring revenue protected",
                  },
                  {
                    title: "Operational Efficiency Gap",
                    description:
                      "Process automation opportunities identified in order fulfillment workflows.",
                    impact: "Potential 23% cost reduction",
                  },
                  {
                    title: "Market Positioning Advantage",
                    description:
                      "Your unique value proposition resonates strongly with target demographic.",
                  },
                ]}
                data_source="real"
              />
            </div>

            {/* CTABlock */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                CTABlock
              </h3>
              <CTABlock
                ctaText="Schedule Your Strategy Session"
                ctaUrl="/schedule"
                headline="Ready to unlock your business potential?"
                supportingText="Book a complimentary 30-minute strategy session with our team."
                cta_mode="next_step"
              />
            </div>

            {/* CredibilityAnchor */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                CredibilityAnchor
              </h3>
              <CredibilityAnchor
                aboutText="Anthrasite provides data-driven business assessments trusted by over 500 companies."
                trustSignal="Trusted by Fortune 500 companies"
                showLogo={true}
              />
            </div>

            {/* SecondaryButton */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                SecondaryButton
              </h3>
              <div className="flex gap-4">
                <SecondaryButton ctaText="View Full Report" ctaUrl="/report" />

                <SecondaryButton ctaText="Download PDF" ctaUrl="/download" />
              </div>
            </div>

            {/* ProblemHeader */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                ProblemHeader
              </h3>
              <ProblemHeader
                headline="Are you leaving money on the table?"
                subheadline="Most businesses miss critical opportunities for growth and efficiency."
              />
            </div>

            {/* ValueProposition */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                ValueProposition
              </h3>
              <ValueProposition
                headline="Comprehensive Business Intelligence"
                explanation="Our platform analyzes your business across multiple dimensions to provide actionable insights. We combine industry benchmarks, financial analysis, and operational metrics."
                benefits={[
                  "Real-time dashboard with 50+ key performance indicators",
                  "Industry-specific benchmarking against top performers",
                  "Actionable recommendations prioritized by impact",
                ]}
              />
            </div>

            {/* SampleAssessmentPreview */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                SampleAssessmentPreview
              </h3>
              <SampleAssessmentPreview
                assessmentSummary={{
                  businessName: "Sample Tech Company",
                  score: "B+",
                  interpretation:
                    "This sample demonstrates strong fundamentals with optimization opportunities.",
                  data_source: "sample",
                }}
                findings={{
                  findings: [
                    {
                      title: "Strong Revenue Growth",
                      description:
                        "Consistent quarter-over-quarter revenue growth of 18%.",
                      impact: "Projected $2.1M additional ARR",
                    },
                    {
                      title: "CAC Optimization",
                      description:
                        "Current CAC can be reduced through improved targeting.",
                      impact: "Potential 30% reduction",
                    },
                    {
                      title: "Team Scaling Readiness",
                      description: "Infrastructure supports 2x team growth.",
                    },
                  ],

                  data_source: "sample",
                }}
              />
            </div>

            {/* MethodologySection */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                MethodologySection
              </h3>
              <MethodologySection
                steps={[
                  {
                    stepNumber: 1,
                    title: "Connect Your Data",
                    description:
                      "Securely link your business systems or answer a brief questionnaire.",
                  },
                  {
                    stepNumber: 2,
                    title: "AI-Powered Analysis",
                    description:
                      "Our platform processes 50+ key indicators and identifies opportunities.",
                  },
                  {
                    stepNumber: 3,
                    title: "Get Actionable Insights",
                    description:
                      "Receive a comprehensive report with prioritized recommendations.",
                  },
                ]}
              />
            </div>

            {/* TrustSection */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                TrustSection
              </h3>
              <TrustSection
                trustSignals={[
                  {
                    type: "team",
                    content: {
                      text: "Founded by former McKinsey consultants with 50+ years combined experience.",
                    },
                  },
                  {
                    type: "testimonials",
                    content: {
                      text: '"This assessment identified $2M in cost savings we didn\'t know existed." — Sarah Chen, CFO',
                    },
                  },
                  {
                    type: "logos",
                    content: {
                      text: "Trusted by over 500 companies including Fortune 500 enterprises.",
                    },
                  },
                ]}
              />
            </div>

            {/* Footer */}
            <div>
              <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
                Footer
              </h3>
              <div className="border border-[var(--color-border-default)] rounded-[var(--radius-lg)] overflow-hidden">
                <Footer
                  footerLinks={[
                    { label: "Privacy Policy", url: "/privacy" },
                    { label: "Terms of Service", url: "/terms" },
                    { label: "Contact", url: "/contact" },
                    { label: "About", url: "/about" },
                  ]}
                  socialLinks={[
                    {
                      platform: "twitter",
                      url: "https://twitter.com/anthrasite",
                    },
                    {
                      platform: "linkedin",
                      url: "https://linkedin.com/company/anthrasite",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
