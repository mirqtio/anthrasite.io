/**
 * Landing Page Loading Skeleton
 * Matches the page layout structure with shimmer animation
 */

function SkeletonBox({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-shimmer rounded-[var(--radius-sm)] ${className}`}
      style={{
        background: `linear-gradient(
          90deg,
          var(--color-skeleton-base) 25%,
          var(--color-skeleton-shimmer) 50%,
          var(--color-skeleton-base) 75%
        )`,
        backgroundSize: "200% 100%",
        ...style,
      }}
    />
  );
}

export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)]">
      <div className="max-w-[760px] mx-auto px-[var(--spacing-section-md)] py-[var(--spacing-section-lg)]">
        <div className="space-y-[var(--spacing-section-lg)]">
          {/* Hero Section Skeleton */}
          <div className="flex flex-col items-center gap-[var(--spacing-gap-lg)]">
            {/* Logo */}
            <SkeletonBox className="w-[120px] h-[32px]" />

            {/* Trust badge */}
            <SkeletonBox className="w-[180px] h-[28px] rounded-full" />

            {/* Screenshot containers */}
            <div className="w-full flex gap-[var(--spacing-gap-md)] justify-center">
              {/* Desktop screenshot */}
              <SkeletonBox
                className="flex-1 max-w-[460px]"
                style={{ aspectRatio: "16 / 10" }}
              />
              {/* Mobile screenshot */}
              <SkeletonBox
                className="w-[100px] sm:w-[120px]"
                style={{ aspectRatio: "9 / 19" }}
              />
            </div>

            {/* Company name */}
            <SkeletonBox className="w-[200px] h-[48px]" />

            {/* Score */}
            <SkeletonBox className="w-[80px] h-[36px]" />

            {/* Issue count */}
            <SkeletonBox className="w-[160px] h-[24px]" />
          </div>

          {/* Hook Section Skeleton */}
          <div className="space-y-[var(--spacing-gap-md)]">
            {/* Issue brief card */}
            <SkeletonBox className="w-full h-[120px] rounded-[var(--radius-lg)]" />

            {/* Metric box */}
            <div className="flex justify-center">
              <SkeletonBox className="w-[280px] h-[80px] rounded-[var(--radius-md)]" />
            </div>

            {/* Dollar range */}
            <div className="flex justify-center">
              <SkeletonBox className="w-[180px] h-[28px]" />
            </div>
          </div>

          {/* Value Section Skeleton */}
          <div className="space-y-[var(--spacing-gap-sm)]">
            <SkeletonBox className="w-full h-[60px]" />
            <SkeletonBox className="w-full h-[60px]" />
            <SkeletonBox className="w-full h-[60px]" />
          </div>

          {/* CTA Section Skeleton */}
          <SkeletonBox className="w-full h-[200px] rounded-[var(--radius-lg)]" />

          {/* FAQ Section Skeleton */}
          <div className="space-y-[var(--spacing-gap-sm)]">
            <SkeletonBox className="w-full h-[56px]" />
            <SkeletonBox className="w-full h-[56px]" />
            <SkeletonBox className="w-full h-[56px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return <LandingPageSkeleton />;
}
