import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { ThemeSync } from "@/components/theme/ThemeSync";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Help Centre | Tilting Heads",
  description: "Cancel, return, or request a refund for your order. We're here to help.",
  icons: {
    icon: [
      { url: "/assets/th logo-01.png", type: "image/png" },
      { url: "/assets/th logo-01.jpg", type: "image/jpeg" },
    ],
    apple: "/assets/th logo-01.png",
    shortcut: "/assets/th logo-01.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <ThemeScript />
        <ThemeSync />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
