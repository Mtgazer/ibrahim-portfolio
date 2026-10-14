"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";

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

interface MarkerCoords {
  x: number;
  y1: number;
  y2: number;
  y3: number;
  y4: number;
  totalLength: number;
}

const MARKER_IDS = [
  "section-marker-field-notes",
  "section-marker-projects",
  "section-marker-about",
  "section-marker-contact",
] as const;

export default function SectionProgressLine() {
  const [coords, setCoords] = useState<MarkerCoords | null>(null);
  const progressLineRef = useRef<SVGLineElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Measure and align to real DOM markers
  useEffect(() => {
    // Desktop only (>= 1024px)
    if (typeof window === "undefined") return;

    const measureMarkers = () => {
      if (window.innerWidth < 1024) {
        setCoords(null);
        return;
      }

      const m1 = document.getElementById(MARKER_IDS[0]);
      const m2 = document.getElementById(MARKER_IDS[1]);
      const m3 = document.getElementById(MARKER_IDS[2]);
      const m4 = document.getElementById(MARKER_IDS[3]);

      if (!m1 || !m2 || !m3 || !m4) return;

      const mainEl = containerRef.current?.parentElement;
      if (!mainEl) return;

      const mainRect = mainEl.getBoundingClientRect();
      const r1 = m1.getBoundingClientRect();
      const r2 = m2.getBoundingClientRect();
      const r3 = m3.getBoundingClientRect();
      const r4 = m4.getBoundingClientRect();

      // Compute center coordinates relative to main container
      const x = r1.left - mainRect.left + r1.width / 2;
      const y1 = r1.top - mainRect.top + r1.height / 2;
      const y2 = r2.top - mainRect.top + r2.height / 2;
      const y3 = r3.top - mainRect.top + r3.height / 2;
      const y4 = r4.top - mainRect.top + r4.height / 2;

      const totalLength = Math.max(y4 - y1, 0);

      setCoords({ x, y1, y2, y3, y4, totalLength });
    };

    measureMarkers();

    // Re-measure on resize, font/image load settlements
    window.addEventListener("resize", measureMarkers, { passive: true });
    const timer1 = setTimeout(measureMarkers, 400);
    const timer2 = setTimeout(measureMarkers, 1500);

    // ResizeObserver on main container to catch dynamic height shifts
    let resizeObserver: ResizeObserver | null = null;
    const mainEl = containerRef.current?.parentElement;
    if (mainEl && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        measureMarkers();
      });
      resizeObserver.observe(mainEl);
    }

    return () => {
      window.removeEventListener("resize", measureMarkers);
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  // Scroll Progress Engine: 100% natural document scroll driven, zero React re-renders
  useEffect(() => {
    if (!coords || typeof window === "undefined") return;

    const m1 = document.getElementById(MARKER_IDS[0]);
    const m2 = document.getElementById(MARKER_IDS[1]);
    const m3 = document.getElementById(MARKER_IDS[2]);
    const m4 = document.getElementById(MARKER_IDS[3]);
    const markers = [m1, m2, m3, m4];

    const updateProgress = () => {
      isUpdatingRef.current = false;
      if (window.innerWidth < 1024) return;

      const mainEl = containerRef.current?.parentElement;
      if (!mainEl) return;

      const mainRect = mainEl.getBoundingClientRect();
      // Reference line aligned with Header's scroll-spy (35% from viewport top)
      const currentScrollYInMain = -mainRect.top + window.innerHeight * 0.35;

      const { y1, y2, y3, y4, totalLength } = coords;
      if (totalLength <= 0) return;

      // Calculate progress length
      let drawnLength = 0;
      if (currentScrollYInMain <= y1) {
        drawnLength = 0;
      } else if (currentScrollYInMain >= y4) {
        drawnLength = totalLength;
      } else {
        drawnLength = currentScrollYInMain - y1;
      }

      // Mutate progress line strokeDashoffset directly
      if (progressLineRef.current) {
        const offset = totalLength - drawnLength;
        progressLineRef.current.style.strokeDashoffset = `${offset.toFixed(1)}px`;
      }

      // Highlight markers as progress reaches their respective Y coordinates
      const markerThresholds = [y1, y2, y3, y4];
      markers.forEach((marker, idx) => {
        if (!marker) return;
        const reached = currentScrollYInMain >= markerThresholds[idx] - 8;
        if (reached) {
          marker.style.transform = "scale(1.4)";
          marker.style.boxShadow = "0 0 8px rgba(229,184,66,0.9)";
        } else {
          marker.style.transform = "scale(1)";
          marker.style.boxShadow = "0 0 6px rgba(229,184,66,0.5)";
        }
      });
    };

    const onScroll = () => {
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true;
        requestAnimationFrame(updateProgress);
      }
    };

    // Initial update
    updateProgress();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      // Clean up marker styles on unmount
      markers.forEach((marker) => {
        if (marker) {
          marker.style.transform = "";
          marker.style.boxShadow = "";
        }
      });
    };
  }, [coords, reducedMotion]);

  if (!coords) {
    return <div ref={containerRef} className="hidden" aria-hidden="true" />;
  }

  const { x, y1, y4, totalLength } = coords;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="hidden lg:block absolute inset-0 pointer-events-none select-none z-0 overflow-visible"
    >
      <svg
        className="w-full h-full pointer-events-none overflow-visible"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Layer 1: Subtle Neutral Base Track */}
        <line
          x1={x}
          y1={y1}
          x2={x}
          y2={y4}
          stroke="var(--theme-border-strong, #262626)"
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.75"
        />

        {/* Layer 2: Gold Scroll-Driven Progress Stroke */}
        <line
          ref={progressLineRef}
          x1={x}
          y1={y1}
          x2={x}
          y2={y4}
          stroke="var(--theme-gold-text, #E5B842)"
          strokeWidth="1.5"
          strokeDasharray={totalLength}
          strokeDashoffset={reducedMotion ? 0 : totalLength}
          style={{
            filter: "drop-shadow(0 0 3px rgba(229, 184, 66, 0.55))",
            transition: reducedMotion ? "none" : undefined,
          }}
        />
      </svg>
    </div>
  );
}
