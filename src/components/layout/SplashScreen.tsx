"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";

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

const STAGES = [
  {
    id: "plan",
    num: "01",
    name: "PLAN",
    subtitle: "Understand the problem",
  },
  {
    id: "design",
    num: "02",
    name: "DESIGN",
    subtitle: "Architect the solution",
  },
  {
    id: "build",
    num: "03",
    name: "BUILD",
    subtitle: "Turn ideas into systems",
  },
  {
    id: "deploy",
    num: "04",
    name: "DEPLOY",
    subtitle: "Ready for the real world",
  },
] as const;

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect full-page reload to permit natural preview while preventing replay during in-session client navigation
    try {
      const navEntry = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (navEntry && navEntry.type === "reload") {
        sessionStorage.removeItem("ik_portfolio_intro_done");
      }
      if (sessionStorage.getItem("ik_portfolio_intro_done")) {
        setVisible(false);
        return;
      }
    } catch {}

    // Immediate minimal reveal for reduced motion preference
    if (reducedMotion) {
      setActiveStage(3);
      const rmTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setVisible(false);
          try {
            sessionStorage.setItem("ik_portfolio_intro_done", "1");
          } catch {}
        }, 200);
      }, 400);
      return () => clearTimeout(rmTimer);
    }

    let minTimeElapsed = false;
    let criticalReady = false;

    const attemptExit = () => {
      if (minTimeElapsed && criticalReady) {
        setIsExiting(true);
        // Smooth 700ms cinematic dissolve
        setTimeout(() => {
          setVisible(false);
          try {
            sessionStorage.setItem("ik_portfolio_intro_done", "1");
          } catch {}
        }, 700);
      }
    };

    // Refined cinematic stage progression:
    // Stage 0 (PLAN): 0ms - Calm initial illumination
    // Stage 1 (DESIGN): 700ms - Smooth stroke advance into Node 1
    // Stage 2 (BUILD): 1400ms - Smooth stroke advance into Node 2
    // Stage 3 (DEPLOY): 2100ms - Smooth stroke advance into Node 3
    // Completion: 2800ms - Natural pause before dissolving into hero
    const timerStage1 = setTimeout(() => setActiveStage(1), 700);
    const timerStage2 = setTimeout(() => setActiveStage(2), 1400);
    const timerStage3 = setTimeout(() => setActiveStage(3), 2100);

    const minTimer = setTimeout(() => {
      minTimeElapsed = true;
      attemptExit();
    }, 2800);

    // Critical readiness measurement: page load & fonts ready
    const onReady = () => {
      criticalReady = true;
      attemptExit();
    };

    if (document.readyState === "complete") {
      criticalReady = true;
    } else {
      window.addEventListener("load", onReady, { once: true });
    }

    if (document.fonts) {
      document.fonts.ready
        .then(() => {
          criticalReady = true;
          attemptExit();
        })
        .catch(() => {
          criticalReady = true;
          attemptExit();
        });
    }

    // Safety timeout: guarantee dismissal at 3500ms
    const maxTimer = setTimeout(() => {
      minTimeElapsed = true;
      criticalReady = true;
      attemptExit();
    }, 3500);

    return () => {
      clearTimeout(timerStage1);
      clearTimeout(timerStage2);
      clearTimeout(timerStage3);
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      window.removeEventListener("load", onReady);
    };
  }, [reducedMotion]);

  const handleManualDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("ik_portfolio_intro_done", "1");
      } catch {}
    }, 400);
  };

  if (!visible) return null;

  // Percentage progress between stage 0 (0%) and stage 3 (100%)
  const progressPercent = (activeStage / (STAGES.length - 1)) * 100;

  return (
    <aside
      aria-label="Software Engineering Lifecycle Intro"
      aria-busy={!isExiting}
      onClick={handleManualDismiss}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--theme-bg-page,#0C0C0C)] transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] select-none cursor-pointer ${
        isExiting
          ? "opacity-0 pointer-events-none"
          : "opacity-100 pointer-events-auto"
      }`}
    >
      {/* Background Atmosphere & Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,var(--theme-gold-glow,rgba(229,184,66,0.18))_0%,transparent_65%)]"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 w-full max-w-2xl">
        {/* 1. Official Gold Logo Container */}
        <div className="relative mb-4 sm:mb-5 flex items-center justify-center">
          {/* Subtle gold illumination glow behind mark */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full blur-[20px] pointer-events-none transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] opacity-70"
            style={{
              backgroundColor: "var(--theme-logo-glow-bg, rgba(229,184,66,0.22))",
            }}
          />

          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
            <Image
              src="/images/ik-logo.png"
              alt="Ibrahim Khalil Official Logo"
              width={64}
              height={64}
              priority
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
              style={{
                filter:
                  "var(--theme-logo-shadow, drop-shadow(0 4px 16px rgba(229, 184, 66, 0.30)))",
              }}
            />
          </div>
        </div>

        {/* 2. Identity Lockup */}
        <div className="space-y-1.5 mb-8 sm:mb-10">
          <h1 className="font-mono text-sm sm:text-base font-bold tracking-[0.24em] text-[var(--theme-text-primary,#F3F3F3)] uppercase">
            IBRAHIM KHALIL
          </h1>
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-[var(--theme-gold-text,#E5B842)] uppercase opacity-85 font-medium">
            SOFTWARE ENGINEERING
          </p>
        </div>

        {/* 3. The Four Software Engineering Lifecycle Stages Matrix */}
        <div className="w-full max-w-xl px-2 sm:px-4 mb-6">
          {/* Node Track Container */}
          <div className="relative mb-3 px-3 sm:px-4">
            {/* Connecting Line Track spanning between first and last node centers */}
            <div
              aria-hidden="true"
              className="absolute left-3 right-3 sm:left-4 sm:right-4 top-1/2 -translate-y-1/2 h-[1.5px] pointer-events-none"
            >
              {/* Background ambient rail */}
              <div className="w-full h-full bg-[var(--theme-border-strong,#262626)] opacity-35" />

              {/* Active gold progress fill stroke with calm cinematic easing */}
              <div
                className="absolute top-0 left-0 h-full bg-[var(--theme-gold-accent,#E5B842)] transition-all duration-750 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  width: `${progressPercent}%`,
                  boxShadow: "0 0 6px var(--theme-gold-glow, rgba(229,184,66,0.5))",
                }}
              />
            </div>

            {/* 4 Connected Lifecycle Nodes */}
            <div className="relative z-10 flex items-center justify-between">
              {STAGES.map((stage, idx) => {
                const isActive = idx === activeStage;
                const isCompleted = idx < activeStage;

                return (
                  <div
                    key={stage.id}
                    className="flex flex-col items-center justify-center"
                  >
                    {/* Node Dot with gradual illumination */}
                    <div
                      className={`relative rounded-full transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center ${
                        isActive
                          ? "w-3.5 h-3.5 bg-[var(--theme-gold-accent,#E5B842)] ring-2 ring-[var(--theme-gold-glow,rgba(229,184,66,0.3))] shadow-[0_0_8px_rgba(229,184,66,0.6)]"
                          : isCompleted
                          ? "w-3 h-3 bg-[var(--theme-gold-accent,#E5B842)] opacity-75 border border-[var(--theme-gold-accent,#E5B842)]"
                          : "w-2.5 h-2.5 bg-[var(--theme-bg-page,#0C0C0C)] border border-[var(--theme-border-strong,#3A3A3A)] opacity-40"
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-black/85" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Names Row (Aligned directly below each node) */}
          <div className="grid grid-cols-4 gap-1 text-center mb-3">
            {STAGES.map((stage, idx) => {
              const isActive = idx === activeStage;
              const isCompleted = idx < activeStage;

              return (
                <div key={stage.id} className="flex flex-col items-center">
                  <span
                    className={`font-mono text-[10px] sm:text-xs tracking-[0.16em] uppercase transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] select-none ${
                      isActive
                        ? "text-[var(--theme-gold-text,#E5B842)] font-semibold opacity-100"
                        : isCompleted
                        ? "text-[var(--theme-text-primary,#F3F3F3)] opacity-70"
                        : "text-[var(--theme-text-muted,#707070)] opacity-35"
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stage Supporting Text (Desktop grid + Mobile active prominent callout) */}
          {/* Desktop/Tablet: all 4 subtitles visible under columns */}
          <div className="hidden sm:grid grid-cols-4 gap-2 text-center">
            {STAGES.map((stage, idx) => {
              const isActive = idx === activeStage;
              return (
                <div key={stage.id} className="px-1">
                  <p
                    className={`text-[11px] leading-snug transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isActive
                        ? "text-[var(--theme-text-primary,#F3F3F3)] font-normal opacity-90"
                        : "text-[var(--theme-text-muted,#707070)] opacity-30"
                    }`}
                  >
                    {stage.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mobile: Focused, high-clarity active stage subtitle */}
          <div className="sm:hidden flex items-center justify-center min-h-[22px] px-2">
            <p className="font-mono text-[11px] text-[var(--theme-text-primary,#F3F3F3)] tracking-wider text-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
              <span className="text-[var(--theme-gold-text,#E5B842)] mr-1.5 font-semibold">
                [{STAGES[activeStage].num}]
              </span>
              {STAGES[activeStage].subtitle}
            </p>
          </div>
        </div>

        {/* 4. Fine Geometric SVG Technical Accent */}
        <div className="w-48 sm:w-64 h-5 flex items-center justify-center text-[var(--theme-border-strong,#262626)] opacity-60">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 240 20"
            fill="none"
            aria-hidden="true"
          >
            {/* Left coordinate datum tick */}
            <line x1="8" y1="6" x2="8" y2="14" stroke="currentColor" strokeWidth="1" />
            <line x1="4" y1="10" x2="12" y2="10" stroke="currentColor" strokeWidth="1" />

            {/* Subtle dashed datum line */}
            <line
              x1="20"
              y1="10"
              x2="220"
              y2="10"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.30"
            />

            {/* Right coordinate datum tick */}
            <line x1="232" y1="6" x2="232" y2="14" stroke="currentColor" strokeWidth="1" />
            <line x1="228" y1="10" x2="236" y2="10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
