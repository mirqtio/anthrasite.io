'use client'

import Script from 'next/script'

interface GA4ScriptProps {
  measurementId: string
}

export function GA4Script({ measurementId }: GA4ScriptProps) {
  if (!measurementId) {
    console.error('[GA4] No measurement ID provided')
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[GA4] Google Analytics script loaded')
        }}
        onError={() => {
          console.error('[GA4] Failed to load Google Analytics script')
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              debug_mode: true
            });
            console.log('[GA4] Initialized with ID: ${measurementId}');
          `,
        }}
      />
    </>
  )
}
