import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Тарифи | ВІКТОРІЯ МЕЩЕРЯКОВА",
  description: "Оберіть свій формат навчання. Бронь місця за спеціальною ціною.",
};

export default function PriceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
