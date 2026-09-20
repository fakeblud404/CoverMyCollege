import type { Metadata } from 'next';
import ResponsibleGamingClient from './ResponsibleGamingClient';

export const metadata: Metadata = {
  title: 'Responsible Gaming — AppBids',
  description: 'Set deposit, loss, and time limits. Self-exclude or take a cooling-off period. AppBids is committed to responsible, safe gaming for all users.',
};

export default function ResponsibleGamingPage() {
  return <ResponsibleGamingClient />;
}
