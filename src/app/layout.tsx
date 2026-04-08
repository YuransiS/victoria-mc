import type { Metadata } from "next";
import { Manrope, Newsreader, Inter } from "next/font/google";
import "./globals.css";
import "intl-tel-input/build/css/intlTelInput.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ВІКТОРІЯ МЕЩЕРЯКОВА — Майстер-клас: Візуал та Сенси",
  description: "Дізнайтеся, як доносити цінність послуг через естетичний візуал та отримувати клієнтів з Instagram без цілодобового постингу.",
};

import { FacebookPixel } from "@/components/FacebookPixel";
import { SmoothScroll } from "@/components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${manrope.variable} ${newsreader.variable} ${inter.variable} ${manrope.className}`}>
        <SmoothScroll />
        <FacebookPixel />
        {children}
      </body>
    </html>
  );
}
