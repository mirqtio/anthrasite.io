/**
 * White Background Demo Component
 * Tests all UI elements on white backgrounds to ensure proper contrast
 */

import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

export function WhiteBackgroundDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
          White Background Compatibility Test
        </h3>
        <p className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)] mb-6">
          All components tested on white background (#FFFFFF) to ensure proper
          contrast and readability when transitioning from dark canvas.
        </p>
      </div>

      {/* White Background Container */}
      <div className="bg-white rounded-[var(--radius-xl)] p-8 space-y-8 border-4 border-[var(--color-border-strong)]">
        <div className="text-center mb-6">
          <div className="inline-block bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] px-4 py-2 rounded-[var(--radius-md)] text-[var(--font-size-sm)] font-[var(--font-weight-semibold)]">
            ⬇️ WHITE BACKGROUND ZONE (#FFFFFF) ⬇️
          </div>
        </div>

        {/* Buttons on White */}
        <div>
          <h4 className="text-[18px] font-semibold mb-4 text-gray-900">
            Buttons on White
          </h4>
          <div className="flex flex-wrap gap-3">
            <button className="bg-[var(--color-interactive-cta-default)] hover:bg-[var(--color-interactive-cta-hover)] text-[var(--color-interactive-cta-text)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)] shadow-md">
              Primary CTA
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] border border-gray-300 font-[var(--font-weight-medium)]">
              Secondary
            </button>
            <button className="bg-transparent hover:bg-gray-100 text-gray-700 px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]">
              Tertiary
            </button>
          </div>
        </div>

        {/* Text Hierarchy on White */}
        <div>
          <h4 className="text-[18px] font-semibold mb-4 text-gray-900">
            Text Hierarchy on White
          </h4>
          <div className="space-y-2">
            <p className="text-[20px] font-bold text-gray-900">
              Primary Text (Heading)
            </p>
            <p className="text-[16px] text-gray-900">
              Body text with normal weight for readability
            </p>
            <p className="text-[14px] text-gray-600">
              Secondary text for supporting information
            </p>
            <p className="text-[14px] text-gray-500">
              Tertiary/muted text for less important details
            </p>
          </div>
        </div>

        {/* Status Colors on White */}
        <div>
          <h4 className="text-[18px] font-semibold mb-4 text-gray-900">
            Status Colors on White
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[var(--radius-md)] border border-gray-200">
              <span className="text-gray-700">Customer Satisfaction</span>
              <span
                className="text-[24px] font-bold"
                style={{ color: "var(--color-status-success-text)" }}
              >
                94%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[var(--radius-md)] border border-gray-200">
              <span className="text-gray-700">Response Time</span>
              <span
                className="text-[24px] font-bold"
                style={{ color: "var(--color-status-warning-text)" }}
              >
                2.3s
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[var(--radius-md)] border border-gray-200">
              <span className="text-gray-700">Error Rate</span>
              <span
                className="text-[24px] font-bold"
                style={{ color: "var(--color-status-error-text)" }}
              >
                8.2%
              </span>
            </div>
          </div>
        </div>

        {/* Badges on White */}
        <div>
          <h4 className="text-[18px] font-semibold mb-4 text-gray-900">
            Badges on White
          </h4>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 border border-gray-300 text-gray-900 text-[14px] font-medium">
              Default
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-medium"
              style={{
                backgroundColor: "var(--color-status-success-bg)",
                borderColor: "var(--color-status-success-border)",
                color: "var(--color-status-success-text)",
                border: "1px solid",
              }}
            >
              Success
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-medium"
              style={{
                backgroundColor: "var(--color-status-warning-bg)",
                borderColor: "var(--color-status-warning-border)",
                color: "var(--color-status-warning-text)",
                border: "1px solid",
              }}
            >
              Warning
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-medium"
              style={{
                backgroundColor: "var(--color-status-error-bg)",
                borderColor: "var(--color-status-error-border)",
                color: "var(--color-status-error-text)",
                border: "1px solid",
              }}
            >
              Error
            </span>
          </div>
        </div>

        {/* Cards on White */}
        <div>
          <h4 className="text-[18px] font-semibold mb-4 text-gray-900">
            Cards on White
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-[var(--radius-lg)] p-4 shadow-sm">
              <h5 className="text-[16px] font-semibold text-gray-900 mb-2">
                Card Title
              </h5>
              <p className="text-[14px] text-gray-600">
                Card content with proper contrast on white background.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-[var(--radius-lg)] p-4 shadow-md hover:shadow-lg transition-shadow">
              <h5 className="text-[16px] font-semibold text-gray-900 mb-2">
                Elevated Card
              </h5>
              <p className="text-[14px] text-gray-600">
                Card with stronger border and shadow for emphasis.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts on White */}
        <div>
          <h4 className="text-[18px] font-semibold mb-4 text-gray-900">
            Alerts on White
          </h4>
          <div className="space-y-3">
            <div
              className="flex gap-3 p-4 rounded-[var(--radius-lg)] border"
              style={{
                backgroundColor: "var(--color-status-success-bg)",
                borderColor: "var(--color-status-success-border)",
              }}
            >
              <CheckCircle2Icon
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "var(--color-status-success-text)" }}
              />

              <div>
                <h5 className="font-semibold text-gray-900 mb-1">
                  Success Alert
                </h5>
                <p className="text-[14px] text-gray-700">
                  Your action was completed successfully.
                </p>
              </div>
            </div>

            <div
              className="flex gap-3 p-4 rounded-[var(--radius-lg)] border"
              style={{
                backgroundColor: "var(--color-status-error-bg)",
                borderColor: "var(--color-status-error-border)",
              }}
            >
              <AlertCircleIcon
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "var(--color-status-error-text)" }}
              />

              <div>
                <h5 className="font-semibold text-gray-900 mb-1">
                  Error Alert
                </h5>
                <p className="text-[14px] text-gray-700">
                  An error occurred. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Inputs on White */}
        <div>
          <h4 className="text-[18px] font-semibold mb-4 text-gray-900">
            Form Inputs on White
          </h4>
          <div className="space-y-3 max-w-md">
            <input
              type="text"
              placeholder="Text input on white"
              className="w-full bg-white border-2 border-gray-300 focus:border-blue-500 rounded-[var(--radius-md)] px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />

            <textarea
              placeholder="Textarea on white"
              rows={3}
              className="w-full bg-white border-2 border-gray-300 focus:border-blue-500 rounded-[var(--radius-md)] px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
          </div>
        </div>

        {/* Design Notes */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-[var(--radius-lg)] p-6">
          <h4 className="text-[16px] font-semibold text-blue-900 mb-3">
            ✓ White Background Design Notes
          </h4>
          <ul className="space-y-2 text-[14px] text-blue-800">
            <li>
              • <strong>Primary CTA</strong> maintains blue (#0066FF) with good
              contrast
            </li>
            <li>
              • <strong>Text hierarchy</strong> uses gray-900/600/500 for proper
              contrast
            </li>
            <li>
              • <strong>Status colors</strong> (green/amber/red) work well on
              white
            </li>
            <li>
              • <strong>Cards</strong> use gray-50 backgrounds with gray-200
              borders
            </li>
            <li>
              • <strong>Inputs</strong> use gray-300 borders, blue focus states
            </li>
            <li>
              • <strong>Shadows</strong> are more subtle on white backgrounds
            </li>
          </ul>
        </div>
      </div>

      {/* Transition Example */}
      <div>
        <h4 className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] mb-4 text-[var(--color-text-primary)]">
          Dark-to-White Transition Pattern
        </h4>
        <p className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)] mb-4">
          Common pattern: Start with dark hero section, transition to white
          content sections.
        </p>

        <div className="space-y-0 rounded-[var(--radius-xl)] overflow-hidden border-2 border-[var(--color-border-strong)]">
          {/* Dark Section */}
          <div className="bg-[var(--color-bg-canvas)] p-12 text-center">
            <h2 className="text-[var(--font-size-4xl)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)] mb-4">
              Dark Hero Section
            </h2>
            <p className="text-[var(--font-size-lg)] text-[var(--color-text-secondary)] mb-6">
              Lead with carbon black background for impact
            </p>
            <button className="bg-[var(--color-interactive-cta-default)] hover:bg-[var(--color-interactive-cta-hover)] text-[var(--color-interactive-cta-text)] px-6 py-3 rounded-[var(--radius-lg)] font-[var(--font-weight-medium)]">
              Get Started
            </button>
          </div>

          {/* White Section */}
          <div className="bg-white p-12">
            <h3 className="text-[28px] font-bold text-gray-900 mb-4">
              White Content Section
            </h3>
            <p className="text-[16px] text-gray-600 mb-6 max-w-2xl">
              Transition to white background for detailed content, maintaining
              readability and visual hierarchy with proper gray tones.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div
                  className="text-[32px] font-bold mb-2"
                  style={{ color: "var(--color-status-success-text)" }}
                >
                  94%
                </div>
                <div className="text-[14px] text-gray-600">Success Rate</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div
                  className="text-[32px] font-bold mb-2"
                  style={{ color: "var(--color-status-warning-text)" }}
                >
                  2.3s
                </div>
                <div className="text-[14px] text-gray-600">Avg Response</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div
                  className="text-[32px] font-bold mb-2"
                  style={{ color: "var(--color-status-info-text)" }}
                >
                  500+
                </div>
                <div className="text-[14px] text-gray-600">Customers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
