import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const sans = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-atkinson",
  // next/font has no metrics for this family; globals.css defines a measured Arial fallback.
  adjustFontFallback: false,
  fallback: ["Atkinson Fallback", "Arial", "sans-serif"],
});

const title = `${SITE_NAME} | Learn from your mistakes while you work`;

// Next adds the base path to file-based images (opengraph-image.png, icons) itself,
// so metadataBase is the bare origin and page URLs are spelled out in full.
export const metadata: Metadata = {
  metadataBase: new URL(new URL(SITE_URL).origin),
  title,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
