/**
 * Status Text Demo Component
 * Demonstrates semantic colored text for status communication (scores, metrics, etc.)
 */

export function StatusTextDemo() {
  return (
    <div className="space-y-8">
      {/* Semantic Status Text */}
      <div>
        <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
          Semantic Status Text Colors
        </h3>
        <p className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)] mb-6">
          Use these for inline status communication like scores, metrics, or
          status indicators without the visual weight of badges.
        </p>

        <div className="space-y-6">
          {/* Score Examples */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)]">
            <h4 className="text-[var(--color-text-primary)] font-[var(--font-weight-semibold)] mb-4">
              Score Display Examples
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">
                  Customer Satisfaction
                </span>
                <span
                  className="text-[var(--font-size-2xl)] font-[var(--font-weight-bold)]"
                  style={{ color: "var(--color-status-success-text)" }}
                >
                  94%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">
                  Response Time
                </span>
                <span
                  className="text-[var(--font-size-2xl)] font-[var(--font-weight-bold)]"
                  style={{ color: "var(--color-status-warning-text)" }}
                >
                  2.3s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">
                  Error Rate
                </span>
                <span
                  className="text-[var(--font-size-2xl)] font-[var(--font-weight-bold)]"
                  style={{ color: "var(--color-status-error-text)" }}
                >
                  8.2%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">
                  System Status
                </span>
                <span
                  className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)]"
                  style={{ color: "var(--color-status-info-text)" }}
                >
                  Operational
                </span>
              </div>
            </div>
          </div>

          {/* Inline Status Text */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)]">
            <h4 className="text-[var(--color-text-primary)] font-[var(--font-weight-semibold)] mb-4">
              Inline Status Text
            </h4>
            <div className="space-y-3 text-[var(--font-size-base)]">
              <p className="text-[var(--color-text-primary)]">
                Revenue is{" "}
                <span
                  className="font-[var(--font-weight-semibold)]"
                  style={{ color: "var(--color-status-success-text)" }}
                >
                  up 23%
                </span>{" "}
                compared to last quarter.
              </p>
              <p className="text-[var(--color-text-primary)]">
                Server load is{" "}
                <span
                  className="font-[var(--font-weight-semibold)]"
                  style={{ color: "var(--color-status-warning-text)" }}
                >
                  approaching capacity
                </span>{" "}
                at 78%.
              </p>
              <p className="text-[var(--color-text-primary)]">
                Database connection{" "}
                <span
                  className="font-[var(--font-weight-semibold)]"
                  style={{ color: "var(--color-status-error-text)" }}
                >
                  failed
                </span>{" "}
                3 times in the last hour.
              </p>
              <p className="text-[var(--color-text-primary)]">
                New feature{" "}
                <span
                  className="font-[var(--font-weight-semibold)]"
                  style={{ color: "var(--color-status-info-text)" }}
                >
                  now available
                </span>{" "}
                for all users.
              </p>
            </div>
          </div>

          {/* All Status Colors Reference */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)]">
            <h4 className="text-[var(--color-text-primary)] font-[var(--font-weight-semibold)] mb-4">
              Status Color Reference
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div
                  className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-1"
                  style={{ color: "var(--color-status-success-text)" }}
                >
                  Success / Above Target
                </div>
                <code className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                  --color-status-success-text
                </code>
              </div>
              <div>
                <div
                  className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-1"
                  style={{ color: "var(--color-status-warning-text)" }}
                >
                  Warning / In Range
                </div>
                <code className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                  --color-status-warning-text
                </code>
              </div>
              <div>
                <div
                  className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-1"
                  style={{ color: "var(--color-status-error-text)" }}
                >
                  Error / Below Target
                </div>
                <code className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                  --color-status-error-text
                </code>
              </div>
              <div>
                <div
                  className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-1"
                  style={{ color: "var(--color-status-info-text)" }}
                >
                  Info / Neutral
                </div>
                <code className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                  --color-status-info-text
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison: Text vs Badges */}
      <div>
        <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-medium)] mb-4 text-[var(--color-text-secondary)]">
          When to Use: Colored Text vs Badges
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Colored Text */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)]">
            <h4 className="text-[var(--color-text-primary)] font-[var(--font-weight-semibold)] mb-3">
              ✓ Use Colored Text For:
            </h4>
            <ul className="space-y-2 text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
              <li>• Scores and metrics (78%, $2.4M, 94/100)</li>
              <li>• Inline status in sentences</li>
              <li>• Data tables and dashboards</li>
              <li>• Minimal, data-dense interfaces</li>
              <li>• When color is the only indicator needed</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-[var(--color-border-default)]">
              <div className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mb-2">
                Example:
              </div>
              <div className="text-[var(--font-size-lg)]">
                Score:{" "}
                <span
                  className="font-[var(--font-weight-bold)]"
                  style={{ color: "var(--color-status-success-text)" }}
                >
                  92/100
                </span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-[var(--spacing-component-lg)]">
            <h4 className="text-[var(--color-text-primary)] font-[var(--font-weight-semibold)] mb-3">
              ✓ Use Badges For:
            </h4>
            <ul className="space-y-2 text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
              <li>• Status labels (Active, Pending, Failed)</li>
              <li>• Categories and tags</li>
              <li>• When background color adds clarity</li>
              <li>• Lists with multiple status types</li>
              <li>• When you need more visual prominence</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-[var(--color-border-default)]">
              <div className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mb-2">
                Example:
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-[var(--radius-full)] bg-[var(--color-status-success-bg)] border border-[var(--color-status-success-border)] text-[var(--color-status-success-text)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)]">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
