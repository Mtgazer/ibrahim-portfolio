"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { SplineEvent } from "@splinetool/react-spline";

// Dynamically import Spline to ensure clean client-side WebGL rendering
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0C0C0C]" aria-hidden="true" />,
});

// Identified exact View Work button objects from the customized Spline scene
const VIEW_WORK_NAMES = new Set(["Button", "Button text", "Button 3", "View Work", "VIEW WORK"]);
const VIEW_WORK_IDS = new Set([33, 36, 37]);
const VIEW_WORK_UUIDS = new Set([
  "98409477-34b2-4ba6-b118-2589beaf82f0",
  "7c06290f-1b0f-441c-8752-d9175c08bf25",
  "be7eae68-7d04-4b0e-8053-73e6a69c0cbb",
]);

interface SplineTarget {
  name?: string;
  id?: number | string;
  uuid?: string;
  parent?: SplineTarget | null;
}

function isViewWorkTarget(target: SplineTarget | null | undefined): boolean {
  if (!target) return false;
  if (target.name && VIEW_WORK_NAMES.has(target.name)) return true;
  if (target.id && VIEW_WORK_IDS.has(Number(target.id))) return true;
  if (target.uuid && VIEW_WORK_UUIDS.has(target.uuid)) return true;
  if (typeof target.name === "string" && target.name.toLowerCase().includes("button")) return true;
  if (target.parent && isViewWorkTarget(target.parent)) return true;
  return false;
}

const TARGET_HERO_COPY_DESKTOP =
  "Software developer building digital products, exploring AI, design, and data.";
const TARGET_HERO_COPY_MOBILE =
  "Software developer building\ndigital products, exploring AI,\ndesign, and data.";

interface SplineAppInternal {
  _scene?: {
    traverse?: (cb: (obj: Spline3DObject) => void) => void;
  };
  requestRender?: () => void;
}

interface Spline3DObject {
  name?: string;
  type?: string;
  position?: { x: number; y: number; z: number };
  scale?: { set: (x: number, y: number, z: number) => void };
  geometry?: {
    font?: { isLoaded?: boolean; loadingPromise?: Promise<void> };
    setText?: (t: string, a: unknown) => Promise<void>;
  };
  updateMatrix?: () => void;
  updateMatrixWorld?: (force?: boolean) => void;
}

const applyResponsiveLayout = async (app: unknown, width: number) => {
  const splineApp = app as SplineAppInternal;
  if (!splineApp?._scene) return;

  let heading: Spline3DObject | undefined;
  let subheading: Spline3DObject | undefined;
  let logo: Spline3DObject | undefined;
  let button: Spline3DObject | undefined;
  let waves: Spline3DObject | undefined;

  splineApp._scene.traverse?.((obj) => {
    if (obj.name === "Heading") heading = obj;
    if (obj.name === "Subheading") subheading = obj;
    if (obj.name?.includes("ChatGPT Image")) logo = obj;
    if (obj.name === "Button 3") button = obj;
    if (obj.name === "Ellipse" && obj.type === "Group") waves = obj;
  });

  const isSmallMobile = width <= 390;
  const isMobile = width < 768 && !isSmallMobile;
  const isTablet = width >= 768 && width < 1024;

  let targetText = TARGET_HERO_COPY_DESKTOP;
  let headingScale = 1.0;
  let headingY = 6;
  let subheadingScale = 1.0;
  let subheadingY = -22;
  let logoScale = 1.0;
  let logoY = 40;
  let buttonScale = 1.0;
  let buttonY = -50;
  let wavesScale = 1.0;

  if (isSmallMobile) {
    targetText = TARGET_HERO_COPY_MOBILE;
    headingScale = 0.44;
    headingY = 8;
    subheadingScale = 0.72;
    subheadingY = -15;
    logoScale = 0.65;
    logoY = 32;
    buttonScale = 0.72;
    buttonY = -42;
    wavesScale = 0.75;
  } else if (isMobile) {
    targetText = TARGET_HERO_COPY_MOBILE;
    headingScale = 0.52;
    headingY = 8;
    subheadingScale = 0.85;
    subheadingY = -16;
    logoScale = 0.75;
    logoY = 34;
    buttonScale = 0.80;
    buttonY = -45;
    wavesScale = 0.85;
  } else if (isTablet) {
    targetText = TARGET_HERO_COPY_MOBILE;
    headingScale = 0.75;
    headingY = 7;
    subheadingScale = 0.95;
    subheadingY = -18;
    logoScale = 0.90;
    logoY = 38;
    buttonScale = 0.90;
    buttonY = -48;
    wavesScale = 0.95;
  }

  if (subheading?.geometry?.setText) {
    const font = subheading.geometry.font;
    if (font?.loadingPromise) {
      await font.loadingPromise;
    }
    await subheading.geometry.setText(targetText, app);
    subheading.scale?.set(subheadingScale, subheadingScale, subheadingScale);
    if (subheading.position) subheading.position.y = subheadingY;
    subheading.updateMatrix?.();
    subheading.updateMatrixWorld?.(true);
  }

  if (heading) {
    heading.scale?.set(headingScale, headingScale, headingScale);
    if (heading.position) heading.position.y = headingY;
    heading.updateMatrix?.();
    heading.updateMatrixWorld?.(true);
  }

  if (logo) {
    logo.scale?.set(logoScale, logoScale, logoScale);
    if (logo.position) logo.position.y = logoY;
    logo.updateMatrix?.();
    logo.updateMatrixWorld?.(true);
  }

  if (button) {
    button.scale?.set(buttonScale, buttonScale, buttonScale);
    if (button.position) button.position.y = buttonY;
    button.updateMatrix?.();
    button.updateMatrixWorld?.(true);
  }

  if (waves) {
    waves.scale?.set(wavesScale, wavesScale, wavesScale);
    waves.updateMatrix?.();
    waves.updateMatrixWorld?.(true);
  }

  splineApp.requestRender?.();
};

export default function SplineHeroClient() {
  const appRef = useRef<unknown>(null);

  const scrollToWork = () => {
    const target = document.getElementById("work") || document.getElementById("portfolio-intro");
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSplineMouseDown = (e: SplineEvent) => {
    if (isViewWorkTarget(e.target)) {
      scrollToWork();
    }
  };

  const handleSplineLoad = async (app: unknown) => {
    try {
      appRef.current = app;
      if (typeof window !== "undefined") {
        (window as unknown as { __splineApp: unknown }).__splineApp = app;
      }

      const runUpdate = async () => {
        if (typeof window !== "undefined") {
          await applyResponsiveLayout(app, window.innerWidth);
        }
      };

      await runUpdate();
      for (const delay of [100, 300, 800, 1500]) {
        await new Promise((r) => setTimeout(r, delay));
        await runUpdate();
      }
    } catch (err) {
      console.error("Spline responsive layout error:", err);
    }
  };

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (appRef.current && typeof window !== "undefined") {
          applyResponsiveLayout(appRef.current, window.innerWidth);
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* 
        Accessible screen-reader fallback:
        Visually hidden (sr-only), preserving full keyboard & screen-reader accessibility
        without creating any duplicate visible UI element.
      */}
      <div className="sr-only">
        <h1>IBRAHIM KHALIL</h1>
        <p>{TARGET_HERO_COPY_DESKTOP}</p>
      </div>

      <a
        href="#work"
        onClick={(e) => {
          e.preventDefault();
          scrollToWork();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#E5B842] focus:text-black focus:font-mono focus:text-xs"
      >
        Skip to Portfolio Dossier / Work
      </a>

      {/* Spline Interactive Scene with wave animation and 3D View Work button */}
      <Spline
        scene="https://prod.spline.design/y9t2HGdjVWaKCHD4/scene.splinecode"
        className="w-full h-full"
        onLoad={handleSplineLoad}
        onSplineMouseDown={handleSplineMouseDown}
      />

      {/* 
        Transparent Hit Target precisely positioned over the 3D Spline 'View Work' button.
        - Has NO visible background
        - Has NO border
        - Has NO visible text (preserves the 3D Spline button as the ONLY visible CTA)
        - Visually exposes the Spline button underneath
        - Responsively tracks the 3D button position across viewports
        - Triggers smooth scrolling to #work on click.
      */}
      <button
        type="button"
        onClick={scrollToWork}
        aria-label="View Work"
        className="absolute top-[69%] sm:top-[70%] md:top-[72%] lg:top-[73%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[145px] h-[40px] sm:w-[160px] sm:h-[44px] md:w-[190px] md:h-[48px] lg:w-[210px] lg:h-[52px] rounded-full bg-transparent border-0 p-0 m-0 cursor-pointer z-20 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5B842]/40"
      >
        <span className="sr-only">View Work</span>
      </button>
    </div>
  );
}
