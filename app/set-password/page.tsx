'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { RobustCenteredLayout } from '@/components/ui/RobustCenteredLayout'

function SetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [exchangeLoading, setExchangeLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleSessionCheck = async () => {
      setExchangeLoading(true)

      // 1. Check if we already have a session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setExchangeLoading(false)
        return
      }

      // 2. If no session, check for code or token in URL
      // 2. If no session, check for code or token in URL
      const code = searchParams.get('code')
      const token = searchParams.get('token')
      const tokenHash = searchParams.get('token_hash')
      const type = (searchParams.get('type') as any) || 'invite'

      if (token || tokenHash) {
        // Option B: Direct link with token (Robust)
        const email = searchParams.get('email')

        // Email is required for 'token' (PKCE) but not always for 'token_hash'
        // However, for invite/recovery, it's safer to have it.
        if (!email && type === 'invite' && !tokenHash) {
          setError(
            'Invalid invite link: missing email address. Please ask admin to fix the email template.'
          )
          setExchangeLoading(false)
          return
        }

        try {
          const verifyParams: any = { type }
          if (tokenHash) {
            verifyParams.token_hash = tokenHash
          } else {
            verifyParams.token = token
            verifyParams.email = email ?? undefined
          }

          const { error } = await supabase.auth.verifyOtp(verifyParams)
          if (error) {
            setError(error.message)
          }
        } catch (err) {
          console.error('Error verifying OTP:', err)
          setError('Failed to verify invite link')
        }
      } else if (code) {
        // Option A: Redirect with code (Legacy/Default)
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            // If PKCE error, suggest using the token link
            if (error.message.includes('verifier')) {
              setError(
                'Link expired or invalid. Please ask admin to resend invite using the "Direct Link" format.'
              )
            } else {
              setError(error.message)
            }
          }
        } catch (err) {
          console.error('Error exchanging code:', err)
          setError('Failed to process invite link')
        }
      }

      setExchangeLoading(false)
    }

    handleSessionCheck()
  }, [searchParams, supabase.auth])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (exchangeLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <RobustCenteredLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Set Your Password
          </h1>
          <p className="text-white/40 text-sm">
            Finalize your account setup by creating a password.
          </p>
        </div>

        {success ? (
          <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded text-green-400">
            <p className="font-medium">Password set successfully!</p>
            <p className="text-sm mt-2 opacity-80">
              Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Save Password & Sign In'
              )}
            </button>
          </form>
        )}
      </RobustCenteredLayout>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  )
}
