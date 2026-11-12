import type { Metadata } from "next";
import { Geist, Geist_Mono, Lobster } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Sváteční písmo pro nadpisy a vylosované jméno (má i českou diakritiku).
const lobster = Lobster({
  variable: "--font-lobster",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Secret Santa · Coding Bear",
  description: "Firemní Secret Santa",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} ${lobster.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
