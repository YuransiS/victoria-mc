import { Metadata } from "next";
import { StyleThanksPage } from "@/components/style/StyleThanksPage";

export const metadata: Metadata = {
  title: "Дякуємо за реєстрацію! | 3-денне навчання: Твій стиль блогу",
  description: "Ви успішно зареєструвалися на інтенсив. Перенаправляємо в Telegram-бот з усіма новинами та матеріалами.",
};

export default function StyleThanksRoute() {
  return <StyleThanksPage />;
}
