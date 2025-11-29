'use client'

import useSWR from 'swr'

import { WorkerHealthStatus } from '@/types/admin'

export function WorkerBeacon() {
  const { data: status, error } = useSWR<WorkerHealthStatus>(
    '/api/admin/worker-status',
    (url) => fetch(url).then((res) => res.json()),
    { refreshInterval: 10000 } // Poll every 10s
  )

  const isOnline = status === 'ONLINE'
  const isOffline = status === 'OFFLINE' || !!error

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
      <div className="relative flex h-3 w-3">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${
            isOnline ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        ></span>
      </div>
      <span className="text-xs font-mono tracking-widest text-white/70 uppercase">
        {isOnline ? 'System Online' : 'System Offline'}
      </span>
    </div>
  )
}
