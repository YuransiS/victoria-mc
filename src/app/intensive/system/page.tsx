"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Gift,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ZoomIn,
  X,
  Users,
  Award,
  Flame,
  HelpCircle,
  FileText,
  Video,
  Target
} from "lucide-react";

import styles from "./system.module.css";
import { SystemHeroForm } from "@/components/intensive/SystemHeroForm";
import { SystemRegistrationModal } from "@/components/intensive/SystemRegistrationModal";
import { CinematicEffects } from "@/components/CinematicEffects";
import { LiveSocialProof } from "@/components/LiveSocialProof";
import { Footer } from "@/components/Footer";

const CASES_DATA = [
  {
    name: "Мар’яна",
    niche: "Вчителька танців",
    id: "01",
    before: "https://i.ibb.co/350Z2MCW/IMG-5900.jpg",
    after: "https://i.ibb.co/dhn0HQx/IMG-5901.jpg"
  },
  {
    name: "Бізнес",
    niche: "Будівництво басейнів",
    id: "02",
    before: "https://i.ibb.co/F4JG4p7D/IMG-5896.jpg",
    after: "https://i.ibb.co/2Y7pmktn/IMG-5897.jpg"
  },
  {
    name: "Аня",
    niche: "Дизайнер одягу",
    id: "03",
    before: "https://i.ibb.co/ycV62Bsy/IMG-5898.jpg",
    after: "https://i.ibb.co/kgCgSsyz/IMG-5899.jpg"
  },
  {
    name: "Аня",
    niche: "Вчителька української",
    id: "04",
    before: "https://i.ibb.co/1YRsL7f5/IMG-5894.jpg",
    after: "https://i.ibb.co/xqb4G38y/IMG-5895.jpg"
  },
  {
    name: "Катя",
    niche: "Лайфстайл блог",
    id: "05",
    before: "https://i.ibb.co/fdF1Y1b2/IMG-5892.jpg",
    after: "https://i.ibb.co/fVgSyWQJ/IMG-5893.jpg"
  },
  {
    name: "Аліса",
    niche: "Стилістка",
    id: "06",
    before: "https://i.ibb.co/nMDKNkY4/IMG-5890.jpg",
    after: "https://i.ibb.co/xqdWH5NY/IMG-5891.jpg"
  }
];

const REVIEWS_DATA = [
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

const FAQ_DATA = [
  {
    q: "Чи підійде, якщо в мене дуже вузька/специфічна ніша?",
    a: "Так. І навіть більше - система працює добре у вузьких нішах. Багато хто думає, що для маленької аудиторії потрібно вигадувати щось особливе. Насправді проблема майже завжди не в ніші, а у відсутності зрозумілої системи контенту. Під час інтенсиву ти не отримаєш шаблон «роби так, як усі». Ти навчишся будувати систему навколо своєї експертності, щоб з однієї теми створювати десятки одиниць контенту, які будуть цікаві саме твоїй аудиторії. Неважливо, чи ти психолог, кондитер, дизайнер, лікар, фотограф або продаєш товари ручної роботи - принцип однаково працює в будь-якій ніші."
  },
  {
    q: "Чи підійде, якщо я вже веду блог і маю систему, яка не працює?",
    a: "Саме для таких людей цей інтенсив часто стає найкориснішим. Дуже багато експертів уже мають контент-план, рубрики або навіть проходили різні навчання. Але проблема в тому, що система існує лише на папері. Вона не допомагає регулярно виходити в блог. Не приводить нову аудиторію. Не приносить заявки. На інтенсиві ми не будемо змушувати тебе починати все заново. Навпаки - покажемо, як подивитися на свою систему зі сторони, знайти слабкі місця і переробити її так, щоб вона реально працювала на тебе, а не просто займала місце в нотатках."
  },
  {
    q: "Чи не «з'їсть» система мою індивідуальність і голос?",
    a: "Це один із найпоширеніших страхів. Багато хто думає, що система - це шаблони, однакові пости й блог, схожий на сотні інших. Але хороша система працює навпаки. Вона не визначає, що ти говориш. Вона допомагає зрозуміти, як доносити свої думки так, щоб їх хотілося читати. Твій стиль, голос, подача, жарти, історії та характер залишаються твоїми. Система лише прибирає хаос і допомагає перестати щоразу починати з чистого аркуша. Саме тому після інтенсиву блог не стане менш живим - навпаки, проявлятися стане значно легше."
  },
  {
    q: "У мене немає часу навіть на курс",
    a: "Саме тому тут лише 4 уроки приблизно по 20 хвилин. Ти не прив’язана до розкладу - проходиш їх у своєму темпі, впроваджуєш одразу у свій блог і отримуєш чат + перевірку домашніх завдань, щоб не просто подивитися уроки, а реально зібрати свою систему."
  },
  {
    q: "У тебе й так багато безкоштовного контенту. Навіщо мені платити?",
    a: "Безкоштовний контент дає окремі знання, тільки по ключовим моментам. Тут ти отримуєш готову структуру, послідовність дій і практику, щоб зібрати все це у власну систему. І зараз це коштує всього 9€ - набагато менше, ніж коштує одна година консультації."
  }
];

export default function IntensiveSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openLessonIndex, setOpenLessonIndex] = useState<number | null>(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Persistent 10-minute timer logic
  useEffect(() => {
    const STORAGE_KEY = "intensive_system_timer_end";
    let endTime = localStorage.getItem(STORAGE_KEY);

    if (!endTime) {
      const newEndTime = Date.now() + 600 * 1000;
      localStorage.setItem(STORAGE_KEY, newEndTime.toString());
      endTime = newEndTime.toString();
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((parseInt(endTime!) - now) / 1000));
      setTimeLeft(remaining);

      // If timer expired, loop or set minimal urgency state
      if (remaining <= 0) {
        const resetEndTime = Date.now() + 600 * 1000;
        localStorage.setItem(STORAGE_KEY, resetEndTime.toString());
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleLesson = (index: number) => {
    setOpenLessonIndex(openLessonIndex === index ? null : index);
  };

  return (
    <main className={styles.pageWrapper}>
      <CinematicEffects />
      <LiveSocialProof variant="booking" />

      {/* ==========================================================================
          1. HERO SECTION
          ========================================================================== */}
      <section className={styles.hero}>
        {/* Background Image & Overlay */}
        <div className={styles.heroBackdrop}>
          <Image
            src="/free-lection/she.jpg"
            alt="Вікторія Мещерякова"
            fill
            priority
            className={styles.heroImageBg}
          />
          <div className={styles.heroOverlayGradient} />
        </div>

        <div className={styles.heroContainer}>
          {/* Hero Left Content */}
          <motion.div
            className={styles.heroTextContent}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className={styles.heroBadge}>
              <Sparkles size={14} className="text-black" />
              <span>ІНТЕНСИВ · 4 УРОКИ ·</span>
            </div>

            <h1 className={styles.heroTitle}>
              Побудуй систему ведення блогу, яка{" "}
              <span className={styles.heroTitleHighlight}>регулярно приводить нову аудиторію</span>,
              клієнтів та допоможе вийти на{" "}
              <span className={styles.heroTitleHighlight}>перші 1000€+</span> — витрачаючи від 30
              хвилин на день.
            </h1>

            <p className={styles.heroSubtitle}>
              За 4 уроки отримаєш готову систему: куди вкладати будь-яку ідею, щоб вона перетворювалась
              на контент, а блог сам приводив нову аудиторію і перші 1000+ евро — без вигорання.
            </p>

            {/* Mobile / Quick Price Block */}
            <div className={styles.heroPriceCard}>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-manrope font-extrabold uppercase tracking-wider text-white/60">
                  СПЕЦІАЛЬНА ВАРТІСТЬ:
                </span>
                <span className={styles.heroDiscountBadge}>ЗНИЖКА -82%</span>
              </div>

              <div className={styles.heroPriceRow}>
                <span className={styles.heroOldPrice}>49 євро</span>
                <span className={styles.heroNewPrice}>9 євро</span>
              </div>

              <div className={styles.heroTimerRow}>
                <Clock size={15} className="text-[#fff500]" />
                <span>
                  Ціна діє ще:{" "}
                  <span className={styles.heroTimerValue}>{formatTime(timeLeft)}</span>
                </span>
              </div>
            </div>

            {/* Mobile CTA Trigger (opens modal) */}
            <div className="w-full lg:hidden">
              <button onClick={handleOpenModal} className={styles.primaryButton}>
                <span>Забрати уроки за 9 євро</span>
                <ArrowRight size={18} />
              </button>
              <p className={styles.buttonSubtext}>
                🎁 + Усі 4 бонуси на 125€ автоматично входять у вартість
              </p>
            </div>
          </motion.div>

          {/* Hero Right: Desktop Inline Form */}
          <motion.div
            className="hidden lg:block w-full max-w-md ml-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <SystemHeroForm buttonText="Забрати уроки за 9 євро →" />
          </motion.div>
        </div>
      </section>

      {/* ==========================================================================
          1.1 BONUSES SECTION (with 10-min countdown timer)
          ========================================================================== */}
      <section className={styles.section} id="bonuses">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>Унікальна пропозиція</span>
          <h2 className={styles.sectionTitle}>БОНУСИ, якщо зареєструєшся прямо зараз 🎁</h2>
          <div className={styles.yellowDivider} />
        </motion.div>

        {/* 10-Minute Timer Banner */}
        <motion.div
          className={styles.bonusTimerBanner}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Clock size={20} className="text-[#fff500]" />
          <span className={styles.bonusTimerText}>
            БОНУСИ ЗНИКНУТЬ ЧЕРЕЗ:{" "}
            <span className="text-[#fff500] font-black text-base">{formatTime(timeLeft)}</span>
          </span>
        </motion.div>

        {/* Bonuses Grid */}
        <div className={styles.bonusesGrid}>
          {/* Bonus 1 */}
          <motion.div
            className={styles.bonusCard}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <div className={styles.bonusBadge}>🎁 БОНУС №1</div>
            <div>
              <h3 className={styles.bonusTitle}>
                Як я створюю контент за 30 хвилин на день
              </h3>
              <p className={styles.bonusDescription}>
                Покажу свою реальну систему роботи, як я поєдную життя матері двох дітей і ведення
                блогу, поділюсь 10-ти річним досвідом створення контенту.
              </p>
            </div>
            <div className={styles.bonusPriceFooter}>
              <span className={styles.bonusOldPrice}>Звичайна ціна: 30 євро</span>
              <span className={styles.bonusFreePrice}>Ціна зараз: БЕЗКОШТОВНО</span>
            </div>
          </motion.div>

          {/* Bonus 2 */}
          <motion.div
            className={styles.bonusCard}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={styles.bonusBadge}>🎁 БОНУС №2</div>
            <div>
              <h3 className={styles.bonusTitle}>Ефір з розборами профілей</h3>
              <p className={styles.bonusDescription}>
                Покроковий аналіз реальних профілей з покращеннями від мене під різні ніші. Після цього
                розбору ти по-іншому подивишся на власний блог. Кожен знайде для себе рішення і
                інструменти для контенту та візуалу.
              </p>
            </div>
            <div className={styles.bonusPriceFooter}>
              <span className={styles.bonusOldPrice}>Звичайна ціна: 30 євро</span>
              <span className={styles.bonusFreePrice}>Ціна зараз: БЕЗКОШТОВНО</span>
            </div>
          </motion.div>

          {/* Bonus 3 */}
          <motion.div
            className={styles.bonusCard}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className={styles.bonusBadge}>🎁 БОНУС №3</div>
            <div>
              <h3 className={styles.bonusTitle}>
                Формула працюючих заголовків, які не хочеться прогортати
              </h3>
              <p className={styles.bonusDescription}>
                Ти отримаєш готову формулу створення сильних заголовків для офферів і контенту +
                приклади її застосування в різних нішах. Береш формулу — підставляєш свою тему —
                отримуєш заголовок, який чіпляє конкретну проблему або бажання твоєї аудиторії.
              </p>
            </div>
            <div className={styles.bonusPriceFooter}>
              <span className={styles.bonusOldPrice}>Звичайна ціна: 40 євро</span>
              <span className={styles.bonusFreePrice}>Ціна зараз: БЕЗКОШТОВНО</span>
            </div>
          </motion.div>

          {/* Bonus 4 */}
          <motion.div
            className={styles.bonusCard}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.bonusBadge}>🎁 БОНУС №4</div>
            <div>
              <h3 className={styles.bonusTitle}>
                30 закликів до дії без нав{`'`}язливих «Купуйте зараз»
              </h3>
              <p className={styles.bonusDescription}>
                Ти отримаєш 30 готових закликів до дії, які можна використовувати в рілс, сторіс,
                постах, каруселях та прогрівах. У результаті ти не просто привертаєш увагу — ти
                розумієш, як направити людину до дії (купити, написати у дірект, залишити коментар).
              </p>
            </div>
            <div className={styles.bonusPriceFooter}>
              <span className={styles.bonusOldPrice}>Звичайна ціна: 25 євро</span>
              <span className={styles.bonusFreePrice}>Ціна зараз: БЕЗКОШТОВНО</span>
            </div>
          </motion.div>
        </div>

        {/* Bonuses Summary Card */}
        <motion.div
          className={styles.bonusesSummaryCard}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.bonusesSummaryTitle}>Сумарна цінність бонусів: 125 євро</div>
          <div className={styles.bonusesSummaryPrices}>
            <span className="text-white/50 line-through text-sm font-bold">125 євро</span>
            <span className="text-[#fff500] text-xl font-black uppercase">Ціна зараз: 0 євро</span>
          </div>
          <p className="text-white/80 text-xs uppercase tracking-wider font-bold mb-5">
            Бонуси зникнуть через ⏳ {formatTime(timeLeft)}
          </p>

          <button onClick={handleOpenModal} className={styles.primaryButton}>
            <span>Забрати місце за 9 євро замість 49</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* ==========================================================================
          3. PAIN SECTION — «Впізнаєш себе?»
          ========================================================================== */}
      <section className={styles.section}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>Точки росту</span>
          <h2 className={styles.sectionTitle}>Інтенсив для тебе, якщо:</h2>
          <div className={styles.yellowDivider} />
        </motion.div>

        <div className={styles.painListGrid}>
          <motion.div
            className={styles.painCard}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <strong className="text-white font-black block mb-1">
              • Розумієш свою нішу, але досі не знаєш як монетизувати
            </strong>
            Маєш експертність і досвід, але блог не конвертує перегляди в реальні оплати та заявки.
          </motion.div>

          <motion.div
            className={styles.painCard}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <strong className="text-white font-black block mb-1">
              • Починаєш з нуля, не маєш продукту та блогу, але хочеш розвиватися
            </strong>
            Хочеш одразу закласти правильний фундамент і не витрачати місяці на хаотичні спроби без
            результату.
          </motion.div>

          <motion.div
            className={styles.painCard}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <strong className="text-white font-black block mb-1">
              • Вже ведеш блог, але він не росте і продажів немає
            </strong>
            Витрачаєш години на створення постів, сторіс і рілс, але відчуваєш, що топчешся на місці.
          </motion.div>
        </div>

        {/* Manifesto Box */}
        <motion.div
          className={styles.painManifestoBox}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className={styles.painManifestoQuestion}>
            «А що, якщо я скажу, що тобі більше не доведеться щоранку відкривати інстаграм і думати:
            "Про що сьогодні написати?"»
          </div>
          <p className={styles.painManifestoText}>
            За 4 уроки ти створиш систему, якою потім користуватимешся роками. <br />
            <strong>Не ще один курс. Не контент-план на тиждень.</strong> А система блогу, яка працює
            незалежно від твого настрою.
          </p>
        </motion.div>
      </section>

      {/* ==========================================================================
          4. CASES & REVIEWS SECTION («ЦЕ ВЖЕ СПРАЦЮВАЛО У НИХ»)
          ========================================================================== */}
      <section className={styles.section} id="cases">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>Тверді результати учнів</span>
          <h2 className={styles.sectionTitle}>ЦЕ ВЖЕ СПРАЦЮВАЛО У НИХ</h2>
          <p className={styles.sectionSubtitle}>
            Подивіться, як змінюється візуал, подача та результати після впровадження системи
          </p>
          <div className={styles.yellowDivider} />
        </motion.div>

        {/* Cases Grid */}
        <div className={styles.casesGrid}>
          {CASES_DATA.map((item, idx) => (
            <motion.div
              key={idx}
              className={styles.caseCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
            >
              <div className={styles.caseCardHeader}>
                <div>
                  <h3 className={styles.caseClientName}>{item.name}</h3>
                  <div className={styles.caseClientNiche}>{item.niche}</div>
                </div>
                <span className="text-[#fff500] font-serif italic text-2xl leading-none">
                  {item.id}
                </span>
              </div>

              <div className={styles.caseComparisonRow}>
                {/* Before */}
                <div
                  className={styles.caseImageContainer}
                  onClick={() => setLightboxSrc(item.before)}
                >
                  <img
                    src={item.before}
                    alt={`До - ${item.name}`}
                    loading="lazy"
                    className={styles.caseImage}
                  />
                  <div className={styles.caseTagBefore}>До</div>
                </div>

                {/* After */}
                <div
                  className={styles.caseImageContainer}
                  onClick={() => setLightboxSrc(item.after)}
                >
                  <img
                    src={item.after}
                    alt={`Після - ${item.name}`}
                    loading="lazy"
                    className={styles.caseImage}
                  />
                  <div className={styles.caseTagAfter}>Після</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reviews Section Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#fff500]">
            ВІДГУКИ ЗАКРИТОГО ЧАТУ ТА РОЗБОРІВ
          </p>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">
            (натисніть на фото, щоб збільшити)
          </p>
        </div>

        {/* Reviews Grid */}
        <div className={styles.reviewsGrid}>
          {REVIEWS_DATA.map((imgSrc, idx) => (
            <motion.div
              key={idx}
              className={styles.reviewItem}
              onClick={() => setLightboxSrc(imgSrc)}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
            >
              <img src={imgSrc} alt={`Відгук ${idx + 1}`} className={styles.reviewImage} />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn size={26} className="text-[#fff500]" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button onClick={handleOpenModal} className={styles.primaryButton}>
            <span>Хочу такий самий результат — за 9 євро замість 49 →</span>
          </button>
        </div>
      </section>

      {/* ==========================================================================
          5. ABOUT EXPERT SECTION
          ========================================================================== */}
      <section className={styles.section} id="expert">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>Автор та спікер</span>
          <h2 className={styles.sectionTitle}>Хто я така?</h2>
          <div className={styles.yellowDivider} />
        </motion.div>

        <div className={styles.expertLayout}>
          {/* Photo */}
          <motion.div
            className={styles.expertImageWrapper}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Image
              src="/rozbir/IMG_2534.jpg"
              alt="Вікторія Мещерякова"
              fill
              className={styles.expertImage}
            />
          </motion.div>

          {/* Bio */}
          <motion.div
            className={styles.expertInfo}
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className={styles.expertTitle}>Мене звати Вікторія Мещерякова</h3>
            <p className="text-white/70 text-sm font-medium leading-relaxed">
              Працюю з контентом з 2015 року. Бачила інстаграм від самого початку і всі його
              трансформації до сьогодні.
            </p>

            <div className={styles.expertPoint}>
              <CheckCircle2 size={18} className={styles.expertCheckIcon} />
              <span>
                <strong>Понад 250 учнів</strong>, які впровадили системний підхід і отримують заявки.
              </span>
            </div>

            <div className={styles.expertPoint}>
              <CheckCircle2 size={18} className={styles.expertCheckIcon} />
              <span>
                <strong>Більше 100 розібраних блогів</strong> у десятках різних експертних ніш.
              </span>
            </div>

            <div className={styles.expertPoint}>
              <CheckCircle2 size={18} className={styles.expertCheckIcon} />
              <span>
                <strong>Стратегії для міжнародних брендів</strong>, зокрема Fisher. Працювала з
                аудиторіями трьох країн: Британія, США, Польща.
              </span>
            </div>

            <div className={styles.expertPoint}>
              <CheckCircle2 size={18} className={styles.expertCheckIcon} />
              <span>
                <strong>Мама двох дітей.</strong> Система «контент за 30 хвилин» — це не
                маркетинговий слоган. Це єдиний спосіб, яким я сама веду блог між дитиною, роботою і
                реальним життям.
              </span>
            </div>

            <div className={styles.expertHighlightBox}>
              «Я не навчаю робити просто красиво. Я навчаю створювати контент, який читають,
              запам{`'`}ятовують — і після якого купують.»
            </div>

            <a
              href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramLink}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Подивитись мій Instagram @victoria_meshcheriakova</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ==========================================================================
          6. INTENSIVE PROGRAM SECTION (4 Lessons)
          ========================================================================== */}
      <section className={styles.section} id="program">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>Покрокова програма</span>
          <h2 className={styles.sectionTitle}>ПРОГРАМА ІНТЕНСИВУ (4 УРОКИ)</h2>
          <p className={styles.sectionSubtitle}>
            Концентрована практика без «води» — від аудиту поточного стану до готової схеми монетизації
          </p>
          <div className={styles.yellowDivider} />
        </motion.div>

        <div className={styles.programGrid}>
          {/* LESSON 1 */}
          <motion.div
            className={styles.lessonCard}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.lessonHeaderRow}>
              <span className={styles.lessonNumber}>01.</span>
              <h3 className={styles.lessonTitle}>
                УРОК 1. ДІАГНОСТИКА: ЩО ГАЛЬМУЄ ТВОЄ ЗРОСТАННЯ
              </h3>
            </div>
            <p className={styles.lessonDescription}>
              Перш ніж створювати більше контенту, потрібно зрозуміти, чому той, що ти вже створюєш, не
              дає потрібного результату.
            </p>
            <ul className={styles.lessonPointsList}>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Де саме блог втрачає охоплення, підписників і потенційних клієнтів</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Чому регулярний контент ≠ зростання блогу</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Яких елементів не вистачає твоєму блогу, щоб він працював як система</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Чому ти постійно шукаєш нові ідеї замість того, щоб мати зрозумілу структуру</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>
                  <strong>Практика:</strong> швидка діагностика власного блогу
                </span>
              </li>
            </ul>
            <div className={styles.lessonOutcomeBox}>
              <span className={styles.lessonOutcomeLabel}>На виході:</span>
              ти чітко розумієш, що зараз заважає твоєму блогу рости та що потрібно змінити в першу
              чергу.
            </div>
          </motion.div>

          {/* LESSON 2 */}
          <motion.div
            className={styles.lessonCard}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={styles.lessonHeaderRow}>
              <span className={styles.lessonNumber}>02.</span>
              <h3 className={styles.lessonTitle}>
                УРОК 2. СИСТЕМА КОНТЕНТУ: ДЕ БРАТИ ІДЕЇ, ЯКИХ ВИСТАЧИТЬ НА МІСЯЦІ
              </h3>
            </div>
            <p className={styles.lessonDescription}>
              Ти більше не відкриваєш Instagram з думкою: «Що мені сьогодні викласти?»
            </p>
            <ul className={styles.lessonPointsList}>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Які формати контенту потрібні блогу та для чого кожен із них</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Де постійно знаходити теми для контенту у своїй ніші</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як одну ідею перетворити на 5–10 різних публікацій</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як поєднати експертність, особистий контент та продажі</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як створити власну карту контенту, яка працює місяцями</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>
                  <strong>Практика:</strong> створюєш свою базу тем та формуєш контент на найближчий
                  період
                </span>
              </li>
            </ul>
            <div className={styles.lessonOutcomeBox}>
              <span className={styles.lessonOutcomeLabel}>На виході:</span>у тебе буде готова система,
              куди можна помістити будь-яку нову ідею та одразу зрозуміти, що з неї створити.
            </div>
          </motion.div>

          {/* LESSON 3 */}
          <motion.div
            className={styles.lessonCard}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className={styles.lessonHeaderRow}>
              <span className={styles.lessonNumber}>03.</span>
              <h3 className={styles.lessonTitle}>
                УРОК 3. СТВОРЕННЯ КОНТЕНТУ: ЯК ПЕРЕТВОРИТИ ІДЕЮ НА КОНТЕНТ, ЯКИЙ ДИВЛЯТЬСЯ
              </h3>
            </div>
            <p className={styles.lessonDescription}>
              Система є. Тепер навчимося швидко перетворювати теми на контент, який хочеться дивитися,
              читати та зберігати.
            </p>
            <ul className={styles.lessonPointsList}>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як створювати Reels, які привертають увагу нової аудиторії</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як будувати каруселі, які дочитують до останнього слайда</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Формули сильних заголовків та перших секунд</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як адаптувати одну тему під Reels, карусель та Stories</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як створювати контент у власному стилі, а не копіювати інших</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>
                  <strong>Практика:</strong> створюєш свій Reels або карусель за готовою структурою
                </span>
              </li>
            </ul>
            <div className={styles.lessonOutcomeBox}>
              <span className={styles.lessonOutcomeLabel}>На виході:</span>у тебе буде перший готовий
              контент + зрозуміла схема, за якою ти зможеш створювати наступний.
            </div>
          </motion.div>

          {/* LESSON 4 */}
          <motion.div
            className={styles.lessonCard}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.lessonHeaderRow}>
              <span className={styles.lessonNumber}>04.</span>
              <h3 className={styles.lessonTitle}>
                УРОК 4. МОНЕТИЗАЦІЯ: ЯК ПЕРЕТВОРИТИ БЛОГ НА ДЖЕРЕЛО КЛІЄНТІВ
              </h3>
            </div>
            <p className={styles.lessonDescription}>
              Бо мета блогу — не просто отримувати перегляди. Мета — щоб правильні люди хотіли
              працювати саме з тобою.
            </p>
            <ul className={styles.lessonPointsList}>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як побудувати шлях: контент → довіра → інтерес → заявка → продаж</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Який контент приводить не просто підписників, а потенційних клієнтів</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як продавати через блог без постійних «купуйте»</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як переводити аудиторію зі Stories та Reels у Direct</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>Як зрозуміти, що і кому продавати через свій блог</span>
              </li>
              <li className={styles.lessonPointItem}>
                <span className={styles.lessonPointBullet}>◆</span>
                <span>
                  <strong>Практика:</strong> створюєш власний шлях від контенту до заявки
                </span>
              </li>
            </ul>
            <div className={styles.lessonOutcomeBox}>
              <span className={styles.lessonOutcomeLabel}>На виході:</span>у тебе буде готова схема
              монетизації блогу та розуміння, як системно рухатися до перших 1000€+.
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center">
          <button onClick={handleOpenModal} className={styles.primaryButton}>
            <span>Зайняти місце за 9 євро замість 49 →</span>
          </button>
        </div>
      </section>

      {/* ==========================================================================
          7. RESULTS SECTION — «Що зміниться після 4-х уроків»
          ========================================================================== */}
      <section className={styles.section}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>Твоя трансформація</span>
          <h2 className={styles.sectionTitle}>Що ти отримаєш у результаті інтенсиву</h2>
          <div className={styles.yellowDivider} />
        </motion.div>

        <div className={styles.resultsGrid}>
          {[
            "Маєш готову систему блогу — не 100 порад звідусіль, а один міцний каркас",
            "Більше немає щоденного «а що постити»",
            "Знаєш, як залучати нову аудиторію без вигорання",
            "Маєш чіткий шлях до перших 1000€+ навіть з невеликою аудиторією",
            "Довіряєш собі — бо тепер це не везіння, а навичка, яку можна повторити"
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className={styles.resultCard}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <CheckCircle2 size={22} className={styles.resultCheckIcon} />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==========================================================================
          7.1 WHO THIS IS NOT FOR SECTION
          ========================================================================== */}
      <section className={styles.section}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-red-400 font-manrope text-[11px] font-extrabold uppercase tracking-[0.2em] mb-2 block">
            Чесна фільтрація
          </span>
          <h2 className={styles.sectionTitle}>КОМУ ТОЧНО НЕ ПІДІЙДЕ ЦЕЙ ІНТЕНСИВ</h2>
          <div className="w-12 h-0.5 bg-red-500 mx-auto mt-3" />
        </motion.div>

        <div className={styles.notForYouGrid}>
          {[
            {
              title: "Якщо ти шукаєш магічну пігулку",
              desc: "один рілс, який принесе 100К переглядів і чергу клієнтів без твоєї участі."
            },
            {
              title: "Якщо не готова нічого змінювати",
              desc: "хочеш продовжувати робити контент так само, але отримати принципово інший результат."
            },
            {
              title: "Якщо хочеш просто подивитися уроки",
              desc: "без практики, аналізу власного блогу та впровадження."
            },
            {
              title: "Якщо тобі важливіше знайти виправдання, ніж знайти рішення",
              desc: "«у мене вузька ніша», «немає часу», «алгоритми не дають охоплень»."
            },
            {
              title: "Якщо ти не хочеш продавати через блог",
              desc: "і тобі достатньо просто вести красиву сторінку без конкретного результату."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className={styles.notForYouCard}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
            >
              <XCircle size={22} className={styles.notForYouIcon} />
              <div>
                <strong className="text-white font-black block mb-0.5">{item.title} —</strong>
                <span>{item.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.notForYouSummary}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Цей інтенсив для тих, хто{" "}
          <strong className="text-[#fff500]">готовий розібратися, що не працює</strong>, змінити
          підхід і нарешті почати створювати контент не навмання, а з розумінням, навіщо він потрібен.
        </motion.div>
      </section>

      {/* ==========================================================================
          8. WHY THIS PRICE & 8.1 HOW IT WORKS
          ========================================================================== */}
      <section className={styles.section}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>Прозорість</span>
          <h2 className={styles.sectionTitle}>ЧОМУ ТАКА ЦІНА?</h2>
          <div className={styles.yellowDivider} />
        </motion.div>

        {/* Why price box */}
        <motion.div
          className="bg-[#18181a]/80 border border-white/15 p-8 md:p-10 max-w-3xl mx-auto text-center mb-16 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-base md:text-lg leading-relaxed text-white/90 mb-6">
            Якщо впровадиш хоча б те, що є у уроках —{" "}
            <strong className="text-[#fff500]">це вже окупить інтенсив у рази.</strong> Повна версія
            цієї системи коштує значно дорожче, але хочу, щоб якомога більше людей нарешті перестали
            вигадувати контент щодня з нуля.
          </p>

          <button onClick={handleOpenModal} className={styles.primaryButton}>
            <span>Зайти за 9 євро замість 49 →</span>
          </button>
        </motion.div>

        {/* 8.1 How it works */}
        <div className="text-center mb-8">
          <span className={styles.sectionTag}>Організація</span>
          <h3 className="font-manrope text-2xl md:text-3xl font-black uppercase text-white">
            ЯК ПРОХОДИТЬ ІНТЕНСИВ І ЩО ТИ ОТРИМУЄШ ПРИ ПОКУПЦІ
          </h3>
        </div>

        <div className={styles.processFeaturesGrid}>
          <motion.div
            className={styles.processFeatureCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Video size={24} className="text-[#fff500] shrink-0" />
            <span>Дивишся всі 4 уроки у своєму темпі, з практикою</span>
          </motion.div>

          <motion.div
            className={styles.processFeatureCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <Award size={24} className="text-[#fff500] shrink-0" />
            <span>Доступ до всіх 4-х уроків назавжди</span>
          </motion.div>

          <motion.div
            className={styles.processFeatureCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
          >
            <Flame size={24} className="text-[#fff500] shrink-0" />
            <span>Участь у додаткових ефірах</span>
          </motion.div>

          <motion.div
            className={styles.processFeatureCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.24 }}
          >
            <Users size={24} className="text-[#fff500] shrink-0" />
            <span>Є чат ком{`'`}юніті — для питань і обміну результатами</span>
          </motion.div>

          <motion.div
            className="sm:col-span-2 bg-[#18181a]/90 border border-[#fff500]/40 p-6 flex items-center gap-4 text-white text-base font-bold shadow-lg"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <Target size={28} className="text-[#fff500] shrink-0" />
            <span>
              Для кожного учня буде закріплений куратор, який буде перевіряти ваші домашні завдання
            </span>
          </motion.div>
        </div>
      </section>

      {/* ==========================================================================
          9. GUARANTEE SECTION
          ========================================================================== */}
      <section className={styles.section}>
        <motion.div
          className={styles.guaranteeCard}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-2">
            <ShieldCheck size={50} className="text-[#fff500]" />
          </div>
          <h2 className={styles.guaranteeTitle}>✓ ЗАЛІЗОБЕТОННА ГАРАНТІЯ</h2>
          <p className={styles.guaranteeText}>
            Подивись 4 уроки і зроби ДЗ з першого. Якщо не спрацює — поверну всю ціну{" "}
            <strong className="text-[#fff500]">9€</strong>, а всі бонуси (вартістю{" "}
            <strong className="text-[#fff500]">125€</strong>) залишаться тобі.
          </p>
        </motion.div>
      </section>

      {/* ==========================================================================
          10. FAQ SECTION
          ========================================================================== */}
      <section className={styles.section} id="faq">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>FAQ</span>
          <h2 className={styles.sectionTitle}>Відповіді на поширені запитання</h2>
          <div className={styles.yellowDivider} />
        </motion.div>

        <div className={styles.faqList}>
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <motion.div
                key={idx}
                className={`${styles.faqItem} ${isOpen ? styles.faqItemActive : ""}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <button onClick={() => toggleFaq(idx)} className={styles.faqQuestionButton}>
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className={styles.faqAnswer}>{item.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ==========================================================================
          11. FINAL BLOCK
          ========================================================================== */}
      <section className={styles.section}>
        <motion.div
          className={styles.finalCard}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className={styles.finalTitle}>ЩЕ СУМНІВАЄШСЯ?</h2>
          <div className={styles.finalText}>
            Ціна <strong>9 євро замість 49</strong>. Ця інвестиція може повернутись у перші 1000€+
            вже за кілька тижнів. <br />
            <br />
            Або не купуй. І через рік знову дивись, як інші роблять систему з того самого, що є в тебе,
            а ти все ще шукаєш ідею для наступного посту.
          </div>

          <button onClick={handleOpenModal} className={styles.primaryButton}>
            <span>Реєструюсь за 9 євро замість 49 — хочу систему</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />

      {/* ==========================================================================
          STICKY MOBILE CTA
          ========================================================================== */}
      <div className={styles.stickyMobileBar}>
        <div className={styles.stickyPriceColumn}>
          <span className={styles.stickyTimer}>⏳ {formatTime(timeLeft)}</span>
          <span className={styles.stickyPrice}>9€ <span className="line-through text-white/40 text-xs font-normal">49€</span></span>
        </div>
        <button onClick={handleOpenModal} className={styles.stickyButton}>
          Забрати за 9€ →
        </button>
      </div>

      {/* ==========================================================================
          REGISTRATION MODAL
          ========================================================================== */}
      <SystemRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tariffName="Інтенсив СИСТЕМА (4 уроки)"
        amount={9}
        currency="EUR"
      />

      {/* ==========================================================================
          LIGHTBOX MODAL
          ========================================================================== */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            className={styles.lightboxOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
          >
            <button
              className={styles.lightboxCloseBtn}
              onClick={() => setLightboxSrc(null)}
              aria-label="Закрити"
            >
              <X size={32} />
            </button>

            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lightboxSrc} alt="Збільшений перегляд" className={styles.lightboxImage} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
