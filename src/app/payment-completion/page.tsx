import { Suspense } from 'react';
import type { Metadata } from 'next';
import PaymentCompletionClient from './PaymentCompletionClient';

export const metadata: Metadata = {
  title: 'Payment Status — Cover My College',
  description: 'Payment completion and verification page.',
};

export default function PaymentCompletionPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.1rem', color: '#6e6e73' }}>Loading payment status...</div>
        </div>
      }
    >
      <PaymentCompletionClient />
    </Suspense>
  );
}
