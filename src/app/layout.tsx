import type { Metadata } from "next";
import { Manrope, Newsreader, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "intl-tel-input/build/css/intlTelInput.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
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
import { Analytics } from "@/components/Analytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${manrope.variable} ${newsreader.variable} ${inter.variable} ${playfair.variable} ${manrope.className}`}>
        <Analytics />
        <SmoothScroll />
        <FacebookPixel />
        {children}
      </body>
    </html>
  );
}
