export interface CaseTransformation {
  id: string;
  name: string;
  niche: string;
  beforeImg: string;
  afterImg: string;
  reviewImg?: string;
  reviewImgs?: string[];
  beforeDesc: string;
  afterDesc: string;
  highlightResult?: string;
}

export const REAL_CASES: CaseTransformation[] = [
  {
    id: "01",
    name: "Ксенія",
    niche: "Дизайнерка інтер’єру",
    beforeImg: "/cases/ksenia_before.jpg",
    afterImg: "/cases/ksenia_after.jpg",
    reviewImg: "/cases/ksenia_review.png",
    reviewImgs: ["/cases/ksenia_review.png"],
    beforeDesc: "Експертний блог, який не викликав довіру та взаємодію.",
    afterDesc: "Блог, який розкриває її комплексно, контент хочеться дивитись та взаємодіяти, охоплення пішли вгору з першої публікації після впровадження системи.",
    highlightResult: "Охоплення зросли з 1-ї публікації, контент залучає клієнтів"
  },
  {
    id: "02",
    name: "Інна",
    niche: "Коуч",
    beforeImg: "/cases/inna_before.jpg",
    afterImg: "/cases/inna_after.jpg",
    reviewImg: "/cases/inna_review.png",
    reviewImgs: ["/cases/inna_review.png"],
    beforeDesc: "Немає натхнення роботи з блогом, він не транслює її цінності та підхід.",
    afterDesc: "Чітке розуміння, чому варто звернутись саме до неї, блог розповідає про її метод роботи та передає відчуття затишку і комфорту, яке викликає бажання довіритись саме їй. Після впровадження системи повернула собі натхнення до роботи з блогом.",
    highlightResult: "Повернула натхнення до блогу, транслює свій метод та цінності"
  },
  {
    id: "03",
    name: "Анастасія",
    niche: "Навчає крипті",
    beforeImg: "/cases/anastasia_before.jpg",
    afterImg: "/cases/anastasia_after.jpg",
    reviewImg: "/cases/anastasia_review2.png",
    reviewImgs: [
      "/cases/anastasia_review2.png",
      "/cases/anastasia_review1.png"
    ],
    beforeDesc: "Сторінка про все і одразу, немає чіткого розуміння, як саме з нею поспівпрацювати і чому.",
    afterDesc: "Контент, що викликає довіру та бажання рости разом з нею: отримала клієнтку з першого рілса після впровадження системи. Крім роботи з контентом, здається, знайшла справу всього життя.",
    highlightResult: "Отримала клієнтку з 1-го рілса та знайшла справу всього життя"
  }
];

export const REVIEWS_GALLERY: string[] = [
  "/cases/ksenia_review.png",
  "/cases/inna_review.png",
  "/cases/anastasia_review2.png",
  "/cases/anastasia_review1.png",
  "/rozbir/r5.jpg",
  "/rozbir/r1.jpg",
  "/rozbir/r4.jpg",
  "/rozbir/r2.jpg",
  "/rozbir/r3.jpg",
  "/rozbir/r6.jpg",
  "/rozbir/r7.jpg",
  "/rozbir/r8.jpg",
  "/rozbir/r9.jpg",
  "/rozbir/r10.jpg"
];
