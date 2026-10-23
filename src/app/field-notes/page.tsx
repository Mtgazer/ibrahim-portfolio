import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FieldNoteEntry from "@/components/portfolio/FieldNoteEntry";
import { getPublishedFieldNotes } from "@/lib/field-notes";

export const metadata: Metadata = {
  title: "Field Notes Archive | Ibrahim Khalil",
  description:
    "A chronological archive of ongoing experiments, UI explorations, machine learning and data science work, and technical lessons learned.",
  openGraph: {
    title: "Field Notes Archive | Ibrahim Khalil",
    description:
      "A chronological archive of ongoing experiments, UI explorations, machine learning and data science work, and technical lessons learned.",
    type: "website",
  },
};

export default async function FieldNotesArchivePage() {
  const publishedNotes = await getPublishedFieldNotes();

  // Strict chronological ordering, newest first
  const sortedNotes = [...publishedNotes].sort((a, b) => {
    const timeA = a.noteDate ? new Date(a.noteDate).getTime() : new Date(a.createdAt).getTime();
    const timeB = b.noteDate ? new Date(b.noteDate).getTime() : new Date(b.createdAt).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
      return timeB - timeA;
    }
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg-page,#0A0A0C)] text-[var(--theme-text-primary,#F3F3F3)]">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[var(--theme-border-strong,#1E1E22)] pb-4">
          <Link
            href="/#field-notes"
            className="inline-flex items-center gap-2 font-mono text-xs text-[var(--theme-gold-text,#E5B842)] hover:underline uppercase tracking-wider transition-colors"
          >
            <span aria-hidden="true">←</span>
            <span>BACK TO PORTFOLIO</span>
          </Link>

          <span className="font-mono text-xs text-[#707074] tracking-widest uppercase">
            ARCHIVE // {sortedNotes.length} ENTRIES
          </span>
        </div>

        {/* Page Heading & Introduction */}
        <header className="space-y-4 pb-6 border-b border-[var(--theme-border-strong,#1E1E22)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[var(--theme-gold-text,#E5B842)] inline-block" />
            <span className="font-mono text-xs font-semibold tracking-wider text-[var(--theme-gold-text,#E5B842)] uppercase">
              FIELD NOTES ARCHIVE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F3F3F3]">
            Technical Notes, Builds &amp; Experiments
          </h1>

          <p className="text-base sm:text-lg text-[#9E9E9E] leading-relaxed max-w-3xl font-normal">
            A chronological record of hands-on technical work, software architecture explorations,
            data analysis, AI experiments, and UI/UX engineering discoveries over time.
          </p>
        </header>

        {/* Chronological Editorial List */}
        {sortedNotes.length > 0 ? (
          <div className="divide-y divide-[var(--theme-border-subtle,#1A1A1E)]">
            {sortedNotes.map((note, idx) => (
              <FieldNoteEntry key={note.id} note={note} index={idx} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-[#26262B] rounded-xl p-8 space-y-3 font-mono text-sm text-[#707074]">
            <p className="text-[#E0E0E5]">No published field notes currently available.</p>
            <p className="text-xs">New technical logs and experiments will be archived here soon.</p>
          </div>
        )}

        {/* Bottom Navigation Affordance */}
        <div className="pt-8 border-t border-[var(--theme-border-strong,#1E1E22)] flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
          <Link
            href="/#home"
            className="text-[var(--theme-gold-text,#E5B842)] hover:underline uppercase tracking-wider"
          >
            ← Return to Top
          </Link>

          <Link
            href="/#contact"
            className="text-[#9E9E9E] hover:text-[#F3F3F3] uppercase tracking-wider transition-colors"
          >
            Get in Touch / Let&apos;s Connect →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
