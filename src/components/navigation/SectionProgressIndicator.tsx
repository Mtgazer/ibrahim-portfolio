"use client";

import React, { useEffect, useRef } from "react";
import { useActiveSection, bindProgressBar } from "@/lib/scroll-progress";

export default function SectionProgressIndicator() {
  const activeSection = useActiveSection();
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressBarRef.current) return;
    const unbind = bindProgressBar(progressBarRef.current);
    return unbind;
  }, []);

  return (
    <div
      aria-label="Current section and page progress indicator"
      className="fixed z-30 pointer-events-none select-none transition-all duration-300
                 bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-7 md:right-8
                 max-w-[calc(100vw-2rem)]"
      style={{
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
      }}
    >
      <div
        className="flex flex-col gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-[7px]
                   border border-[var(--theme-border,#222222)]
                   bg-[var(--theme-bg-surface,#0C0C0C)]/85 backdrop-blur-md
                   shadow-xs transition-colors duration-200"
      >
        {/* Status Line */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[11px] tracking-wider uppercase">
          {/* Section Number: e.g. 02 */}
          <span className="text-[var(--theme-gold-text,#E5B842)] font-semibold">
            {activeSection.number}
          </span>

          {/* Total Counter: / 05 */}
          <span className="text-[var(--theme-text-muted,#707070)] opacity-75">
            / {String(activeSection.total).padStart(2, "0")}
          </span>

          {/* Subtle Datum Separator */}
          <span
            className="w-1 h-1 rounded-full bg-[var(--theme-border-strong,#333333)] shrink-0"
            aria-hidden="true"
          />

          {/* Section Name: Responsive Display */}
          <span className="text-[var(--theme-text-primary,#F3F3F3)] font-medium truncate max-w-[130px] sm:max-w-[200px]">
            <span className="hidden sm:inline">{activeSection.name}</span>
            <span className="sm:hidden">{activeSection.shortName}</span>
          </span>
        </div>

        {/* Thin Gold Progress Bar */}
        <div
          className="w-full h-[1.5px] bg-[var(--theme-border,#1F1F1F)] rounded-full overflow-hidden"
          aria-hidden="true"
        >
          <div
            ref={progressBarRef}
            className="h-full bg-[var(--theme-gold-text,#E5B842)] origin-left will-change-transform"
            style={{
              transform: "scaleX(0)",
              transition: "transform 80ms linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
