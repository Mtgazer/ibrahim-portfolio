"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import HeroAtmosphere from "./HeroAtmosphere";
import HeroGenerativeBackground from "./HeroGenerativeBackground";

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export default function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const scrollToWork = () => {
    const projectsEl =
      document.getElementById("my-projects") ||
      document.getElementById("selected-work");
    if (projectsEl) {
      projectsEl.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const scrollToContact = () => {
    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const focusTags = [
    "SOFTWARE DEVELOPMENT",
    "ARTIFICIAL INTELLIGENCE",
    "UI/UX DESIGN",
    "DATA SCIENCE",
  ];

  return (
    <section
      ref={trackRef}
      id="home"
      aria-label="Hero"
      style={{ backgroundColor: "var(--theme-bg-hero, #050505)" }}
      className={`relative w-full ${
        reducedMotion
          ? "min-h-[calc(100svh-4rem)] sm:min-h-[calc(100vh-4rem)] border-b border-[var(--theme-border)]"
          : "min-h-[calc(100svh-4rem)] md:h-[185vh] border-b md:border-b-0 border-[var(--theme-border)]"
      }`}
    >
      {/* Hero Viewport Container: Normal document flow on mobile (zero scroll-locking), sticky on desktop */}
      <div
        className={`w-full min-h-[calc(100svh-4rem)] md:h-[calc(100vh-4rem)] md:min-h-[580px] md:border-b border-[var(--theme-border)] overflow-hidden flex flex-col items-center justify-center select-none py-12 md:py-0 ${
          reducedMotion ? "relative" : "relative md:sticky md:top-16"
        }`}
      >
        {/* 1. Atmospheric Glow & Grain Texture */}
        <HeroAtmosphere />

        {/* 2. Scroll-Driven Technical Generative Background */}
        <HeroGenerativeBackground trackRef={trackRef} contentRef={contentRef} />

        {/* 3. Main Foreground Content Flow */}
        <div
          ref={contentRef}
          className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center"
        >
          {/* A. Official IK Logo */}
          <div className="mb-4 sm:mb-5 flex items-center justify-center">
            <div className="relative group select-none">
              {/* Soft subtle warm gold glow behind logo - tuned per theme */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full blur-[18px] pointer-events-none transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  backgroundColor: "var(--theme-logo-glow-bg, rgba(229,184,66,0.20))",
                }}
              />

              {/* Official Logo Display Container */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/ik-logo.png"
                  alt="Ibrahim Khalil Official Logo"
                  width={64}
                  height={64}
                  priority
                  style={{
                    filter: "var(--theme-logo-shadow)",
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* B. Status / Availability Label */}
          <div className="mb-4 sm:mb-5">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 bg-[var(--theme-bg-surface)] backdrop-blur-sm border border-[var(--theme-border-strong)] rounded-[6px] transition-colors duration-200 hover:border-[var(--theme-gold-text)] select-text shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] shadow-[0_0_8px_rgba(229,184,66,0.8)] animate-pulse" />
              <span className="font-mono text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--theme-text-secondary)]">
                AVAILABLE FOR ENGINEERING &amp; DESIGN ROLES
              </span>
            </div>
          </div>

          {/* C. Name Display Heading */}
          <h1 className="select-text font-sans font-bold text-4xl xs:text-5xl sm:text-6xl md:text-[4.25rem] lg:text-[4.75rem] text-[var(--theme-text-primary)] leading-[1.08] tracking-[-0.01em] sm:tracking-[0.01em] max-w-3xl">
            Ibrahim Khalil
          </h1>

          {/* D. Hero Description */}
          <p className="mt-4 sm:mt-5 select-text font-sans font-normal text-sm sm:text-base md:text-[1.05rem] text-[var(--theme-text-secondary)] max-w-md sm:max-w-lg md:max-w-xl leading-relaxed">
            Software developer building{" "}
            <span className="text-[var(--theme-gold-text)] font-medium">digital products</span>,
            exploring <span className="text-[var(--theme-gold-text)] italic">AI</span>,{" "}
            <span className="text-[var(--theme-gold-text)] italic">design</span>, and{" "}
            <span className="text-[var(--theme-gold-text)] italic">data</span>.
          </p>

          {/* E. Skill / Focus Tags */}
          <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl px-2">
            {focusTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-[5px] font-mono text-[10px] sm:text-[11px] font-normal tracking-[0.12em] uppercase text-[var(--theme-text-secondary)] transition-colors duration-200 hover:border-[var(--theme-gold-text)] hover:text-[var(--theme-text-primary)] select-text whitespace-nowrap shadow-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* F. Two CTA Buttons (Side-by-side on desktop/tablet, stacked on mobile) */}
          <div className="mt-8 sm:mt-10 flex flex-col md:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-xs sm:max-w-sm md:max-w-none px-4 sm:px-0">
            {/* Button 1: Light / Primary Gold Version */}
            <div className="relative inline-flex p-[1px] rounded-[8px] overflow-hidden group focus-within:ring-2 focus-within:ring-[#F0C969]/60 w-full md:w-auto">
              {/* Base Gold Border */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[8px] bg-[#D4A84F] transition-colors duration-200 group-hover:bg-[#F0C44E]"
              />

              {/* Traveling Light Beam on Border */}
              <div
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] aspect-square animate-border-beam pointer-events-none opacity-85 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(255, 255, 255, 0.45) 320deg, #FFFFFF 350deg, rgba(255, 255, 255, 0.55) 360deg)",
                }}
              />

              {/* Solid Warm Gold Button Surface */}
              <button
                type="button"
                onClick={scrollToWork}
                aria-label="Explore selected work portfolio section"
                className="relative z-10 flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#E5B842] text-[#090909] rounded-[7px] font-sans text-xs sm:text-[13px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 group-hover:bg-[#F0C44E] cursor-pointer focus:outline-none min-w-[210px] sm:min-w-[220px] w-full md:w-auto shadow-[0_2px_12px_rgba(229,184,66,0.22)]"
              >
                <span>EXPLORE SELECTED WORK</span>
                <span className="text-sm font-bold">↓</span>
              </button>
            </div>

            {/* Button 2: Secondary CTA Version */}
            <div className="relative inline-flex p-[1px] rounded-[8px] overflow-hidden group focus-within:ring-2 focus-within:ring-[var(--theme-gold-text)] w-full md:w-auto">
              {/* Base Subtle Border */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[8px] bg-[var(--theme-secondary-btn-border)] transition-colors duration-200 group-hover:bg-[var(--theme-gold-text)]"
              />

              {/* Traveling Gold Highlight on Border */}
              <div
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] aspect-square animate-border-beam pointer-events-none opacity-85 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(240, 201, 105, 0.25) 315deg, #F0C969 350deg, rgba(240, 201, 105, 0.35) 360deg)",
                }}
              />

              {/* Crisp Surface */}
              <button
                type="button"
                onClick={scrollToContact}
                aria-label="Get in touch contact section"
                className="relative z-10 flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-[var(--theme-secondary-btn-bg)] text-[var(--theme-secondary-btn-text)] rounded-[7px] font-sans text-xs sm:text-[13px] font-medium tracking-[0.14em] uppercase transition-all duration-200 hover:bg-[var(--theme-secondary-btn-hover)] cursor-pointer focus:outline-none min-w-[210px] sm:min-w-[220px] w-full md:w-auto shadow-xs"
              >
                <span>GET IN TOUCH</span>
                <span className="text-sm font-bold">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
