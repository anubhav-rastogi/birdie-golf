import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Birdie — Golf Stat Tracker",
    template: "%s | Birdie",
  },
  description:
    "A serious golfer's stat tracker. Fast manual entry. Coach-grade insights. No hardware required.",
  keywords: ["golf", "stat tracker", "scoring", "handicap", "GIR", "putting"],
  authors: [{ name: "Birdie Golf" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Birdie",
    title: "Birdie — Golf Stat Tracker",
    description:
      "A serious golfer's stat tracker. Fast manual entry. Coach-grade insights. No hardware required.",
  },
  twitter: {
    card: "summary",
    title: "Birdie — Golf Stat Tracker",
    description:
      "A serious golfer's stat tracker. Fast manual entry. Coach-grade insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#283618",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-forest text-cornsilk antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
