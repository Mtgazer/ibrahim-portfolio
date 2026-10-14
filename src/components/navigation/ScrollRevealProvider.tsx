"use client";

import { useEffect, useSyncExternalStore } from "react";

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
 * Editorial Scroll Reveal System
 * 
 * High-performance viewport entry manager.
 * - Single native IntersectionObserver for maximum efficiency and 0 per-frame React updates.
 * - Progressive enhancement: Content is fully visible if JS fails. 'reveal-ready' class is added on mount.
 * - Reduced motion respected via media query and direct initialization.
 * - Anchors and initial viewport items revealed immediately without delay.
 * - Reverse scrolling preserves visibility (reveals are one-way to prevent jarring re-animations).
 */
export default function ScrollRevealProvider() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    // Under reduced motion, reveal everything immediately and exit
    if (reducedMotion) {
      root.classList.add("reveal-ready");
      const allTargets = document.querySelectorAll(
        ".reveal-heading, .reveal-card, .reveal-item, .reveal-media"
      );
      allTargets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    // Enable reveal styling on root (progressive enhancement)
    root.classList.add("reveal-ready");

    const SELECTOR =
      ".reveal-heading:not(.is-revealed), .reveal-card:not(.is-revealed), .reveal-item:not(.is-revealed), .reveal-media:not(.is-revealed)";

    // If an anchor hash exists (e.g. #about, #my-projects), reveal items above and in target
    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const targetTop = targetEl.getBoundingClientRect().top + window.scrollY;
        const allTargets = document.querySelectorAll(SELECTOR);
        allTargets.forEach((el) => {
          const elTop = el.getBoundingClientRect().top + window.scrollY;
          if (elTop <= targetTop + 200) {
            el.classList.add("is-revealed");
          }
        });
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -5% 0px", // Trigger slightly inside the viewport
        threshold: 0.04,
      }
    );

    const observePending = () => {
      const elements = document.querySelectorAll(SELECTOR);
      const windowHeight = window.innerHeight;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Immediately reveal elements already inside or above the visible viewport
        if (rect.top <= windowHeight * 0.94) {
          el.classList.add("is-revealed");
        } else {
          observer.observe(el);
        }
      });
    };

    observePending();

    // Check again after fonts or images settle
    if (document.fonts) {
      document.fonts.ready.then(observePending).catch(() => {});
    }
    const timer = setTimeout(observePending, 400);

    // Watch for dynamic DOM additions (e.g. filtered cards or tabs)
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(() => {
        observePending();
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [reducedMotion]);

  return null;
}
