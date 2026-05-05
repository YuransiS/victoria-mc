"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./PracticumHero.module.css";
import { animate, createTimeline, stagger } from "animejs";
import { BookingModal } from "@/components/pricing/BookingModal";

export function PracticumHero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(490);
  const [showTestMode, setShowTestMode] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(63);
  const [activeUsers, setActiveUsers] = useState(7);
  const [blurAmount, setBlurAmount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // CHECK FOR TEST MODE
    const params = new URLSearchParams(window.location.search);
    if (params.get('test') === '1') {
      setShowTestMode(true);
    }

    // SCROLL LISTENER FOR BLUR EFFECT
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const deadPoint = 20; 
      const maxScroll = 300;
      
      setIsScrolled(scrollY > 20);

      if (scrollY > deadPoint) {
        const progress = Math.min((scrollY - deadPoint) / (maxScroll - deadPoint), 1);
        setBlurAmount(progress); 
      } else {
        setBlurAmount(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // ANIME.JS V4 ENTRANCE ANIMATION
    const isMobile = window.innerWidth <= 480;
    const timeline = createTimeline({
      defaults: {
        ease: "easeOutExpo",
        duration: 1200,
      }
    });

    timeline
      .add(`.${styles.topRowWrapper}`, {
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 800,
        delay: 200,
      })
      .add(`.${styles.content}`, {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 1500,
      }, "-=400")
      .add(`.${styles.title} .line`, {
        opacity: [0, 1],
        translateX: [-30, 0],
        delay: stagger(150),
      }, "-=1200")
      .add(`.${styles.subtitle}`, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
      }, "-=800")
      .add(`.${styles.vikaPhotoContainer}`, {
        opacity: [0, 1],
        scale: [0.9, 1],
        // Use a function for responsive translateX to avoid conflicts
        translateX: (el: HTMLElement) => {
          return isMobile ? ["-50%", "-50%"] : [50, 0];
        },
        translateY: [100, 0],
        duration: 2000,
        ease: "spring(1, 80, 12, 0)",
      }, "-=1000")
      .add(`.${styles.ctaCard}`, {
        opacity: [0, 1],
        translateY: [150, 0],
        duration: 1500,
        ease: "easeOutElastic(1, .8)",
      }, "-=1500");

    // SPOT REGISTRATION HANDLER
    const handleNewRegistration = () => {
      setSpotsLeft(prev => (prev > 5 ? prev - 1 : prev));
    };
    window.addEventListener('new_registration', handleNewRegistration);

    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return newValue < 5 ? 5 : newValue > 12 ? 12 : newValue;
      });
    }, 4000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('new_registration', handleNewRegistration);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className={styles.hero} ref={heroRef}>
      {/* FIXED HEADER BADGE */}
      <div 
        className={`${styles.topRowWrapper} ${isScrolled ? styles.headerScrolled : ""}`}
        style={{ 
          backdropFilter: `blur(${blurAmount * 24}px)`,
          WebkitBackdropFilter: `blur(${blurAmount * 24}px)`,
          background: `rgba(8, 8, 8, ${blurAmount * 0.7})`,
          maskImage: blurAmount > 0 ? `linear-gradient(to bottom, black 70%, rgba(0,0,0,${1 - blurAmount * 0.3}) 100%)` : "none",
          WebkitMaskImage: blurAmount > 0 ? `linear-gradient(to bottom, black 70%, rgba(0,0,0,${1 - blurAmount * 0.3}) 100%)` : "none"
        } as React.CSSProperties}
      >
        <div className={styles.topRow}>
          <span className={styles.dot}></span>
          <span>11.05 — 17.05</span>
          <span className={styles.separator}>|</span>
          <span>7-ДЕННИЙ ПРАКТИКУМ</span>
        </div>
      </div>

      <div className={styles.background}>
        <div className={styles.bgImageContainer} />
        <div className={styles.overlay} />
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title} ref={titleRef}>
            <div className="line">СТОРІЗ ЯКІ</div>
            <div className="line"><span>ПРОДАЮТЬ</span></div>
          </h1>

          <div className={styles.subDescription}>
            <p className={styles.subtitle} ref={subtitleRef}>
              Навчись знімати контент, який відображає твою особистість та перетворює підписників на клієнтів.
            </p>
          </div>
        </div>

        {/* Vika's Photo */}
        <div className={styles.vikaPhotoContainer} ref={photoRef}>
          <img 
            src="https://i.ibb.co/rRz99L0Q/IMG-0901.png" 
            alt="Вікторія" 
            className={styles.vikaPhoto}
          />
        </div>

        <div className={styles.ctaCard} ref={ctaRef}>
          <div className={styles.liveUsers}>
            <span className={styles.liveDot}></span>
            <span>зараз на сторінці: {activeUsers} людей</span>
          </div>

          <button 
            className={styles.mainActionBtn}
            onClick={() => {
              setPaymentAmount(490);
              setIsModalOpen(true);
            }}
          >
            <div className={styles.btnContent}>
              <span>ВЗЯТИ УЧАСТЬ — 490 ГРН</span>
              <span className={styles.oldPriceInline}>1500 ГРН</span>
            </div>
          </button>

          {showTestMode && (
            <button 
              className={styles.testPaymentBtn}
              onClick={() => {
                setPaymentAmount(1);
                setIsModalOpen(true);
              }}
            >
              ТЕСТОВА ОПЛАТА — 1 ГРН
            </button>
          )}

          <button 
            className={styles.secondaryBtn}
            onClick={(e) => {
              e.preventDefault();
              const target = document.querySelector("#program");
              if (target) {
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const scrollObj = { y: window.pageYOffset };
                animate(scrollObj, {
                  y: targetPosition,
                  duration: 1200,
                  ease: "easeOutExpo",
                  onRender: () => window.scrollTo(0, scrollObj.y)
                });
              }
            }}
          >
            ДЕТАЛІ ПРОГРАМИ
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className={styles.socialProof}>
            <div className={styles.avatars}>
              <img src="https://i.pravatar.cc/100?img=32" alt="Participant" />
              <img src="https://i.pravatar.cc/100?img=47" alt="Participant" />
              <img src="https://i.pravatar.cc/100?img=12" alt="Participant" />
            </div>
            <div className={styles.proofText}>
              <span>🔥 <b>37</b> вже з нами</span>
              <span>Залишилось <b>{spotsLeft}</b> місць</span>
            </div>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tariffName={paymentAmount === 1 ? "ТЕСТОВА ОПЛАТА (1 ГРН)" : "Практикум СТОРІЗ ЯКІ ПРОДАЮТЬ"} 
        amount={paymentAmount} 
        targetSheetName="Практикум"
        successUrl="/practicum/thanks"
        failUrl="/practicum/fail"
      />
    </section>
  );
}
