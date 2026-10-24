"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import type { EditorialProject } from "@/types";

interface ProjectCarouselProps {
  projects: EditorialProject[];
}

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
 * Extracts a concise 1-2 sentence description from a longer project description.
 */
function getConciseDescription(desc: string | null | undefined): string {
  if (!desc) return "";
  const cleaned = desc.trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 2) {
    return cleaned;
  }
  const twoSentences = `${sentences[0]} ${sentences[1]}`.trim();
  if (twoSentences.length > 200) {
    return sentences[0].trim();
  }
  return twoSentences;
}

/**
 * Resolves primary project image with precedence:
 * 1. Database project_images marked as isPrimary
 * 2. First database project_image
 * 3. Fallback to presentation_data.visuals.main
 */
function resolveProjectImage(project: EditorialProject): { src: string | null; alt: string } {
  const sortedImages = (project.images || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const primary = sortedImages.find((img) => img.isPrimary) || sortedImages[0] || null;
  const src = primary?.publicUrl || primary?.storagePath || project.visuals?.main || null;
  const alt = primary?.altText || `${project.title} preview screenshot`;
  return { src, alt };
}

/**
 * Detects genuine external source-code repository link.
 */
function resolveSourceCodeLink(project: EditorialProject) {
  return (project.links || []).find((l) => {
    if (l.type === "case-study") return false;
    if (l.type === "github") return true;
    const labelLower = (l.label || "").toLowerCase();
    if (
      labelLower.includes("source") ||
      labelLower.includes("github") ||
      labelLower.includes("codebase") ||
      labelLower.includes("repository")
    ) {
      return true;
    }
    const urlLower = (l.url || "").toLowerCase();
    return urlLower.includes("github.com") || urlLower.includes("gitlab.com");
  });
}

export default function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const total = projects.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Automatic advancement every 7 seconds (paused on hover, focus, touch, or prefers-reduced-motion)
  useEffect(() => {
    if (total <= 1 || isPaused || reducedMotion) return;

    const timer = setInterval(() => {
      handleNext();
    }, 7000);

    return () => clearInterval(timer);
  }, [total, isPaused, reducedMotion, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch & Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null) {
      const deltaX = touchDeltaXRef.current;
      if (deltaX < -45) {
        handleNext();
      } else if (deltaX > 45) {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    setIsPaused(false);
  };

  if (total === 0) {
    return null;
  }

  return (
    <div
      ref={carouselRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected Projects Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative w-full outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-gold-text,#E5B842)]/50 rounded-2xl"
    >
      {/* Cards Stage Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full min-h-[600px] sm:min-h-[640px] md:min-h-[680px] lg:min-h-[720px] py-6 sm:py-8 flex items-center justify-center select-none overflow-visible"
      >
        {projects.map((project, index) => {
          // Circular offset relative to active card
          let offset = index - activeIndex;
          if (total > 2) {
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;
          } else if (total === 2) {
            if (offset === -1) offset = -1;
            else if (offset === 1) offset = 1;
          }

          const isActive = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;
          const isVisible = Math.abs(offset) <= 1;

          const { src: imageSrc, alt: imageAlt } = resolveProjectImage(project);
          const sourceCodeLink = resolveSourceCodeLink(project);
          const conciseDesc = getConciseDescription(project.description);
          const displayTools = (project.tools || []).slice(0, 3);
          const categoryLabel = [
            project.category,
            project.tags && project.tags.length > 0 ? project.tags[0] : null,
          ]
            .filter(Boolean)
            .slice(0, 2)
            .join(" · ");

          // Layered cover-flow transforms
          let transformStyle = "";
          let zIndexStyle = 10;
          let opacityStyle = 0;
          let pointerEventsStyle: "auto" | "none" = "none";

          if (isActive) {
            transformStyle = "translateX(0%) translateY(0px) scale(1)";
            zIndexStyle = 30;
            opacityStyle = 1;
            pointerEventsStyle = "auto";
          } else if (isLeft) {
            transformStyle = "translateX(-52%) translateY(16px) scale(0.88)";
            zIndexStyle = 20;
            opacityStyle = 0.65;
            pointerEventsStyle = "auto";
          } else if (isRight) {
            transformStyle = "translateX(52%) translateY(16px) scale(0.88)";
            zIndexStyle = 20;
            opacityStyle = 0.65;
            pointerEventsStyle = "auto";
          } else {
            transformStyle = `translateX(${offset > 0 ? "80%" : "-80%"}) translateY(32px) scale(0.76)`;
            zIndexStyle = 10;
            opacityStyle = 0;
            pointerEventsStyle = "none";
          }

          return (
            <div
              key={project.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${project.title} (${index + 1} of ${total})`}
              aria-hidden={!isActive}
              onClick={() => {
                if (!isActive && isVisible) {
                  setActiveIndex(index);
                }
              }}
              style={{
                transform: transformStyle,
                zIndex: zIndexStyle,
                opacity: opacityStyle,
                pointerEvents: pointerEventsStyle,
                transition: reducedMotion
                  ? "opacity 200ms ease"
                  : "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms ease, box-shadow 450ms ease, filter 450ms ease",
              }}
              className={`absolute top-6 sm:top-8 bottom-6 sm:bottom-8 my-auto w-[90%] sm:w-[78%] md:w-[68%] lg:w-[58%] max-w-[680px] h-fit rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? "bg-[var(--theme-bg-surface,#0E0E10)] border-[var(--theme-gold-text,#E5B842)]/45 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85),0_0_24px_rgba(229,184,66,0.12)] cursor-default"
                  : "bg-[#0B0B0D] border-[#222226] shadow-[0_16px_36px_rgba(0,0,0,0.7)] cursor-pointer hover:border-[var(--theme-gold-text,#E5B842)]/40 hover:opacity-85 brightness-90"
              }`}
            >
              {/* Media Preview Container - clipping image inside top rounded corners */}
              <div className="relative w-full aspect-[16/10] bg-[#0A0A0C] overflow-hidden rounded-t-2xl border-b border-[var(--theme-border-strong,#1E1E22)]">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 55vw"
                    priority={isActive}
                    className="object-cover object-top transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121214] to-[#0A0A0C] p-6 text-center">
                    <span className="font-mono text-2xl font-bold text-[var(--theme-gold-text,#E5B842)]/40 mb-2">
                      {project.projectNumber || String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-xs text-[#707074] uppercase tracking-wider">
                      {project.category || "Case Study"}
                    </span>
                  </div>
                )}

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C]/90 via-transparent to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#0C0C0E]/90 backdrop-blur-md border border-[#28282D] rounded-[6px] font-mono text-[10px] text-[var(--theme-gold-text,#E5B842)] font-semibold tracking-wider select-none">
                    {project.projectNumber || String(index + 1).padStart(2, "0")}
                  </span>
                  {project.badge && (
                    <span className="px-2 py-0.5 bg-[#0C0C0E]/80 border border-[#28282D] rounded-[4px] font-mono text-[9px] text-[#A0A0A5] tracking-wider uppercase">
                      {project.badge}
                    </span>
                  )}
                </div>

                {project.year && (
                  <div className="absolute top-3.5 right-3.5 px-2 py-0.5 bg-[#0C0C0E]/80 border border-[#28282D] rounded-[4px] font-mono text-[10px] text-[#88888C] tracking-wider select-none">
                    {project.year}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {categoryLabel && (
                    <div className="font-mono text-[11px] font-medium tracking-wider uppercase text-[var(--theme-gold-text,#E5B842)]/90">
                      {categoryLabel}
                    </div>
                  )}

                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--theme-text-primary,#F3F3F3)] leading-snug">
                    {isActive ? (
                      <Link
                        href={`/projects/${project.slug}`}
                        className="hover:text-[var(--theme-gold-text,#E5B842)] transition-colors focus:outline-none"
                      >
                        {project.title}
                      </Link>
                    ) : (
                      <span>{project.title}</span>
                    )}
                  </h3>

                  {/* Concise Description: only displayed prominently on active foreground card */}
                  {isActive && conciseDesc && (
                    <p className="text-xs sm:text-[13px] text-[var(--theme-text-secondary,#9E9E9E)] leading-relaxed font-normal line-clamp-2">
                      {conciseDesc}
                    </p>
                  )}

                  {/* Tech stack tags */}
                  {displayTools.length > 0 && (
                    <div className="pt-1 flex items-center flex-wrap gap-1.5 font-mono text-[11px] text-[#A0A0A5]">
                      {displayTools.map((tool, idx) => (
                        <span key={tool} className="inline-flex items-center gap-1.5">
                          <span className="text-[#CCCCCC]">{tool}</span>
                          {idx < displayTools.length - 1 && (
                            <span
                              className="text-[var(--theme-gold-text,#E5B842)]/60 text-[10px]"
                              aria-hidden="true"
                            >
                              ·
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3.5 border-t border-[var(--theme-border-strong,#1C1C20)] flex items-center justify-between flex-wrap gap-2.5 font-mono text-xs">
                  {isActive ? (
                    <>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-1.5 text-[var(--theme-gold-text,#E5B842)] hover:text-[#F0C44E] font-semibold tracking-wider uppercase transition-colors group/btn focus:outline-none"
                      >
                        <span>VIEW PROJECT</span>
                        <span
                          className="text-sm transition-transform duration-200 group-hover/btn:translate-x-1"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </Link>

                      {sourceCodeLink ? (
                        <a
                          href={sourceCodeLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--theme-text-muted,#707074)] hover:text-[var(--theme-text-primary,#F3F3F3)] tracking-wider uppercase transition-colors focus:outline-none"
                          title="Open GitHub source code repository"
                        >
                          <span>VIEW SOURCE CODE</span>
                          <span className="text-[11px]" aria-hidden="true">
                            ↗
                          </span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#4A4A50] tracking-widest uppercase select-none">
                          CASE STUDY
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between text-[#707074] font-mono text-[10px] uppercase tracking-wider">
                      <span>CLICK TO VIEW</span>
                      <span>0{index + 1}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architectural Navigation Controls & Indicator Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 flex items-center justify-between border-t border-[var(--theme-border-subtle,#1A1A1E)] pt-4">
        {/* Left: Position Indicator (e.g. 01 / 04) */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs tracking-widest uppercase text-[#707074]">
            <span className="text-[var(--theme-gold-text,#E5B842)] font-bold text-sm">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="mx-1.5 text-[#444448]">/</span>
            <span>{String(total).padStart(2, "0")}</span>
          </div>

          {/* Segmented mini-bar indicator */}
          <div className="hidden sm:flex items-center gap-1">
            {projects.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Jump to project ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 focus:outline-none ${
                  i === activeIndex
                    ? "w-6 bg-[var(--theme-gold-text,#E5B842)]"
                    : "w-2 bg-[#28282D] hover:bg-[#404046]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center / Right: Arrows and auto-advance status */}
        <div className="flex items-center gap-2">
          {/* Pause / Play tooltip indicator */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-[#55555A] uppercase tracking-wider mr-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPaused || reducedMotion
                  ? "bg-[#666666]"
                  : "bg-[var(--theme-gold-text,#E5B842)] animate-pulse"
              }`}
            />
            <span>{isPaused ? "PAUSED" : "AUTO 7S"}</span>
          </div>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous project"
            className="w-10 h-10 rounded-lg border border-[#28282D] hover:border-[var(--theme-gold-text,#E5B842)] bg-[#101012] hover:bg-[#18181C] text-[var(--theme-text-primary,#F3F3F3)] hover:text-[var(--theme-gold-text,#E5B842)] flex items-center justify-center transition-all focus:outline-none focus:ring-1 focus:ring-[var(--theme-gold-text,#E5B842)]"
          >
            <span className="font-mono text-base font-bold" aria-hidden="true">
              ←
            </span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next project"
            className="w-10 h-10 rounded-lg border border-[#28282D] hover:border-[var(--theme-gold-text,#E5B842)] bg-[#101012] hover:bg-[#18181C] text-[var(--theme-text-primary,#F3F3F3)] hover:text-[var(--theme-gold-text,#E5B842)] flex items-center justify-center transition-all focus:outline-none focus:ring-1 focus:ring-[var(--theme-gold-text,#E5B842)]"
          >
            <span className="font-mono text-base font-bold" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
