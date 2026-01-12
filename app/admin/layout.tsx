import { WorkerBeacon } from '@/components/admin/WorkerBeacon'
import Link from 'next/link'
import { ReactNode } from 'react'
import { SignOutButton } from '@/components/admin/SignOutButton'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#232323] text-white font-sans selection:bg-blue-500/30">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-[#232323]/80 backdrop-blur-md z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/admin/leads"
            className="text-xl font-bold tracking-tight"
          >
            CONTROL ROOM
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-white/60">
            <Link
              href="/admin/leads"
              className="hover:text-white transition-colors"
            >
              Leads
            </Link>
            <Link
              href="/admin/pipeline"
              className="hover:text-white transition-colors"
            >
              Pipeline
            </Link>
            <Link
              href="/admin/prompt-lab"
              className="hover:text-white transition-colors"
            >
              Prompt Lab
            </Link>
            <Link
              href="/admin/mockups"
              className="hover:text-white transition-colors"
            >
              Mockups
            </Link>
            <Link
              href="/admin/referrals"
              className="hover:text-white transition-colors"
            >
              Referrals
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <WorkerBeacon />
          <SignOutButton />
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-20 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  )
}
