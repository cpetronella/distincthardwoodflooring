import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsChoice } from './analytics-choice';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Distinct Hardwood Flooring | Custom Floors Since 1993",
  description:
    "Custom hardwood flooring installation, sanding, refinishing, and gymnasium floors in New York, New Jersey, and Connecticut. Request a free estimate.",
  icons: {
    icon: [{ url: "/favicon.jpg", type: "image/jpeg", sizes: "256x256" }],
    shortcut: "/favicon.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <AnalyticsChoice />
      </body>
    </html>
  );
}
