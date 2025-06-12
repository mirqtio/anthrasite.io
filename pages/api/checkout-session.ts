import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const session = await stripe.paymentIntents.create({
    amount: 9900,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  })

  res.status(200).json({ clientSecret: session.client_secret })
}
