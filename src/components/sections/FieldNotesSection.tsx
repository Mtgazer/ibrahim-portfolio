"use client";

import Link from "next/link";
import type { FieldNote } from "@/types";
import { fieldNotes as defaultFieldNotes } from "@/data/fieldNotes";
import FieldNoteEntry from "@/components/portfolio/FieldNoteEntry";
import SectionMarker from "@/components/navigation/SectionMarker";

interface FieldNotesSectionProps {
  initialNotes?: FieldNote[];
}

export default function FieldNotesSection({ initialNotes }: FieldNotesSectionProps = {}) {
  const rawNotes = initialNotes && initialNotes.length > 0 ? initialNotes : defaultFieldNotes;

  // Chronological ordering, newest first (with sort_order fallback)
  const sortedNotes = [...rawNotes].sort((a, b) => {
    const timeA = a.noteDate ? new Date(a.noteDate).getTime() : new Date(a.createdAt).getTime();
    const timeB = b.noteDate ? new Date(b.noteDate).getTime() : new Date(b.createdAt).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
      return timeB - timeA;
    }
    return a.sortOrder - b.sortOrder;
  });

  // Display top 3 latest published entries on the homepage
  const homepageNotes = sortedNotes.slice(0, 3);
  const totalNotes = sortedNotes.length;
  const renderedCount = homepageNotes.length;

  const countLabel =
    totalNotes === 1
      ? "SHOWING 1 OF 1 RECENT ENTRY"
      : `SHOWING ${renderedCount} OF ${totalNotes} RECENT ENTRIES`;

  return (
    <section
      id="field-notes"
      aria-label="Field Notes"
      className={`scroll-mt-20 w-full border-b border-[var(--theme-border-strong,#1A1A1A)] bg-[var(--theme-bg-page,#0C0C0C)] ${
        totalNotes <= 1 ? "py-10 sm:py-14" : "py-16 sm:py-20"
      }`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${totalNotes <= 1 ? "space-y-6 sm:space-y-8" : "space-y-8 sm:space-y-10"}`}>
        {/* Section Header */}
        <div className="space-y-6">
          {/* Section Marker & Label (Synchronized with SectionScrollTransitions and Progress Indicator) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <SectionMarker sectionId="field-notes" />
            <span className="font-mono text-[11px] sm:text-xs lg:text-[13px] font-semibold tracking-wider text-[var(--theme-gold-text,#E5B842)]/75 select-none">
              03
            </span>
            <span
              className="w-1 h-1 rounded-full bg-[var(--theme-border-strong,#333333)] shrink-0"
              aria-hidden="true"
            />
            <span className="font-mono text-xs sm:text-sm lg:text-[16px] xl:text-[17px] font-semibold tracking-[0.14em] uppercase text-[var(--theme-gold-text,#E5B842)] select-none">
              FIELD NOTES
            </span>
          </div>

          {/* Section Title, Subtitle & Counter */}
          <div className="reveal-heading space-y-3 pb-4 border-b border-[var(--theme-border-subtle,#1A1A1E)]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--theme-text-primary,#F3F3F3)]">
                Experiments &amp; Ongoing Work
              </h2>
              <div className="font-mono text-xs text-[#707074] tracking-wider uppercase flex-shrink-0">
                <span className="text-[var(--theme-gold-text,#E5B842)] font-semibold">{totalNotes}</span>{" "}
                {totalNotes === 1 ? "ENTRY" : "ENTRIES"} IN ARCHIVE
              </div>
            </div>
            <p className="text-sm sm:text-base text-[var(--theme-text-secondary,#9E9E9E)] leading-relaxed max-w-2xl font-normal">
              A lightweight, chronological record of small builds, technical discoveries, AI &amp; data explorations, and engineering notes.
            </p>
          </div>
        </div>

        {/* Vertically Stacked Editorial Cards */}
        <div className="space-y-4 sm:space-y-5">
          {homepageNotes.map((note, index) => (
            <FieldNoteEntry key={note.id} note={note} index={index} />
          ))}
        </div>

        {/* View All Field Notes Action */}
        <div className="pt-6 border-t border-[var(--theme-border-subtle,#1A1A1E)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs text-[#707074] tracking-wider uppercase">
            {countLabel}
          </span>

          <Link
            href="/field-notes"
            className="inline-flex items-center gap-2 border border-[var(--theme-gold-text,#E5B842)] hover:bg-[var(--theme-gold-text,#E5B842)] hover:text-black text-[var(--theme-gold-text,#E5B842)] font-mono text-xs font-semibold px-6 py-3 rounded-[8px] uppercase tracking-wider transition-all focus:outline-none"
          >
            <span>VIEW ALL FIELD NOTES</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
