import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

export default function Checkout() {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    const res = await fetch('/api/checkout-session', { method: 'POST' })
    const { clientSecret } = await res.json()

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    })

    if (result.error) {
      alert(result.error.message)
    } else if (result.paymentIntent?.status === 'succeeded') {
      alert('Payment succeeded!')
    }

    setLoading(false)
  }

  return (
    <div style={{ backgroundColor: '#0A0A0A', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Complete Your Purchase</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <CardElement className="mb-4 p-2 border" />
        <button type="submit" disabled={!stripe || loading}
          style={{ backgroundColor: '#0066FF', color: 'white', padding: '12px 24px', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  )
}
