"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useSyncExternalStore,
} from "react";
import { subscribeProgress } from "@/lib/scroll-progress";

export interface HeroSignalConnectorHandle {
  updateProgress: (progress: number) => void;
}

interface HeroSignalConnectorProps {
  trackRef: React.RefObject<HTMLDivElement | null>;
}

interface Point {
  x: number;
  y: number;
}

interface HeroPathGeometry {
  pathD: string;
  ticksD: string;
  totalLength: number;
  pStart: Point;
  pEnd: Point;
}

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

/**
 * Builds a filleted geometric connector path between 01 · HOME and SYS.START // 01.
 * Traces down through the dedicated left margin whitespace corridor, chamfers into
 * the lower baseline beacon with precision fillets, and includes architectural datum ticks.
 */
function buildHeroConnectorPath(
  pStart: Point,
  pEnd: Point,
  isMobile: boolean
): { d: string; ticks: string[]; length: number } {
  const r = isMobile ? 4 : 8;
  const sin45 = 0.7071;
  const cos45 = 0.7071;
  const tickW = isMobile ? 2.5 : 4;

  const parts: string[] = [];
  const ticks: string[] = [];

  // Top datum tick at pStart
  ticks.push(
    `M ${(pStart.x - tickW).toFixed(1)} ${pStart.y.toFixed(1)} L ${(pStart.x + tickW).toFixed(1)} ${pStart.y.toFixed(1)}`
  );

  parts.push(`M ${pStart.x.toFixed(1)} ${pStart.y.toFixed(1)}`);

  const dx = pEnd.x - pStart.x;
  const dy = pEnd.y - pStart.y;

  // Case 1: Pure vertical alignment (within 2.5px)
  if (Math.abs(dx) < 2.5) {
    parts.push(`L ${pEnd.x.toFixed(1)} ${pEnd.y.toFixed(1)}`);
    ticks.push(
      `M ${(pEnd.x - tickW).toFixed(1)} ${pEnd.y.toFixed(1)} L ${(pEnd.x + tickW).toFixed(1)} ${pEnd.y.toFixed(1)}`
    );
    return {
      d: parts.join(" "),
      ticks,
      length: Math.max(1, dy),
    };
  }

  // Case 2: Chamfered geometric transition into lower beacon
  const yChamferApproach = isMobile ? 18 : 28;
  const yTransitionEnd = pEnd.y - yChamferApproach;
  const absDx = Math.abs(dx);
  const yTransitionStart = yTransitionEnd - absDx;

  if (yTransitionStart > pStart.y + 16) {
    // 1. Straight vertical drop from pStart
    parts.push(`L ${pStart.x.toFixed(1)} ${(yTransitionStart - r).toFixed(1)}`);

    const xDir = dx > 0 ? 1 : -1;
    // Fillet 1: vertical into 45-deg chamfer
    parts.push(
      `Q ${pStart.x.toFixed(1)} ${yTransitionStart.toFixed(1)}, ${(pStart.x + xDir * r * sin45).toFixed(1)} ${(yTransitionStart + r * cos45).toFixed(1)}`
    );

    ticks.push(
      `M ${(pStart.x - tickW).toFixed(1)} ${yTransitionStart.toFixed(1)} L ${(pStart.x + tickW).toFixed(1)} ${yTransitionStart.toFixed(1)}`
    );

    // 2. 45-degree chamfer towards pEnd.x
    parts.push(
      `L ${(pEnd.x - xDir * r * sin45).toFixed(1)} ${(yTransitionEnd - r * cos45).toFixed(1)}`
    );

    // Fillet 2: chamfer into vertical approach
    parts.push(
      `Q ${pEnd.x.toFixed(1)} ${yTransitionEnd.toFixed(1)}, ${pEnd.x.toFixed(1)} ${(yTransitionEnd + r).toFixed(1)}`
    );

    ticks.push(
      `M ${(pEnd.x - tickW).toFixed(1)} ${yTransitionEnd.toFixed(1)} L ${(pEnd.x + tickW).toFixed(1)} ${yTransitionEnd.toFixed(1)}`
    );

    // 3. Vertical entry into pEnd
    parts.push(`L ${pEnd.x.toFixed(1)} ${pEnd.y.toFixed(1)}`);

    ticks.push(
      `M ${(pEnd.x - tickW).toFixed(1)} ${pEnd.y.toFixed(1)} L ${(pEnd.x + tickW).toFixed(1)} ${pEnd.y.toFixed(1)}`
    );

    const lVert1 = yTransitionStart - pStart.y;
    const lChamfer = Math.hypot(absDx, absDx);
    const lVert2 = pEnd.y - yTransitionEnd;
    const totalLength = lVert1 + lChamfer + lVert2;

    return {
      d: parts.join(" "),
      ticks,
      length: totalLength,
    };
  } else {
    // Fallback direct connection
    parts.push(`L ${pEnd.x.toFixed(1)} ${pEnd.y.toFixed(1)}`);
    ticks.push(
      `M ${(pEnd.x - tickW).toFixed(1)} ${pEnd.y.toFixed(1)} L ${(pEnd.x + tickW).toFixed(1)} ${pEnd.y.toFixed(1)}`
    );
    return {
      d: parts.join(" "),
      ticks,
      length: Math.hypot(dx, dy),
    };
  }
}

const HeroSignalConnector = forwardRef<HeroSignalConnectorHandle, HeroSignalConnectorProps>(
  function HeroSignalConnector({ trackRef }, ref) {
    const [geometry, setGeometry] = useState<HeroPathGeometry | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressPathRef = useRef<SVGPathElement>(null);
    const tipHighlightRef = useRef<SVGCircleElement>(null);
    const tipGlowRef = useRef<SVGCircleElement>(null);

    const currentProgressRef = useRef<number>(0);

    const reducedMotion = useSyncExternalStore(
      subscribeReducedMotion,
      getReducedMotionSnapshot,
      getReducedMotionServerSnapshot
    );

    // Measure anchor positions and build responsive path geometry
    useEffect(() => {
      if (typeof window === "undefined") return;

      const measureAndBuild = () => {
        const startEl = document.getElementById("section-marker-hero");
        const endEl = document.getElementById("journey-start-anchor");
        const viewportEl = containerRef.current?.parentElement;

        if (!startEl || !endEl || !viewportEl) return;

        const vpRect = viewportEl.getBoundingClientRect();
        const rStart = startEl.getBoundingClientRect();
        const rEnd = endEl.getBoundingClientRect();

        const pStart: Point = {
          x: rStart.left - vpRect.left + rStart.width / 2,
          y: rStart.top - vpRect.top + rStart.height / 2,
        };
        const pEnd: Point = {
          x: rEnd.left - vpRect.left + rEnd.width / 2,
          y: rEnd.top - vpRect.top + rEnd.height / 2,
        };

        const isMobile = window.innerWidth < 1024;
        const { d, ticks, length } = buildHeroConnectorPath(pStart, pEnd, isMobile);

        setGeometry({
          pathD: d,
          ticksD: ticks.join(" "),
          totalLength: length,
          pStart,
          pEnd,
        });
      };

      measureAndBuild();

      window.addEventListener("resize", measureAndBuild, { passive: true });
      const t1 = setTimeout(measureAndBuild, 300);
      const t2 = setTimeout(measureAndBuild, 1000);

      if (document.fonts) {
        document.fonts.ready.then(measureAndBuild).catch(() => {});
      }

      let ro: ResizeObserver | null = null;
      const vpEl = containerRef.current?.parentElement;
      if (vpEl && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => measureAndBuild());
        ro.observe(vpEl);
      }

      return () => {
        window.removeEventListener("resize", measureAndBuild);
        clearTimeout(t1);
        clearTimeout(t2);
        if (ro) ro.disconnect();
      };
    }, []);

    // Direct hardware-accelerated update function (zero React re-render overhead)
    const applyProgress = useCallback(
      (p: number) => {
        currentProgressRef.current = p;
        if (!geometry || reducedMotion) return;

        const clampedP = Math.max(0, Math.min(1, p));
        const drawnDistance = clampedP * geometry.totalLength;

        const pathEl = progressPathRef.current;
        if (pathEl) {
          const offset = Math.max(0, geometry.totalLength - drawnDistance);
          pathEl.style.strokeDashoffset = `${offset.toFixed(1)}px`;

          const tipEl = tipHighlightRef.current;
          const glowEl = tipGlowRef.current;

          if (tipEl) {
            try {
              const pt = pathEl.getPointAtLength(drawnDistance);
              tipEl.setAttribute("cx", pt.x.toFixed(1));
              tipEl.setAttribute("cy", pt.y.toFixed(1));
              tipEl.style.opacity = "1";

              if (glowEl) {
                glowEl.setAttribute("cx", pt.x.toFixed(1));
                glowEl.setAttribute("cy", pt.y.toFixed(1));
                glowEl.style.opacity = "1";
              }
            } catch {
              tipEl.style.opacity = "0";
              if (glowEl) glowEl.style.opacity = "0";
            }
          }
        }

        // Visual handoff connection with SYS.START // 01 beacon when reaching destination
        const beaconRing = document.getElementById("journey-start-pulse-ring");
        if (beaconRing) {
          if (clampedP > 0.95) {
            beaconRing.classList.add("opacity-100");
            beaconRing.classList.remove("opacity-0");
          } else {
            beaconRing.classList.add("opacity-0");
            beaconRing.classList.remove("opacity-100");
          }
        }
      },
      [geometry, reducedMotion]
    );

    useImperativeHandle(ref, () => ({
      updateProgress: (p: number) => {
        applyProgress(p);
      },
    }));

    // Reapply progress upon geometry changes or orientation changes
    useEffect(() => {
      if (geometry) {
        applyProgress(currentProgressRef.current);
      }
    }, [geometry, applyProgress]);

    // Secondary fallback sync with global scroll progress (ensures continuous response)
    useEffect(() => {
      if (!geometry || reducedMotion) return;

      const unsubscribe = subscribeProgress(() => {
        const trackEl = trackRef.current;
        if (!trackEl) return;
        const rect = trackEl.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrollDistance = -rect.top;
        const maxScroll = Math.max(1, trackEl.offsetHeight - windowHeight);

        const p = Math.max(0, Math.min(1, scrollDistance / maxScroll));
        applyProgress(p);
      });

      return () => {
        unsubscribe();
      };
    }, [geometry, reducedMotion, trackRef, applyProgress]);

    if (!geometry) {
      return <div ref={containerRef} className="hidden" aria-hidden="true" />;
    }

    const isMobile = typeof window !== "undefined" ? window.innerWidth < 1024 : false;

    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none z-[2] overflow-visible"
      >
        <svg
          className="w-full h-full pointer-events-none overflow-visible"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Layer A — Ambient Geometric Path (Subdued technical route) */}
          <path
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

          {/* Active Tip Traveling Highlight Node (Starting at upper HOME anchor) */}
          {!reducedMotion && (
            <>
              {/* Soft luminous ambient aura */}
              <circle
                ref={tipGlowRef}
                cx={geometry.pStart.x}
                cy={geometry.pStart.y}
                r={isMobile ? "4" : "5.5"}
                fill="rgba(229, 184, 66, 0.22)"
                style={{
                  opacity: 1,
                  filter: "blur(2px)",
                  transition: "opacity 0.2s ease-out",
                }}
              />
              {/* Crisp luminous core */}
              <circle
                ref={tipHighlightRef}
                cx={geometry.pStart.x}
                cy={geometry.pStart.y}
                r={isMobile ? "2" : "2.5"}
                fill="var(--theme-gold-text, #E5B842)"
                style={{
                  opacity: 1,
                  filter: "drop-shadow(0 0 5px rgba(229, 184, 66, 0.95))",
                  transition: "opacity 0.2s ease-out",
                }}
              />
            </>
          )}
        </svg>
      </div>
    );
  }
);

export default HeroSignalConnector;
