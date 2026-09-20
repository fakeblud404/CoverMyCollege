'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'College Tuition Fund',
    question: 'How does bidding pay for college tuition?',
    answer:
      '100% of bidding proceeds are dedicated to paying off my $15,000 college tuition goal. In exchange, app developers get high-visibility ad placements on our live leaderboard, driving massive traffic and user interest to their products.',
  },
  {
    category: 'College Tuition Fund',
    question: 'How is the $15,000 goal tracked?',
    answer:
      'We feature a live, loading-screen styled progress chart at the top of the homepage that updates in real time with every bid placed. It breaks down tuition by semester milestones so sponsors can see their impact immediately.',
  },
  {
    category: 'Bidding',
    question: 'How does the auction work?',
    answer:
      'Each auction has a listed product with a starting bid and a countdown timer. You place a bid, which goes through the Plinko multiplier game. Your final bid = base bid × Plinko multiplier. The highest final bid at auction end wins the product.',
  },
  {
    category: 'Bidding',
    question: 'Can I bid multiple times on the same auction?',
    answer:
      'Yes! You can bid as many times as you like. Each bid is a separate transaction with its own Plinko spin. Your highest bid is tracked on the leaderboard. Note: each bid is charged separately.',
  },
  {
    category: 'Plinko',
    question: 'Is the Plinko game fair? How can I verify?',
    answer:
      'Yes — AppBids uses a provably fair system. Before each drop, we generate a cryptographic seed and show you the SHA-256 hash. After the drop, we reveal the seed so you can verify the result matches the hash. You can use any online SHA-256 verifier to confirm.',
  },
  {
    category: 'Plinko',
    question: 'What are the Plinko multipliers and probabilities?',
    answer:
      'On Medium risk: slots are 0.5× (10%), 1× (20%), 1.5× (20%), 2× (15%), 3× (10%), then mirrored. High risk has 10× edge slots with only 3% probability. The full RTP table is displayed on the Plinko page before you play.',
  },
  {
    category: 'Payments',
    question: 'What payment methods are accepted?',
    answer:
      'We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), NetBanking, and Stripe-supported wallets. All payments are secured with 256-bit SSL encryption. We do not store your card details.',
  },
  {
    category: 'Payments',
    question: 'What is the platform fee?',
    answer:
      'AppBids charges a 5% platform fee on your base bid amount. This is clearly shown before you confirm payment. The Plinko multiplier applies to your base bid only — the 5% fee is not multiplied.',
  },
  {
    category: 'Winning',
    question: 'What happens after I win an auction?',
    answer:
      'You\'ll receive an email notification immediately. Our team verifies the win within 2 hours. Shipping is arranged within 1 business day and delivery takes 3–5 business days. You can track your shipment in your account.',
  },
  {
    category: 'Account',
    question: 'How do I set bidding/loss limits?',
    answer:
      'Go to Settings → Responsible Gaming. You can set daily, weekly, and monthly deposit and loss limits. Once set, limits take effect immediately. Increasing a limit requires a 24-hour cooling-off period.',
  },
  {
    category: 'Responsible Gaming',
    question: 'What if I feel my bidding is becoming a problem?',
    answer:
      'We take responsible gaming seriously. Visit /responsible-gaming to self-exclude for 1 day to permanently, set cooling-off periods, or contact iCall: 9152987821 (World) or BeGambleAware (international). We\'ll never contact you with promotional materials during a self-exclusion period.',
  },
  {
    category: 'Responsible Gaming',
    question: 'Is there an age restriction?',
    answer:
      'Yes. AppBids is strictly 18+. All users must complete age verification (KYC) before participating in paid auctions or Plinko games. We use third-party verification and reserve the right to request proof of age at any time.',
  },
];

interface FAQAccordionProps {
  limit?: number;
  showCategories?: boolean;
}

export default function FAQAccordion({ limit, showCategories = false }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = limit ? FAQ_ITEMS.slice(0, limit) : FAQ_ITEMS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={`faq-item${isOpen ? ' open' : ''}`}>
            <button
              className="faq-question"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              id={`faq-q-${i}`}
              aria-controls={`faq-a-${i}`}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                {showCategories && item.category && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--accent-blue)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {item.category}
                  </span>
                )}
                {item.question}
              </span>
              <span
                style={{
                  fontSize: '1.1rem',
                  transition: 'transform 0.25s ease',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                  color: isOpen ? 'var(--accent-blue)' : 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div
                id={`faq-a-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                className="faq-answer animate-fade-in"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
