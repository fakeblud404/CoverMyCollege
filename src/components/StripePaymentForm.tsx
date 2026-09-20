'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface PaymentFormInnerProps {
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
  amount: number;
}

function PaymentFormInner({ onSuccess, onError, amount }: PaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      onError('An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          padding: 16,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          marginBottom: 16,
        }}
      >
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={!stripe || processing}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '1rem',
          opacity: processing ? 0.7 : 1,
          cursor: processing ? 'not-allowed' : 'pointer',
        }}
      >
        {processing ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </button>
    </form>
  );
}

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}

export default function StripePaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', fontSize: '0.85rem' }}>
        ️ Real credit card payments require setting <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and <code>STRIPE_SECRET_KEY</code> in <code>.env.local</code>.
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            fontFamily: 'Inter, system-ui, sans-serif',
            colorPrimary: '#2563eb',
            colorBackground: '#ffffff',
            colorText: '#0f172a',
            colorTextSecondary: '#475569',
            borderRadius: '10px',
          },
        },
      }}
    >
      <PaymentFormInner amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
