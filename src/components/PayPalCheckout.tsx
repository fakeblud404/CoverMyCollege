'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';

interface PayPalCheckoutProps {
  /** Bid amount in **cents** (e.g. 1000 = $10.00 USD) */
  amount: number;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}

function PayPalButtonsInner({ amount, onSuccess, onError }: PayPalCheckoutProps) {
  const [processing, setProcessing] = useState(false);

  const createOrder = async (): Promise<string> => {
    setProcessing(true);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create PayPal order');
      }

      const data = await res.json();
      return data.orderId as string;
    } catch (err: unknown) {
      setProcessing(false);
      const msg = err instanceof Error ? err.message : 'PayPal setup failed';
      onError(msg);
      throw err;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Payment capture failed');
      }

      const result = await res.json();
      if (result.success) {
        onSuccess(result.orderId as string);
      } else {
        throw new Error('Payment not completed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      onError(msg);
    } finally {
      setProcessing(false);
    }
  };

  const onErrorHandler = (err: Record<string, unknown>) => {
    setProcessing(false);
    console.error('PayPal error:', err);
    onError('PayPal encountered an error. Please try again.');
  };

  return (
    <div style={{ opacity: processing ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      {/* Amount summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          marginBottom: 20,
        }}
      >
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Bid amount</span>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          ${(amount / 100).toFixed(2)} USD
        </span>
      </div>

      {/* PayPal Buttons */}
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
          height: 48,
        }}
        disabled={processing}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onErrorHandler}
        onCancel={() => {
          setProcessing(false);
          onError('Payment was cancelled.');
        }}
      />

      <p
        style={{
          textAlign: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          marginTop: 12,
          lineHeight: 1.5,
        }}
      >
        🔒 Payments are processed securely by PayPal. Your financial details are never shared with us.
      </p>
    </div>
  );
}

export default function PayPalCheckout({ amount, onSuccess, onError }: PayPalCheckoutProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0,113,227,0.06)',
          border: '1px solid rgba(0,113,227,0.2)',
          color: 'var(--blue)',
          fontSize: '0.85rem',
          lineHeight: 1.6,
        }}
      >
        ⚠️ PayPal is not configured. Please set{' '}
        <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> and{' '}
        <code>PAYPAL_SECRET</code> in your <code>.env.local</code> file.
        <br />
        <br />
        Get your credentials at{' '}
        <a
          href="https://developer.paypal.com/dashboard/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--blue)', textDecoration: 'underline' }}
        >
          developer.paypal.com
        </a>
        .
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
      }}
    >
      <PayPalButtonsInner amount={amount} onSuccess={onSuccess} onError={onError} />
    </PayPalScriptProvider>
  );
}
