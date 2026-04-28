import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Autopilot — Your Home Runs Itself",
  description:
    "Autopilot manages your household maintenance — scheduling, vendors, and approvals — so you never forget a filter, miss a tune-up, or overpay a contractor again.",
  keywords: [
    "home maintenance",
    "household management",
    "automated home maintenance",
    "home repair scheduling",
    "HVAC maintenance",
    "home management app",
    "property maintenance",
    "smart home maintenance",
  ],
  openGraph: {
    title: "Autopilot — Your Home Runs Itself",
    description:
      "AI-powered household maintenance. Weather-aware scheduling, vetted vendors, and smart approvals — all handled automatically.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autopilot — Your Home Runs Itself",
    description:
      "AI-powered household maintenance. Weather-aware scheduling, vetted vendors, and smart approvals.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return <LandingPage />;
}
