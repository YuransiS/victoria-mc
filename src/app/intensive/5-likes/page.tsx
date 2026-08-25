import React from "react";
import { IntensivePageContent } from "@/components/intensive/IntensivePageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ІНТЕНСИВ: 5 ЛАЙКІВ · 4 УРОКИ | Вікторія Мещерякова",
  description: "Перестань витрачати години на контент, який не дає результату. За 4 уроки побудуєш систему, з якою зможеш швидко створювати контент, залучати нову аудиторію та приводити клієнтів у блог.",
  openGraph: {
    title: "ІНТЕНСИВ: 5 ЛАЙКІВ · 4 УРОКИ | Вікторія Мещерякова",
    description: "За 4 уроки побудуєш систему, з якою зможеш швидко створювати контент, залучати нову аудиторію та приводити клієнтів у блог — без постійного хаосу й виснаження.",
    images: ["/rozbir/vik.jpg"]
  }
};

export default function Intensive5LikesPage() {
  return <IntensivePageContent />;
}
