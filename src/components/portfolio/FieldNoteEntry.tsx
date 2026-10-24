import Image from "next/image";
import Link from "next/link";
import type { FieldNote } from "@/types";

interface FieldNoteEntryProps {
  note: FieldNote;
  index: number;
}

export default function FieldNoteEntry({ note, index }: FieldNoteEntryProps) {
  const targetHref = `/field-notes/${note.slug || note.id}`;
  const imageSrc = note.coverImage || note.image;

  return (
    <article>
      <Link
        href={targetHref}
        aria-label={`Read field note: ${note.title}`}
        className="group relative flex flex-col sm:flex-row items-stretch rounded-xl border border-[var(--theme-border-strong,#1E1E22)] bg-[var(--theme-bg-surface,#0E0E10)] hover:border-[var(--theme-gold-text,#E5B842)]/50 hover:bg-[#121216] transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-gold-text,#E5B842)] shadow-sm"
      >
        {/* Left Side: Controlled Image Area / Thumbnail */}
        <div className="relative w-full sm:w-52 md:w-64 lg:w-72 shrink-0 aspect-[16/10] sm:aspect-auto min-h-[160px] sm:min-h-full bg-[#08080A] border-b sm:border-b-0 sm:border-r border-[var(--theme-border-strong,#1E1E22)] overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={note.coverAltText || `${note.title} exploration preview`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 256px, 288px"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full min-h-[160px] flex flex-col items-center justify-center p-6 bg-[#0B0B0D] text-center select-none">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#606066]">
                FIELD NOTE
              </span>
              <span className="font-mono text-xs text-[var(--theme-gold-text,#E5B842)] font-semibold mt-1">
                {"//"} {note.noteNumber || String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Unified Content & Metadata Area */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-3 sm:gap-4 min-w-0">
          {/* Top Line: Category & Date Metadata */}
          <div className="flex items-center justify-between gap-2 flex-wrap font-mono text-xs">
            <div className="flex items-center gap-2">
              {note.category && (
                <span className="text-[11px] font-semibold tracking-wider text-[var(--theme-gold-text,#E5B842)] uppercase">
                  [ {note.category} ]
                </span>
              )}
              {note.noteNumber && (
                <span className="text-[10px] text-[#707074] tracking-widest uppercase">
                  {"//"} {note.noteNumber}
                </span>
              )}
            </div>

            {note.date && (
              <time
                dateTime={note.noteDate || undefined}
                className="text-[11px] text-[#88888C] tracking-wider uppercase"
              >
                {note.date}
              </time>
            )}
          </div>

          {/* Core Content: Title & Excerpt grouped together */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-[var(--theme-text-primary,#F3F3F3)] group-hover:text-[var(--theme-gold-text,#E5B842)] transition-colors line-clamp-2 leading-snug">
              {note.title}
            </h3>

            {note.description && (
              <p className="text-xs sm:text-sm text-[var(--theme-text-secondary,#9E9E9E)] line-clamp-2 sm:line-clamp-3 leading-relaxed font-normal">
                {note.description}
              </p>
            )}
          </div>

          {/* Bottom Row: Tags & Reading Affordance */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--theme-border-subtle,#1A1A1E)]/60">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {note.tags && note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#141416] border border-[#222226] rounded text-[10px] font-mono text-[#8E8E94] truncate max-w-[130px]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--theme-gold-text,#E5B842)] group-hover:text-[#F0C44E] transition-colors shrink-0">
              <span className="text-[11px] font-semibold tracking-wider uppercase">READ NOTE</span>
              <span aria-hidden="true" className="text-sm transition-transform duration-200 group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
