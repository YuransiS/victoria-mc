"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Flame,
  Award,
  Users,
  Globe2,
  Heart,
  MessageCircle,
  HelpCircle,
  X
} from "lucide-react";
import { SystemHeroForm } from "@/components/intensive/SystemHeroForm";
import { SystemRegistrationModal } from "@/components/intensive/SystemRegistrationModal";
import styles from "./system.module.css";

// 10-Minute Countdown Timer Hook
function use10MinTimer() {
  const DURATION_SECS = 10 * 60; // 10 minutes
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECS);

  useEffect(() => {
    const STORAGE_KEY = "intensive_system_timer_end";
    const now = Date.now();
    let endTimeStr = localStorage.getItem(STORAGE_KEY);
    let endTime = endTimeStr ? parseInt(endTimeStr, 10) : 0;

    if (!endTime || isNaN(endTime) || endTime <= now) {
      endTime = now + DURATION_SECS * 1000;
      localStorage.setItem(STORAGE_KEY, endTime.toString());
    }

    const calculateRemaining = () => {
      const currentNow = Date.now();
      let storedEnd = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
      if (!storedEnd || isNaN(storedEnd) || storedEnd <= currentNow) {
        storedEnd = currentNow + DURATION_SECS * 1000;
        localStorage.setItem(STORAGE_KEY, storedEnd.toString());
      }
      const remaining = Math.max(0, Math.floor((storedEnd - currentNow) / 1000));
      setSecondsLeft(remaining);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return { secondsLeft, formatted };
}

export default function IntensiveSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const { formatted: timerFormatted } = use10MinTimer();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className={styles.pageWrapper}>
      {/* ====================================================================
          1. HERO SECTION (Split Editorial Layout)
          ==================================================================== */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          {/* Left Column: Visual Portrait */}
          <div className={styles.heroVisualCol}>
            <Image
              src="/free-lection/she.jpg"
              alt="Вікторія Мещерякова"
              fill
              priority
              className={styles.heroImg}
            />
            <div className={styles.heroMobileGradient} />
          </div>

          {/* Right Column: Copy & Booking Form */}
          <div className={styles.heroContentCol}>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={styles.pillBadge}>ІНТЕНСИВ · 4 УРОКИ</span>
              <span className="inline-flex items-center gap-1.5 bg-[#EFE8DC] text-[#380E18] text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                <Clock size={13} />
                <span>ВІД 30 ХВИЛИН НА ДЕНЬ</span>
              </span>
            </div>

            <h1 className={styles.heroTitle}>
              Побудуй систему ведення блогу, <span className={styles.scriptItalic}>яка регулярно приводить нову аудиторію,</span> клієнтів та допоможе вийти на перші 1000€+
            </h1>

            <p className={styles.heroSubtitle}>
              За 4 уроки отримаєш готову систему: куди вкладати будь-яку ідею, щоб вона перетворювалась на контент, а блог сам приводив нову аудиторію і перші 1000+ євро — без вигорання.
            </p>

            {/* Desktop Inline Form */}
            <div className="hidden lg:block w-full">
              <SystemHeroForm buttonText="Забрати уроки за 9 євро →" amount={9} />
            </div>

            {/* Mobile Hero Price & Trigger */}
            <div className="lg:hidden w-full">
              <div className={styles.heroPriceCard}>
                <div className={styles.heroPriceRow}>
                  <span className={styles.heroOldPrice}>49 євро</span>
                  <span className={styles.heroNewPrice}>9 євро</span>
                </div>
                <div className={styles.heroTimerRow}>
                  <Clock size={15} />
                  <span>⏳ Ціна діє ще {timerFormatted}</span>
                </div>
              </div>

              <button onClick={handleOpenModal} className={styles.pillButton}>
                <span>Забрати уроки за 9 євро</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          1.1 BONUSES (With 10-Min Countdown)
          ==================================================================== */}
      <section className={`${styles.sectionWide} ${styles.bgWarmSand}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={styles.sectionHeader}>
            <span className={styles.pillBadge}>
              <Gift size={13} />
              <span>ГАРАНТОВАНІ ПОДАРУНКИ</span>
            </span>
            <h2 className={styles.sectionTitle}>
              БОНУСИ, <span className={styles.scriptItalic}>якщо зареєструєшся прямо зараз</span>
            </h2>
            <div className="text-xs uppercase tracking-[0.2em] font-extrabold text-[#380E18] opacity-80 mt-2">
              Пропозиція зникне через:
            </div>
            <div className={styles.bonusTimerBig}>{timerFormatted}</div>
          </div>

          <div className={styles.bonusesGrid}>
            {/* Bonus 1 */}
            <div className={styles.bonusCardWine}>
              <div>
                <div className={styles.bonusCardHeader}>
                  <span className={styles.bonusTag}>Бонус 1</span>
                  <div className={styles.bonusIconCircle}>
                    <Gift size={20} />
                  </div>
                </div>
                <h3 className={styles.bonusTitle}>
                  «Як я створюю контент за 30 хвилин на день»
                </h3>
                <p className={styles.bonusDesc}>
                  Повний запис уроку з демонстрацією мого власного процесу: від ідеї до готового допису за 30 хвилин.
                </p>
              </div>
              <div className={styles.bonusPriceRow}>
                <span className={styles.bonusOldPriceVal}>30 євро</span>
                <span className={styles.bonusFreePriceVal}>0 євро / безкоштовно</span>
              </div>
            </div>

            {/* Bonus 2 */}
            <div className={styles.bonusCardWine}>
              <div>
                <div className={styles.bonusCardHeader}>
                  <span className={styles.bonusTag}>Бонус 2</span>
                  <div className={styles.bonusIconCircle}>
                    <Sparkles size={20} />
                  </div>
                </div>
                <h3 className={styles.bonusTitle}>
                  «Ефір з розборами профілей»
                </h3>
                <p className={styles.bonusDesc}>
                  Живий розбір помилок реальних блогів: що заважає конвертувати підписників у заявки і як це виправити за 1 вечір.
                </p>
              </div>
              <div className={styles.bonusPriceRow}>
                <span className={styles.bonusOldPriceVal}>30 євро</span>
                <span className={styles.bonusFreePriceVal}>0 євро / безкоштовно</span>
              </div>
            </div>

            {/* Bonus 3 */}
            <div className={styles.bonusCardWineDeep}>
              <div>
                <div className={styles.bonusCardHeader}>
                  <span className={styles.bonusTag}>Бонус 3</span>
                  <div className={styles.bonusIconCircle}>
                    <Flame size={20} />
                  </div>
                </div>
                <h3 className={styles.bonusTitle}>
                  «Формула працюючих заголовків, які не хочеться прогортати»
                </h3>
                <p className={styles.bonusDesc}>
                  Гайд із 50+ перевіреними шаблонами заголовків для Reels та дописів, які змушують відкрити та дочитати до кінця.
                </p>
              </div>
              <div className={styles.bonusPriceRow}>
                <span className={styles.bonusOldPriceVal}>40 євро</span>
                <span className={styles.bonusFreePriceVal}>0 євро / безкоштовно</span>
              </div>
            </div>

            {/* Bonus 4 */}
            <div className={styles.bonusCardWineDeep}>
              <div>
                <div className={styles.bonusCardHeader}>
                  <span className={styles.bonusTag}>Бонус 4</span>
                  <div className={styles.bonusIconCircle}>
                    <MessageCircle size={20} />
                  </div>
                </div>
                <h3 className={styles.bonusTitle}>
                  «30 закликів до дії без нав{`'`}язливих «Купуйте зараз»»
                </h3>
                <p className={styles.bonusDesc}>
                  М'які, органічні CTA, які переводять перегляди у коментарі, запити в Direct та оплати без відчуття нав'язування.
                </p>
              </div>
              <div className={styles.bonusPriceRow}>
                <span className={styles.bonusOldPriceVal}>25 євро</span>
                <span className={styles.bonusFreePriceVal}>0 євро / безкоштовно</span>
              </div>
            </div>
          </div>

          {/* Bonus Total Summary Card */}
          <div className={styles.bonusesSummaryCard}>
            <div className="inline-block bg-[#380E18] text-[#FDFBF7] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              СУМАРНА ЦІННІСТЬ БОНУСІВ
            </div>
            <div className="flex flex-wrap items-baseline justify-center gap-2 sm:gap-3 text-2xl sm:text-4xl font-black text-[#2D0C14] mb-2">
              <span className="line-through opacity-40 text-xl sm:text-3xl font-bold">125 євро</span>
              <span className="text-[#380E18]">БЕЗКОШТОВНО</span>
            </div>
            <p className="text-sm sm:text-base text-[#2D0C14]/80 mb-6 font-medium">
              Доступ до всіх 4 бонусів відкривається автоматично відразу після оплати 9€.
            </p>
            <button onClick={handleOpenModal} className={styles.pillButton}>
              <span>Забрати місце за 9 євро замість 49</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. PAIN SECTION («Впізнаєш себе?»)
          ==================================================================== */}
      <section className={`${styles.sectionWide} ${styles.bgCream}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={styles.sectionHeader}>
            <span className={styles.pillBadge}>ДІАГНОСТИКА</span>
            <h2 className={styles.sectionTitle}>
              Впізнаєш <span className={styles.scriptItalic}>себе?</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Якщо хоча б один пункт описує твій щоденний стан — цей інтенсив стане твоєю точкою розвороту.
            </p>
          </div>

          <div className={styles.painCardsGrid}>
            <div className={styles.painCard}>
              <div className={styles.scriptNum}>01</div>
              <p className={styles.painCardText}>
                <strong>«Що сьогодні запостити?»</strong> — щоранку починається з пошуку ідей. Витрачаєш 3–4 години, втомлюєшся, а до вечора так нічого й не викладено або результат — нуль реакцій.
              </p>
            </div>

            <div className={styles.painCard}>
              <div className={styles.scriptNum}>02</div>
              <p className={styles.painCardText}>
                <strong>Контент є, а клієнтів немає.</strong> Публікуєш сторіз та Reels регулярно, але замість замовлень та оплат отримуєш лише лайки від знайомих і мовчання в Direct.
              </p>
            </div>

            <div className={styles.painCard}>
              <div className={styles.scriptNum}>03</div>
              <p className={styles.painCardText}>
                <strong>Страх підняти ціни або вийти на 1000€+.</strong> Здається, що для цього треба найняти команду продюсерів, знімати 50 Reels на тиждень і жити в телефоні 24/7.
              </p>
            </div>
          </div>

          {/* Manifesto Box */}
          <div className={styles.manifestoBox}>
            <p className={styles.manifestoQuote}>
              «Тобі не потрібно більше працювати. Тобі потрібна працююча система.»
            </p>
            <p className="text-sm sm:text-base text-[#2D0C14]/85 leading-relaxed max-w-2xl mx-auto font-medium">
              Коли кожен елемент (ідея → структура → контент → монетизація) з{`'`}єднано в єдиний ланцюг, блог приносить нову аудиторію та продажі щодня — навіть коли ти відпочиваєш або проводиш час із родиною.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. CASES & REVIEWS («ЦЕ ВЖЕ СПРАЦЮВАЛО У НИХ»)
          ==================================================================== */}
      <section className={`${styles.sectionWide} ${styles.bgIvory}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={styles.sectionHeader}>
            <span className={styles.pillBadge}>РЕАЛЬНІ РЕЗУЛЬТАТИ</span>
            <h2 className={styles.sectionTitle}>
              ЦЕ ВЖЕ <span className={styles.scriptItalic}>СПРАЦЮВАЛО У НИХ</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Кейси та відгуки учнів, які впровадили систему контенту за 30 хвилин.
            </p>
          </div>

          {/* 6 Before/After Student Cards */}
          <div className={styles.casesGrid}>
            {[
              {
                name: "Ольга",
                niche: "Бʼюті-майстер",
                beforeImg: "/rozbir/do1.jpg",
                afterImg: "/rozbir/bo1.jpg",
                result: "Вийшла з 300€ на 1400€/міс завдяки системі контенту"
              },
              {
                name: "Марія",
                niche: "Психолог-консультант",
                beforeImg: "/rozbir/do2.jpg",
                afterImg: "/rozbir/bo2.jpg",
                result: "Заповнила запис на 2 місяці наперед без щоденних сторіс"
              },
              {
                name: "Катерина",
                niche: "Експерт з англійської",
                beforeImg: "/rozbir/do3.jpg",
                afterImg: "/rozbir/bo3.jpg",
                result: "+850 цільових підписників за 3 тижні та перші 1100€"
              }
            ].map((c, idx) => (
              <div key={idx} className={styles.caseCard}>
                <div className={styles.caseHeader}>
                  <span className={styles.caseName}>{c.name}</span>
                  <span className={styles.caseNiche}>{c.niche}</span>
                </div>
                <div className={styles.caseCompareRow}>
                  <div
                    className={styles.caseImgWrap}
                    onClick={() => setLightboxImage(c.beforeImg)}
                  >
                    <Image src={c.beforeImg} alt="До" fill className={styles.caseImg} />
                    <span className={styles.caseLabelBefore}>До</span>
                  </div>
                  <div
                    className={styles.caseImgWrap}
                    onClick={() => setLightboxImage(c.afterImg)}
                  >
                    <Image src={c.afterImg} alt="Після" fill className={styles.caseImg} />
                    <span className={styles.caseLabelAfter}>Після</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-[#2D0C14]/85 leading-relaxed pt-1">
                  ✦ {c.result}
                </p>
              </div>
            ))}
          </div>

          {/* Review Screenshots Gallery */}
          <div className={styles.sectionHeader} style={{ marginBottom: "2rem" }}>
            <h3 className="font-manrope text-xl sm:text-2xl font-black uppercase tracking-tight text-[#2D0C14]">
              ЩО КАЖУТЬ <span className={styles.scriptItalic}>УЧНІ:</span>
            </h3>
          </div>

          <div className={styles.reviewsWrap}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div
                key={num}
                className={styles.reviewItem}
                onClick={() => setLightboxImage(`/rozbir/r${num}.jpg`)}
              >
                <Image
                  src={`/rozbir/r${num}.jpg`}
                  alt={`Відгук ${num}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={handleOpenModal} className={styles.pillButton}>
              <span>Хочу такий самий результат — за 9 євро</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. ABOUT EXPERT SECTION
          ==================================================================== */}
      <section className={`${styles.sectionWide} ${styles.bgWarmSand}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={styles.expertGrid}>
            {/* Expert Photo */}
            <div className={styles.expertImgContainer}>
              <Image
                src="/rozbir/IMG_2534.jpg"
                alt="Вікторія Мещерякова"
                fill
                className="object-cover object-top"
              />
            </div>

            {/* Expert Details */}
            <div>
              <span className={styles.pillBadge}>АВТОРКА ІНТЕНСИВУ</span>
              <h2 className={styles.sectionTitle}>
                ВІКТОРІЯ <span className={styles.scriptItalic}>МЕЩЕРЯКОВА</span>
              </h2>

              <p className="text-base text-[#2D0C14]/85 leading-relaxed mb-4 font-medium">
                Працюю з контентом з 2015 року. Бачила трансформацію соцмереж від перших постів до сучасних алгоритмів ШІ і точно знаю, що працює зараз.
              </p>

              <div className={styles.expertFactsList}>
                <div className={styles.expertFactItem}>
                  <Users size={20} className="text-[#380E18] shrink-0 mt-0.5" />
                  <span><strong>250+ учнів</strong> пройшли мої навчальні програми та вийшли на стабільні продажі.</span>
                </div>
                <div className={styles.expertFactItem}>
                  <Award size={20} className="text-[#380E18] shrink-0 mt-0.5" />
                  <span><strong>100+ розібраних блогів</strong> у різних нішах: від послуг та експертів до товарних брендів.</span>
                </div>
                <div className={styles.expertFactItem}>
                  <Globe2 size={20} className="text-[#380E18] shrink-0 mt-0.5" />
                  <span><strong>Міжнародний досвід:</strong> стратегії для брендів у трьох країнах (Британія, США, Польща), зокрема Fisher.</span>
                </div>
                <div className={styles.expertFactItem}>
                  <Heart size={20} className="text-[#380E18] shrink-0 mt-0.5" />
                  <span><strong>Мама 2 дітей:</strong> система «контент за 30 хв» — це не маркетинг, а мій щоденний спосіб життя без вигорання.</span>
                </div>
              </div>

              {/* Instagram link */}
              <a
                href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#380E18] hover:underline mb-4"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>Instagram @victoria_meshcheriakova →</span>
              </a>

              <div className={styles.expertQuoteBox}>
                <p className="font-playfair italic text-lg sm:text-xl text-[#FDFBF7] mb-1">
                  «Я не навчаю робити просто красиво.»
                </p>
                <p className="text-xs uppercase font-extrabold tracking-widest text-[#FDFBF7]/90">
                  Я навчаю будувати систему, після якої купують.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. INTENSIVE PROGRAM (4 Lessons)
          ==================================================================== */}
      <section className={`${styles.sectionWide} ${styles.bgCream}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={styles.sectionHeader}>
            <span className={styles.pillBadge}>ПРОГРАМА КУРСУ</span>
            <h2 className={styles.sectionTitle}>
              4 УРОКИ, ЯКІ ЗМІНЯТЬ <span className={styles.scriptItalic}>ТВІЙ БЛОГ</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Кожен урок — це конкретний крок системи, практичне домашнє завдання та вимірний результат.
            </p>
          </div>

          <div className={styles.programList}>
            {/* Lesson 1 */}
            <div className={styles.lessonCard}>
              <div className={styles.lessonHeader}>
                <span className={styles.lessonTag}>Урок 1</span>
                <span className="text-xs font-bold text-[#FDFBF7]/70 uppercase tracking-widest">Діагностика</span>
              </div>
              <h3 className={styles.lessonTitle}>
                «Діагностика: чому блог не росте і де зливаються клієнти»
              </h3>
              <ul className={styles.lessonPoints}>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>3 головні причини, чому аудиторія дивиться, але не підписується і не купує.</span>
                </li>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Аудит профілю: шапка, закріплені, візуальне позиціонування за 10 хвилин.</span>
                </li>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Практика: знаходимо вузькі місця у твоєму блозі та виправляємо їх.</span>
                </li>
              </ul>
              <div className={styles.lessonOutcome}>
                <strong>На виході:</strong> Чітке розуміння, що саме гальмувало продажі, та упакований профіль, який викликає довіру з перших секунд.
              </div>
            </div>

            {/* Lesson 2 */}
            <div className={styles.lessonCard}>
              <div className={styles.lessonHeader}>
                <span className={styles.lessonTag}>Урок 2</span>
                <span className="text-xs font-bold text-[#FDFBF7]/70 uppercase tracking-widest">Система ідей</span>
              </div>
              <h3 className={styles.lessonTitle}>
                «Система контенту: як 1 ідею перетворити на 5–10 публікацій»
              </h3>
              <ul className={styles.lessonPoints}>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Банк ідей, який ніколи не закінчується (де брати теми без вигорання).</span>
                </li>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Матриця контенту: як із однієї думки створити Reel, карусель, сторітелінг та пост.</span>
                </li>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Практика: складаємо твій контент-план на місяць за 30 хвилин.</span>
                </li>
              </ul>
              <div className={styles.lessonOutcome}>
                <strong>На виході:</strong> Готова карта контенту на місяць уперед і назавжди забуте відчуття «що мені сьогодні запостити».
              </div>
            </div>

            {/* Lesson 3 */}
            <div className={styles.lessonCard}>
              <div className={styles.lessonHeader}>
                <span className={styles.lessonTag}>Урок 3</span>
                <span className="text-xs font-bold text-[#FDFBF7]/70 uppercase tracking-widest">Виробництво</span>
              </div>
              <h3 className={styles.lessonTitle}>
                «Створення контенту за 30 хвилин на день: Reels, каруселі та сенси»
              </h3>
              <ul className={styles.lessonPoints}>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Покроковий протокол швидкого знімання та монтажу відео на телефоні.</span>
                </li>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Формули перших 3 секунд: хуки, які утримують увагу до кінця.</span>
                </li>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Практика: знімаємо та монтуємо твій перший конверсійний Reel за готовим шаблоном.</span>
                </li>
              </ul>
              <div className={styles.lessonOutcome}>
                <strong>На виході:</strong> Навичка створювати естетичні, чіпляючі дописи за 30 хвилин без спеціальної техніки та студій.
              </div>
            </div>

            {/* Lesson 4 */}
            <div className={styles.lessonCard}>
              <div className={styles.lessonHeader}>
                <span className={styles.lessonTag}>Урок 4</span>
                <span className="text-xs font-bold text-[#FDFBF7]/70 uppercase tracking-widest">Монетизація</span>
              </div>
              <h3 className={styles.lessonTitle}>
                «Монетизація: як вийти на перші 1000€+ з блогу»
              </h3>
              <ul className={styles.lessonPoints}>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Шлях клієнта: від першого перегляду Reels до оплати в Direct.</span>
                </li>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Скрипти м'яких продажів без тиску та маніпуляцій.</span>
                </li>
                <li className={styles.lessonPoint}>
                  <CheckCircle2 size={16} className="text-[#FDFBF7]/80 shrink-0 mt-0.5" />
                  <span>Практика: формуємо твою продуктову лінійку або пропозицію для виходу на 1000€+.</span>
                </li>
              </ul>
              <div className={styles.lessonOutcome}>
                <strong>На виході:</strong> Чітка та зрозуміла воронка продажів у блозі, яка приносить заявки щодня.
              </div>
            </div>
          </div>

          <div className="text-center">
            <button onClick={handleOpenModal} className={styles.pillButton}>
              <span>Зайняти місце за 9 євро замість 49</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. TRANSFORMATION & 7.1 DISQUALIFIERS
          ==================================================================== */}
      <section className={`${styles.sectionWide} ${styles.bgWarmSand}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={styles.sectionHeader}>
            <span className={styles.pillBadge}>ТРАНСФОРМАЦІЯ</span>
            <h2 className={styles.sectionTitle}>
              ЩО ЗМІНИТЬСЯ <span className={styles.scriptItalic}>ПІСЛЯ 4-Х УРОКІВ</span>
            </h2>
          </div>

          <div className={styles.resultsList}>
            {[
              "Ти більше не відкриваєш Instagram з думкою: «Що мені сьогодні викласти?»",
              "Маєш готову систему створення контенту, яка займає від 30 хвилин на день.",
              "Твої Reels та дописи приводять нових підписників безкоштовно через органічні алгоритми.",
              "Розумієш, як закривати клієнтів у Direct м'яко, без нав'язування.",
              "Маєш чіткий покроковий план, як вийти на перші 1000€+ щомісяця з блогу."
            ].map((text, idx) => (
              <div key={idx} className={styles.resultRow}>
                <CheckCircle2 size={22} className="text-[#380E18] shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* 7.1 Disqualifiers */}
          <div className={styles.sectionHeader} style={{ marginTop: "5rem", marginBottom: "2rem" }}>
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-900 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              ЧЕСНА ФІЛЬТРАЦІЯ
            </span>
            <h3 className="font-manrope text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#2D0C14]">
              КОМУ ТОЧНО <span className={styles.scriptItalic}>НЕ ПІДІЙДЕ ЦЕЙ ІНТЕНСИВ:</span>
            </h3>
          </div>

          <div className={styles.notForYouList}>
            {[
              "Хто шукає «чарівну кнопку», де гроші падають без дій.",
              "Хто не готовий виділити навіть 30 хвилин на день для впровадження системи.",
              "Хто очікує мільйонних результатів без практики та виконання завдань.",
              "Хто вважає, що соцмережі — це тимчасовий хайп, а не системний бізнес-інструмент.",
              "Хто не готовий проявлятися та говорити про свої послуги чесно і відкрито."
            ].map((text, idx) => (
              <div key={idx} className={styles.notForYouRow}>
                <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <span className="text-[#2D0C14]/85 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. WHY THIS PRICE & 8.1 HOW IT WORKS & 9. GUARANTEE
          ==================================================================== */}
      <section className={`${styles.sectionWide} ${styles.bgCream}`}>
        <div className="max-w-5xl mx-auto px-4">
          {/* Why this price */}
          <div className={styles.sectionHeader}>
            <span className={styles.pillBadge}>ДОСТУПНІСТЬ</span>
            <h2 className={styles.sectionTitle}>
              ЧОМУ ЦІНА <span className={styles.scriptItalic}>ВСЬОГО 9 ЄВРО?</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Цінність цієї системи — набагато вища. Але я хочу, щоб кожен експерт та підприємець зміг переконатися у дієвості мого підходу без фінансового бар'єру.
            </p>
          </div>

          {/* 8.1 How it works */}
          <div className={styles.processGrid}>
            <div className={styles.processCard}>
              <span className="w-8 h-8 rounded-full bg-[#380E18] text-[#FDFBF7] flex items-center justify-center font-bold text-sm shrink-0">1</span>
              <span>4 уроки у записі — дивись у будь-який зручний час</span>
            </div>
            <div className={styles.processCard}>
              <span className="w-8 h-8 rounded-full bg-[#380E18] text-[#FDFBF7] flex items-center justify-center font-bold text-sm shrink-0">2</span>
              <span>Доступ до матеріалів назавжди без обмежень</span>
            </div>
            <div className={styles.processCard}>
              <span className="w-8 h-8 rounded-full bg-[#380E18] text-[#FDFBF7] flex items-center justify-center font-bold text-sm shrink-0">3</span>
              <span>Бонусні ефіри та розбори реальних кейсів</span>
            </div>
            <div className={styles.processCard}>
              <span className="w-8 h-8 rounded-full bg-[#380E18] text-[#FDFBF7] flex items-center justify-center font-bold text-sm shrink-0">4</span>
              <span>Окремий куратор для перевірки домашніх завдань</span>
            </div>
          </div>

          {/* 9. Guarantee Box */}
          <div className={styles.guaranteeBox}>
            <ShieldCheck size={48} className="mx-auto mb-4 text-[#FDFBF7]" />
            <h3 className="font-manrope text-2xl sm:text-3xl font-black uppercase tracking-tight mb-3">
              100% ЗАЛІЗОБЕТОННА ГАРАНТІЯ
            </h3>
            <p className="text-sm sm:text-base text-[#FDFBF7]/90 leading-relaxed max-w-xl mx-auto mb-6 font-medium">
              Якщо ти подивишся 4 уроки, виконаєш перше завдання і зрозумієш, що система тобі не підходить — напиши нам, і ми повернемо всі 9 євро без зайвих запитань. Усі бонуси вартістю 125€ ти залишаєш собі.
            </p>
            <button onClick={handleOpenModal} className={styles.pillButtonLight}>
              <span>Зайти за 9 євро замість 49</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. FAQ SECTION (Accordion)
          ==================================================================== */}
      <section className={`${styles.sectionWide} ${styles.bgIvory}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={styles.sectionHeader}>
            <span className={styles.pillBadge}>
              <HelpCircle size={13} />
              <span>ЧАСТІ ЗАПИТАННЯ</span>
            </span>
            <h2 className={styles.sectionTitle}>
              ЗАПИТАННЯ <span className={styles.scriptItalic}>ТА ВІДПОВІДІ</span>
            </h2>
          </div>

          <div className={styles.faqList}>
            {[
              {
                q: "Чи підійде інтенсив, якщо я повний новачок без блогу?",
                a: "Так! Програма побудована від фундаменту: ми покажемо, як оформити профіль, де брати ідеї та з чого почати знімати контент, навіть якщо ти ніколи не виходив у сторіз."
              },
              {
                q: "Скільки часу на день потрібно виділяти?",
                a: "Уроки тривають до 20–30 хвилин. Практичні завдання адаптовані так, щоб ти міг впроваджувати систему за 30 хвилин на день паралельно з основною роботою чи доглядом за дітьми."
              },
              {
                q: "Як я отримаю доступ після оплати?",
                a: "Відразу після підтвердження оплати на сторінці з'явиться посилання на закритий кабінет та Telegram-чат із матеріалами. Також доступ дублюється сповіщенням."
              },
              {
                q: "Скільки зберігається доступ до уроків?",
                a: "Доступ до всіх 4 уроків та 4 бонусів надається НАЗАВЖДИ. Ти зможеш переглядати матеріали у власному темпі та повертатися до них у будь-який момент."
              },
              {
                q: "Що робити, якщо виникнуть запитання під час навчання?",
                a: "У тебе буде доступ до підтримки та куратора в закритому чаті, де ти завжди зможеш отримати відповідь на своє запитання або зворотний зв'язок по профілю."
              }
            ].map((faq, idx) => (
              <div key={idx} className={styles.faqItem}>
                <button onClick={() => toggleFaq(idx)} className={styles.faqQuestionBtn}>
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      openFaq === idx ? "rotate-180 text-[#380E18]" : "text-[#2D0C14]/50"
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className={styles.faqAnswerBox}>{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          11. FINAL BLOCK («ЩЕ СУМНІВАЄШСЯ?»)
          ==================================================================== */}
      <section className={`${styles.sectionWide} ${styles.bgWarmSand}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={styles.finalCard}>
            <span className={styles.pillBadgeLight}>ФІНАЛЬНЕ РІШЕННЯ</span>
            <h2 className="font-manrope text-3xl sm:text-4xl md:text-5xl font-black text-[#FDFBF7] uppercase tracking-tight mb-4">
              ЩЕ <span className={styles.scriptItalic}>СУМНІВАЄШСЯ?</span>
            </h2>
            <p className="text-sm sm:text-base text-[#FDFBF7]/90 leading-relaxed max-w-xl mx-auto mb-8 font-medium">
              9 євро — це ціна двох чашок кави. Але за ці 9 євро ти отримуєш перевірену систему, яка приноситиме аудиторію та продажі місяцями. Або можна знову відкласти все на рік і дивитися, як інші заробляють на своїх знаннях.
            </p>

            <button onClick={handleOpenModal} className={styles.pillButtonLight}>
              <span>Реєструюсь за 9 євро замість 49 — хочу систему</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="bg-[#23080F] text-[#FDFBF7]/70 py-8 px-4 text-center text-xs">
        <div className="max-w-5xl mx-auto space-y-2">
          <a
            href="https://drive.google.com/file/d/11CzUnxGFrRcvVhxpSIEEGK7GwzzNH42p/view"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FDFBF7] underline transition-colors"
          >
            Договір публічної оферти
          </a>
          <p>© 2026 Вікторія Мещерякова · Всі права захищено</p>
        </div>
      </footer>

      {/* ====================================================================
          STICKY MOBILE CTA BAR
          ==================================================================== */}
      <div className={styles.stickyMobileBar}>
        <div className={styles.stickyPriceBox}>
          <span className={styles.stickyTimerText}>⏳ {timerFormatted}</span>
          <span className={styles.stickyPriceVal}>9 євро</span>
        </div>
        <button onClick={handleOpenModal} className={styles.stickyBtn}>
          Забрати місце →
        </button>
      </div>

      {/* ====================================================================
          REGISTRATION MODAL
          ==================================================================== */}
      <SystemRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tariffName="Інтенсив СИСТЕМА (4 уроки)"
        amount={9}
        currency="EUR"
      />

      {/* ====================================================================
          LIGHTBOX FOR REVIEWS & CASES
          ==================================================================== */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.lightboxOverlay}
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className={styles.lightboxCloseBtn}
              aria-label="Закрити"
            >
              <X size={28} />
            </button>
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <img
                src={lightboxImage}
                alt="Збільшений відгук або кейс"
                className={styles.lightboxImg}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
