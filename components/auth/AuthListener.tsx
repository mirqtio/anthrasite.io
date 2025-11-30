'use client'

import { useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthListener() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // 1. Safety Net: Check if we are on Homepage with an auth code
    // This catches the case where Supabase redirects to Site URL
    if (pathname === '/' && searchParams?.has('code')) {
      const code = searchParams.get('code')
      console.log(
        'AuthListener: Detected code on homepage, redirecting to auth callback'
      )
      router.replace(`/auth/callback?code=${code}&next=/set-password`)
      return
    }

    // 2. Listen for Supabase Auth Events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthListener: Auth event:', event)

      if (event === 'PASSWORD_RECOVERY') {
        // Redirect to set password page
        router.replace('/set-password')
      }

      // Note: We don't redirect on SIGNED_IN globally because that happens on login too.
      // But if we wanted to catch "Invite -> Signed In", we might check session.user.created_at
      // However, PASSWORD_RECOVERY is the standard event for "Invite" links that are treated as recovery
      // OR if the invite link just logs them in, they might land here.
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, searchParams, router, supabase.auth])

  return null
}
