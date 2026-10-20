'use client';

import React, { useState } from 'react';
import {
  WhopElements,
  Payments,
  PaymentElement,
  BrandingElement,
  usePayments,
} from '@whop/elements-react';
import { loadWhop } from '@whop/elements';

const QUICK_AMOUNTS = [1, 5, 10, 25, 50];

interface WhopPaymentEmbedProps {
  initialAmountUSD?: number;
  adId?: string;
  adData?: any;
  onPaymentSuccess: (result: { paymentId: string; creditedAmount: number }) => void;
  onError: (errMsg: string) => void;
}

function WhopPayButton({
  amountUSD,
  adId,
  adData,
  onSuccess,
  onError,
}: {
  amountUSD: number;
  adId?: string;
  adData?: any;
  onSuccess: (result: any) => void;
  onError: (err: string) => void;
}) {
  const payments = usePayments();
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!payments) {
      onError('Payment components are still initializing. Please wait a moment.');
      return;
    }

    if (amountUSD < 1) {
      onError('Minimum promotion amount is $1.00 USD.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create confirmation token using official Whop Elements
      const res = await payments.createConfirmationToken({
        billingDetails: {
          email: adData?.bidderEmail || undefined,
          name: adData?.bidderName || undefined,
        },
      });

      if (!res || !res.confirmationToken) {
        throw new Error('Failed to generate payment confirmation token.');
      }

      // 2. Confirm token server-side and credit the listing
      const amountCents = Math.round(amountUSD * 100);
      const confirmRes = await fetch('/api/whop/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationTokenId: res.confirmationToken,
          amount: amountCents,
          adId,
          adData,
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        throw new Error(confirmData.error || 'Server payment verification failed.');
      }

      onSuccess(confirmData);
    } catch (err: any) {
      console.error('Payment error:', err);
      onError(err?.message || 'Payment could not be processed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={submitting}
      className="btn-primary"
      style={{
        width: '100%',
        padding: '14px',
        fontSize: '1rem',
        marginTop: 16,
        opacity: submitting ? 0.7 : 1,
        cursor: submitting ? 'not-allowed' : 'pointer',
      }}
    >
      {submitting ? 'Verifying with Server...' : `Pay $${amountUSD.toFixed(2)} with Whop`}
    </button>
  );
}

export default function WhopPaymentEmbed({
  initialAmountUSD = 10,
  adId,
  adData,
  onPaymentSuccess,
  onError,
}: WhopPaymentEmbedProps) {
  const [amountUSD, setAmountUSD] = useState<number>(Math.max(1, initialAmountUSD));
  const accountId = process.env.NEXT_PUBLIC_WHOP_ACCOUNT_ID || 'biz_mock';

  // Minor currency units: $1.00 = 100, $10.00 = 1000
  const amountMinorUnits = Math.max(100, Math.round(amountUSD * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Variable Amount Input & Quick Selectors */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 8,
          }}
        >
          Promotion Amount (USD) *
        </label>

        {/* Quick select buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {QUICK_AMOUNTS.map((amt) => {
            const isSelected = amountUSD === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountUSD(amt)}
                style={{
                  flex: '1 1 auto',
                  minWidth: 54,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--accent-blue, #0071e3)' : '1px solid var(--border)',
                  background: isSelected ? 'rgba(0, 113, 227, 0.08)' : '#ffffff',
                  color: isSelected ? 'var(--accent-blue, #0071e3)' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                ${amt}
              </button>
            );
          })}
        </div>

        {/* Custom amount input */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            $
          </span>
          <input
            type="number"
            min="1"
            step="any"
            className="input"
            value={amountUSD || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setAmountUSD(isNaN(val) ? 0 : Math.max(0, val));
            }}
            placeholder="Enter custom amount"
            style={{ paddingLeft: 30, fontSize: '1rem', fontWeight: 600 }}
          />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
          Minimum payment: $1.00 USD (no maximum limit).
        </p>
      </div>

      {/* Whop Elements Provider & Embed */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          background: '#fafafa',
        }}
      >
        <WhopElements elements={loadWhop()}>
          {/* Keyed by amount to ensure the PaymentElement updates dynamically */}
          <Payments
            key={`whop-payments-${amountMinorUnits}`}
            accountId={accountId}
            currency="usd"
            amount={amountMinorUnits}
          >
            <PaymentElement />
            <WhopPayButton
              amountUSD={amountUSD}
              adId={adId}
              adData={adData}
              onSuccess={onPaymentSuccess}
              onError={onError}
            />
            <div style={{ marginTop: 12 }}>
              <BrandingElement />
            </div>
          </Payments>
        </WhopElements>
      </div>
    </div>
  );
}
