"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { personalInfo } from "@/data/personal";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useActiveSection } from "@/lib/scroll-progress";

const NAV_ITEMS = [
  { id: "home", label: "HOME" },
  { id: "field-notes", label: "FIELD NOTES" },
  { id: "my-projects", label: "MY PROJECTS" },
  { id: "about", label: "ABOUT & CAPABILITIES" },
  { id: "contact", label: "CONTACT" },
] as const;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("home");
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  const navContainerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const isClickScrollingRef = useRef(false);

  const updateIndicator = useCallback((targetId: string) => {
    const targetEl = itemRefs.current[targetId];
    const container = navContainerRef.current;
    if (!targetEl || !container) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    setIndicatorStyle({
      left: targetRect.left - containerRect.left,
      width: targetRect.width,
      opacity: 1,
    });
  }, []);

  // Update indicator position whenever activeId changes
  useEffect(() => {
    updateIndicator(activeId);
  }, [activeId, updateIndicator]);

  // Recalculate indicator position on window resize
  useEffect(() => {
    const handleResize = () => {
      updateIndicator(activeId);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeId, updateIndicator]);

  const activeSection = useActiveSection();

  // Synchronize active nav item with shared scroll-progress controller (eliminates duplicate scroll listener)
  useEffect(() => {
    if (!isClickScrollingRef.current) {
      setActiveId(activeSection.id);
    }
  }, [activeSection.id]);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    isClickScrollingRef.current = true;
    setActiveId(id);
    updateIndicator(id);

    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `#${id}`);

      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      setTimeout(() => {
        isClickScrollingRef.current = false;
      }, 850);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
  };

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-50 w-full pt-2.5 sm:pt-3 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
      <div className="pointer-events-auto max-w-7xl mx-auto h-14 sm:h-[58px] px-4 sm:px-6 rounded-2xl bg-[var(--theme-header-bg)] backdrop-blur-xl border border-[var(--theme-border-strong)] shadow-[0_8px_32px_rgba(0,0,0,0.36)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.55)] flex items-center justify-between transition-all duration-300">
        {/* Brand / Logo */}
        <Link
          href="#home"
          onClick={(e) => handleNavClick(e, "home")}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--theme-focus-ring)] rounded-[8px]"
        >
          <Image
            src="/images/ik-logo.png"
            alt="IK Logo"
            width={22}
            height={22}
            priority
            className="h-5 w-auto object-contain transition-transform duration-200 group-hover:scale-105 flex-shrink-0"
          />
          <span className="font-mono text-xs sm:text-[13px] font-semibold tracking-wider text-[var(--theme-text-primary)]">
            {personalInfo.name.toUpperCase()}
          </span>
          <span className="font-mono text-xs text-[var(--theme-text-muted)] hidden md:inline-block">
            [ {personalInfo.tagline} ]
          </span>
        </Link>

        {/* Desktop Navigation with refined circular gold-node active indicator */}
        <nav
          ref={navContainerRef}
          aria-label="Primary navigation"
          className="relative hidden lg:flex items-center gap-7 xl:gap-8 text-xs font-mono tracking-wider py-2"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`relative px-1 py-1 transition-colors duration-200 focus:outline-none focus-visible:text-[var(--theme-gold-text)] flex items-center gap-1.5 ${
                  isActive
                    ? "text-[var(--theme-gold-text)] font-semibold"
                    : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-[var(--theme-gold-text)] animate-pulse"
                    style={{ boxShadow: "0 0 6px var(--theme-gold-glow, rgba(229,184,66,0.6))" }}
                  />
                )}
                <span>{item.label}</span>
              </a>
            );
          })}

          {/* Refined sliding circular gold-node indicator (replaces flat underline) */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 flex items-center justify-center transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--theme-gold-text)]"
              style={{
                boxShadow: "0 0 6px var(--theme-gold-glow, rgba(229,184,66,0.8)), 0 0 12px var(--theme-gold-glow, rgba(229,184,66,0.4))",
              }}
            />
          </div>
        </nav>

        {/* Actions Cluster: Theme Toggle + CTA + Mobile menu button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          {/* CTA */}
          <div className="hidden sm:flex items-center">
            <Link
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="border border-[var(--theme-gold-text)] rounded-[8px] px-3.5 py-1.5 text-xs font-mono tracking-wider text-[var(--theme-gold-text)] hover:bg-[var(--theme-gold-text)] hover:text-white dark:hover:text-black transition-all duration-200"
            >
              LET&apos;S CONNECT
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] p-2 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[var(--theme-focus-ring)]"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Floating rounded glass panel) */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 max-w-7xl mx-auto lg:hidden rounded-2xl border border-[var(--theme-border-strong)] bg-[var(--theme-header-bg)] backdrop-blur-xl px-6 py-5 space-y-3 font-mono text-xs tracking-wider shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleMobileNavClick(e, item.id)}
                className={`flex items-center gap-2 py-2 border-b border-[var(--theme-border-subtle)] transition-colors ${
                  isActive
                    ? "text-[var(--theme-gold-text)] font-semibold"
                    : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-gold-text)] shrink-0" />
                )}
                <span>{item.label}</span>
              </a>
            );
          })}
          <div className="pt-2">
            <Link
              href="#contact"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, "contact");
              }}
              className="block text-center border border-[var(--theme-gold-text)] rounded-[8px] py-2.5 text-[var(--theme-gold-text)] hover:bg-[var(--theme-gold-text)] hover:text-white dark:hover:text-black transition-colors"
            >
              LET&apos;S CONNECT
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
