import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
    <ClerkProvider>
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
