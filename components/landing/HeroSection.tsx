"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Shield } from "lucide-react";

interface HeroSectionProps {
  company: string;
  domainUrl: string;
  score: number;
  issueCount: number;
  desktopScreenshotUrl: string;
  mobileScreenshotUrl: string;
}

/**
 * Get score color based on value
 * Good: 80+ (green), Moderate: 60-79 (amber), Poor: <60 (red)
 */
function getScoreColor(score: number): string {
  if (score >= 80) return "var(--color-status-success)";
  if (score >= 60) return "var(--color-status-warning)";
  return "var(--color-status-error)";
}

/**
 * Get score interpretation text
 */
function getScoreInterpretation(score: number): string {
  if (score >= 80) return "Strong foundation";
  if (score >= 60) return "Room for improvement";
  return "Needs attention";
}

export function HeroSection({
  company,
  domainUrl,
  score,
  issueCount,
  desktopScreenshotUrl,
  mobileScreenshotUrl,
}: HeroSectionProps) {
  const [desktopLoaded, setDesktopLoaded] = useState(false);
  const [mobileLoaded, setMobileLoaded] = useState(false);
  const [desktopError, setDesktopError] = useState(false);
  const [mobileError, setMobileError] = useState(false);

  // Pluralize "issue" correctly
  const issueText = issueCount === 1 ? "issue" : "issues";

  return (
    <div className="flex flex-col items-center gap-[var(--spacing-gap-lg)]">
      {/* Logo - not clickable per spec */}
      <Logo size="medium" darkMode />

      {/* Trust Badge */}
      <div className="inline-flex items-center gap-[var(--spacing-gap-xs)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-full">
        <Shield
          className="w-4 h-4 text-[var(--color-status-success)]"
          aria-hidden="true"
        />
        <span className="text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] text-[var(--color-text-secondary)]">
          Secure Analysis
        </span>
      </div>

      {/* Screenshot Display */}
      <div className="w-full flex gap-[var(--spacing-gap-md)] justify-center items-end">
        {/* Desktop Screenshot */}
        <div
          className="flex-1 max-w-[460px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] shadow-[var(--shadow-lg)] overflow-hidden bg-[var(--color-bg-surface)]"
          style={{ aspectRatio: "16 / 10" }}
        >
          {!desktopError && (
            <img
              src={desktopScreenshotUrl}
              alt={`Screenshot of ${company} website on desktop`}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                desktopLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setDesktopLoaded(true)}
              onError={() => {
                console.error(
                  `[HeroSection] Desktop screenshot failed to load: ${desktopScreenshotUrl}`
                );
                setDesktopError(true);
              }}
            />
          )}
        </div>

        {/* Mobile Screenshot */}
        <div
          className="w-[100px] sm:w-[120px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] shadow-[var(--shadow-lg)] overflow-hidden bg-[var(--color-bg-surface)]"
          style={{ aspectRatio: "9 / 19" }}
        >
          {!mobileError && (
            <img
              src={mobileScreenshotUrl}
              alt={`Screenshot of ${company} website on mobile`}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                mobileLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setMobileLoaded(true)}
              onError={() => {
                console.error(
                  `[HeroSection] Mobile screenshot failed to load: ${mobileScreenshotUrl}`
                );
                setMobileError(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Company Name */}
      <h1
        id="hero-heading"
        className="text-[var(--color-text-primary)] text-[length:var(--font-size-3xl)] sm:text-[length:var(--font-size-4xl)] font-[var(--font-weight-bold)] text-center leading-[var(--leading-tight)] max-w-full"
        style={{
          // Scale down if name is very long
          fontSize:
            company.length > 20
              ? "clamp(1.5rem, 4vw, var(--font-size-3xl))"
              : undefined,
        }}
      >
        {company}
      </h1>

      {/* Score Display */}
      <div className="flex flex-col items-center gap-[var(--spacing-gap-xs)]">
        <div className="flex items-baseline gap-[var(--spacing-gap-xs)]">
          <span
            className="text-[length:var(--font-size-4xl)] font-[var(--font-weight-bold)]"
            style={{ color: getScoreColor(score) }}
            aria-label={`Score: ${score} out of 100`}
          >
            {score}
          </span>
          <span className="text-[var(--color-text-muted)] text-[length:var(--font-size-lg)]">
            /100
          </span>
        </div>
        <span className="text-[var(--color-text-secondary)] text-[length:var(--font-size-sm)]">
          {getScoreInterpretation(score)}
        </span>
      </div>

      {/* Issue Count */}
      <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)]">
        <span className="font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]">
          {issueCount}
        </span>{" "}
        {issueText} identified
      </p>
    </div>
  );
}
