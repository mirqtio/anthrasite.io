/**
 * Loading skeleton for the purchase success page.
 * Displayed while the server component fetches Stripe session data.
 */

function SkeletonBox({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/10 ${className}`}
      style={style}
    />
  )
}

export default function PurchaseSuccessLoading() {
  return (
    <main className="min-h-screen bg-[#232323] text-white font-sans">
      <div className="landing-container py-12 min-[800px]:py-16">
        <div className="max-w-2xl mx-auto flex flex-col gap-8 min-[800px]:gap-10">
          {/* Hero Skeleton */}
          <div className="text-center">
            {/* Logo placeholder */}
            <SkeletonBox
              className="mx-auto mb-8"
              style={{ width: 120, height: 32 }}
            />

            {/* Success icon */}
            <SkeletonBox
              className="mx-auto mb-6 rounded-full"
              style={{ width: 80, height: 80 }}
            />

            {/* Heading */}
            <SkeletonBox
              className="mx-auto mb-3"
              style={{ width: 280, height: 40 }}
            />

            {/* Order ref */}
            <SkeletonBox
              className="mx-auto"
              style={{ width: 140, height: 20 }}
            />
          </div>

          {/* Purchase Summary Skeleton */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 min-[800px]:p-8">
            <div className="flex items-start gap-4">
              <SkeletonBox
                className="flex-shrink-0 rounded-full"
                style={{ width: 24, height: 24 }}
              />
              <div className="flex-1">
                <SkeletonBox
                  className="mb-2"
                  style={{ width: '70%', height: 24 }}
                />
                <SkeletonBox style={{ width: '50%', height: 18 }} />
              </div>
            </div>
          </div>

          {/* Expectation Block Skeleton */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 min-[800px]:p-8">
            {/* Header */}
            <SkeletonBox
              className="mb-2"
              style={{ width: '60%', height: 28 }}
            />
            <SkeletonBox
              className="mb-8"
              style={{ width: '40%', height: 20 }}
            />

            {/* Timeline */}
            <div className="flex items-start justify-between gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 text-center">
                  <SkeletonBox
                    className="mx-auto mb-3 rounded-full"
                    style={{ width: 48, height: 48 }}
                  />
                  <SkeletonBox
                    className="mx-auto mb-1"
                    style={{ width: 60, height: 16 }}
                  />
                  <SkeletonBox
                    className="mx-auto"
                    style={{ width: 50, height: 14 }}
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="border-t border-white/10 pt-6">
              <SkeletonBox
                className="mb-2"
                style={{ width: '100%', height: 16 }}
              />
              <SkeletonBox style={{ width: '80%', height: 16 }} />
            </div>
          </div>

          {/* Delivery Block Skeleton */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 min-[800px]:p-8">
            <SkeletonBox
              className="mb-6"
              style={{ width: '60%', height: 24 }}
            />

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <SkeletonBox
                    className="flex-shrink-0 rounded-full"
                    style={{ width: 40, height: 40 }}
                  />
                  <div className="flex-1">
                    <SkeletonBox
                      className="mb-1"
                      style={{ width: '50%', height: 20 }}
                    />
                    <SkeletonBox style={{ width: '70%', height: 16 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Skeleton */}
          <div>
            <SkeletonBox className="mb-6" style={{ width: 120, height: 28 }} />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBox
                  key={i}
                  className="rounded-xl"
                  style={{ width: '100%', height: 56 }}
                />
              ))}
            </div>
          </div>

          {/* Support CTA Skeleton */}
          <div className="text-center py-6 border-t border-white/10">
            <SkeletonBox
              className="mx-auto mb-4"
              style={{ width: 280, height: 16 }}
            />
            <SkeletonBox
              className="mx-auto rounded-lg"
              style={{ width: 160, height: 44 }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
