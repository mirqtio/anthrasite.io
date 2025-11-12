export default function ThankYou() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
      <div
        className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 102, 255, 0.1)' }}
      >
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="#0066ff"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Thank You!
      </h1>

      <p className="text-lg text-gray-600 mb-6">
        Your feedback has been successfully submitted. We truly appreciate you
        taking the time to share your thoughts.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
        <p className="text-blue-800">
          We'll use your feedback to improve our reports and better serve
          businesses like yours. If you opted in for updates, you'll hear from
          us when we have new features to share.
        </p>
      </div>

      <p className="text-sm text-gray-500">You can safely close this window.</p>
    </div>
  )
}
