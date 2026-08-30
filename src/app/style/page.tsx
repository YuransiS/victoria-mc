import { Metadata } from "next";
import { StyleLandingPage } from "@/components/style/StyleLandingPage";

export const metadata: Metadata = {
  title: "3-денне навчання: Твій стиль блогу | Віка Мещерякова",
  description:
    "Твій блог може виділятися і запам'ятовуватися, навіть якщо зараз він виглядає як у всіх. Осінній 3-денний інтенсив від Віки Мещерякової.",
  openGraph: {
    title: "3-денне навчання: Твій стиль блогу | Віка Мещерякова",
    description:
      "Твій блог може виділятися і запам'ятовуватися, навіть якщо зараз він виглядає як у всіх. Безкоштовно для перших 100 учасників.",
    images: ["/free-lection/estet.JPG"],
  },
};

export default function StylePage() {
  return <StyleLandingPage />;
}
