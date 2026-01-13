import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthInitializer from "@/components/AuthInitializer";
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
  title: "Goodreads Clone",
  description: "A book tracking and social reading app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
