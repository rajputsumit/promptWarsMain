import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZenSpace — Serene Scholar Wellness",
  description:
    "A calm sanctuary to track your mood, understand your stress triggers, and find personalised wellness support through NEET, JEE, UPSC, CAT, GATE and board exam seasons.",
};

export const viewport: Viewport = {
  themeColor: "#fcf9f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`light ${outfit.variable}`}>
      <body className="bg-background text-on-background min-h-screen font-sans antialiased selection:bg-primary-container selection:text-on-primary-container">
        {children}
      </body>
    </html>
  );
}
