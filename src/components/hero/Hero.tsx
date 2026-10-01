"use client";

import HeroAtmosphere from "./HeroAtmosphere";

export default function Hero() {
  const scrollToWork = () => {
    const workEl = document.getElementById("work");
    if (workEl) {
      workEl.scrollIntoView({
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
      id="home"
      aria-label="Hero"
      style={{ backgroundColor: "#050505" }}
      className="scroll-mt-16 relative w-full min-h-[calc(100svh-4rem)] sm:min-h-[calc(100vh-4rem)] py-16 sm:py-20 md:py-24 border-b border-[#1A1A1A] overflow-hidden flex flex-col items-center justify-center select-none"
    >
      {/* 1. Atmospheric Glow & Grain Texture */}
      <HeroAtmosphere />

      {/* 2. Main Foreground Content Flow */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* A. Official IK Logo Badge */}
        <div className="mb-4 sm:mb-5 flex items-center justify-center">
          <div className="relative group select-none">
            {/* Soft subtle glow behind badge */}
            <div className="absolute inset-0 rounded-[14px] bg-[#E5B842]/15 blur-[12px] pointer-events-none transition-opacity duration-300 group-hover:opacity-100" />

            {/* Badge Card Container */}
            <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-[14px] bg-[#111110] border border-[#8F6B24]/60 p-[3px] shadow-[0_4px_24px_rgba(0,0,0,0.7)] transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full rounded-[10px] border border-white/[0.08] flex items-center justify-center bg-gradient-to-b from-[#141413] to-[#0D0D0C]">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  aria-label="IK Logo"
                >
                  {/* Letter I: Ivory vertical stroke */}
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="28"
                    stroke="#F5F5F0"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                  />
                  {/* Letter K: Gold vertical stem */}
                  <line
                    x1="19.5"
                    y1="8"
                    x2="19.5"
                    y2="28"
                    stroke="#E5B842"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                  />
                  {/* Letter K: Ivory diagonal upper arm */}
                  <line
                    x1="19.5"
                    y1="18"
                    x2="27"
                    y2="9.5"
                    stroke="#F5F5F0"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                  />
                  {/* Letter K: Ivory diagonal lower arm */}
                  <line
                    x1="19.5"
                    y1="18"
                    x2="27"
                    y2="26.5"
                    stroke="#F5F5F0"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                  />
                  {/* Subtle golden junction accent */}
                  <circle cx="19.5" cy="18" r="1.5" fill="#F0C969" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* B. Status / Availability Label */}
        <div className="mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 bg-[#0C0C0C]/90 backdrop-blur-sm border border-[#222222] rounded-[6px] transition-colors duration-200 hover:border-[#E5B842]/40 select-text">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] shadow-[0_0_8px_rgba(229,184,66,0.8)] animate-pulse" />
            <span className="font-mono text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase text-[#B5B5AF]">
              AVAILABLE FOR ENGINEERING &amp; DESIGN ROLES
            </span>
          </div>
        </div>

        {/* C. Name Display Heading */}
        <h1 className="select-text font-sans font-bold text-4xl xs:text-5xl sm:text-6xl md:text-[4.25rem] lg:text-[4.75rem] text-[#F5F5F0] leading-[1.08] tracking-[-0.01em] sm:tracking-[0.01em] max-w-3xl">
          Ibrahim Khalil
        </h1>

        {/* D. Hero Description */}
        <p className="mt-4 sm:mt-5 select-text font-sans font-normal text-sm sm:text-base md:text-[1.05rem] text-[#9A9A9A] max-w-md sm:max-w-lg md:max-w-xl leading-relaxed">
          Software developer building{" "}
          <span className="text-[#E5B842] font-medium">digital products</span>,
          exploring <span className="text-[#E5B842] italic">AI</span>,{" "}
          <span className="text-[#E5B842] italic">design</span>, and{" "}
          <span className="text-[#E5B842] italic">data</span>.
        </p>

        {/* E. Skill / Focus Tags */}
        <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl px-2">
          {focusTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#0D0D0D]/90 border border-[#222222] rounded-[5px] font-mono text-[10px] sm:text-[11px] font-normal tracking-[0.12em] uppercase text-[#8E8E8A] transition-colors duration-200 hover:border-[#E5B842]/40 hover:text-[#C4C4C0] select-text whitespace-nowrap"
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

          {/* Button 2: Dark / Secondary Version */}
          <div className="relative inline-flex p-[1px] rounded-[8px] overflow-hidden group focus-within:ring-2 focus-within:ring-[#F0C969]/60 w-full md:w-auto">
            {/* Base Subtle Gold Border: rgba(212,168,79,0.45) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[8px] bg-[rgba(212,168,79,0.45)] transition-colors duration-200 group-hover:bg-[rgba(212,168,79,0.7)]"
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

            {/* Near-Black Button Surface */}
            <button
              type="button"
              onClick={scrollToContact}
              aria-label="Get in touch contact section"
              className="relative z-10 flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#090909] text-[#F5F5F0] rounded-[7px] font-sans text-xs sm:text-[13px] font-medium tracking-[0.14em] uppercase transition-all duration-200 group-hover:bg-[#121212] group-hover:text-white cursor-pointer focus:outline-none min-w-[210px] sm:min-w-[220px] w-full md:w-auto"
            >
              <span>GET IN TOUCH</span>
              <span className="text-sm font-bold">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
