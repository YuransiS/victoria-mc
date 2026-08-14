import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Інтенсив: СИСТЕМА ВЕДЕННЯ БЛОГУ — 4 Уроки | Вікторія Мещерякова",
  description: "Побудуй систему ведення блогу, яка регулярно приводить нову аудиторію, клієнтів та допоможе вийти на перші 1000€+ — витрачаючи від 30 хвилин на день.",
  openGraph: {
    title: "Інтенсив: СИСТЕМА ВЕДЕННЯ БЛОГУ | Вікторія Мещерякова",
    description: "4 уроки, які перетворять хаотичний контент на стабільне джерело клієнтів та 1000€+ прибутку.",
    images: ["/free-lection/she.jpg"],
  }
};

export default function IntensiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
