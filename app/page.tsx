import { cookies } from 'next/headers'
import { OrganicHomepage } from '@/components/homepage/OrganicHomepage'
import { PurchaseHomepage } from '@/components/homepage/PurchaseHomepage'
import { ReferralToast } from '@/components/referral/ReferralToast'

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
  // Referral promo code from URL (e.g., ?promo=ACMECORP)
  const promoParam = typeof sp?.promo === 'string' ? sp.promo : null

  let mode = 'organic'

  if (utmParam) {
    mode = 'purchase'
  } else if (modeCookie === 'purchase') {
    mode = 'purchase'
  }

  if (mode === 'organic') {
    return (
      <>
        <ReferralToast promoCode={promoParam} />
        <OrganicHomepage />
      </>
    )
  } else {
    return (
      <>
        <ReferralToast promoCode={promoParam} />
        <PurchaseHomepage />
      </>
    )
  }
}
