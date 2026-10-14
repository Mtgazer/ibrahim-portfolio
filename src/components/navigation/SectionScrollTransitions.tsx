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

interface Point {
  x: number;
  y: number;
}

interface PathGeometry {
  pathD: string;
  ticksD: string;
  points: Point[];
  totalLength: number;
  segLengths: number[];
  cumLengths: number[];
}

const MARKER_IDS = [
  "section-marker-field-notes",
  "section-marker-projects",
  "section-marker-about",
  "section-marker-contact",
] as const;

const PULSE_RING_IDS = [
  "section-pulse-ring-field-notes",
  "section-pulse-ring-projects",
  "section-pulse-ring-about",
  "section-pulse-ring-contact",
] as const;

export default function SectionScrollTransitions() {
  const [geometry, setGeometry] = useState<PathGeometry | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Direct DOM refs to avoid React re-render overhead during high-frequency scroll
  const progressPathRef = useRef<SVGPathElement>(null);
  const ambientPathRef = useRef<SVGPathElement>(null);
  const tipHighlightRef = useRef<SVGCircleElement>(null);

  // Pulse tracking to prevent repeated flashing
  const hasPulsedRef = useRef<boolean[]>([false, false, false, false]);
  const isUpdatingRef = useRef(false);
  const isInitialMountRef = useRef(true);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Measure section markers and generate the continuous geometric path
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

      // Construct continuous geometric path connecting:
      // p0 (Field Notes) -> p1 (Selected Work) -> p2 (About) -> p3 (Contact)
      //
      // For each segment i from p[i] to p[i+1]:
      // - Step straight down from p[i]
      // - Chamfer 45-deg into whitespace gutter
      // - Travel down through the clean gutter corridor (safe clearance from text/cards)
      // - Chamfer 45-deg in toward next marker p[i+1]
      // - Step straight down into center of p[i+1]
      const isMobile = window.innerWidth < 1024;
      const segLengths: number[] = [];
      const cumLengths: number[] = [0];
      const dParts: string[] = [];
      const tickParts: string[] = [];

      dParts.push(`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`);
      const startTickHalf = isMobile ? 2.5 : 4;
      tickParts.push(
        `M ${(points[0].x - startTickHalf).toFixed(1)} ${points[0].y.toFixed(1)} L ${(points[0].x + startTickHalf).toFixed(1)} ${points[0].y.toFixed(1)}`
      );

      for (let i = 0; i < points.length - 1; i++) {
        const pStart = points[i];
        const pEnd = points[i + 1];

        // Responsive gutter calculation:
        // Desktop (>= 1024px): 40px left offset from marker (min 14px)
        // Mobile / Tablet (< 1024px): Position safely inside the left page gutter margin (x = ~7.5px)
        // Leaving 8.5px+ clearance from all headings, cards, project images, and buttons
        const gutterX_start = isMobile
          ? Math.max(6, Math.min(12, pStart.x - 12.5))
          : Math.max(14, pStart.x - 40);
        const gutterX_end = isMobile
          ? Math.max(6, Math.min(12, pEnd.x - 12.5))
          : Math.max(14, pEnd.x - 40);

        const yDrop = pStart.y + (isMobile ? 8 : 10);
        const yGutterStart = pStart.y + (isMobile ? 20 : 36);
        const yGutterEnd = pEnd.y - (isMobile ? 20 : 36);
        const yApproach = pEnd.y - (isMobile ? 8 : 10);

        // Path coordinates for this segment
        dParts.push(`L ${pStart.x.toFixed(1)} ${yDrop.toFixed(1)}`);
        dParts.push(`L ${gutterX_start.toFixed(1)} ${yGutterStart.toFixed(1)}`);
        dParts.push(`L ${gutterX_end.toFixed(1)} ${yGutterEnd.toFixed(1)}`);
        dParts.push(`L ${pEnd.x.toFixed(1)} ${yApproach.toFixed(1)}`);
        dParts.push(`L ${pEnd.x.toFixed(1)} ${pEnd.y.toFixed(1)}`);

        // Architectural datum ticks at key transition junctures
        if (!isMobile) {
          tickParts.push(
            `M ${(gutterX_start - 3).toFixed(1)} ${yGutterStart.toFixed(1)} L ${(gutterX_start + 3).toFixed(1)} ${yGutterStart.toFixed(1)}`
          );
          tickParts.push(
            `M ${(gutterX_end - 3).toFixed(1)} ${yGutterEnd.toFixed(1)} L ${(gutterX_end + 3).toFixed(1)} ${yGutterEnd.toFixed(1)}`
          );
          tickParts.push(
            `M ${(pEnd.x - 4).toFixed(1)} ${pEnd.y.toFixed(1)} L ${(pEnd.x + 4).toFixed(1)} ${pEnd.y.toFixed(1)}`
          );
        } else {
          // Streamlined subtle ticks on mobile to preserve minimal clarity
          tickParts.push(
            `M ${(gutterX_start - 2).toFixed(1)} ${yGutterStart.toFixed(1)} L ${(gutterX_start + 2).toFixed(1)} ${yGutterStart.toFixed(1)}`
          );
          tickParts.push(
            `M ${(pEnd.x - 3).toFixed(1)} ${pEnd.y.toFixed(1)} L ${(pEnd.x + 3).toFixed(1)} ${pEnd.y.toFixed(1)}`
          );
        }

        // Calculate segment geometric length
        const l1 = isMobile ? 8 : 10;
        const l2 = Math.hypot(pStart.x - gutterX_start, yGutterStart - yDrop);
        const l3 = Math.hypot(gutterX_end - gutterX_start, yGutterEnd - yGutterStart);
        const l4 = Math.hypot(pEnd.x - gutterX_end, yApproach - yGutterEnd);
        const l5 = isMobile ? 8 : 10;
        const segLen = l1 + l2 + l3 + l4 + l5;

        segLengths.push(segLen);
        cumLengths.push(cumLengths[i] + segLen);
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

  // Scroll Progress Engine: maps scroll smoothly to Signal Trace & Section Pulse
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Trigger subtle section pulse once per entry
    const triggerSectionPulse = (idx: number) => {
      if (reducedMotion) return;

      const markerEl = document.getElementById(MARKER_IDS[idx]);
      const ringEl = document.getElementById(PULSE_RING_IDS[idx]);

      if (markerEl) {
        markerEl.classList.remove("section-pulse-active");
        void markerEl.offsetWidth; // Force reflow
        markerEl.classList.add("section-pulse-active");
      }

      if (ringEl) {
        ringEl.classList.remove("section-pulse-ring-active");
        void ringEl.offsetWidth; // Force reflow
        ringEl.classList.add("section-pulse-ring-active");
      }

      setTimeout(() => {
        markerEl?.classList.remove("section-pulse-active");
        ringEl?.classList.remove("section-pulse-ring-active");
      }, 750);
    };

    const updateTransitions = () => {
      isUpdatingRef.current = false;
      const mainEl = containerRef.current?.parentElement;
      if (!mainEl) return;

      const windowHeight = window.innerHeight;
      const eyeLineY = windowHeight * 0.45; // Section reading reference line

      // 1. Evaluate Section Pulse triggers across all viewports (Mobile & Desktop)
      MARKER_IDS.forEach((id, idx) => {
        const marker = document.getElementById(id);
        if (!marker) return;

        const mRect = marker.getBoundingClientRect();
        const distFromEyeLine = mRect.top - eyeLineY;

        // On initial direct load/refresh at lower anchor, mark visited without flashing
        if (isInitialMountRef.current) {
          if (distFromEyeLine < 0) {
            hasPulsedRef.current[idx] = true;
          }
          return;
        }

        // Section marker reaches eye line reading zone (within 35px)
        if (Math.abs(distFromEyeLine) <= 35) {
          if (!hasPulsedRef.current[idx]) {
            hasPulsedRef.current[idx] = true;
            triggerSectionPulse(idx);
          }
        }
        // Hysteresis: re-arm pulse only when user has scrolled away (> 180px)
        else if (Math.abs(distFromEyeLine) > 180) {
          hasPulsedRef.current[idx] = false;
        }
      });

      // End initial mount check after evaluating markers
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
      }

      // 2. Animate Continuous Signal Trace (Mobile, Tablet & Desktop)
      if (geometry && !reducedMotion) {
        const pathEl = progressPathRef.current;
        const tipEl = tipHighlightRef.current;
        if (!pathEl) return;

        const mainRect = mainEl.getBoundingClientRect();
        const scrollYInMain = -mainRect.top + eyeLineY;

        // Calculate scroll-mapped drawn distance along the geometric path
        let drawnDistance = 0;

        const p0 = geometry.points[0];
        const p1 = geometry.points[1];
        const p2 = geometry.points[2];
        const p3 = geometry.points[3];

        if (scrollYInMain <= p0.y) {
          // Above Field Notes (in Hero section)
          drawnDistance = 0;
        } else if (scrollYInMain < p1.y) {
          // Segment 0: Field Notes -> Selected Work
          const ratio = (scrollYInMain - p0.y) / (p1.y - p0.y);
          drawnDistance = geometry.cumLengths[0] + Math.max(0, Math.min(1, ratio)) * geometry.segLengths[0];
        } else if (scrollYInMain < p2.y) {
          // Segment 1: Selected Work -> About & Capabilities
          const ratio = (scrollYInMain - p1.y) / (p2.y - p1.y);
          drawnDistance = geometry.cumLengths[1] + Math.max(0, Math.min(1, ratio)) * geometry.segLengths[1];
        } else if (scrollYInMain < p3.y) {
          // Segment 2: About & Capabilities -> Contact
          const ratio = (scrollYInMain - p2.y) / (p3.y - p2.y);
          drawnDistance = geometry.cumLengths[2] + Math.max(0, Math.min(1, ratio)) * geometry.segLengths[2];
        } else {
          // At or past Contact
          drawnDistance = geometry.totalLength;
        }

        // Clamp distance to total path length
        drawnDistance = Math.max(0, Math.min(geometry.totalLength, drawnDistance));

        // Direct DOM update: strokeDashoffset controls gold illumination
        const offset = Math.max(0, geometry.totalLength - drawnDistance);
        pathEl.style.strokeDashoffset = `${offset.toFixed(1)}px`;

        // Update active endpoint highlight dot
        if (tipEl) {
          if (drawnDistance > 4 && drawnDistance < geometry.totalLength - 4) {
            try {
              const tipPt = pathEl.getPointAtLength(drawnDistance);
              tipEl.setAttribute("cx", tipPt.x.toFixed(1));
              tipEl.setAttribute("cy", tipPt.y.toFixed(1));
              tipEl.style.opacity = "1";
            } catch {
              tipEl.style.opacity = "0";
            }
          } else {
            tipEl.style.opacity = "0";
          }
        }
      }
    };

    const onScroll = () => {
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true;
        requestAnimationFrame(updateTransitions);
      }
    };

    // Initial pass
    updateTransitions();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [geometry, reducedMotion]);

  if (!geometry) {
    return <div ref={containerRef} className="hidden" aria-hidden="true" />;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none z-20 overflow-visible"
    >
      {/* Continuous Geometric Section Path (Responsive: Mobile, Tablet & Desktop) */}
      <svg
        className="w-full h-full pointer-events-none overflow-visible"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Layer A — Ambient Path: Permanently visible subtle neutral/gold base track */}
        <path
          ref={ambientPathRef}
          d={geometry.pathD}
          fill="none"
          stroke="var(--theme-ambient-path, rgba(229, 184, 66, 0.16))"
          strokeWidth="1.25"
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
          opacity="0.75"
          className="transition-colors duration-300"
        />

        {/* Layer B — Active Signal Trace: Scroll-driven gold illumination */}
        <path
          ref={progressPathRef}
          d={geometry.pathD}
          fill="none"
          stroke="var(--theme-gold-text, #E5B842)"
          strokeWidth="1.75"
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
            r="2.5"
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
