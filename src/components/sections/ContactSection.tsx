"use client";

import { useState } from "react";
import Link from "next/link";
import { personalInfo } from "@/data/personal";

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="font-mono text-xs text-[#E5B842] tracking-wider uppercase">
            [COMMISSION &amp; ROLES // 2024]
          </div>
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
          <div className="border border-[#222222] bg-[#121212] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[10px] sm:text-xs text-[#666666] tracking-wider uppercase block">
                DIRECT TRANSMISSION
              </span>
              <a
                href={`mailto:${personalInfo.email}`}
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3F3F3] hover:text-[#E5B842] transition-colors break-all"
              >
                {personalInfo.email}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
              <a
                href={`mailto:${personalInfo.email}`}
                className="inline-flex items-center gap-1.5 bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-semibold px-5 py-3 tracking-wider uppercase transition-colors"
              >
                <span>SEND MESSAGE</span>
                <span>↗</span>
              </a>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 border border-[#333333] hover:border-[#E5B842] bg-[#181818] text-[#A0A0A0] hover:text-white px-4 py-3 tracking-wider uppercase transition-colors cursor-pointer"
              >
                <span>⧉</span>
                <span>{copied ? "ADDRESS COPIED!" : "COPY ADDRESS"}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Professional Network */}
          <div className="border border-[#222222] bg-[#121212] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[10px] sm:text-xs text-[#666666] tracking-wider uppercase block">
                PROFESSIONAL NETWORK
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3F3F3]">
                LinkedIn &amp; Design Profiles
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs tracking-wider uppercase">
              <Link
                href={personalInfo.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#E5B842] hover:underline"
              >
                <span>LINKEDIN PROFILE</span>
                <span>↗</span>
              </Link>
              <span className="text-[#444444]">/</span>
              <Link
                href={personalInfo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#A0A0A0] hover:text-white hover:underline"
              >
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
              LOCATION: {personalInfo.location.toUpperCase()} [{personalInfo.coordinates}]
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
