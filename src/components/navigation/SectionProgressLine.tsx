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

interface PathData {
  pathD: string;
  totalLength: number;
  markerDistances: number[];
  yStart: number;
  yEnd: number;
}

const MARKER_IDS = [
  "section-marker-field-notes",
  "section-marker-projects",
  "section-marker-about",
  "section-marker-contact",
] as const;

export default function SectionProgressLine() {
  const [pathData, setPathData] = useState<PathData | null>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Measure and align to real DOM markers
  useEffect(() => {
    if (typeof window === "undefined") return;

    const measureMarkers = () => {
      // Desktop only (>= 1024px)
      if (window.innerWidth < 1024) {
        setPathData(null);
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

      // Compute exact center coordinates of each marker relative to <main>
      const points = [
        { x: r1.left - mainRect.left + r1.width / 2, y: r1.top - mainRect.top + r1.height / 2 },
        { x: r2.left - mainRect.left + r2.width / 2, y: r2.top - mainRect.top + r2.height / 2 },
        { x: r3.left - mainRect.left + r3.width / 2, y: r3.top - mainRect.top + r3.height / 2 },
        { x: r4.left - mainRect.left + r4.width / 2, y: r4.top - mainRect.top + r4.height / 2 },
      ];

      // Build continuous SVG path passing through all 4 section marker centers
      const baseX = points[0].x;
      let d = `M ${baseX.toFixed(1)} ${points[0].y.toFixed(1)}`;
      let totalLength = 0;
      const markerDistances: number[] = [0];

      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const dx = next.x - curr.x;
        const dy = next.y - curr.y;

        // Snap to common column if subpixel offset is minor (<= 2px)
        if (Math.abs(dx) <= 2) {
          d += ` L ${curr.x.toFixed(1)} ${next.y.toFixed(1)}`;
          totalLength += dy;
        } else {
          // Gentle S-curve if any structural horizontal difference exists
          const c1y = (curr.y + dy * 0.35).toFixed(1);
          const c2y = (next.y - dy * 0.35).toFixed(1);
          d += ` C ${curr.x.toFixed(1)} ${c1y}, ${next.x.toFixed(1)} ${c2y}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
          totalLength += Math.hypot(dx, dy);
        }
        markerDistances.push(totalLength);
      }

      setPathData({
        pathD: d,
        totalLength,
        markerDistances,
        yStart: points[0].y,
        yEnd: points[points.length - 1].y,
      });
    };

    measureMarkers();

    // Re-measure on resize and layout stabilization
    window.addEventListener("resize", measureMarkers, { passive: true });
    const timer1 = setTimeout(measureMarkers, 350);
    const timer2 = setTimeout(measureMarkers, 1200);
    const timer3 = setTimeout(measureMarkers, 2500);

    // Font loading observer to adjust if webfonts shift layout heights
    if (document.fonts) {
      document.fonts.ready.then(measureMarkers).catch(() => {});
    }

    // ResizeObserver on parent container
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
      clearTimeout(timer3);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  // Scroll Progress Engine: Natural document scroll driven, zero React re-renders
  useEffect(() => {
    if (!pathData || typeof window === "undefined") return;

    const m1 = document.getElementById(MARKER_IDS[0]);
    const m2 = document.getElementById(MARKER_IDS[1]);
    const m3 = document.getElementById(MARKER_IDS[2]);
    const m4 = document.getElementById(MARKER_IDS[3]);
    const markers = [m1, m2, m3, m4];

    // Measure exact SVG geometry length if rendered
    let actualLength = pathData.totalLength;
    if (progressPathRef.current) {
      try {
        const svgLen = progressPathRef.current.getTotalLength();
        if (svgLen > 0) {
          actualLength = svgLen;
        }
      } catch {
        // Fallback to computed totalLength
      }
    }

    const updateProgress = () => {
      isUpdatingRef.current = false;
      if (window.innerWidth < 1024) return;

      const mainEl = containerRef.current?.parentElement;
      if (!mainEl) return;

      const mainRect = mainEl.getBoundingClientRect();
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      const { yStart, yEnd, markerDistances } = pathData;
      if (actualLength <= 0) return;

      let drawnLength = 0;

      // 1. Guaranteed 0% when near top of hero
      if (scrollY < 80) {
        drawnLength = 0;
      }
      // 2. Guaranteed 100% when near bottom (Contact / footer)
      else if (windowHeight + scrollY >= docHeight - 60) {
        drawnLength = actualLength;
      }
      // 3. Continuous scroll tracking across sections
      else {
        // Natural focal eye line 40% from top of viewport
        const focalOffset = Math.min(windowHeight * 0.40, 360);
        const currentScrollYInMain = -mainRect.top + focalOffset;

        if (currentScrollYInMain <= yStart) {
          drawnLength = 0;
        } else if (currentScrollYInMain >= yEnd) {
          drawnLength = actualLength;
        } else {
          // Scale progress smoothly across the full path
          const ratio = (currentScrollYInMain - yStart) / (yEnd - yStart);
          drawnLength = Math.max(0, Math.min(actualLength, ratio * actualLength));
        }
      }

      // Mutate progress path strokeDashoffset directly
      if (progressPathRef.current) {
        progressPathRef.current.style.strokeDasharray = `${actualLength.toFixed(1)} ${actualLength.toFixed(1)}`;
        const offset = Math.max(0, actualLength - drawnLength);
        progressPathRef.current.style.strokeDashoffset = `${offset.toFixed(1)}px`;
      }

      // Highlight markers as progress reaches them
      markers.forEach((marker, idx) => {
        if (!marker) return;
        const targetDist = markerDistances[idx];
        const isReached = drawnLength >= targetDist - 3;

        if (isReached) {
          marker.style.transform = "scale(1.4)";
          marker.style.boxShadow = "0 0 10px var(--theme-gold-glow, rgba(229,184,66,0.95))";
          marker.style.backgroundColor = "var(--theme-gold-hover, #F0C44E)";
        } else {
          marker.style.transform = "scale(1)";
          marker.style.boxShadow = "0 0 6px var(--theme-gold-glow, rgba(229,184,66,0.5))";
          marker.style.backgroundColor = "var(--theme-gold-text, #E5B842)";
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
          marker.style.backgroundColor = "";
        }
      });
    };
  }, [pathData, reducedMotion]);

  if (!pathData) {
    return <div ref={containerRef} className="hidden" aria-hidden="true" />;
  }

  const { pathD, totalLength } = pathData;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="hidden lg:block absolute inset-0 pointer-events-none select-none z-20 overflow-visible"
    >
      <svg
        className="w-full h-full pointer-events-none overflow-visible"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Layer 1: Refined Subtle Neutral Base Path Track */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--theme-border-strong, #3A3A3A)"
          strokeWidth="1.5"
          strokeDasharray="3 4"
          opacity="0.75"
        />

        {/* Layer 2: Gold Scroll-Driven Progress Stroke */}
        <path
          ref={progressPathRef}
          d={pathD}
          fill="none"
          stroke="var(--theme-gold-text, #E5B842)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${totalLength.toFixed(1)} ${totalLength.toFixed(1)}`}
          strokeDashoffset={reducedMotion ? 0 : totalLength.toFixed(1)}
          style={{
            filter: "drop-shadow(0 0 3.5px rgba(229, 184, 66, 0.75))",
            transition: reducedMotion ? "none" : undefined,
          }}
        />
      </svg>
    </div>
  );
}
