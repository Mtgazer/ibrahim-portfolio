"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { personalInfo } from "@/data/personal";

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

  // Scroll-spy observer
  useEffect(() => {
    const sectionIds = ["home", "field-notes", "my-projects", "about", "contact"];

    const handleScroll = () => {
      if (isClickScrollingRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // 1. Guaranteed HOME when near top
      if (scrollY < 120) {
        setActiveId("home");
        return;
      }

      // 2. Guaranteed CONTACT when scrolled near bottom
      if (windowHeight + scrollY >= docHeight - 80) {
        setActiveId("contact");
        return;
      }

      // 3. Determine current section based on scroll line (35% from top of viewport)
      const referenceY = scrollY + windowHeight * 0.35;
      let current = "home";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (top <= referenceY) {
            current = id;
          }
        }
      }

      setActiveId(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header className="sticky top-0 z-50 w-full bg-[#0C0C0C]/90 backdrop-blur-md border-b border-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="#home"
          onClick={(e) => handleNavClick(e, "home")}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E5B842] rounded-[8px]"
        >
          <Image
            src="/images/ik-logo.png"
            alt="IK Logo"
            width={20}
            height={20}
            priority
            className="h-5 w-auto object-contain transition-transform duration-200 group-hover:scale-105 flex-shrink-0"
          />
          <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white">
            {personalInfo.name.toUpperCase()}
          </span>
          <span className="font-mono text-xs text-[#707070] hidden md:inline-block">
            [ {personalInfo.tagline} ]
          </span>
        </Link>

        {/* Desktop Navigation with shared moving active indicator */}
        <nav
          ref={navContainerRef}
          aria-label="Primary navigation"
          className="relative hidden lg:flex items-center gap-8 text-xs font-mono tracking-wider py-2"
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
                className={`relative py-1 transition-colors duration-200 focus:outline-none focus-visible:text-[#E5B842] ${
                  isActive
                    ? "text-[#E5B842] font-semibold"
                    : "text-[#A0A0A0] hover:text-[#E5B842]"
                }`}
              >
                {item.label}
              </a>
            );
          })}

          {/* Shared sliding gold underline indicator */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 h-[2px] bg-[#E5B842] transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
          />
        </nav>

        {/* CTA */}
        <div className="hidden sm:flex items-center">
          <Link
            href="#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className="border border-[#E5B842] rounded-[8px] px-4 py-1.5 text-xs font-mono tracking-wider text-[#E5B842] hover:bg-[#E5B842] hover:text-black transition-all duration-200"
          >
            LET&apos;S CONNECT
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="text-[#A0A0A0] hover:text-white p-2 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#E5B842]"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1F1F1F] bg-[#0C0C0C] px-6 py-6 space-y-4 font-mono text-xs tracking-wider">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleMobileNavClick(e, item.id)}
                className={`block py-2 border-b border-[#1A1A1A] transition-colors ${
                  isActive
                    ? "text-[#E5B842] font-semibold"
                    : "text-[#C0C0C0] hover:text-white"
                }`}
              >
                {isActive ? `→ ${item.label}` : item.label}
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
              className="block text-center border border-[#E5B842] rounded-[8px] py-2.5 text-[#E5B842] hover:bg-[#E5B842] hover:text-black transition-colors"
            >
              LET&apos;S CONNECT
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
