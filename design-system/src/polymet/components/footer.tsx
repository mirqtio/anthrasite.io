import React from "react";
import { Link } from "react-router-dom";
import {
  TwitterIcon,
  LinkedinIcon,
  GithubIcon,
  FacebookIcon,
} from "lucide-react";

export type FooterProps = {
  footerLinks: Array<{
    label: string;
    url: string;
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  "data-pol-id"?: string;
};

const SOCIAL_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  twitter: TwitterIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  facebook: FacebookIcon,
};

export function Footer({
  footerLinks,
  socialLinks,
  "data-pol-id": dataPolId,
}: FooterProps) {
  if (process.env.NODE_ENV === "development") {
    if (!footerLinks || footerLinks.length === 0) {
      console.error(
        "Footer: footerLinks array is required and cannot be empty"
      );
    }
  }

  return (
    <footer className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
      <div className="max-w-7xl mx-auto px-[var(--spacing-component-lg)] py-[var(--spacing-section-sm)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-[var(--spacing-gap-lg)]">
          {/* Footer Links */}
          <nav className="flex flex-wrap items-center justify-center gap-[var(--spacing-gap-md)]">
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                to={link.url}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-[length:var(--font-size-sm)] font-[var(--font-weight-regular)] transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-surface)] rounded-[var(--radius-sm)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex items-center gap-[var(--spacing-gap-sm)]">
              {socialLinks.map((social, index) => {
                const Icon = SOCIAL_ICONS[social.platform.toLowerCase()];
                if (!Icon) return null;

                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-[36px] h-[36px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] rounded-[var(--radius-md)] transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-surface)]"
                    aria-label={social.platform}
                  >
                    <Icon className="w-[20px] h-[20px]" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="mt-[var(--spacing-component-lg)] pt-[var(--spacing-component-md)] border-t border-[var(--color-border-subtle)]">
          <p className="text-[var(--color-text-tertiary)] text-[length:var(--font-size-xs)] font-[var(--font-weight-regular)] text-center">
            © {new Date().getFullYear()} Anthrasite. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
