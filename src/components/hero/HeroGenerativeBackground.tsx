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

function subscribeWindowResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getMobileSnapshot(): boolean {
  return window.innerWidth < 768;
}

function getMobileServerSnapshot(): boolean {
  return false;
}

export default function HeroGenerativeBackground({
  trackRef,
  contentRef,
}: HeroGenerativeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Layer & Element Refs for GSAP Timeline Target Selection
  const arcLeftPrimaryRef = useRef<SVGPathElement>(null);
  const arcLeftMetricRef = useRef<SVGPathElement>(null);
  const arcLeftGoldRef = useRef<SVGPathElement>(null);
  const arcRightPrimaryRef = useRef<SVGPathElement>(null);
  const arcRightMetricRef = useRef<SVGPathElement>(null);
  const arcRightGoldRef = useRef<SVGPathElement>(null);

  // Progressive Drawing Vectors
  const vecLeftPrimaryRef = useRef<SVGLineElement>(null);
  const vecRightPrimaryRef = useRef<SVGLineElement>(null);
  const vecNetLeftRef = useRef<SVGLineElement>(null);
  const vecNetRightRef = useRef<SVGLineElement>(null);
  const vecCrossLeftRef = useRef<SVGLineElement>(null);
  const vecCrossRightRef = useRef<SVGLineElement>(null);
  const datumTopLeftRef = useRef<SVGLineElement>(null);
  const datumTopRightRef = useRef<SVGLineElement>(null);

  // Traveling Node Assemblies
  const nodeAlphaRef = useRef<SVGGElement>(null);
  const nodeAlphaPulseRef = useRef<SVGCircleElement>(null);
  const nodeBetaRef = useRef<SVGGElement>(null);
  const nodeBetaPulseRef = useRef<SVGCircleElement>(null);

  // Annotations & Exit Flow
  const coordLeftRef = useRef<SVGTextElement>(null);
  const coordRightRef = useRef<SVGTextElement>(null);
  const exitAssemblyRef = useRef<SVGGElement>(null);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const isMobile = useSyncExternalStore(
    subscribeWindowResize,
    getMobileSnapshot,
    getMobileServerSnapshot
  );

  useEffect(() => {
    // If reduced motion is requested or trackRef is missing, render static pristine state
    if (reducedMotion || !trackRef || !trackRef.current) {
      return;
    }

    const trackEl = trackRef.current;

    const ctx = gsap.context(() => {
      // Create master scrubbed timeline bound to track scroll progress
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackEl,
          start: "top top+=64", // Starts as soon as hero meets the navbar bottom
          end: "bottom bottom", // Runs across the complete height of the hero scroll track
          scrub: 0.8, // Silky physics-smoothed scrub
          invalidateOnRefresh: true,
        },
      });

      // =====================================================================
      // STAGE 1 -> STAGE 2: 0% -> 30% [EXPANSION]
      // =====================================================================
      // 1. Orbital Arcs visibly rotate and scale
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
        // Draw in gold accent arc
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

      // 2. Progressive Line Drawing (Trajectory Lines)
      if (vecLeftPrimaryRef.current) {
        tl.to(
          vecLeftPrimaryRef.current,
          {
            strokeDashoffset: 190, // Draws 60% of the vector
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

      // 3. Node Movement: Nodes Alpha & Beta travel along trajectory vectors
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

      // 4. Datum Line horizontal expansion
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

      // =====================================================================
      // STAGE 2 -> STAGE 3: 30% -> 65% [TRANSFORMATION / NETWORK]
      // =====================================================================
      // 1. Orbital Arcs continue expanding and opening
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

      // 2. Trajectory lines finish drawing 100% to intersection nodes
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

      // 3. Interconnecting Network Lines draw across
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

      // 4. Nodes arrive at milestone intersections (440, 560) and (1000, 560)
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

      // Coordinate labels slide and subtly reposition
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

      // =====================================================================
      // STAGE 3 -> STAGE 4: 65% -> 100% [HERO EXIT & DIRECTIONAL HANDOFF]
      // =====================================================================
      // 1. Decorative circular geometry fades down
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

      // 2. Downward Directional Streamer Assembly emerges prominently
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

      // 3. Foreground Content gently lifts and fades out as Field Notes section enters
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
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [trackRef, contentRef, reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full text-[var(--hero-geom-line-subtle)]"
      >
        <defs>
          {/* Central elliptical clearing mask to keep hero text, name, and logo completely uninhibited */}
          <radialGradient
            id="hero-center-mask-gradient"
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
          <mask id="hero-generative-mask">
            <rect width="1440" height="900" fill="url(#hero-center-mask-gradient)" />
          </mask>
        </defs>

        {/* Master geometry container with central clearing mask applied */}
        <g mask="url(#hero-generative-mask)">
          {/* ============================================================== */}
          {/* 1. ORBITAL ARCS & COMPASS GAUGES */}
          {/* ============================================================== */}
          <g id="orbital-arcs-group">
            {/* Left Primary Orbital Arc */}
            <path
              ref={arcLeftPrimaryRef}
              d="M 140 60 A 420 420 0 0 0 160 840"
              fill="none"
              stroke="var(--hero-geom-line-mid)"
              strokeWidth="1.1"
            />
            {/* Left Concentric Dashed Metric Arc */}
            <path
              ref={arcLeftMetricRef}
              d="M 185 130 A 380 380 0 0 0 195 770"
              fill="none"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.85"
              strokeDasharray="4 10"
            />
            {/* Left Gold Accent Arc (Progressively draws in) */}
            <path
              ref={arcLeftGoldRef}
              d="M 240 220 A 340 340 0 0 0 255 500"
              fill="none"
              stroke="var(--hero-geom-line-accent)"
              strokeWidth="1.4"
              strokeDasharray="320"
              strokeDashoffset={reducedMotion ? "0" : "320"}
            />

            {/* Right Primary Orbital Arc */}
            <path
              ref={arcRightPrimaryRef}
              d="M 1300 60 A 420 420 0 0 1 1280 840"
              fill="none"
              stroke="var(--hero-geom-line-mid)"
              strokeWidth="1.1"
            />
            {/* Right Concentric Dashed Metric Arc */}
            <path
              ref={arcRightMetricRef}
              d="M 1255 130 A 380 380 0 0 1 1245 770"
              fill="none"
              stroke="var(--hero-geom-line-subtle)"
              strokeWidth="0.85"
              strokeDasharray="4 10"
            />
            {/* Right Gold Accent Arc (Progressively draws in) */}
            <path
              ref={arcRightGoldRef}
              d="M 1200 220 A 340 340 0 0 1 1185 500"
              fill="none"
              stroke="var(--hero-geom-line-accent)"
              strokeWidth="1.4"
              strokeDasharray="320"
              strokeDashoffset={reducedMotion ? "0" : "320"}
            />

            {/* Auxiliary calibration rings */}
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

          {/* ============================================================== */}
          {/* 2. ARCHITECTURAL DATUMS & PROGRESSIVE NETWORK VECTORS */}
          {/* ============================================================== */}
          <g id="datums-and-vectors-group">
            {/* Top Datum Lines */}
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
            {/* Datum line millimeter gauge ticks */}
            <line x1="120" y1="155" x2="120" y2="165" stroke="var(--hero-geom-line-mid)" strokeWidth="0.8" />
            <line x1="240" y1="156" x2="240" y2="164" stroke="var(--hero-geom-line-subtle)" strokeWidth="0.7" />
            <line x1="360" y1="155" x2="360" y2="165" stroke="var(--hero-geom-line-mid)" strokeWidth="0.8" />
            <line x1="1080" y1="155" x2="1080" y2="165" stroke="var(--hero-geom-line-mid)" strokeWidth="0.8" />
            <line x1="1200" y1="156" x2="1200" y2="164" stroke="var(--hero-geom-line-subtle)" strokeWidth="0.7" />
            <line x1="1320" y1="155" x2="1320" y2="165" stroke="var(--hero-geom-line-mid)" strokeWidth="0.8" />

            {/* Bottom Datum Lines */}
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

            {/* Progressive Trajectory Vector Left (180, 160 -> 440, 560, length ~480) */}
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

            {/* Progressive Trajectory Vector Right (1260, 160 -> 1000, 560, length ~480) */}
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

            {/* Interconnecting Horizontal Network Lines (Stage 3 Transformation) */}
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

            {/* Diagonal Network Cross Struts */}
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

          {/* ============================================================== */}
          {/* 3. TRAVELING NODES & COORDINATE ANNOTATIONS */}
          {/* ============================================================== */}
          <g id="traveling-nodes-group">
            {/* Left Fixed Origin Ring (180, 160) */}
            <circle
              cx="180"
              cy="160"
              r="6"
              fill="none"
              stroke="var(--hero-geom-node-neutral)"
              strokeWidth="0.8"
            />
            <circle cx="180" cy="160" r="1.8" fill="var(--hero-geom-node-gold)" />

            {/* Right Fixed Origin Ring (1260, 160) */}
            <circle
              cx="1260"
              cy="160"
              r="6"
              fill="none"
              stroke="var(--hero-geom-node-neutral)"
              strokeWidth="0.8"
            />
            <circle cx="1260" cy="160" r="1.8" fill="var(--hero-geom-node-gold)" />

            {/* Destination Milestone Junction Rings */}
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

            {/* Traveling Node Alpha (Travels from 180, 160 -> 440, 560) */}
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
              {!isMobile && (
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
              )}
            </g>

            {/* Traveling Node Beta (Travels from 1260, 160 -> 1000, 560) */}
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
              {!isMobile && (
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
              )}
            </g>

            {/* Lower Precision Registration Crosshairs */}
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

            {/* Editorial Technical Annotations (Cairo, Egypt Coordinates) */}
            {!isMobile && (
              <>
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
              </>
            )}
          </g>
        </g>

        {/* ============================================================== */}
        {/* 4. STAGE 4 DIRECTIONAL EXIT HANDOFF ASSEMBLY */}
        {/* ============================================================== */}
        <g
          ref={exitAssemblyRef}
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          {/* Left Vertical Streamer (directs eye downward into Field Notes) */}
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

          {/* Center-Left Streamer */}
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

          {/* Center-Right Streamer */}
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

          {/* Right Vertical Streamer */}
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
