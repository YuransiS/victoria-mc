import { Metadata } from "next";
import { StyleThanksPage } from "@/components/style/StyleThanksPage";

export const metadata: Metadata = {
  title: "Дякуємо за реєстрацію! | 3-денне навчання: Твій стиль блогу",
  description: "Ви успішно зареєструвалися на інтенсив. Напишіть слово ДОСТУП на @vika_cooperation в Telegram для отримання матеріалів.",
};

export default function IntensiveStyleThanksRoute() {
  return <StyleThanksPage />;
}
