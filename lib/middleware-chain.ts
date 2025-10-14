// lib/middleware-chain.ts
import type { NextFetchEvent, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export type Middleware = (
  req: NextRequest,
  evt: NextFetchEvent,
  res: NextResponse
) => Promise<NextResponse> | NextResponse

export type MiddlewareFactory = (next: Middleware) => Middleware

export function chain(factories: MiddlewareFactory[]): Middleware {
  const initial: Middleware = (_req, _evt, res) => res ?? NextResponse.next()
  return factories.reduceRight<Middleware>(
    (next, factory) => factory(next),
    initial
  )
}
