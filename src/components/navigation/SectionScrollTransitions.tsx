"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { subscribeProgress } from "@/lib/scroll-progress";

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

export interface Point {
  x: number;
  y: number;
}

export interface PathGeometry {
  pathD: string;
  ticksD: string;
  points: Point[];
  totalLength: number;
  segLengths: number[];
  cumLengths: number[];
}

export const MARKER_IDS = [
  "section-marker-field-notes",
  "section-marker-projects",
  "section-marker-about",
  "section-marker-contact",
] as const;

export const PULSE_RING_IDS = [
  "section-pulse-ring-field-notes",
  "section-pulse-ring-projects",
  "section-pulse-ring-about",
  "section-pulse-ring-contact",
] as const;

/**
 * Builds an intentional geometric path segment between two section markers:
 * - Drops straight down from marker dot
 * - Curves smoothly with subtle fillet into a 45-degree chamfer
 * - Travels down through the margin whitespace gutter corridor
 * - Curves smoothly out of the corridor into a 45-degree approach chamfer
 * - Enters straight down into the next marker dot
 * - Generates architectural datum ticks at transition vertices
 */
function buildFilletedSegment(
  pStart: Point,
  pEnd: Point,
  isMobile: boolean
): { d: string; ticks: string[]; length: number } {
  const r = isMobile ? 4 : 8;
  const sin45 = 0.7071;
  const cos45 = 0.7071;

  // Dedicated Outer Gutter Corridor X:
  // Desktop (>= 1024px): 42px left offset in margin whitespace, safely away from headings & cards
  // Mobile (< 1024px): ~8px inside the 16px page padding, safely away from text & cards
  const gutterOffset = isMobile ? 12 : 42;
  const gutterX = isMobile
    ? Math.max(7, Math.min(10, pStart.x - gutterOffset))
    : Math.max(16, pStart.x - gutterOffset);
  const gutterXEnd = isMobile
    ? Math.max(7, Math.min(10, pEnd.x - gutterOffset))
    : Math.max(16, pEnd.x - gutterOffset);

  const yDrop = isMobile ? 10 : 14;
  const pStartY_drop = pStart.y + yDrop;

  const dxStart = Math.abs(pStart.x - gutterX);
  const yGutterStart = pStartY_drop + dxStart;

  const yApproach = isMobile ? 10 : 14;
  const pEndY_approach = pEnd.y - yApproach;
  const dxEnd = Math.abs(pEnd.x - gutterXEnd);
  const yGutterEnd = pEndY_approach - dxEnd;

  const parts: string[] = [];
  const ticks: string[] = [];

  // Defensive fallback if two markers are unusually compressed
  if (yGutterEnd <= yGutterStart) {
    parts.push(`L ${pEnd.x.toFixed(1)} ${pEnd.y.toFixed(1)}`);
    return {
      d: parts.join(" "),
      ticks,
      length: Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y),
    };
  }

  // 1. Straight vertical drop from pStart
  parts.push(`L ${pStart.x.toFixed(1)} ${(pStartY_drop - r).toFixed(1)}`);

  // Fillet 1: curve from vertical into 45-deg chamfer
  parts.push(
    `Q ${pStart.x.toFixed(1)} ${pStartY_drop.toFixed(1)}, ${(pStart.x - r * sin45).toFixed(1)} ${(pStartY_drop + r * cos45).toFixed(1)}`
  );

  // 2. 45-deg angled chamfer into gutter corridor
  parts.push(
    `L ${(gutterX + r * sin45).toFixed(1)} ${(yGutterStart - r * cos45).toFixed(1)}`
  );

  // Fillet 2: curve from chamfer into vertical gutter corridor
  parts.push(
    `Q ${gutterX.toFixed(1)} ${yGutterStart.toFixed(1)}, ${gutterX.toFixed(1)} ${(yGutterStart + r).toFixed(1)}`
  );

  // Architectural datum tick at gutter start
  const tickW = isMobile ? 2.5 : 4;
  ticks.push(
    `M ${(gutterX - tickW).toFixed(1)} ${yGutterStart.toFixed(1)} L ${(gutterX + tickW).toFixed(1)} ${yGutterStart.toFixed(1)}`
  );

  // 3. Vertical corridor through dedicated outer whitespace
  if (Math.abs(gutterX - gutterXEnd) < 1) {
    parts.push(`L ${gutterX.toFixed(1)} ${(yGutterEnd - r).toFixed(1)}`);
  } else {
    const midY = (yGutterStart + yGutterEnd) / 2;
    parts.push(`L ${gutterX.toFixed(1)} ${(midY - 12).toFixed(1)}`);
    parts.push(`L ${gutterXEnd.toFixed(1)} ${(midY + 12).toFixed(1)}`);
    parts.push(`L ${gutterXEnd.toFixed(1)} ${(yGutterEnd - r).toFixed(1)}`);
  }

  // Architectural datum tick at gutter end
  ticks.push(
    `M ${(gutterXEnd - tickW).toFixed(1)} ${yGutterEnd.toFixed(1)} L ${(gutterXEnd + tickW).toFixed(1)} ${yGutterEnd.toFixed(1)}`
  );

  // Fillet 3: curve from vertical into chamfer towards pEnd
  parts.push(
    `Q ${gutterXEnd.toFixed(1)} ${yGutterEnd.toFixed(1)}, ${(gutterXEnd + r * sin45).toFixed(1)} ${(yGutterEnd + r * cos45).toFixed(1)}`
  );

  // 4. Chamfer back in toward marker
  parts.push(
    `L ${(pEnd.x - r * sin45).toFixed(1)} ${(pEndY_approach - r * cos45).toFixed(1)}`
  );

  // Fillet 4: curve from chamfer into vertical entry
  parts.push(
    `Q ${pEnd.x.toFixed(1)} ${pEndY_approach.toFixed(1)}, ${pEnd.x.toFixed(1)} ${(pEndY_approach + r).toFixed(1)}`
  );

  // 5. Vertical entry into pEnd
  parts.push(`L ${pEnd.x.toFixed(1)} ${pEnd.y.toFixed(1)}`);

  // Architectural datum tick at marker
  ticks.push(
    `M ${(pEnd.x - tickW).toFixed(1)} ${pEnd.y.toFixed(1)} L ${(pEnd.x + tickW).toFixed(1)} ${pEnd.y.toFixed(1)}`
  );

  const lVertical1 = yDrop;
  const lChamfer1 = Math.hypot(dxStart, dxStart);
  const lCorridor = Math.max(0, yGutterEnd - yGutterStart);
  const lChamfer2 = Math.hypot(dxEnd, dxEnd);
  const lVertical2 = yApproach;
  const segLen = lVertical1 + lChamfer1 + lCorridor + lChamfer2 + lVertical2;

  return {
    d: parts.join(" "),
    ticks,
    length: segLen,
  };
}

function triggerSectionPulse(markerEl: HTMLElement, ringEl: HTMLElement | null) {
  markerEl.classList.remove("section-pulse-active");
  void markerEl.offsetWidth; // Force reflow
  markerEl.classList.add("section-pulse-active");

  if (ringEl) {
    ringEl.classList.remove("section-pulse-ring-active");
    void ringEl.offsetWidth; // Force reflow
    ringEl.classList.add("section-pulse-ring-active");
  }

  setTimeout(() => {
    markerEl.classList.remove("section-pulse-active");
    ringEl?.classList.remove("section-pulse-ring-active");
  }, 750);
}

export default function SectionScrollTransitions() {
  const [geometry, setGeometry] = useState<PathGeometry | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientPathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const tipHighlightRef = useRef<SVGCircleElement>(null);

  const hasPulsedRef = useRef<boolean[]>([false, false, false, false]);
  const isInitialMountRef = useRef<boolean>(true);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Measure section markers and construct the continuous geometric path with clean hero handoff
  useEffect(() => {
    if (typeof window === "undefined") return;

    const measureAndBuildPath = () => {
      const markers = MARKER_IDS.map((id) => document.getElementById(id));
      if (markers.some((m) => !m)) return;

      const mainEl = containerRef.current?.parentElement;
      if (!mainEl) return;

      const mainRect = mainEl.getBoundingClientRect();

      const points: Point[] = markers.map((m) => {
        const r = m!.getBoundingClientRect();
        return {
          x: r.left - mainRect.left + r.width / 2,
          y: r.top - mainRect.top + r.height / 2,
        };
      });

      const isMobile = window.innerWidth < 1024;
      const segLengths: number[] = [];
      const cumLengths: number[] = [0];
      const dParts: string[] = [];
      const tickParts: string[] = [];

      // Clean visual handoff near the bottom of the hero into Field Notes:
      // A vertical datum stem extends from the bottom of the hero (64px desktop / 36px mobile above Field Notes marker)
      // directly into Marker 02 (Field Notes). This avoids any competing vertical rail over the hero's artwork.
      const pFN = points[0];
      const handoffStemLength = isMobile ? 36 : 64;
      const yHandoff = pFN.y - handoffStemLength;
      const tickHalf = isMobile ? 2.5 : 4;

      // Handoff entrance datum tick at bottom of hero
      tickParts.push(
        `M ${(pFN.x - tickHalf).toFixed(1)} ${yHandoff.toFixed(1)} L ${(pFN.x + tickHalf).toFixed(1)} ${yHandoff.toFixed(1)}`
      );

      // Start path at the clean hero handoff point and drop into Field Notes marker
      dParts.push(`M ${pFN.x.toFixed(1)} ${yHandoff.toFixed(1)}`);
      dParts.push(`L ${pFN.x.toFixed(1)} ${pFN.y.toFixed(1)}`);

      // Datum tick at Field Notes marker
      tickParts.push(
        `M ${(pFN.x - tickHalf).toFixed(1)} ${pFN.y.toFixed(1)} L ${(pFN.x + tickHalf).toFixed(1)} ${pFN.y.toFixed(1)}`
      );

      cumLengths[0] = handoffStemLength;

      // Connect sections through dedicated outer whitespace gutter:
      // Field Notes (p0) -> Selected Work (p1) -> About & Capabilities (p2) -> Contact (p3)
      for (let i = 0; i < points.length - 1; i++) {
        const pStart = points[i];
        const pEnd = points[i + 1];

        const seg = buildFilletedSegment(pStart, pEnd, isMobile);
        dParts.push(seg.d);
        tickParts.push(...seg.ticks);
        segLengths.push(seg.length);
        cumLengths.push(cumLengths[i] + seg.length);
      }

      const totalLength = cumLengths[cumLengths.length - 1];
      const pathD = dParts.join(" ");
      const ticksD = tickParts.join(" ");

      setGeometry({
        pathD,
        ticksD,
        points,
        totalLength,
        segLengths,
        cumLengths,
      });
    };

    measureAndBuildPath();

    window.addEventListener("resize", measureAndBuildPath, { passive: true });
    const timer1 = setTimeout(measureAndBuildPath, 350);
    const timer2 = setTimeout(measureAndBuildPath, 1200);

    if (document.fonts) {
      document.fonts.ready.then(measureAndBuildPath).catch(() => {});
    }

    let resizeObserver: ResizeObserver | null = null;
    const mainEl = containerRef.current?.parentElement;
    if (mainEl && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        measureAndBuildPath();
      });
      resizeObserver.observe(mainEl);
    }

    return () => {
      window.removeEventListener("resize", measureAndBuildPath);
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  // Update animated signal trace based on shared scroll progress
  useEffect(() => {
    if (!geometry) return;

    const updateSignalTrace = () => {
      const mainEl = containerRef.current?.parentElement;
      if (!mainEl) return;

      const mainRect = mainEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const eyeLineY = windowHeight * 0.42; // Unified 42% reading eye line matching scroll-progress.ts
      const scrollYInMain = -mainRect.top + eyeLineY;

      const pFN = geometry.points[0];
      const pProjects = geometry.points[1];
      const pAbout = geometry.points[2];
      const pContact = geometry.points[3];

      const handoffStemLength = geometry.cumLengths[0];
      const yHandoff = pFN.y - handoffStemLength;

      let drawnDistance = 0;

      if (scrollYInMain <= yHandoff) {
        drawnDistance = 0;
      } else if (scrollYInMain < pFN.y) {
        const ratio = (scrollYInMain - yHandoff) / (pFN.y - yHandoff);
        drawnDistance = Math.max(0, Math.min(1, ratio)) * handoffStemLength;
      } else if (scrollYInMain < pProjects.y) {
        const ratio = (scrollYInMain - pFN.y) / (pProjects.y - pFN.y);
        drawnDistance =
          geometry.cumLengths[0] +
          Math.max(0, Math.min(1, ratio)) * geometry.segLengths[0];
      } else if (scrollYInMain < pAbout.y) {
        const ratio = (scrollYInMain - pProjects.y) / (pAbout.y - pProjects.y);
        drawnDistance =
          geometry.cumLengths[1] +
          Math.max(0, Math.min(1, ratio)) * geometry.segLengths[1];
      } else if (scrollYInMain < pContact.y) {
        const ratio = (scrollYInMain - pAbout.y) / (pContact.y - pAbout.y);
        drawnDistance =
          geometry.cumLengths[2] +
          Math.max(0, Math.min(1, ratio)) * geometry.segLengths[2];
      } else {
        drawnDistance = geometry.totalLength;
      }

      // Handle bottom of page
      if (typeof window !== "undefined") {
        const docHeight = document.documentElement.scrollHeight;
        if (window.innerHeight + window.scrollY >= docHeight - 70) {
          drawnDistance = geometry.totalLength;
        }
      }

      drawnDistance = Math.max(0, Math.min(geometry.totalLength, drawnDistance));

      // 1. Direct hardware-accelerated update on gold path stroke
      const pathEl = progressPathRef.current;
      if (pathEl) {
        const offset = Math.max(0, geometry.totalLength - drawnDistance);
        pathEl.style.strokeDashoffset = `${offset.toFixed(1)}px`;
      }

      // 2. Direct update on traveling highlight node
      const tipEl = tipHighlightRef.current;
      if (tipEl && pathEl) {
        if (!reducedMotion && drawnDistance > 4 && drawnDistance < geometry.totalLength - 2) {
          try {
            const pt = pathEl.getPointAtLength(drawnDistance);
            tipEl.setAttribute("cx", pt.x.toFixed(1));
            tipEl.setAttribute("cy", pt.y.toFixed(1));
            tipEl.style.opacity = "1";
          } catch {
            tipEl.style.opacity = "0";
          }
        } else {
          tipEl.style.opacity = "0";
        }
      }

      // 3. Update section markers (reached / upcoming states and pulse triggers)
      MARKER_IDS.forEach((id, idx) => {
        const markerEl = document.getElementById(id);
        if (!markerEl) return;

        const targetDistance = geometry.cumLengths[idx];
        const isReached = drawnDistance >= targetDistance - 4;

        if (isReached) {
          markerEl.classList.add("section-marker-reached");
          markerEl.classList.remove("section-marker-upcoming");
        } else {
          markerEl.classList.add("section-marker-upcoming");
          markerEl.classList.remove("section-marker-reached");
        }

        // Pulse trigger when entering reading threshold
        if (!reducedMotion) {
          const ringEl = document.getElementById(PULSE_RING_IDS[idx]);
          const distFromMarker = drawnDistance - targetDistance;

          if (isInitialMountRef.current) {
            if (isReached) {
              hasPulsedRef.current[idx] = true;
            }
          } else {
            if (distFromMarker >= -8 && distFromMarker <= 60) {
              if (!hasPulsedRef.current[idx]) {
                hasPulsedRef.current[idx] = true;
                triggerSectionPulse(markerEl, ringEl);
              }
            } else if (distFromMarker < -50 || distFromMarker > 180) {
              hasPulsedRef.current[idx] = false;
            }
          }
        }
      });

      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
      }
    };

    // Run initial pass to synchronize with initial scroll or hash anchor
    updateSignalTrace();

    // Subscribe to shared scroll controller (zero duplicate window listeners)
    const unsubscribeProgress = subscribeProgress(() => {
      updateSignalTrace();
    });

    return () => {
      unsubscribeProgress();
    };
  }, [geometry, reducedMotion]);

  if (!geometry) {
    return <div ref={containerRef} className="hidden" aria-hidden="true" />;
  }

  const isMobile = typeof window !== "undefined" ? window.innerWidth < 1024 : false;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none z-20 overflow-visible"
    >
      {/* Continuous Geometric Section Path */}
      <svg
        className="w-full h-full pointer-events-none overflow-visible"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Layer A — Ambient Base Track: Subdued gold-neutral geometric route */}
        <path
          ref={ambientPathRef}
          d={geometry.pathD}
          fill="none"
          stroke="var(--theme-ambient-path, rgba(229, 184, 66, 0.16))"
          strokeWidth={isMobile ? "1" : "1.25"}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />

        {/* Ambient Datum Reference Ticks */}
        <path
          d={geometry.ticksD}
          fill="none"
          stroke="var(--theme-ambient-path, rgba(229, 184, 66, 0.16))"
          strokeWidth="1"
          opacity="0.85"
          className="transition-colors duration-300"
        />

        {/* Layer B — Active Signal Trace: Scroll-driven gold illumination */}
        <path
          ref={progressPathRef}
          d={geometry.pathD}
          fill="none"
          stroke="var(--theme-gold-text, #E5B842)"
          strokeWidth={isMobile ? "1.5" : "1.75"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${geometry.totalLength.toFixed(1)} ${geometry.totalLength.toFixed(1)}`}
          strokeDashoffset={`${geometry.totalLength.toFixed(1)}px`}
          style={{
            filter: "var(--theme-signal-shadow, drop-shadow(0 0 4px rgba(229, 184, 66, 0.6)))",
            transition: reducedMotion ? "none" : undefined,
          }}
        />

        {/* Active Tip Traveling Highlight Node */}
        {!reducedMotion && (
          <circle
            ref={tipHighlightRef}
            cx="0"
            cy="0"
            r={isMobile ? "2" : "2.5"}
            fill="var(--theme-gold-text, #E5B842)"
            style={{
              opacity: 0,
              filter: "drop-shadow(0 0 5px rgba(229, 184, 66, 0.9))",
              transition: "opacity 0.2s ease-out",
            }}
          />
        )}
      </svg>
    </div>
  );
}
