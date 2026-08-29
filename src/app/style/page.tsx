import { Metadata } from "next";
import { StyleLandingPage } from "@/components/style/StyleLandingPage";

export const metadata: Metadata = {
  title: "3-денне навчання: Твій стиль блогу | Віка Міщерякова",
  description:
    "Твій блог може виділятися і запам'ятовуватися, навіть якщо зараз він виглядає як у всіх. 3-денний інтенсив від Віки Міщерякової.",
  openGraph: {
    title: "3-денне навчання: Твій стиль блогу | Віка Міщерякова",
    description:
      "Твій блог може виділятися і запам'ятовуватися, навіть якщо зараз він виглядає як у всіх.",
    images: ["/free-lection/krupn.JPG"],
  },
};

export default function StylePage() {
  return <StyleLandingPage />;
}
