"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import HeroAtmosphere from "./HeroAtmosphere";
import HeroGenerativeBackground from "./HeroGenerativeBackground";
import HeroSignalConnector, { HeroSignalConnectorHandle } from "./HeroSignalConnector";

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
  const signalConnectorRef = useRef<HeroSignalConnectorHandle>(null);

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
      {/* Hero Viewport Container: normal document flow on mobile; sticky track on desktop */}
      <div
        className={`w-full min-h-[calc(100svh-4rem)] md:h-[calc(100vh-4rem)] md:min-h-[620px] md:border-b border-[var(--theme-border)] overflow-hidden flex flex-col justify-between select-none py-6 sm:py-8 lg:py-0 ${
          reducedMotion ? "relative" : "relative md:sticky md:top-16"
        }`}
      >
        {/* Editorial Section 01 Marker: Dedicated outer gutter (zero collision with SYS.01 / NODE.α) */}
        <div className="absolute top-3.5 sm:top-4 left-4 sm:left-6 lg:left-8 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 sm:gap-2.5">
            <div className="relative flex items-center justify-center">
              <span
                id="section-marker-hero"
                className="w-2 h-2 rounded-full bg-[var(--theme-gold-text,#E5B842)] inline-block transition-all duration-300 pointer-events-auto"
                style={{ boxShadow: "0 0 6px var(--theme-gold-glow, rgba(229,184,66,0.5))" }}
              />
              <span
                id="section-pulse-ring-hero"
                className="section-pulse-ring absolute w-2 h-2 rounded-full pointer-events-none opacity-0"
                aria-hidden="true"
              />
            </div>
            <span className="font-mono text-[11px] sm:text-xs lg:text-[13px] font-semibold tracking-wider text-[var(--theme-gold-text,#E5B842)]/75 select-none">
              01
            </span>
            <span
              className="w-1 h-1 rounded-full bg-[var(--theme-border-strong,#333333)] shrink-0"
              aria-hidden="true"
            />
            <span className="font-mono text-xs sm:text-sm lg:text-[16px] xl:text-[17px] font-semibold tracking-[0.14em] uppercase text-[var(--theme-gold-text,#E5B842)] select-none">
              HOME
            </span>
          </div>
        </div>

        {/* 1. Atmospheric Glow & Grain Texture */}
        <HeroAtmosphere />

        {/* 2. Scroll-Driven Technical Generative Background */}
        <HeroGenerativeBackground
          trackRef={trackRef}
          contentRef={contentRef}
          onProgress={(p) => signalConnectorRef.current?.updateProgress(p)}
        />

        {/* 2.5 Scroll-Driven Hero Connecting Signal (01 · HOME -> SYS.START // 01) */}
        <HeroSignalConnector ref={signalConnectorRef} trackRef={trackRef} />

        {/* 3. Main Foreground Content Flow (Asymmetric Desktop Layout) */}
        <div
          ref={contentRef}
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-0 my-auto flex-1 flex flex-col justify-center"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
            {/* Left Column: Editorial Copy, Badges, and CTAs (cols 1-7) */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Mobile-Only Visual Signature: Clean compact circular halo at top on mobile */}
              <div className="lg:hidden mb-5 flex items-center justify-center">
                <div className="relative group select-none">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full blur-[14px] pointer-events-none"
                    style={{
                      backgroundColor: "var(--theme-logo-glow-bg, rgba(229,184,66,0.20))",
                    }}
                  />
                  <div className="relative w-16 h-16 rounded-full border border-[var(--theme-border-strong)] bg-[var(--theme-bg-surface)]/80 backdrop-blur-sm flex items-center justify-center shadow-[0_2px_14px_rgba(229,184,66,0.18)]">
                    <Image
                      src="/images/ik-logo.png"
                      alt="Ibrahim Khalil Official Logo"
                      width={52}
                      height={52}
                      priority
                      style={{ filter: "var(--theme-logo-shadow)" }}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Status / Availability Label */}
              <div className="mb-4 sm:mb-5">
                <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 bg-[var(--theme-bg-surface)] backdrop-blur-sm border border-[var(--theme-border-strong)] rounded-[6px] transition-colors duration-200 hover:border-[var(--theme-gold-text)] select-text shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] shadow-[0_0_8px_rgba(229,184,66,0.8)] animate-pulse" />
                  <span className="font-mono text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--theme-text-secondary)]">
                    AVAILABLE FOR ENGINEERING &amp; DESIGN ROLES
                  </span>
                </div>
              </div>

              {/* Name Display Heading */}
              <h1 className="select-text font-sans font-bold text-4xl xs:text-5xl sm:text-6xl lg:text-[4.25rem] xl:text-[4.75rem] text-[var(--theme-text-primary)] leading-[1.06] tracking-[-0.02em]">
                Ibrahim Khalil
              </h1>

              {/* Hero Description */}
              <p className="mt-4 sm:mt-5 select-text font-sans font-normal text-sm sm:text-base lg:text-[1.1rem] text-[var(--theme-text-secondary)] max-w-lg lg:max-w-xl leading-relaxed">
                Software developer building{" "}
                <span className="text-[var(--theme-gold-text)] font-medium">digital products</span>,
                exploring <span className="text-[var(--theme-gold-text)] italic">AI</span>,{" "}
                <span className="text-[var(--theme-gold-text)] italic">design</span>, and{" "}
                <span className="text-[var(--theme-gold-text)] italic">data</span>.
              </p>

              {/* Skill / Focus Tags */}
              <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5 max-w-2xl">
                {focusTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-[5px] font-mono text-[10px] sm:text-[11px] font-normal tracking-[0.12em] uppercase text-[var(--theme-text-secondary)] transition-colors duration-200 hover:border-[var(--theme-gold-text)] hover:text-[var(--theme-text-primary)] select-text whitespace-nowrap shadow-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Two CTA Buttons */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 w-full max-w-xs sm:max-w-md lg:max-w-none">
                {/* Button 1: Primary Gold CTA */}
                <div className="relative inline-flex p-[1px] rounded-[8px] overflow-hidden group focus-within:ring-2 focus-within:ring-[#F0C969]/60 w-full sm:w-auto">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[8px] bg-[#D4A84F] transition-colors duration-200 group-hover:bg-[#F0C44E]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] aspect-square animate-border-beam pointer-events-none opacity-85 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(255, 255, 255, 0.45) 320deg, #FFFFFF 350deg, rgba(255, 255, 255, 0.55) 360deg)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={scrollToWork}
                    aria-label="Explore selected work portfolio section"
                    className="relative z-10 flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#E5B842] text-[#090909] rounded-[7px] font-sans text-xs sm:text-[13px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 group-hover:bg-[#F0C44E] cursor-pointer focus:outline-none min-w-[210px] w-full sm:w-auto shadow-[0_2px_12px_rgba(229,184,66,0.22)]"
                  >
                    <span>EXPLORE SELECTED WORK</span>
                    <span className="text-sm font-bold">↓</span>
                  </button>
                </div>

                {/* Button 2: Secondary CTA */}
                <div className="relative inline-flex p-[1px] rounded-[8px] overflow-hidden group focus-within:ring-2 focus-within:ring-[var(--theme-gold-text)] w-full sm:w-auto">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[8px] bg-[var(--theme-secondary-btn-border)] transition-colors duration-200 group-hover:bg-[var(--theme-gold-text)]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] aspect-square animate-border-beam pointer-events-none opacity-85 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(240, 201, 105, 0.25) 315deg, #F0C969 350deg, rgba(240, 201, 105, 0.35) 360deg)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={scrollToContact}
                    aria-label="Get in touch contact section"
                    className="relative z-10 flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-[var(--theme-secondary-btn-bg)] text-[var(--theme-secondary-btn-text)] rounded-[7px] font-sans text-xs sm:text-[13px] font-medium tracking-[0.14em] uppercase transition-all duration-200 hover:bg-[var(--theme-secondary-btn-hover)] cursor-pointer focus:outline-none min-w-[210px] w-full sm:w-auto shadow-xs"
                  >
                    <span>GET IN TOUCH</span>
                    <span className="text-sm font-bold">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Signature Anchor on Desktop (cols 8-12) */}
            <div className="hidden lg:flex lg:col-span-5 items-center justify-center relative">
              <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                {/* Soft subtle radial gold glow centered behind the logo */}
                <div
                  aria-hidden="true"
                  className="absolute w-[280px] h-[280px] rounded-full blur-[42px] pointer-events-none transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(229,184,66,0.22) 0%, rgba(212,168,79,0.08) 50%, transparent 75%)",
                  }}
                />

                {/* Precision SVG Orbital Rings & Astronomical Instrument Geometry */}
                <svg
                  viewBox="0 0 420 420"
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible select-none"
                  aria-hidden="true"
                >
                  {/* 1. Inner Aperture Ring */}
                  <g data-hero-orbit-inner>
                    <circle
                      cx="210"
                      cy="210"
                      r="82"
                      fill="none"
                      stroke="var(--hero-geom-line-mid)"
                      strokeWidth="0.85"
                      strokeDasharray="4 4"
                    />
                    {/* Cardinal Inner Ticks */}
                    <line x1="210" y1="120" x2="210" y2="128" stroke="var(--theme-gold-accent)" strokeWidth="1" />
                    <line x1="210" y1="292" x2="210" y2="300" stroke="var(--theme-gold-accent)" strokeWidth="1" />
                    <line x1="120" y1="210" x2="128" y2="210" stroke="var(--theme-gold-accent)" strokeWidth="1" />
                    <line x1="292" y1="210" x2="300" y2="210" stroke="var(--theme-gold-accent)" strokeWidth="1" />
                  </g>

                  {/* 2. Middle Metric Orbit Arc (Gold accent) */}
                  <g data-hero-orbit-1>
                    <circle
                      cx="210"
                      cy="210"
                      r="130"
                      fill="none"
                      stroke="var(--hero-geom-line-subtle)"
                      strokeWidth="0.8"
                    />
                    <path
                      d="M 210 80 A 130 130 0 0 1 340 210"
                      fill="none"
                      stroke="var(--theme-gold-accent)"
                      strokeWidth="1.4"
                      strokeDasharray="140"
                    />
                    <path
                      d="M 210 340 A 130 130 0 0 1 80 210"
                      fill="none"
                      stroke="var(--hero-geom-line-accent)"
                      strokeWidth="1.2"
                      strokeDasharray="8 8"
                    />
                    {/* Node Alpha (Top-Right Orbit) */}
                    <g transform="translate(302, 118)">
                      <circle cx="0" cy="0" r="5" fill="none" stroke="var(--hero-geom-node-gold)" strokeWidth="1" />
                      <circle cx="0" cy="0" r="2" fill="var(--hero-geom-node-gold)" />
                      <text
                        data-hero-orbit-text-1
                        x="10"
                        y="3"
                        fontFamily="var(--font-mono, monospace)"
                        fontSize="7.5"
                        letterSpacing="0.1em"
                        fill="var(--hero-geom-text)"
                      >
                        NODE.α
                      </text>
                    </g>
                  </g>

                  {/* 3. Outer Astronomical Coordinate Ring */}
                  <g data-hero-orbit-2>
                    <circle
                      cx="210"
                      cy="210"
                      r="185"
                      fill="none"
                      stroke="var(--hero-geom-line-subtle)"
                      strokeWidth="0.75"
                      strokeDasharray="2 10"
                    />
                    <path
                      d="M 395 210 A 185 185 0 0 1 341 341"
                      fill="none"
                      stroke="var(--theme-gold-accent)"
                      strokeWidth="1.2"
                    />
                    {/* Node Beta (Bottom-Left Orbit) */}
                    <g transform="translate(118, 302)">
                      <circle cx="0" cy="0" r="5" fill="none" stroke="var(--hero-geom-node-gold)" strokeWidth="1" />
                      <circle cx="0" cy="0" r="2" fill="var(--hero-geom-node-gold)" />
                      <text
                        data-hero-orbit-text-2
                        x="-44"
                        y="3"
                        fontFamily="var(--font-mono, monospace)"
                        fontSize="7.5"
                        letterSpacing="0.1em"
                        fill="var(--hero-geom-text)"
                      >
                        NODE.β
                      </text>
                    </g>
                  </g>

                  {/* 4. Editorial Technical Annotations */}
                  <text
                    x="210"
                    y="62"
                    textAnchor="middle"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="8"
                    letterSpacing="0.14em"
                    fill="var(--hero-geom-text)"
                  >
                    30.0444° N // SYS.01
                  </text>
                  <text
                    x="210"
                    y="368"
                    textAnchor="middle"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="8"
                    letterSpacing="0.14em"
                    fill="var(--hero-geom-text)"
                  >
                    31.2357° E // ARCH.UX
                  </text>

                  {/* Quadrant Registration Crosshairs */}
                  <path d="M 45 45 L 55 45 M 50 40 L 50 50" stroke="var(--hero-geom-line-mid)" strokeWidth="0.75" />
                  <path d="M 365 45 L 375 45 M 370 40 L 370 50" stroke="var(--hero-geom-line-mid)" strokeWidth="0.75" />
                  <path d="M 45 365 L 55 365 M 50 360 L 50 370" stroke="var(--hero-geom-line-mid)" strokeWidth="0.75" />
                  <path d="M 365 365 L 375 365 M 370 360 L 370 370" stroke="var(--hero-geom-line-mid)" strokeWidth="0.75" />
                </svg>

                {/* The Official Personal Gold Logo at Center */}
                <div className="relative group select-none">
                  {/* Center Glass Pedestal */}
                  <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-[var(--theme-bg-surface)]/85 backdrop-blur-md border border-[var(--theme-border-strong)] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/images/ik-logo.png"
                      alt="Ibrahim Khalil Official Logo"
                      width={72}
                      height={72}
                      priority
                      style={{
                        filter: "var(--theme-logo-shadow)",
                      }}
                      className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Hero Bottom Architectural Baseline & Journey Start Anchor */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 pointer-events-none">
          <div className="w-full flex items-center justify-between pt-2.5 border-t border-[var(--hero-geom-line-mid)]">
            {/* Left: Journey Start Intersection Anchor (ready for Phase 3 Golden Journey connection) */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span
                  id="journey-start-anchor"
                  className="w-2 h-2 rounded-full bg-[var(--theme-gold-text)] inline-block pointer-events-auto transition-transform duration-300 hover:scale-125"
                  style={{ boxShadow: "0 0 6px var(--theme-gold-glow, rgba(229,184,66,0.6))" }}
                />
                <span
                  id="journey-start-pulse-ring"
                  className="absolute w-3.5 h-3.5 rounded-full border border-[var(--theme-gold-text)]/60 pointer-events-none opacity-0 transition-opacity duration-300"
                  aria-hidden="true"
                />
                <span
                  className="absolute w-3.5 h-3.5 rounded-full border border-[var(--theme-gold-text)]/40 animate-ping pointer-events-none"
                  aria-hidden="true"
                />
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--theme-gold-text)]/80">
                SYS.START // 01
              </span>
            </div>

            {/* Center: Geographic Datum Coordinates */}
            <div className="hidden md:flex items-center gap-3 text-[var(--hero-geom-text)] font-mono text-[9px] tracking-[0.16em]">
              <span>[ LAT: 30.0444° N ]</span>
              <span className="w-1 h-1 rounded-full bg-[var(--hero-geom-node-neutral)]" />
              <span>[ LON: 31.2357° E ]</span>
            </div>

            {/* Right: Technical Handoff Indicator */}
            <div className="flex items-center gap-2 text-[var(--hero-geom-text)] font-mono text-[9px] sm:text-[10px] tracking-[0.14em]">
              <span>V.02_ARCH</span>
              <span className="text-[var(--theme-gold-text)]">↓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
