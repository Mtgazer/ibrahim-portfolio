"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure ScrollTrigger is registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroGenerativeBackgroundProps {
  trackRef: React.RefObject<HTMLDivElement | null>;
  contentRef?: React.RefObject<HTMLDivElement | null>;
}

// React 19 SSR-safe store subscriptions
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

export default function HeroGenerativeBackground({
  trackRef,
  contentRef,
}: HeroGenerativeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Desktop Target Element Refs
  const arcLeftPrimaryRef = useRef<SVGPathElement>(null);
  const arcLeftMetricRef = useRef<SVGPathElement>(null);
  const arcLeftGoldRef = useRef<SVGPathElement>(null);
  const arcRightPrimaryRef = useRef<SVGPathElement>(null);
  const arcRightMetricRef = useRef<SVGPathElement>(null);
  const arcRightGoldRef = useRef<SVGPathElement>(null);

  const vecLeftPrimaryRef = useRef<SVGLineElement>(null);
  const vecRightPrimaryRef = useRef<SVGLineElement>(null);
  const vecNetLeftRef = useRef<SVGLineElement>(null);
  const vecNetRightRef = useRef<SVGLineElement>(null);
  const vecCrossLeftRef = useRef<SVGLineElement>(null);
  const vecCrossRightRef = useRef<SVGLineElement>(null);
  const datumTopLeftRef = useRef<SVGLineElement>(null);
  const datumTopRightRef = useRef<SVGLineElement>(null);

  const nodeAlphaRef = useRef<SVGGElement>(null);
  const nodeAlphaPulseRef = useRef<SVGCircleElement>(null);
  const nodeBetaRef = useRef<SVGGElement>(null);
  const nodeBetaPulseRef = useRef<SVGCircleElement>(null);

  const coordLeftRef = useRef<SVGTextElement>(null);
  const coordRightRef = useRef<SVGTextElement>(null);
  const exitAssemblyRef = useRef<SVGGElement>(null);

  // Dedicated Mobile Target Element Refs (Decoupled from Desktop)
  const mobHaloPrimaryRef = useRef<SVGPathElement>(null);
  const mobHaloSecondaryRef = useRef<SVGPathElement>(null);
  const mobNodeLeftRef = useRef<SVGGElement>(null);
  const mobNodeRightRef = useRef<SVGGElement>(null);
  const mobCrosshairLeftRef = useRef<SVGPathElement>(null);
  const mobCrosshairRightRef = useRef<SVGPathElement>(null);
  const mobTransitLineRef = useRef<SVGLineElement>(null);
  const mobTransitNodeRef = useRef<SVGCircleElement>(null);
  const mobOuterRef = useRef<SVGGElement>(null);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (reducedMotion || !trackRef || !trackRef.current) {
      return;
    }

    const trackEl = trackRef.current;

    // Use gsap.matchMedia for clean, responsive separation between Desktop and Mobile
    const mm = gsap.matchMedia(containerRef);

    // =========================================================================
    // 1. DESKTOP VIEWPORT (min-width: 768px): APPROVED 4-STAGE TRACK TIMELINE
    // =========================================================================
    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackEl,
          start: "top top+=64",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // Stage 1 -> Stage 2: 0% -> 30% [EXPANSION]
      if (arcLeftPrimaryRef.current) {
        tl.to(
          arcLeftPrimaryRef.current,
          {
            rotation: 20,
            scale: 1.15,
            x: -20,
            transformOrigin: "180px 450px",
            ease: "power1.inOut",
            duration: 0.3,
          },
          0
        );
      }
      if (arcLeftMetricRef.current) {
        tl.to(
          arcLeftMetricRef.current,
          {
            rotation: -16,
            transformOrigin: "210px 450px",
            ease: "power1.inOut",
            duration: 0.3,
          },
          0
        );
      }
      if (arcLeftGoldRef.current) {
        tl.to(
          arcLeftGoldRef.current,
          {
            strokeDashoffset: 0,
            ease: "power1.inOut",
            duration: 0.3,
          },
          0
        );
      }

      if (arcRightPrimaryRef.current) {
        tl.to(
          arcRightPrimaryRef.current,
          {
            rotation: -20,
            scale: 1.15,
            x: 20,
            transformOrigin: "1260px 450px",
            ease: "power1.inOut",
            duration: 0.3,
          },
          0
        );
      }
      if (arcRightMetricRef.current) {
        tl.to(
          arcRightMetricRef.current,
          {
            rotation: 16,
            transformOrigin: "1230px 450px",
            ease: "power1.inOut",
            duration: 0.3,
          },
          0
        );
      }
      if (arcRightGoldRef.current) {
        tl.to(
          arcRightGoldRef.current,
          {
            strokeDashoffset: 0,
            ease: "power1.inOut",
            duration: 0.3,
          },
          0
        );
      }

      if (vecLeftPrimaryRef.current) {
        tl.to(
          vecLeftPrimaryRef.current,
          {
            strokeDashoffset: 190,
            ease: "none",
            duration: 0.3,
          },
          0
        );
      }
      if (vecRightPrimaryRef.current) {
        tl.to(
          vecRightPrimaryRef.current,
          {
            strokeDashoffset: 190,
            ease: "none",
            duration: 0.3,
          },
          0
        );
      }

      if (nodeAlphaRef.current) {
        tl.to(
          nodeAlphaRef.current,
          {
            x: 130,
            y: 200,
            ease: "none",
            duration: 0.3,
          },
          0
        );
      }
      if (nodeBetaRef.current) {
        tl.to(
          nodeBetaRef.current,
          {
            x: -130,
            y: 200,
            ease: "none",
            duration: 0.3,
          },
          0
        );
      }

      if (datumTopLeftRef.current) {
        tl.to(
          datumTopLeftRef.current,
          {
            scaleX: 1.25,
            transformOrigin: "left center",
            duration: 0.3,
          },
          0
        );
      }
      if (datumTopRightRef.current) {
        tl.to(
          datumTopRightRef.current,
          {
            scaleX: 1.25,
            transformOrigin: "right center",
            duration: 0.3,
          },
          0
        );
      }

      // Stage 2 -> Stage 3: 30% -> 65% [TRANSFORMATION / NETWORK]
      if (arcLeftPrimaryRef.current) {
        tl.to(
          arcLeftPrimaryRef.current,
          {
            rotation: 36,
            scale: 1.24,
            x: -38,
            ease: "power1.inOut",
            duration: 0.35,
          },
          0.3
        );
      }
      if (arcLeftMetricRef.current) {
        tl.to(
          arcLeftMetricRef.current,
          {
            rotation: -32,
            duration: 0.35,
          },
          0.3
        );
      }
      if (arcRightPrimaryRef.current) {
        tl.to(
          arcRightPrimaryRef.current,
          {
            rotation: -36,
            scale: 1.24,
            x: 38,
            ease: "power1.inOut",
            duration: 0.35,
          },
          0.3
        );
      }
      if (arcRightMetricRef.current) {
        tl.to(
          arcRightMetricRef.current,
          {
            rotation: 32,
            duration: 0.35,
          },
          0.3
        );
      }

      if (vecLeftPrimaryRef.current) {
        tl.to(
          vecLeftPrimaryRef.current,
          {
            strokeDashoffset: 0,
            ease: "none",
            duration: 0.35,
          },
          0.3
        );
      }
      if (vecRightPrimaryRef.current) {
        tl.to(
          vecRightPrimaryRef.current,
          {
            strokeDashoffset: 0,
            ease: "none",
            duration: 0.35,
          },
          0.3
        );
      }

      if (vecNetLeftRef.current) {
        tl.to(
          vecNetLeftRef.current,
          {
            strokeDashoffset: 0,
            opacity: 1,
            ease: "power1.out",
            duration: 0.35,
          },
          0.3
        );
      }
      if (vecNetRightRef.current) {
        tl.to(
          vecNetRightRef.current,
          {
            strokeDashoffset: 0,
            opacity: 1,
            ease: "power1.out",
            duration: 0.35,
          },
          0.3
        );
      }
      if (vecCrossLeftRef.current) {
        tl.to(
          vecCrossLeftRef.current,
          {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.35,
          },
          0.3
        );
      }
      if (vecCrossRightRef.current) {
        tl.to(
          vecCrossRightRef.current,
          {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.35,
          },
          0.3
        );
      }

      if (nodeAlphaRef.current) {
        tl.to(
          nodeAlphaRef.current,
          {
            x: 260,
            y: 400,
            ease: "none",
            duration: 0.35,
          },
          0.3
        );
      }
      if (nodeBetaRef.current) {
        tl.to(
          nodeBetaRef.current,
          {
            x: -260,
            y: 400,
            ease: "none",
            duration: 0.35,
          },
          0.3
        );
      }
      if (nodeAlphaPulseRef.current) {
        tl.to(
          nodeAlphaPulseRef.current,
          {
            scale: 1.8,
            opacity: 0.8,
            transformOrigin: "center center",
            duration: 0.35,
          },
          0.3
        );
      }
      if (nodeBetaPulseRef.current) {
        tl.to(
          nodeBetaPulseRef.current,
          {
            scale: 1.8,
            opacity: 0.8,
            transformOrigin: "center center",
            duration: 0.35,
          },
          0.3
        );
      }

      if (coordLeftRef.current) {
        tl.to(
          coordLeftRef.current,
          {
            x: 20,
            opacity: 0.45,
            duration: 0.35,
          },
          0.3
        );
      }
      if (coordRightRef.current) {
        tl.to(
          coordRightRef.current,
          {
            x: -20,
            opacity: 0.45,
            duration: 0.35,
          },
          0.3
        );
      }

      // Stage 3 -> Stage 4: 65% -> 100% [HERO EXIT & DIRECTIONAL HANDOFF]
      if (arcLeftPrimaryRef.current) {
        tl.to(
          arcLeftPrimaryRef.current,
          {
            opacity: 0.2,
            duration: 0.35,
          },
          0.65
        );
      }
      if (arcRightPrimaryRef.current) {
        tl.to(
          arcRightPrimaryRef.current,
          {
            opacity: 0.2,
            duration: 0.35,
          },
          0.65
        );
      }
      if (nodeAlphaRef.current) {
        tl.to(
          nodeAlphaRef.current,
          {
            opacity: 0.25,
            duration: 0.35,
          },
          0.65
        );
      }
      if (nodeBetaRef.current) {
        tl.to(
          nodeBetaRef.current,
          {
            opacity: 0.25,
            duration: 0.35,
          },
          0.65
        );
      }

      if (exitAssemblyRef.current) {
        tl.fromTo(
          exitAssemblyRef.current,
          {
            opacity: 0,
            y: -25,
          },
          {
            opacity: 1,
            y: 0,
            ease: "power1.out",
            duration: 0.35,
          },
          0.65
        );
      }

      if (contentRef?.current) {
        tl.to(
          contentRef.current,
          {
            opacity: 0.15,
            y: -30,
            ease: "power1.out",
            duration: 0.35,
          },
          0.65
        );
      }
    });

    // =========================================================================
    // 2. MOBILE VIEWPORT (max-width: 767px): NATURAL SCROLLING, GENERATIVE TRANSFORMATION
    // =========================================================================
    mm.add("(max-width: 767px)", () => {
      if (reducedMotion) {
        if (mobHaloPrimaryRef.current) gsap.set(mobHaloPrimaryRef.current, { opacity: 0.85, scale: 1, rotation: 0 });
        if (mobHaloSecondaryRef.current) gsap.set(mobHaloSecondaryRef.current, { opacity: 0.65, scale: 1, rotation: 0 });
        if (mobOuterRef.current) gsap.set(mobOuterRef.current, { opacity: 1, y: 0 });
        return;
      }

      // Initial geometric background is immediately visible on page load
      if (mobOuterRef.current) gsap.set(mobOuterRef.current, { opacity: 1 });
      if (mobHaloPrimaryRef.current) gsap.set(mobHaloPrimaryRef.current, { opacity: 0.85 });
      if (mobHaloSecondaryRef.current) gsap.set(mobHaloSecondaryRef.current, { opacity: 0.65 });

      // Natural finger scroll-driven generative transformation scrubbing over trackEl
      const mobTl = gsap.timeline({
        scrollTrigger: {
          trigger: trackEl,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // Stage 1 (0% -> 35%): Logo Halo Expansion & Node Glides
      if (mobHaloPrimaryRef.current) {
        mobTl.to(
          mobHaloPrimaryRef.current,
          {
            scale: 1.35,
            rotation: 26,
            transformOrigin: "195px 160px",
            opacity: 1,
            ease: "power1.inOut",
            duration: 0.45,
          },
          0
        );
      }
      if (mobHaloSecondaryRef.current) {
        mobTl.to(
          mobHaloSecondaryRef.current,
          {
            scale: 1.25,
            rotation: -18,
            transformOrigin: "195px 160px",
            opacity: 0.85,
            ease: "power1.inOut",
            duration: 0.45,
          },
          0
        );
      }

      // Outer margin nodes slide along their hairlines
      if (mobNodeLeftRef.current) {
        mobTl.to(
          mobNodeLeftRef.current,
          {
            y: 90,
            ease: "power1.inOut",
            duration: 0.65,
          },
          0
        );
      }
      if (mobNodeRightRef.current) {
        mobTl.to(
          mobNodeRightRef.current,
          {
            y: 90,
            ease: "power1.inOut",
            duration: 0.65,
          },
          0
        );
      }

      // Stage 2 (35% -> 70%): Lower Crosshair Rotation
      if (mobCrosshairLeftRef.current) {
        mobTl.to(
          mobCrosshairLeftRef.current,
          {
            rotation: 45,
            transformOrigin: "18px 660px",
            opacity: 1,
            ease: "power1.out",
            duration: 0.35,
          },
          0.35
        );
      }
      if (mobCrosshairRightRef.current) {
        mobTl.to(
          mobCrosshairRightRef.current,
          {
            rotation: -45,
            transformOrigin: "372px 660px",
            opacity: 1,
            ease: "power1.out",
            duration: 0.35,
          },
          0.35
        );
      }

      // Stage 3 (55% -> 100%): Transition Progressing into Field Notes
      if (mobTransitLineRef.current) {
        mobTl.fromTo(
          mobTransitLineRef.current,
          { strokeDashoffset: 45 },
          { strokeDashoffset: 0, ease: "power1.out", duration: 0.45 },
          0.5
        );
      }
      if (mobTransitNodeRef.current) {
        mobTl.to(
          mobTransitNodeRef.current,
          {
            y: 18,
            scale: 1.3,
            transformOrigin: "center center",
            ease: "power1.out",
            duration: 0.45,
          },
          0.5
        );
      }

      // Upper halo gently fades out as hero scrolls out of view into Field Notes
      if (mobHaloPrimaryRef.current) {
        mobTl.to(
          mobHaloPrimaryRef.current,
          {
            opacity: 0.2,
            scale: 1.5,
            ease: "power1.in",
            duration: 0.35,
          },
          0.65
        );
      }
      if (mobHaloSecondaryRef.current) {
        mobTl.to(
          mobHaloSecondaryRef.current,
          {
            opacity: 0.1,
            scale: 1.4,
            ease: "power1.in",
            duration: 0.35,
          },
          0.65
        );
      }
    });

    return () => {
      mm.revert();
    };
  }, [trackRef, contentRef, reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* =================================================================== */}
      {/* A. MOBILE-NATIVE REFINED COMPOSITION (block md:hidden, viewBox 0 0 390 844) */}
      {/* =================================================================== */}
      <svg
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        className="block md:hidden w-full h-full text-[var(--hero-geom-line-subtle)]"
      >
        {/* 1. Restrained Architectural Halo Behind / Framing Logo */}
        <g id="mob-logo-halo-group">
          {/* Concentric guide arc */}
          <path
            ref={mobHaloSecondaryRef}
            d="M 130 160 A 65 65 0 0 1 260 160"
            fill="none"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
            opacity="0.65"
          />
          {/* Primary gold accent halo arc (scrubbed on scroll) */}
          <path
            ref={mobHaloPrimaryRef}
            d="M 145 160 A 50 50 0 0 1 245 160"
            fill="none"
            stroke="var(--hero-geom-line-accent)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.85"
          />
          {/* Horizontal framing hairline segments with datum tick marks */}
          <line
            x1="105"
            y1="160"
            x2="132"
            y2="160"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />
          <line
            x1="115"
            y1="156"
            x2="115"
            y2="164"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />

          <line
            x1="258"
            y1="160"
            x2="285"
            y2="160"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />
          <line
            x1="275"
            y1="156"
            x2="275"
            y2="164"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />
        </g>

        {/* 2. Controlled Outer Margin Datums & Gold Nodes (strictly outside content column) */}
        <g ref={mobOuterRef} id="mob-outer-datums" opacity="1">
          {/* Left Margin Hairlines (x = 18) */}
          <line
            x1="18"
            y1="75"
            x2="18"
            y2="280"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />
          {/* Left Controlled Gold Node (sliding group) */}
          <g ref={mobNodeLeftRef}>
            <circle
              cx="18"
              cy="160"
              r="4.5"
              fill="none"
              stroke="var(--hero-geom-node-neutral)"
              strokeWidth="0.8"
            />
            <circle cx="18" cy="160" r="1.8" fill="var(--hero-geom-node-gold)" />
          </g>

          {/* Left Lower Hairline and Crosshair */}
          <line
            x1="18"
            y1="560"
            x2="18"
            y2="760"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />
          <path
            ref={mobCrosshairLeftRef}
            d="M 14 660 L 22 660 M 18 656 L 18 664"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />

          {/* Right Margin Hairlines (x = 372) */}
          <line
            x1="372"
            y1="75"
            x2="372"
            y2="280"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />
          {/* Right Controlled Gold Node (sliding group) */}
          <g ref={mobNodeRightRef}>
            <circle
              cx="372"
              cy="160"
              r="4.5"
              fill="none"
              stroke="var(--hero-geom-node-neutral)"
              strokeWidth="0.8"
            />
            <circle cx="372" cy="160" r="1.8" fill="var(--hero-geom-node-gold)" />
          </g>

          {/* Right Lower Hairline and Crosshair */}
          <line
            x1="372"
            y1="560"
            x2="372"
            y2="760"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />
          <path
            ref={mobCrosshairRightRef}
            d="M 368 660 L 376 660 M 372 656 L 372 664"
            stroke="var(--hero-geom-line-subtle)"
            strokeWidth="0.8"
          />

          {/* 3. Subtle Bottom Directional Transit into Field Notes */}
          <g id="mob-bottom-transit">
            <line
              ref={mobTransitLineRef}
              x1="195"
              y1="745"
              x2="195"
              y2="790"
              stroke="var(--hero-geom-line-mid)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            <circle
              ref={mobTransitNodeRef}
              cx="195"
              cy="790"
              r="2.2"
              fill="var(--hero-geom-node-gold)"
            />
            <path
              d="M 191 785 L 195 791 L 199 785"
              fill="none"
              stroke="var(--hero-geom-node-gold)"
              strokeWidth="1.2"
              opacity="0.85"
            />
          </g>
        </g>
      </svg>

      {/* =================================================================== */}
      {/* B. DESKTOP-NATIVE SVG COMPOSITION (hidden md:block, viewBox 0 0 1440 900) */}
      {/* =================================================================== */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="hidden md:block w-full h-full text-[var(--hero-geom-line-subtle)]"
      >
        <defs>
          {/* Desktop Central Elliptical Clearing Mask */}
          <radialGradient
            id="hero-desktop-center-mask"
            cx="50%"
            cy="48%"
            r="44%"
            fx="50%"
            fy="48%"
          >
            <stop offset="0%" stopColor="#000" stopOpacity="0.0" />
            <stop offset="35%" stopColor="#000" stopOpacity="0.2" />
            <stop offset="68%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </radialGradient>
          <mask id="hero-desktop-mask">
            <rect width="1440" height="900" fill="url(#hero-desktop-center-mask)" />
          </mask>
        </defs>

        {/* Master Desktop Geometry masked cleanly around foreground content */}
        <g mask="url(#hero-desktop-mask)">
          {/* 1. Desktop Orbital Arcs */}
          <g id="orbital-arcs-group">
            <path
              ref={arcLeftPrimaryRef}
              d="M 140 60 A 420 420 0 0 0 160 840"
              fill="none"
              stroke="var(--hero-geom-line-mid)"
              strokeWidth="1.1"
            />
            <path
              ref={arcLeftMetricRef}
              d="M 185 130 A 380 380 0 0 0 195 770"
              fill="none"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.85"
              strokeDasharray="4 10"
            />
            <path
              ref={arcLeftGoldRef}
              d="M 240 220 A 340 340 0 0 0 255 500"
              fill="none"
              stroke="var(--hero-geom-line-accent)"
              strokeWidth="1.4"
              strokeDasharray="320"
              strokeDashoffset={reducedMotion ? "0" : "320"}
            />

            <path
              ref={arcRightPrimaryRef}
              d="M 1300 60 A 420 420 0 0 1 1280 840"
              fill="none"
              stroke="var(--hero-geom-line-mid)"
              strokeWidth="1.1"
            />
            <path
              ref={arcRightMetricRef}
              d="M 1255 130 A 380 380 0 0 1 1245 770"
              fill="none"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.85"
              strokeDasharray="4 10"
            />
            <path
              ref={arcRightGoldRef}
              d="M 1200 220 A 340 340 0 0 1 1185 500"
              fill="none"
              stroke="var(--hero-geom-line-accent)"
              strokeWidth="1.4"
              strokeDasharray="320"
              strokeDashoffset={reducedMotion ? "0" : "320"}
            />

            <circle
              cx="180"
              cy="200"
              r="70"
              fill="none"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.65"
              strokeDasharray="2 7"
            />
            <circle
              cx="1260"
              cy="700"
              r="80"
              fill="none"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.65"
              strokeDasharray="2 8"
            />
          </g>

          {/* 2. Desktop Datums & Progressive Trajectory Vectors */}
          <g id="datums-and-vectors-group">
            <line
              ref={datumTopLeftRef}
              x1="60"
              y1="160"
              x2="460"
              y2="160"
              stroke="var(--hero-geom-line-mid)"
              strokeWidth="0.8"
            />
            <line
              ref={datumTopRightRef}
              x1="980"
              y1="160"
              x2="1380"
              y2="160"
              stroke="var(--hero-geom-line-mid)"
              strokeWidth="0.8"
            />
            <line x1="120" y1="155" x2="120" y2="165" stroke="var(--hero-geom-line-mid)" strokeWidth="0.8" />
            <line x1="240" y1="156" x2="240" y2="164" stroke="var(--hero-geom-line-subtle)" strokeWidth="0.7" />
            <line x1="360" y1="155" x2="360" y2="165" stroke="var(--hero-geom-line-mid)" strokeWidth="0.8" />
            <line x1="1080" y1="155" x2="1080" y2="165" stroke="var(--hero-geom-line-mid)" strokeWidth="0.8" />
            <line x1="1200" y1="156" x2="1200" y2="164" stroke="var(--hero-geom-line-subtle)" strokeWidth="0.7" />
            <line x1="1320" y1="155" x2="1320" y2="165" stroke="var(--hero-geom-line-mid)" strokeWidth="0.8" />

            <line
              x1="80"
              y1="740"
              x2="480"
              y2="740"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.75"
            />
            <line
              x1="960"
              y1="740"
              x2="1360"
              y2="740"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.75"
            />

            <line
              ref={vecLeftPrimaryRef}
              x1="180"
              y1="160"
              x2="440"
              y2="560"
              stroke="var(--hero-geom-line-mid)"
              strokeWidth="0.95"
              strokeDasharray="480"
              strokeDashoffset={reducedMotion ? "0" : "480"}
            />
            <line
              ref={vecRightPrimaryRef}
              x1="1260"
              y1="160"
              x2="1000"
              y2="560"
              stroke="var(--hero-geom-line-mid)"
              strokeWidth="0.95"
              strokeDasharray="480"
              strokeDashoffset={reducedMotion ? "0" : "480"}
            />

            <line
              ref={vecNetLeftRef}
              x1="180"
              y1="560"
              x2="440"
              y2="560"
              stroke="var(--hero-geom-line-accent)"
              strokeWidth="1.1"
              strokeDasharray="260"
              strokeDashoffset={reducedMotion ? "0" : "260"}
              style={{ opacity: reducedMotion ? 1 : 0.4 }}
            />
            <line
              ref={vecNetRightRef}
              x1="1000"
              y1="560"
              x2="1260"
              y2="560"
              stroke="var(--hero-geom-line-accent)"
              strokeWidth="1.1"
              strokeDasharray="260"
              strokeDashoffset={reducedMotion ? "0" : "260"}
              style={{ opacity: reducedMotion ? 1 : 0.4 }}
            />

            <line
              ref={vecCrossLeftRef}
              x1="180"
              y1="740"
              x2="440"
              y2="560"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.75"
              strokeDasharray="360"
              strokeDashoffset={reducedMotion ? "0" : "360"}
              style={{ opacity: reducedMotion ? 1 : 0.3 }}
            />
            <line
              ref={vecCrossRightRef}
              x1="1260"
              y1="740"
              x2="1000"
              y2="560"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.75"
              strokeDasharray="360"
              strokeDashoffset={reducedMotion ? "0" : "360"}
              style={{ opacity: reducedMotion ? 1 : 0.3 }}
            />
          </g>

          {/* 3. Desktop Traveling Nodes & Annotations */}
          <g id="traveling-nodes-group">
            <circle
              cx="180"
              cy="160"
              r="6"
              fill="none"
              stroke="var(--hero-geom-node-neutral)"
              strokeWidth="0.8"
            />
            <circle cx="180" cy="160" r="1.8" fill="var(--hero-geom-node-gold)" />

            <circle
              cx="1260"
              cy="160"
              r="6"
              fill="none"
              stroke="var(--hero-geom-node-neutral)"
              strokeWidth="0.8"
            />
            <circle cx="1260" cy="160" r="1.8" fill="var(--hero-geom-node-gold)" />

            <circle
              ref={nodeAlphaPulseRef}
              cx="440"
              cy="560"
              r="7"
              fill="none"
              stroke="var(--hero-geom-node-gold)"
              strokeWidth="1"
              style={{ opacity: reducedMotion ? 0.8 : 0.2 }}
            />
            <circle
              ref={nodeBetaPulseRef}
              cx="1000"
              cy="560"
              r="7"
              fill="none"
              stroke="var(--hero-geom-node-gold)"
              strokeWidth="1"
              style={{ opacity: reducedMotion ? 0.8 : 0.2 }}
            />

            <g ref={nodeAlphaRef}>
              <circle
                cx="180"
                cy="160"
                r="7"
                fill="var(--theme-bg-hero, #050505)"
                stroke="var(--hero-geom-node-gold)"
                strokeWidth="1.2"
              />
              <circle cx="180" cy="160" r="2.5" fill="var(--hero-geom-node-gold)" />
              <text
                x="192"
                y="164"
                fontFamily="var(--font-mono, monospace)"
                fontSize="7.5"
                letterSpacing="0.1em"
                fill="var(--hero-geom-text)"
              >
                NODE.α
              </text>
            </g>

            <g ref={nodeBetaRef}>
              <circle
                cx="1260"
                cy="160"
                r="7"
                fill="var(--theme-bg-hero, #050505)"
                stroke="var(--hero-geom-node-gold)"
                strokeWidth="1.2"
              />
              <circle cx="1260" cy="160" r="2.5" fill="var(--hero-geom-node-gold)" />
              <text
                x="1210"
                y="164"
                fontFamily="var(--font-mono, monospace)"
                fontSize="7.5"
                letterSpacing="0.1em"
                fill="var(--hero-geom-text)"
              >
                NODE.β
              </text>
            </g>

            <path
              d="M 235 740 L 245 740 M 240 735 L 240 745"
              stroke="var(--hero-geom-node-neutral)"
              strokeWidth="0.8"
            />
            <path
              d="M 1195 740 L 1205 740 M 1200 735 L 1200 745"
              stroke="var(--hero-geom-node-neutral)"
              strokeWidth="0.8"
            />

            <text
              ref={coordLeftRef}
              x="192"
              y="148"
              fontFamily="var(--font-mono, monospace)"
              fontSize="8.5"
              letterSpacing="0.12em"
              fill="var(--hero-geom-text)"
            >
              30.0444° N // SYS.01
            </text>
            <text
              ref={coordRightRef}
              x="1150"
              y="148"
              fontFamily="var(--font-mono, monospace)"
              fontSize="8.5"
              letterSpacing="0.12em"
              fill="var(--hero-geom-text)"
            >
              31.2357° E // ARCH.UX
            </text>
            <text
              x="252"
              y="744"
              fontFamily="var(--font-mono, monospace)"
              fontSize="8"
              letterSpacing="0.12em"
              fill="var(--hero-geom-text)"
            >
              [ 01 // 04 ]
            </text>
            <text
              x="1130"
              y="744"
              fontFamily="var(--font-mono, monospace)"
              fontSize="8"
              letterSpacing="0.12em"
              fill="var(--hero-geom-text)"
            >
              [ V.01_EXP ]
            </text>
          </g>
        </g>

        {/* 4. Desktop Exit Assembly */}
        <g ref={exitAssemblyRef} style={{ opacity: reducedMotion ? 1 : 0 }}>
          <line
            x1="140"
            y1="680"
            x2="140"
            y2="770"
            stroke="var(--hero-geom-line-mid)"
            strokeWidth="0.85"
            strokeDasharray="4 6"
          />
          <path
            d="M 136 762 L 140 770 L 144 762"
            fill="none"
            stroke="var(--hero-geom-node-gold)"
            strokeWidth="1.2"
          />

          <line
            x1="440"
            y1="690"
            x2="440"
            y2="770"
            stroke="var(--hero-geom-line-accent)"
            strokeWidth="0.85"
            strokeDasharray="4 6"
          />
          <path
            d="M 436 762 L 440 770 L 444 762"
            fill="none"
            stroke="var(--hero-geom-node-gold)"
            strokeWidth="1.2"
          />

          <line
            x1="1000"
            y1="690"
            x2="1000"
            y2="770"
            stroke="var(--hero-geom-line-accent)"
            strokeWidth="0.85"
            strokeDasharray="4 6"
          />
          <path
            d="M 996 762 L 1000 770 L 1004 762"
            fill="none"
            stroke="var(--hero-geom-node-gold)"
            strokeWidth="1.2"
          />

          <line
            x1="1300"
            y1="680"
            x2="1300"
            y2="770"
            stroke="var(--hero-geom-line-mid)"
            strokeWidth="0.85"
            strokeDasharray="4 6"
          />
          <path
            d="M 1296 762 L 1300 770 L 1304 762"
            fill="none"
            stroke="var(--hero-geom-node-gold)"
            strokeWidth="1.2"
          />
        </g>
      </svg>
    </div>
  );
}
