import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://autopilothome.com"),
  title: {
    default: "Autopilot — Your Home Runs Itself",
    template: "%s | Autopilot",
  },
  description:
    "Autopilot manages your household maintenance — scheduling, vendors, and approvals — so you never forget a filter, miss a tune-up, or overpay a contractor again.",
  authors: [{ name: "Autopilot" }],
  creator: "Autopilot",
  publisher: "Autopilot",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    siteName: "Autopilot",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
