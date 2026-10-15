"use client";

import { useSyncExternalStore } from "react";

export interface SectionMeta {
  id: string;
  number: string;        // "01", "02", "03", "04", "05"
  index: number;         // 0, 1, 2, 3, 4
  total: number;         // 5
  name: string;          // Full label: "HOME", "FIELD NOTES", "SELECTED WORK", "ABOUT & CAPABILITIES", "CONTACT"
  shortName: string;     // Compact mobile label: "HOME", "FIELD NOTES", "WORK", "ABOUT", "CONTACT"
}

export const HOMEPAGE_SECTIONS: readonly SectionMeta[] = [
  { id: "home", number: "01", index: 0, total: 5, name: "HOME", shortName: "HOME" },
  { id: "field-notes", number: "02", index: 1, total: 5, name: "FIELD NOTES", shortName: "FIELD NOTES" },
  { id: "my-projects", number: "03", index: 2, total: 5, name: "SELECTED WORK", shortName: "WORK" },
  { id: "about", number: "04", index: 3, total: 5, name: "ABOUT & CAPABILITIES", shortName: "ABOUT" },
  { id: "contact", number: "05", index: 4, total: 5, name: "CONTACT", shortName: "CONTACT" },
] as const;

// Internal state singleton
let activeSection: SectionMeta = HOMEPAGE_SECTIONS[0];
let scrollProgress = 0; // Normalized 0.0 to 1.0

const activeSectionListeners = new Set<() => void>();
const progressListeners = new Set<(progress: number) => void>();
const boundProgressBars = new Set<HTMLElement>();

let isListening = false;
let rafId: number | null = null;
let intersectionObserver: IntersectionObserver | null = null;

interface CachedSection {
  meta: SectionMeta;
  el: HTMLElement | null;
  top: number;
}

let cachedSections: CachedSection[] = [];
let cachedDocHeight = 0;
let cachedWindowHeight = 0;
let cachedMaxScroll = 1;

/**
 * Caches section element offsets and document dimensions to prevent
 * forced synchronous layout reads (layout thrashing) on every scroll frame.
 */
export function updateCachedLayout() {
  if (typeof window === "undefined") return;
  cachedWindowHeight = window.innerHeight;
  cachedDocHeight = document.documentElement.scrollHeight;
  cachedMaxScroll = Math.max(1, cachedDocHeight - cachedWindowHeight);

  cachedSections = HOMEPAGE_SECTIONS.map((section) => {
    let el = document.getElementById(section.id);
    if (!el && section.id === "my-projects") {
      el = document.getElementById("selected-work");
    }
    return {
      meta: section,
      el,
      top: el ? el.offsetTop : 0,
    };
  });
}

/**
 * Fast normalized scroll progress of the hero section on mobile (0 to 1).
 * Reaches 1.0 as the hero approaches the handoff to Field Notes.
 * 100% arithmetic-only with zero DOM layout queries on scroll frames.
 */
export function getHeroMobileProgress(): number {
  if (typeof window === "undefined") return 0;
  const fieldNotesTop = cachedSections[1]?.top || (cachedWindowHeight || 700);
  const scrollY = window.scrollY;
  // Progresses from 0 at top to 1.0 when scrolling 65% of the distance to Field Notes
  const heroHandoffThreshold = Math.max(100, fieldNotesTop * 0.65);
  return Math.min(1, Math.max(0, scrollY / heroHandoffThreshold));
}

/**
 * High-efficiency scroll and active section evaluator.
 * Uses cached layout metrics and a unified reading eye-line at 42% of the viewport.
 */
function computeScrollMetrics() {
  if (typeof window === "undefined") return;

  const scrollY = window.scrollY;
  const windowHeight = cachedWindowHeight || window.innerHeight;
  const maxScroll = cachedMaxScroll || Math.max(1, (cachedDocHeight || 1000) - windowHeight);

  // 1. Normalized Continuous Page Progress (0 to 1) - Pure Arithmetic
  const nextProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
  if (Math.abs(nextProgress - scrollProgress) > 0.00008) {
    scrollProgress = nextProgress;

    // Direct hardware-accelerated transform on bound progress bars (zero React overhead)
    boundProgressBars.forEach((el) => {
      el.style.transform = `scaleX(${scrollProgress.toFixed(4)})`;
    });

    // Notify custom progress subscribers (for Phase 3/4 integration)
    progressListeners.forEach((cb) => cb(scrollProgress));
  }

  // 2. Active Section Detection (Unified 42% reading eye-line) using cached offsets
  let nextSection: SectionMeta = HOMEPAGE_SECTIONS[0];

  // Guaranteed HOME near top
  if (scrollY < 90) {
    nextSection = HOMEPAGE_SECTIONS[0];
  }
  // Guaranteed CONTACT near bottom
  else if (windowHeight + scrollY >= (cachedDocHeight || 1000) - 70) {
    nextSection = HOMEPAGE_SECTIONS[4];
  }
  // In-between sections using 42% reading eye-line with cached offsets (zero reflows!)
  else {
    const eyeLineY = scrollY + windowHeight * 0.42;

    for (let i = 0; i < cachedSections.length; i++) {
      if (cachedSections[i].top <= eyeLineY) {
        nextSection = cachedSections[i].meta;
      }
    }
  }

  // Only dispatch to React listeners when the active section ID actually changes
  if (nextSection.id !== activeSection.id) {
    activeSection = nextSection;
    activeSectionListeners.forEach((cb) => cb());
  }
}

function onScrollThrottled() {
  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      rafId = null;
      computeScrollMetrics();
    });
  }
}

function handleResize() {
  updateCachedLayout();
  computeScrollMetrics();
}

function ensureListener() {
  if (isListening || typeof window === "undefined") return;
  isListening = true;

  // Initialize from hash if direct landing occurs
  if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    const match = HOMEPAGE_SECTIONS.find(
      (s) => s.id === hash || (hash === "selected-work" && s.id === "my-projects")
    );
    if (match) {
      activeSection = match;
    }
  }

  // Initial layout measurement and computation pass
  updateCachedLayout();
  computeScrollMetrics();

  window.addEventListener("scroll", onScrollThrottled, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });

  // Native IntersectionObserver for efficient boundary crossing updates
  if (typeof IntersectionObserver !== "undefined") {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        let hasRelevantChange = false;
        entries.forEach((entry) => {
          if (entry.isIntersecting) hasRelevantChange = true;
        });
        if (hasRelevantChange) {
          updateCachedLayout();
          computeScrollMetrics();
        }
      },
      {
        rootMargin: "-25% 0px -45% 0px",
        threshold: [0, 0.25, 0.5],
      }
    );

    HOMEPAGE_SECTIONS.forEach((section) => {
      const el =
        document.getElementById(section.id) ||
        (section.id === "my-projects" ? document.getElementById("selected-work") : null);
      if (el) intersectionObserver?.observe(el);
    });
  }
}

function cleanupListenerIfEmpty() {
  if (
    activeSectionListeners.size === 0 &&
    progressListeners.size === 0 &&
    boundProgressBars.size === 0
  ) {
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", onScrollThrottled);
      window.removeEventListener("resize", handleResize);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
    }
    isListening = false;
  }
}

// ---------------------------------------------------------------------------
// Public API for Consumers (Indicator, Header, Phase 3/4)
// ---------------------------------------------------------------------------

/**
 * Subscribes to active section transitions. Only fires when section index changes.
 */
export function subscribeActiveSection(callback: () => void): () => void {
  activeSectionListeners.add(callback);
  ensureListener();
  return () => {
    activeSectionListeners.delete(callback);
    cleanupListenerIfEmpty();
  };
}

/**
 * Subscribes to normalized continuous progress (0 to 1).
 */
export function subscribeProgress(callback: (progress: number) => void): () => void {
  progressListeners.add(callback);
  ensureListener();
  return () => {
    progressListeners.delete(callback);
    cleanupListenerIfEmpty();
  };
}

/**
 * Directly binds a progress bar DOM element via transform: scaleX().
 * Provides 60/120fps hardware acceleration with zero React re-render overhead.
 */
export function bindProgressBar(element: HTMLElement): () => void {
  boundProgressBars.add(element);
  element.style.transform = `scaleX(${scrollProgress.toFixed(4)})`;
  ensureListener();
  return () => {
    boundProgressBars.delete(element);
    cleanupListenerIfEmpty();
  };
}

export function getActiveSectionSnapshot(): SectionMeta {
  return activeSection;
}

export function getServerActiveSectionSnapshot(): SectionMeta {
  return HOMEPAGE_SECTIONS[0];
}

/**
 * React hook for consuming the current active section.
 * Safe for React 19 / SSR and updates strictly on section boundary change.
 */
export function useActiveSection(): SectionMeta {
  return useSyncExternalStore(
    subscribeActiveSection,
    getActiveSectionSnapshot,
    getServerActiveSectionSnapshot
  );
}

/**
 * Synchronously retrieves current normalized progress (0 to 1).
 */
export function getScrollProgress(): number {
  return scrollProgress;
}
