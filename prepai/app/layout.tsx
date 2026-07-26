import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://prepai.com"),
  title: "PrepAI — Get Interview Questions From Any Job Description",
  description: "Paste a job description, get tailored interview questions with model answers in seconds.",
  openGraph: {
    title: "PrepAI — Interview Prep, Tailored to the Actual Job",
    description: "Paste a job description, get tailored interview questions instantly.",
    url: "https://prepai.com",
    siteName: "PrepAI",
    images: [
      {
        url: "/api/og?score=85&role=Software%20Engineer",
        width: 1200,
        height: 630,
        alt: "PrepAI Readiness Score Card",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepAI — Interview Prep, Tailored to the Actual Job",
    description: "Paste a job description, get tailored interview questions instantly.",
    images: ["/api/og?score=85&role=Software%20Engineer"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="bg-paper text-ink font-body min-h-full flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
