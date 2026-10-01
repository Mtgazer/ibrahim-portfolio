"use client";

import { useState } from "react";
import Link from "next/link";
import { personalInfo } from "@/data/personal";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    personalInfo.email
  )}&su=${encodeURIComponent("Portfolio Inquiry")}&body=${encodeURIComponent(
    "Hi Ibrahim,\n\nI came across your portfolio and would like to get in touch.\n\nBest,"
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(personalInfo.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <section
      id="contact"
      className="scroll-mt-20 w-full py-16 sm:py-24 border-b border-[#1A1A1A] bg-[#0C0C0C]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Section Label */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] inline-block shadow-[0_0_6px_rgba(229,184,66,0.5)]" />
            <span className="font-mono text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#E5B842] select-none">
              CONTACT
            </span>
          </div>

          <div className="w-full h-px bg-[#1F1F1F]" />
        </div>

        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F3F3F3] leading-[1.1]">
            Let&apos;s build something{" "}
            <span className="text-[#E5B842] italic font-serif font-normal">
              thoughtful
            </span>
            .
          </h2>
          <p className="text-sm sm:text-base text-[#9E9E9E] leading-relaxed max-w-2xl">
            Available for Junior UI/UX roles, design internships, and selected
            product interface contracts. Based in Cairo, Egypt (UTC+2), ready to
            collaborate globally.
          </p>
        </div>

        {/* Two Contact Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Direct Transmission */}
          <div className="border border-[#222222] bg-[#121212] rounded-[10px] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[10px] sm:text-xs text-[#666666] tracking-wider uppercase block">
                DIRECT TRANSMISSION
              </span>
              <a
                href={`mailto:${personalInfo.email}`}
                className="text-xl sm:text-2xl xl:text-3xl font-bold text-[#F3F3F3] hover:text-[#E5B842] transition-colors break-words"
              >
                {personalInfo.email}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
              <a
                href={gmailComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-semibold px-5 py-3 tracking-wider uppercase transition-colors rounded-[8px]"
              >
                <span>SEND MESSAGE</span>
                <span>↗</span>
              </a>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 border border-[#333333] hover:border-[#E5B842] bg-[#181818] text-[#A0A0A0] hover:text-white px-4 py-3 tracking-wider uppercase transition-colors cursor-pointer rounded-[8px]"
              >
                <span>⧉</span>
                <span>{copied ? "ADDRESS COPIED!" : "COPY ADDRESS"}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Professional Network */}
          <div className="border border-[#222222] bg-[#121212] rounded-[10px] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[10px] sm:text-xs text-[#666666] tracking-wider uppercase block">
                PROFESSIONAL NETWORK
              </span>
              <h3 className="text-xl sm:text-2xl xl:text-3xl font-bold text-[#F3F3F3]">
                LinkedIn &amp; Design Profiles
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs tracking-wider uppercase">
              <Link
                href={personalInfo.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#E5B842] hover:underline transition-colors"
              >
                <LinkedInIcon className="w-4 h-4 shrink-0 fill-current" />
                <span>LINKEDIN PROFILE</span>
                <span>↗</span>
              </Link>
              <span className="text-[#444444]">/</span>
              <Link
                href={personalInfo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#A0A0A0] hover:text-white hover:underline transition-colors"
              >
                <GitHubIcon className="w-4 h-4 shrink-0 fill-current" />
                <span>GITHUB</span>
                <span>↗</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Metadata Footer Strip */}
        <div className="pt-8 border-t border-[#1C1C1C] space-y-3 font-mono text-xs text-[#707070] tracking-wider">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div>
              LOCATION: {personalInfo.location.toUpperCase()}
            </div>
            <div>TIMEZONE: {personalInfo.timezone.toUpperCase()}</div>
          </div>
          <div>
            <span className="text-[#E5B842]">
              ALL ARTIFACTS DESIGNED BY {personalInfo.name.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
