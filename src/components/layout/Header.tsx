"use client";

import { useState } from "react";
import Link from "next/link";
import { personalInfo } from "@/data/personal";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0C0C0C]/90 backdrop-blur-md border-b border-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E5B842]"
        >
          <span className="w-2.5 h-2.5 bg-[#E5B842] inline-block transition-transform group-hover:scale-110" />
          <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white">
            {personalInfo.name.toUpperCase()}
          </span>
          <span className="font-mono text-xs text-[#707070] hidden md:inline-block">
            [ {personalInfo.tagline} ]
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-mono tracking-wider">
          <Link
            href="#selected-work"
            className="text-[#E5B842] font-semibold border-b-2 border-[#E5B842] pb-0.5"
          >
            WORK
          </Link>
          <Link
            href="#selected-work"
            className="text-[#A0A0A0] hover:text-[#E5B842] transition-colors"
          >
            MY PROJECTS
          </Link>
          <Link
            href="#about"
            className="text-[#A0A0A0] hover:text-[#E5B842] transition-colors"
          >
            ABOUT & CAPABILITIES
          </Link>
          <Link
            href="#field-notes"
            className="text-[#A0A0A0] hover:text-[#E5B842] transition-colors"
          >
            FIELD NOTES
          </Link>
          <Link
            href="#contact"
            className="text-[#A0A0A0] hover:text-[#E5B842] transition-colors"
          >
            CONTACT
          </Link>
        </nav>

        {/* Action */}
        <div className="hidden sm:flex items-center">
          <Link
            href="#contact"
            className="border border-[#E5B842] px-4 py-1.5 text-xs font-mono tracking-wider text-[#E5B842] hover:bg-[#E5B842] hover:text-black transition-all duration-200"
          >
            LET&apos;S CONNECT
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="text-[#A0A0A0] hover:text-white p-2 focus:outline-none focus:ring-1 focus:ring-[#E5B842]"
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
          <Link
            href="#selected-work"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#E5B842] py-2 border-b border-[#1A1A1A]"
          >
            → WORK / SELECTED PROJECTS
          </Link>
          <Link
            href="#selected-work"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#C0C0C0] hover:text-white py-2 border-b border-[#1A1A1A]"
          >
            MY PROJECTS
          </Link>
          <Link
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#C0C0C0] hover:text-white py-2 border-b border-[#1A1A1A]"
          >
            ABOUT & CAPABILITIES
          </Link>
          <Link
            href="#field-notes"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#C0C0C0] hover:text-white py-2 border-b border-[#1A1A1A]"
          >
            FIELD NOTES
          </Link>
          <Link
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#C0C0C0] hover:text-white py-2 border-b border-[#1A1A1A]"
          >
            CONTACT
          </Link>
          <div className="pt-2">
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center border border-[#E5B842] py-2.5 text-[#E5B842] hover:bg-[#E5B842] hover:text-black transition-colors"
            >
              LET&apos;S CONNECT
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
