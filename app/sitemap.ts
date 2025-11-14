import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.anthrasite.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const paths: string[] = [
    '/',
    '/about',
    '/analytics',
    '/survey',
    '/purchase',
    '/purchase/success',
    '/legal',
    '/legal/privacy',
    '/legal/terms',
    '/legal/do-not-sell',
  ]

  return paths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
