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
    "Apps spend money to rank #1 on our live ad leaderboard while 100% of proceeds fund a $15,000 college degree! Spin Plinko multipliers for maximum bid power.",
  keywords: ["cover my college", "college tuition", "advertising", "bidding", "leaderboard", "plinko", "app marketing"],
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
