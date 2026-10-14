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

interface TraceConfig {
  id: string;
  fromSection: string;
  toSection: string;
  pathD: string;
  tickD: string;
  totalLength: number;
  targetMarkerId: string;
  targetY: number;
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
  const [traces, setTraces] = useState<TraceConfig[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trace DOM element refs for direct mutation (zero React re-renders on scroll)
  const traceGroupRefs = useRef<(SVGGElement | null)[]>([]);
  const progressPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const tipHighlightRefs = useRef<(SVGCircleElement | null)[]>([]);

  // Pulse tracking to prevent repeated flashing
  const hasPulsedRef = useRef<Record<string, boolean>>({
    [MARKER_IDS[0]]: false,
    [MARKER_IDS[1]]: false,
    [MARKER_IDS[2]]: false,
    [MARKER_IDS[3]]: false,
  });

  const isUpdatingRef = useRef(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Measure section marker centers and compute transition geometry
  useEffect(() => {
    if (typeof window === "undefined") return;

    const measureAndBuildTraces = () => {
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

      // Build 3 discrete, temporary transition traces:
      // Trace 0: Field Notes -> Selected Work (leading to points[1])
      // Trace 1: Selected Work -> About & Capabilities (leading to points[2])
      // Trace 2: About & Capabilities -> Contact (leading to points[3])
      const newTraces: TraceConfig[] = [
        // 1. Transition into Selected Work
        (() => {
          const p = points[1];
          const spanY = 120;
          const startX = p.x - 12;
          const startY = p.y - spanY;
          const jogY = startY + 12;
          const pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${p.x.toFixed(1)} ${jogY.toFixed(1)} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          const tickD = `M ${(startX - 4).toFixed(1)} ${startY.toFixed(1)} L ${(startX + 4).toFixed(1)} ${startY.toFixed(1)}`;
          const totalLength = Math.hypot(p.x - startX, jogY - startY) + (p.y - jogY);
          return {
            id: "trace-fn-to-sw",
            fromSection: "field-notes",
            toSection: "selected-work",
            pathD,
            tickD,
            totalLength,
            targetMarkerId: MARKER_IDS[1],
            targetY: p.y,
          };
        })(),

        // 2. Transition into About & Capabilities
        (() => {
          const p = points[2];
          const spanY = 120;
          const startX = p.x + 12;
          const startY = p.y - spanY;
          const jogY = startY + 12;
          const pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${p.x.toFixed(1)} ${jogY.toFixed(1)} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          const tickD = `M ${(startX - 4).toFixed(1)} ${startY.toFixed(1)} L ${(startX + 4).toFixed(1)} ${startY.toFixed(1)}`;
          const totalLength = Math.hypot(startX - p.x, jogY - startY) + (p.y - jogY);
          return {
            id: "trace-sw-to-about",
            fromSection: "selected-work",
            toSection: "about",
            pathD,
            tickD,
            totalLength,
            targetMarkerId: MARKER_IDS[2],
            targetY: p.y,
          };
        })(),

        // 3. Transition into Contact
        (() => {
          const p = points[3];
          const spanY = 115;
          const startY = p.y - spanY;
          const pathD = `M ${p.x.toFixed(1)} ${startY.toFixed(1)} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          const tickD = `M ${(p.x - 5).toFixed(1)} ${startY.toFixed(1)} L ${(p.x + 5).toFixed(1)} ${startY.toFixed(1)}`;
          const totalLength = spanY;
          return {
            id: "trace-about-to-contact",
            fromSection: "about",
            toSection: "contact",
            pathD,
            tickD,
            totalLength,
            targetMarkerId: MARKER_IDS[3],
            targetY: p.y,
          };
        })(),
      ];

      setTraces(newTraces);
    };

    measureAndBuildTraces();

    window.addEventListener("resize", measureAndBuildTraces, { passive: true });
    const timer1 = setTimeout(measureAndBuildTraces, 350);
    const timer2 = setTimeout(measureAndBuildTraces, 1200);

    if (document.fonts) {
      document.fonts.ready.then(measureAndBuildTraces).catch(() => {});
    }

    let resizeObserver: ResizeObserver | null = null;
    const mainEl = containerRef.current?.parentElement;
    if (mainEl && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        measureAndBuildTraces();
      });
      resizeObserver.observe(mainEl);
    }

    return () => {
      window.removeEventListener("resize", measureAndBuildTraces);
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  // Scroll transition and Section Pulse engine
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

      const mainRect = mainEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const eyeLineY = windowHeight * 0.42;

      // 1. Check all 4 section markers for Section Pulse
      MARKER_IDS.forEach((id, idx) => {
        const marker = document.getElementById(id);
        if (!marker) return;

        const mRect = marker.getBoundingClientRect();
        const distFromEyeLine = mRect.top - eyeLineY;

        // Approaching natural eye-line (within 35px threshold)
        if (Math.abs(distFromEyeLine) <= 35) {
          if (!hasPulsedRef.current[id]) {
            hasPulsedRef.current[id] = true;
            triggerSectionPulse(idx);
          }
        }
        // Reset when user has scrolled away (> 200px) so re-entry fires again
        else if (Math.abs(distFromEyeLine) > 200) {
          hasPulsedRef.current[id] = false;
        }
      });

      // 2. Animate Signal Traces during section transitions (Desktop >= 768px)
      if (traces && window.innerWidth >= 768 && !reducedMotion) {
        const enterThreshold = windowHeight * 0.88; // Trace begins as target marker approaches
        const reachThreshold = windowHeight * 0.42; // Trace arrives at marker
        const leaveThreshold = windowHeight * 0.22; // Trace fades after entry

        traces.forEach((trace, idx) => {
          const groupEl = traceGroupRefs.current[idx];
          const pathEl = progressPathRefs.current[idx];
          const tipEl = tipHighlightRefs.current[idx];
          if (!groupEl || !pathEl) return;

          // Target marker viewport Y
          const targetYInViewport = trace.targetY + mainRect.top;

          let progress = 0;
          let opacity = 0;

          if (targetYInViewport > enterThreshold || targetYInViewport < leaveThreshold) {
            // Out of transition zone
            opacity = 0;
            progress = targetYInViewport < leaveThreshold ? 1 : 0;
          } else if (targetYInViewport >= reachThreshold) {
            // Phase A: Drawing progress as section approaches (enterThreshold -> reachThreshold)
            progress = (enterThreshold - targetYInViewport) / (enterThreshold - reachThreshold);
            progress = Math.max(0, Math.min(1, progress));
            // Fade in gently at start
            opacity = Math.min(1, progress * 2.2);
          } else {
            // Phase B: Section reached, trace fades out into the design (reachThreshold -> leaveThreshold)
            progress = 1;
            opacity = (targetYInViewport - leaveThreshold) / (reachThreshold - leaveThreshold);
            opacity = Math.max(0, Math.min(1, opacity));
          }

          // Direct style mutations (100% smooth, no React re-render overhead)
          groupEl.style.opacity = opacity.toFixed(3);
          const strokeOffset = Math.max(0, trace.totalLength * (1 - progress));
          pathEl.style.strokeDashoffset = `${strokeOffset.toFixed(1)}px`;

          // Endpoint traveling highlight node
          if (tipEl) {
            tipEl.style.opacity = opacity > 0.1 && progress < 0.98 ? "0.9" : "0";
          }
        });
      }
    };

    const onScroll = () => {
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true;
        requestAnimationFrame(updateTransitions);
      }
    };

    // Initial check
    updateTransitions();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [traces, reducedMotion]);

  if (!traces) {
    return <div ref={containerRef} className="hidden" aria-hidden="true" />;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none z-20 overflow-visible"
    >
      {/* Signal Traces: Desktop temporary transition lines (hidden on narrow screens to avoid clutter) */}
      <svg
        className="hidden md:block w-full h-full pointer-events-none overflow-visible"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {traces.map((trace, idx) => (
          <g
            key={trace.id}
            ref={(el) => {
              traceGroupRefs.current[idx] = el;
            }}
            style={{ opacity: 0, transition: reducedMotion ? "none" : undefined }}
          >
            {/* Base Reference Datum Hairline (Ultra-subtle) */}
            <path
              d={trace.pathD}
              fill="none"
              stroke="var(--theme-border-strong, #3A3A3A)"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.35"
            />

            {/* Top Datum Origin Tick */}
            <path
              d={trace.tickD}
              fill="none"
              stroke="var(--theme-border-strong, #3A3A3A)"
              strokeWidth="1"
              opacity="0.45"
            />

            {/* Signal Trace Gold Progress Stroke */}
            <path
              ref={(el) => {
                progressPathRefs.current[idx] = el;
              }}
              d={trace.pathD}
              fill="none"
              stroke="var(--theme-gold-text, #E5B842)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={`${trace.totalLength.toFixed(1)} ${trace.totalLength.toFixed(1)}`}
              strokeDashoffset={`${trace.totalLength.toFixed(1)}px`}
              style={{
                filter: "drop-shadow(0 0 3px rgba(229, 184, 66, 0.65))",
              }}
            />

            {/* Endpoint Traveling Node */}
            <circle
              ref={(el) => {
                tipHighlightRefs.current[idx] = el;
              }}
              cx="0"
              cy="0"
              r="2"
              fill="var(--theme-gold-text, #E5B842)"
              style={{
                opacity: 0,
                filter: "drop-shadow(0 0 4px rgba(229, 184, 66, 0.9))",
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
