"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { fieldNotes } from "@/data/fieldNotes";

export default function FieldNotesSection() {
  const [currentIndex, setCurrentIndex] = useState(0); // Start on the first field note
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [stageHeight, setStageHeight] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  const totalNotes = fieldNotes.length;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalNotes) % totalNotes);
  }, [totalNotes]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalNotes);
  }, [totalNotes]);

  // Dynamically measure active card height to prevent any vertical clipping
  useEffect(() => {
    const updateActiveHeight = () => {
      const activeEl = cardRefs.current[currentIndex];
      if (activeEl) {
        const height = activeEl.offsetHeight;
        if (height > 0) {
          // Add 12px buffer for card shadow and gold luminous glow
          setStageHeight(height + 12);
        }
      }
    };

    updateActiveHeight();

    const activeEl = cardRefs.current[currentIndex];
    if (!activeEl) return;

    const observer = new ResizeObserver(() => {
      updateActiveHeight();
    });

    observer.observe(activeEl);
    window.addEventListener("resize", updateActiveHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateActiveHeight);
    };
  }, [currentIndex]);

  // Keyboard navigation when section is in view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const section = document.getElementById("field-notes");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;

      if (inView) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  // Pointer / Mouse drag handlers
  const isMouseDownRef = useRef(false);
  const mouseStartXRef = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    isMouseDownRef.current = true;
    mouseStartXRef.current = e.clientX;
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const deltaX = e.clientX - mouseStartXRef.current;
    setDragOffset(deltaX);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsDragging(false);
    const deltaX = e.clientX - mouseStartXRef.current;
    setDragOffset(0);
    if (deltaX < -45) {
      handleNext();
    } else if (deltaX > 45) {
      handlePrev();
    }
  };

  const onMouseLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  // Touch swipe handlers with vertical scroll preservation
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchDeltaXRef = useRef(0);
  const isSwipingRef = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchDeltaXRef.current = 0;
    isSwipingRef.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    const deltaY = e.touches[0].clientY - touchStartYRef.current;

    if (!isSwipingRef.current) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isSwipingRef.current = true;
        setIsDragging(true);
      }
    }

    if (isSwipingRef.current) {
      touchDeltaXRef.current = deltaX;
      setDragOffset(deltaX);
    }
  };

  const onTouchEnd = () => {
    if (isSwipingRef.current) {
      const deltaX = touchDeltaXRef.current;
      setIsDragging(false);
      setDragOffset(0);
      if (deltaX < -40) {
        handleNext();
      } else if (deltaX > 40) {
        handlePrev();
      }
      isSwipingRef.current = false;
    }
  };

  return (
    <section
      id="field-notes"
      aria-label="Field Notes"
      className="scroll-mt-20 w-full py-16 sm:py-24 border-b border-[#1A1A1A] bg-[#0C0C0C] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Section Label */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] inline-block shadow-[0_0_6px_rgba(229,184,66,0.5)]" />
            <span className="font-mono text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#E5B842] select-none">
              FIELD NOTES
            </span>
          </div>

          {/* Section Introduction & Dynamic Count */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#1A1A1A]">
            <p className="text-sm sm:text-base text-[#9E9E9E] leading-relaxed max-w-2xl font-normal">
              Daily UI explorations, micro-interactions, component architecture
              studies, and design experiments from my ongoing workbench.
            </p>
            <div className="font-mono text-xs text-[#707070] tracking-wider uppercase flex-shrink-0">
              <span className="text-[#E5B842] font-semibold">{totalNotes}</span> ENTRIES
            </div>
          </div>
        </div>

        {/* 3-Card Centered Editorial Carousel Stage Wrapper with horizontal containment and vertical clearance */}
        <div
          className="relative w-full overflow-x-clip overflow-y-visible"
          style={{ overflowX: "clip", overflowY: "visible" }}
        >
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Field notes interactive archive"
            tabIndex={0}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              height: stageHeight ? `${stageHeight}px` : undefined,
              transition: isDragging
                ? "none"
                : "height 350ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="relative w-full min-h-[480px] xs:min-h-[510px] sm:min-h-[550px] md:min-h-[620px] lg:min-h-[670px] overflow-visible select-none cursor-grab active:cursor-grabbing focus:outline-none touch-pan-y"
          >
            {fieldNotes.map((note, index) => {
              // Calculate circular offset from active card
              let diff = index - currentIndex;
              if (diff > totalNotes / 2) diff -= totalNotes;
              if (diff < -totalNotes / 2) diff += totalNotes;

              const isActive = diff === 0;
              const isPrev = diff === -1;
              const isNext = diff === 1;
              const isVisible = isActive || isPrev || isNext;

              // Positioning: center card at left: 50%, side cards offset by ~104%
              const basePercent = diff * 104;
              const scale = isActive ? 1 : 0.93;
              const opacity = isActive ? 1 : isVisible ? 0.5 : 0;
              const zIndex = isActive ? 20 : isVisible ? 10 : 0;

              return (
                <article
                  key={note.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  aria-hidden={!isActive}
                onClick={() => {
                  if (isPrev) handlePrev();
                  if (isNext) handleNext();
                }}
                style={{
                  left: "50%",
                  transform: `translate3d(calc(-50% + ${basePercent}% + ${dragOffset}px), 0, 0) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: isDragging
                    ? "none"
                    : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), border-color 300ms ease, box-shadow 300ms ease",
                }}
                className={`absolute top-0 w-[88vw] max-w-[340px] sm:max-w-[480px] md:max-w-[560px] lg:max-w-[620px] rounded-[16px] overflow-hidden flex flex-col justify-between transition-colors ${
                  isActive
                    ? "border border-[#E5B842]/55 bg-[#111113] shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_24px_rgba(229,184,66,0.12)] cursor-default"
                    : "border border-[#222226] bg-[#0E0E10] shadow-[0_4px_24px_rgba(0,0,0,0.6)] cursor-pointer hover:opacity-75"
                }`}
              >
                {/* Visual Preview Container */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] bg-[#0B0B0D] overflow-hidden border-b border-[#1E1E22]">
                  {note.image && (
                    <Image
                      src={note.image}
                      alt={`${note.title} visual exploration preview`}
                      fill
                      sizes="(max-width: 640px) 90vw, 620px"
                      priority={isActive}
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Gradient overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/80 via-transparent to-[#0B0B0D]/40 pointer-events-none" />

                  {/* Top-Left: Technical Note Badge */}
                  <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 px-2.5 py-1 bg-[#0C0C0E]/90 backdrop-blur-md border border-[#28282D] rounded-[6px] font-mono text-[10px] text-[#A0A0A5] tracking-wider uppercase select-none">
                    NOTE // {note.noteNumber}
                  </div>

                  {/* Top-Right: Date Pill */}
                  {note.date && (
                    <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 font-mono text-[10px] text-[#7A7A80] tracking-wider uppercase select-none">
                      {note.date}
                    </div>
                  )}

                  {/* Bottom-Right: Spec / Category Watermark */}
                  {note.tag && (
                    <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-3.5 font-mono text-[9px] text-[#55555A] tracking-widest uppercase select-none pointer-events-none">
                      {note.tag}
                    </div>
                  )}
                </div>

                {/* Card Body & Content */}
                <div className="p-5 sm:p-6 md:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Category & Date Metadata */}
                    <div className="flex items-center justify-between font-mono text-[11px] tracking-wider uppercase">
                      <span className="text-[#E5B842] font-semibold tracking-[0.12em]">
                        [ {note.category} ]
                      </span>
                      {note.date && (
                        <span className="text-[#707074]">{note.date}</span>
                      )}
                    </div>

                    {/* Card Title */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F3F3F3] tracking-tight leading-snug">
                      <Link
                        href={note.href || "#contact"}
                        className="hover:text-[#E5B842] transition-colors focus:outline-none focus:underline"
                      >
                        {note.title}
                      </Link>
                    </h3>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-[#949494] leading-relaxed line-clamp-3 font-normal">
                      {note.description}
                    </p>
                  </div>

                  {/* Card Footer: Spec Tag & Direct Explore Action */}
                  <div className="pt-3.5 border-t border-[#1C1C20] flex items-center justify-between font-mono text-xs">
                    {note.tag ? (
                      <span className="px-2.5 py-1 bg-[#18181A] border border-[#26262B] rounded-[5px] text-[#A0A0A5] text-[10px] uppercase tracking-wider select-none">
                        {note.tag}
                      </span>
                    ) : (
                      <span />
                    )}

                    <Link
                      href={note.href || "#contact"}
                      className="text-[#E5B842] hover:text-[#F0C44E] transition-colors flex items-center gap-1.5 font-semibold text-xs tracking-wider uppercase focus:outline-none"
                    >
                      <span>EXPLORE</span>
                      <span className="text-sm transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

        {/* Carousel Controls: Previous Arrow / Progress Indicator / Next Arrow */}
        <div className="flex items-center justify-center gap-6 pt-2 sm:pt-4 select-none">
          {/* Previous Note Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous field note"
            className="w-10 h-10 rounded-full border border-[#26262B] bg-[#121214] text-[#A0A0A0] hover:text-[#E5B842] hover:border-[#E5B842]/50 hover:bg-[#18181B] active:scale-95 transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E5B842]"
          >
            <span className="text-base font-bold">←</span>
          </button>

          {/* Minimal Editorial Progress Indicator */}
          <div className="font-mono text-xs text-[#707074] tracking-widest flex items-center gap-2 select-none">
            <span className="text-[#E5B842] font-semibold text-sm">
              {String(currentIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-[#3A3A3E]">/</span>
            <span className="text-[#88888C]">
              {String(totalNotes).padStart(2, "0")}
            </span>
          </div>

          {/* Next Note Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next field note"
            className="w-10 h-10 rounded-full border border-[#26262B] bg-[#121214] text-[#A0A0A0] hover:text-[#E5B842] hover:border-[#E5B842]/50 hover:bg-[#18181B] active:scale-95 transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E5B842]"
          >
            <span className="text-base font-bold">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
