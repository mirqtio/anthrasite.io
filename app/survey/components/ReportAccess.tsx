'use client'

export default function ReportAccess({
  token,
  isPublic,
  reportAccessed,
  onReportClick,
  onContinue,
}: {
  token: string
  isPublic?: boolean
  reportAccessed: boolean
  onReportClick: () => void
  onContinue: () => void
}) {
  function handleReportClick() {
    onReportClick()
    // Download report via redirect shim (download=1 forces Content-Disposition: attachment)
    const reportUrl = `/api/report/open?sid=${encodeURIComponent(token)}&download=1`
    window.location.href = reportUrl
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Your Report is Ready!
        </h2>
        <p className="text-lg text-gray-600">
          Thanks for answering those questions. Now it's time to see your
          personalized audit.
        </p>

        {isPublic && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4 max-w-lg mx-auto">
            <p className="text-blue-800 font-medium">
              ℹ️ Since this is a test participant assessment, we’re showing a
              sample report.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-lg text-blue-900 mb-3">
          📊 Access Your Report
        </h3>
        <p className="text-blue-800 mb-4">
          Click the button below to download your report. Take your time
          reviewing it, then return to answer a few quick questions about your
          experience.
        </p>

        <button
          onClick={handleReportClick}
          className="w-full text-white font-bold py-4 px-6 rounded-lg transition-colors"
          style={{ backgroundColor: '#0066ff' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#0052cc')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = '#0066ff')
          }
        >
          ⬇️ Download My Report
        </button>

        {reportAccessed && (
          <p className="text-sm text-blue-600 mt-3 text-center">
            ✓ Report download started
          </p>
        )}
      </div>

      <div className="text-center space-y-3">
        <button
          onClick={onContinue}
          disabled={!reportAccessed}
          className="w-full px-8 py-3 rounded-lg font-semibold transition-all"
          style={{
            backgroundColor: reportAccessed ? '#0066ff' : '#cccccc',
            color: reportAccessed ? '#ffffff' : '#666666',
            cursor: reportAccessed ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={(e) => {
            if (reportAccessed)
              e.currentTarget.style.backgroundColor = '#0052cc'
          }}
          onMouseLeave={(e) => {
            if (reportAccessed)
              e.currentTarget.style.backgroundColor = '#0066ff'
          }}
        >
          {reportAccessed
            ? 'Continue to Final Questions →'
            : 'Download report first to continue'}
        </button>

        {!reportAccessed && (
          <button
            onClick={onContinue}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Continue without downloading (not recommended)
          </button>
        )}
      </div>
    </div>
  )
}
