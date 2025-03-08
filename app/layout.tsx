import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeShip - AI Startup Generator",
  description: "Generate viral AI startup ideas with one click",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        
        {/* Script to remove browser extension attributes that cause hydration errors */}
        <Script id="remove-extension-attrs" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', () => {
              const body = document.body;
              const attributesToRemove = ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'];
              attributesToRemove.forEach(attr => {
                if (body.hasAttribute(attr)) {
                  body.removeAttribute(attr);
                }
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
