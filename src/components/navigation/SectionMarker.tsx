"use client";

import React from "react";
import { useActiveSection } from "@/lib/scroll-progress";

interface SectionMarkerProps {
  sectionId: string;
  className?: string;
}

/**
 * Minimal standalone circular section marker.
 * Replaces the connected decorative golden path with a subtle spatial orientation dot.
 * Illuminates in gold with restrained glow when its section is active in the viewport.
 */
export default function SectionMarker({
  sectionId,
  className = "",
}: SectionMarkerProps) {
  const activeSection = useActiveSection();
  const isActive = activeSection.id === sectionId;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <span
        aria-hidden="true"
        className={`inline-block rounded-full transition-all duration-300 ease-out ${
          isActive
            ? "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[var(--theme-gold-text,#E5B842)] shadow-[0_0_8px_rgba(229,184,66,0.65)] scale-110 opacity-100"
            : "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[var(--theme-gold-text,#E5B842)]/25 border border-[#3A3A40] scale-100 opacity-45"
        }`}
      />
    </div>
  );
}
