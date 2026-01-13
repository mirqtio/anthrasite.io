'use client'

import { Toaster } from 'sonner'

export function ToasterClient() {
  return (
    <>
      <style jsx global>{`
        [data-sonner-toast] [data-description] {
          color: #ffffff !important;
          opacity: 1 !important;
          font-size: 16px !important;
          margin-top: 4px !important;
        }
        [data-sonner-toast][data-type='error'] {
          border-left-color: #ef4444 !important;
        }
      `}</style>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            borderTop: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            borderLeft: '4px solid #22C55E',
            borderRadius: '16px',
            padding: '20px 24px',
            color: '#ffffff',
            fontSize: '18px',
            lineHeight: '1.5',
            maxWidth: '480px',
          },
          // descriptionStyle applied via global CSS above
        }}
      />
    </>
  )
}
