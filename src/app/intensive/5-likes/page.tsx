import React from "react";
import { IntensivePageContent } from "@/components/intensive/IntensivePageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ІНТЕНСИВ: 5 ЛАЙКІВ · 4 УРОКИ | Вікторія Мещерякова",
  description: "Абсолютно випадковий контент може набрати мільйони. А той, у який ти вклала душу — 5 лайків. За 4 уроки побудуй систему контенту, яка приводить аудиторію та клієнтів.",
  openGraph: {
    title: "ІНТЕНСИВ: 5 ЛАЙКІВ · 4 УРОКИ | Вікторія Мещерякова",
    description: "За 4 уроки ти перестанеш сподіватися на удачу і побудуєш систему, яка приводить аудиторію та клієнтів.",
    images: ["/rozbir/IMG_2534.jpg"]
  }
};

export default function Intensive5LikesPage() {
  return <IntensivePageContent />;
}
