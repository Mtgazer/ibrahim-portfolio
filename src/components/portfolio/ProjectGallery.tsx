"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { ProjectImage } from "@/types";

interface ProjectGalleryProps {
  images: ProjectImage[];
  fallbackImage?: string | null;
  projectTitle: string;
}

export default function ProjectGallery({
  images,
  fallbackImage,
  projectTitle,
}: ProjectGalleryProps) {
  // Sort images strictly by database sortOrder
  const sortedImages = images.slice().sort((a, b) => a.sortOrder - b.sortOrder);

  // If no DB images exist, check if a fallback image was supplied
  const effectiveImages: Array<{
    id: string;
    url: string;
    alt: string;
    caption?: string | null;
    isPrimary?: boolean;
  }> =
    sortedImages.length > 0
      ? sortedImages.map((img) => ({
          id: img.id,
          url: img.publicUrl || img.storagePath,
          alt: img.altText || `${projectTitle} screenshot`,
          caption: img.caption,
          isPrimary: img.isPrimary,
        }))
      : fallbackImage
      ? [
          {
            id: "fallback-primary",
            url: fallbackImage,
            alt: `${projectTitle} primary showcase`,
            caption: null,
            isPrimary: true,
          },
        ]
      : [];

  // Default active image to the one marked as primary, or the first
  const primaryIndex = effectiveImages.findIndex((img) => img.isPrimary);
  const initialIndex = primaryIndex >= 0 ? primaryIndex : 0;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const total = effectiveImages.length;
  const activeImage = effectiveImages[activeIndex] || null;

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Keyboard navigation during lightbox view
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  // Touch swipe support for mobile
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  if (total === 0) {
    return null;
  }

  return (
    <section aria-label="Project Visual Gallery" className="w-full space-y-4">
      {/* Active Showcase Image */}
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") handlePrev();
          if (e.key === "ArrowRight") handleNext();
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsLightboxOpen(true);
          }
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="group relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/10] rounded-xl overflow-hidden border border-[var(--theme-border-strong,#222222)] bg-[#0C0C0E] focus:outline-none focus:ring-1 focus:ring-[var(--theme-gold-text,#E5B842)]"
      >
        {activeImage && (
          <Image
            src={activeImage.url}
            alt={activeImage.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-contain sm:object-cover object-top transition-transform duration-500"
          />
        )}

        {/* Ambient top & bottom vignettes for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none" />

        {/* Image Status Bar: Counter + Primary Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 pointer-events-none">
          <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-[#28282D] rounded-[6px] font-mono text-[10px] text-[var(--theme-gold-text,#E5B842)] font-semibold tracking-wider">
            {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          {activeImage?.isPrimary && (
            <span className="px-2 py-0.5 bg-black/80 border border-[#28282D] rounded-[4px] font-mono text-[9px] text-[#A0A0A5] tracking-wider uppercase">
              PRIMARY SHOWCASE
            </span>
          )}
        </div>

        {/* Expand / Lightbox Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Enlarge image in fullscreen lightbox"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-lg bg-black/80 border border-[#28282D] text-[#A0A0A5] hover:text-[var(--theme-gold-text,#E5B842)] hover:border-[var(--theme-gold-text,#E5B842)]/50 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--theme-gold-text,#E5B842)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        {/* Previous / Next Controls (Only displayed when multiple images exist) */}
        {total > 1 && (
          <div className="absolute inset-y-0 inset-x-2 sm:inset-x-3 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous gallery image"
              className="pointer-events-auto w-10 h-10 rounded-full bg-black/75 hover:bg-black/90 border border-[#2E2E32] hover:border-[var(--theme-gold-text,#E5B842)] text-[#F3F3F3] hover:text-[var(--theme-gold-text,#E5B842)] backdrop-blur-md flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--theme-gold-text,#E5B842)]"
            >
              <span className="text-base font-bold select-none" aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next gallery image"
              className="pointer-events-auto w-10 h-10 rounded-full bg-black/75 hover:bg-black/90 border border-[#2E2E32] hover:border-[var(--theme-gold-text,#E5B842)] text-[#F3F3F3] hover:text-[var(--theme-gold-text,#E5B842)] backdrop-blur-md flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--theme-gold-text,#E5B842)]"
            >
              <span className="text-base font-bold select-none" aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {/* Caption bar at bottom of active image */}
        {activeImage?.caption && (
          <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 to-transparent">
            <p className="font-mono text-xs sm:text-[13px] text-[#E0E0E0] tracking-wide">
              {activeImage.caption}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail Strip (Rendered only when > 1 images) */}
      {total > 1 && (
        <div
          role="tablist"
          aria-label="Gallery thumbnails"
          className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#26262B]"
        >
          {effectiveImages.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={img.id}
                role="tab"
                aria-selected={isActive}
                aria-label={`View image ${idx + 1}: ${img.caption || img.alt}`}
                onClick={() => setActiveIndex(idx)}
                className={`relative flex-shrink-0 w-20 h-14 sm:w-28 sm:h-18 rounded-lg overflow-hidden border transition-all cursor-pointer focus:outline-none ${
                  isActive
                    ? "border-[var(--theme-gold-text,#E5B842)] ring-1 ring-[var(--theme-gold-text,#E5B842)]/50 shadow-[0_0_12px_rgba(229,184,66,0.3)]"
                    : "border-[#222226] opacity-60 hover:opacity-100 hover:border-[#3A3A40]"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover object-center"
                />
                {img.isPrimary && (
                  <span
                    title="Primary project image"
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[var(--theme-gold-text,#E5B842)] ring-1 ring-black"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Dismissible Lightbox Modal */}
      {isLightboxOpen && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview modal"
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6"
        >
          {/* Top Header Bar */}
          <div
            className="w-full max-w-7xl flex items-center justify-between text-xs font-mono text-[#A0A0A5] select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--theme-gold-text,#E5B842)] font-semibold">
                {projectTitle}
              </span>
              <span>{"//"}</span>
              <span>
                {activeIndex + 1} of {total}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="border border-[#2E2E32] rounded-[6px] px-3 py-1.5 text-xs text-[#E0E0E0] hover:text-[var(--theme-gold-text,#E5B842)] hover:border-[var(--theme-gold-text,#E5B842)] transition-colors cursor-pointer"
            >
              [ESC · CLOSE ✕]
            </button>
          </div>

          {/* Central Showcase Image */}
          <div
            className="relative flex-1 w-full max-w-7xl my-4 flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-h-[82vh] flex items-center justify-center">
              <Image
                src={activeImage.url}
                alt={activeImage.alt}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="absolute left-2 sm:left-4 w-12 h-12 rounded-full bg-black/70 hover:bg-black border border-[#2E2E32] hover:border-[var(--theme-gold-text,#E5B842)] text-[#F3F3F3] hover:text-[var(--theme-gold-text,#E5B842)] flex items-center justify-center transition-all cursor-pointer text-xl font-bold"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-2 sm:right-4 w-12 h-12 rounded-full bg-black/70 hover:bg-black border border-[#2E2E32] hover:border-[var(--theme-gold-text,#E5B842)] text-[#F3F3F3] hover:text-[var(--theme-gold-text,#E5B842)] flex items-center justify-center transition-all cursor-pointer text-xl font-bold"
                >
                  →
                </button>
              </>
            )}
          </div>

          {/* Bottom Caption Bar */}
          <div
            className="w-full max-w-3xl text-center font-mono text-xs text-[#B0B0B5] pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {activeImage.caption || activeImage.alt}
          </div>
        </div>
      )}
    </section>
  );
}
