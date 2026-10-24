import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { getFieldNoteBySlug } from "@/lib/field-notes";

interface FieldNoteDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: FieldNoteDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await getFieldNoteBySlug(slug);

  if (!note || !note.isPublished) {
    return {
      title: "Field Note Not Found | Ibrahim Khalil",
      description: "The requested field note could not be found.",
    };
  }

  const title = `${note.title} — Field Note | Ibrahim Khalil`;
  const description =
    note.description || `Technical observation and engineering note on ${note.title} by Ibrahim Khalil.`;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: "article",
    },
  };
}

export default async function FieldNoteDetailsPage({
  params,
}: FieldNoteDetailsPageProps) {
  const { slug } = await params;
  const note = await getFieldNoteBySlug(slug);

  // Draft and unpublished notes return 404
  if (!note || !note.isPublished) {
    notFound();
  }

  const imageSrc = note.coverImage || note.image;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg-page,#0A0A0C)] text-[var(--theme-text-primary,#F3F3F3)]">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
        {/* Navigation Breadcrumb & Contextual Controls */}
        <div className="flex items-center justify-between border-b border-[var(--theme-border-strong,#1E1E22)] pb-4">
          <Link
            href="/field-notes"
            className="inline-flex items-center gap-2 font-mono text-xs text-[var(--theme-gold-text,#E5B842)] hover:underline uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-gold-text,#E5B842)] rounded"
          >
            <span aria-hidden="true">←</span>
            <span>BACK TO FIELD NOTES ARCHIVE</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[#707074] tracking-widest uppercase">
              NOTE // {note.noteNumber || "01"}
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Note Header: Metadata & Title */}
        <header className="space-y-4 pb-6 border-b border-[var(--theme-border-strong,#1E1E22)]">
          <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
            {note.category && (
              <span className="text-[var(--theme-gold-text,#E5B842)] font-semibold tracking-wider uppercase">
                [ {note.category} ]
              </span>
            )}
            {note.date && (
              <span className="text-[#88888C] tracking-wider uppercase">
                {note.date}
              </span>
            )}
            {note.noteDate && (
              <span className="text-[#55555A] text-[11px] hidden sm:inline">
                ({note.noteDate})
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#F3F3F3] leading-tight">
            {note.title}
          </h1>
        </header>

        {/* Optional Cover Image */}
        {imageSrc && (
          <figure className="space-y-2">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden border border-[#222226] bg-[#0A0A0C]">
              <Image
                src={imageSrc}
                alt={note.coverAltText || `${note.title} technical illustration`}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover object-top"
              />
            </div>
            {note.coverAltText && (
              <figcaption className="text-xs font-mono text-[#707074] tracking-wide text-right">
                {"//"} {note.coverAltText}
              </figcaption>
            )}
          </figure>
        )}

        {/* Main Note Content / Observation */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--theme-border-strong,#1E1E22)] bg-[var(--theme-bg-surface,#0E0E10)] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-gold-text,#E5B842)]" />
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--theme-gold-text,#E5B842)] font-semibold">
                OBSERVATION &amp; TECHNICAL SYNOPSIS
              </span>
            </div>

            <div className="text-base sm:text-lg text-[#D0D0D5] leading-relaxed whitespace-pre-line font-normal">
              {note.description}
            </div>
          </div>
        </div>

        {/* Taxonomy & External Resource Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[var(--theme-border-strong,#1E1E22)]">
          {note.tags && note.tags.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-[#707074] uppercase tracking-wider">TAGS:</span>
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-[#141416] border border-[#222226] rounded-md font-mono text-xs text-[#A0A0A5]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div />
          )}

          {note.externalLink && (
            <a
              href={note.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs text-[var(--theme-gold-text,#E5B842)] hover:underline uppercase tracking-wider font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-gold-text,#E5B842)]"
            >
              <span>EXPLORE EXTERNAL RESOURCE</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>

        {/* Bottom Navigation Affordance */}
        <div className="pt-8 border-t border-[var(--theme-border-strong,#1E1E22)] flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
          <Link
            href="/field-notes"
            className="text-[var(--theme-gold-text,#E5B842)] hover:underline uppercase tracking-wider inline-flex items-center gap-1.5"
          >
            <span aria-hidden="true">←</span>
            <span>All Field Notes</span>
          </Link>

          <Link
            href="/#field-notes"
            className="text-[#9E9E9E] hover:text-[#F3F3F3] uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
          >
            <span>Return to Portfolio</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
