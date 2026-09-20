import type { Metadata } from 'next';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'Contact Support — AppBids',
  description: 'Get help from the AppBids support team. Submit a ticket, browse FAQs, or find answers quickly.',
};

export default function SupportPage() {
  return <SupportClient />;
}
