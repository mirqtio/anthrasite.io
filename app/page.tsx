import { cookies } from 'next/headers'
import { OrganicHomepage } from '@/components/homepage/OrganicHomepage'
import { PurchaseHomepage } from '@/components/homepage/PurchaseHomepage'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const cookieStore = await cookies()
  const modeCookie = cookieStore.get('site_mode')?.value
  const sp = await searchParams
  const utmParam = sp?.utm

  let mode = 'organic'

  if (utmParam) {
    mode = 'purchase'
  } else if (modeCookie === 'purchase') {
    mode = 'purchase'
  }

  if (mode === 'organic') {
    return <OrganicHomepage />
  } else {
    return <PurchaseHomepage />
  }
}
