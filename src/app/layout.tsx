import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Cover My College — Bid to Rank #1 & Fund $15,000 College Tuition",
  description:
    "App creators bid for the top spot on our live leaderboard. Every dollar goes directly toward a $15,000 college tuition. Spin Plinko multipliers for extra bid power.",
  keywords: ["cover my college", "college tuition", "advertising", "bidding", "leaderboard", "plinko", "app marketing"],
  metadataBase: new URL("https://www.covermycollege.com"),
  openGraph: {
    type: "website",
    url: "https://www.covermycollege.com/",
    siteName: "CoverMyCollege",
    title: "CoverMyCollege — Bid to Rank #1 · Fund $15,000 College Tuition",
    description:
      "App creators bid for the top spot on our live leaderboard. Every dollar goes directly toward a $15,000 college tuition. Spin Plinko multipliers for extra bid power.",
    images: [
      {
        url: "https://www.covermycollege.com/og-image.jpg?v=20261025",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "CoverMyCollege — Bid to Rank #1 and fund $15,000 college tuition. A live leaderboard where app creators compete and 100% of proceeds go to college.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoverMyCollege — Bid to Rank #1 · Fund $15,000 College Tuition",
    description:
      "App creators bid for the top spot on our live leaderboard. Every dollar goes directly toward a $15,000 college tuition. Spin Plinko multipliers for extra bid power.",
    images: [
      {
        url: "https://www.covermycollege.com/og-image.jpg?v=20261025",
        alt: "CoverMyCollege — Bid to Rank #1 and fund $15,000 college tuition. A live leaderboard where app creators compete and 100% of proceeds go to college.",
      },
    ],
  },
  alternates: {
    canonical: "https://www.covermycollege.com/",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[var(--white)] text-[var(--ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
