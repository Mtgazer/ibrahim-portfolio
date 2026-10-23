import Image from "next/image";
import Link from "next/link";
import type { FieldNote } from "@/types";

interface FieldNoteEntryProps {
  note: FieldNote;
  index: number;
}

export default function FieldNoteEntry({ note }: FieldNoteEntryProps) {
  const targetHref = note.href || note.externalLink || "#contact";
  const isExternal = Boolean(note.externalLink && !note.externalLink.startsWith("#") && !note.externalLink.startsWith("/"));

  return (
    <article className="group relative border-b border-[var(--theme-border-subtle,#1A1A1E)] py-6 sm:py-8 last:border-b-0 transition-colors">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left Column: Metadata (Date, Note Number, Category) */}
        <div className="w-full md:w-56 shrink-0 space-y-1.5 font-mono text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {note.noteNumber && (
              <span className="text-[10px] text-[#707074] tracking-widest uppercase">
                NOTE // {note.noteNumber}
              </span>
            )}
            {note.date && (
              <span className="text-[var(--theme-gold-text,#E5B842)] font-semibold tracking-wider uppercase">
                {note.date}
              </span>
            )}
          </div>

          {note.category && (
            <div className="text-[11px] text-[#A0A0A5] tracking-wider uppercase font-medium">
              [ {note.category} ]
            </div>
          )}
        </div>

        {/* Center Column: Title, Excerpt, Tags */}
        <div className="flex-1 space-y-2.5 max-w-2xl">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--theme-text-primary,#F3F3F3)] group-hover:text-[var(--theme-gold-text,#E5B842)] transition-colors leading-snug">
            {isExternal ? (
              <a
                href={targetHref}
                target="_blank"
                rel="noopener noreferrer"
                className="focus:outline-none"
              >
                {note.title}
              </a>
            ) : (
              <Link href={targetHref} className="focus:outline-none">
                {note.title}
              </Link>
            )}
          </h3>

          {note.description && (
            <p className="text-xs sm:text-sm text-[var(--theme-text-secondary,#9E9E9E)] leading-relaxed font-normal">
              {note.description}
            </p>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="pt-1 flex items-center flex-wrap gap-1.5 font-mono text-[10px]">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#141416] border border-[#222226] rounded text-[#8E8E94]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Optional Compact Thumbnail + Reading Affordance */}
        <div className="flex items-center md:flex-col md:items-end justify-between md:justify-start gap-4 shrink-0">
          {/* Subtle Compact Image Thumbnail if available (does NOT dominate the layout) */}
          {(note.coverImage || note.image) && (
            <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-[8px] overflow-hidden border border-[#222226] bg-[#0E0E10] shrink-0">
              <Image
                src={note.coverImage || note.image || ""}
                alt={note.coverAltText || `${note.title} exploration preview`}
                fill
                sizes="120px"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          {/* Subtle Reading Affordance Arrow */}
          <div className="font-mono text-xs">
            {isExternal ? (
              <a
                href={targetHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Explore external note: ${note.title}`}
                className="inline-flex items-center gap-1.5 text-[var(--theme-gold-text,#E5B842)] group-hover:text-[#F0C44E] transition-colors uppercase tracking-wider font-semibold"
              >
                <span className="hidden sm:inline">EXPLORE</span>
                <span className="text-sm transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                  ↗
                </span>
              </a>
            ) : (
              <Link
                href={targetHref}
                aria-label={`Read note: ${note.title}`}
                className="inline-flex items-center gap-1.5 text-[var(--theme-gold-text,#E5B842)] group-hover:text-[#F0C44E] transition-colors uppercase tracking-wider font-semibold"
              >
                <span className="hidden sm:inline">READ NOTE</span>
                <span className="text-sm transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
