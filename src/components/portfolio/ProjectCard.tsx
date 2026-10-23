import Image from "next/image";
import Link from "next/link";
import type { EditorialProject } from "@/types";

interface ProjectCardProps {
  project: EditorialProject;
  index: number;
}

/**
 * Extracts a concise 1-2 sentence description from a longer project description.
 */
function getConciseDescription(desc: string | null | undefined): string {
  if (!desc) return "";
  const cleaned = desc.trim();
  // Split on sentence boundaries (. ! ?) followed by whitespace
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 2) {
    return cleaned;
  }
  const twoSentences = `${sentences[0]} ${sentences[1]}`.trim();
  // Cap at ~180 characters if the first two sentences are unusually long
  if (twoSentences.length > 200) {
    return sentences[0].trim();
  }
  return twoSentences;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  // Resolve primary project image with precedence:
  // 1. Database project_images marked as isPrimary
  // 2. First database project_image
  // 3. Fallback to presentation_data.visuals.main
  const sortedImages = (project.images || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage =
    sortedImages.find((img) => img.isPrimary) ||
    sortedImages[0] ||
    null;
  const imageSrc = primaryImage?.publicUrl || primaryImage?.storagePath || project.visuals?.main || null;
  const imageAlt = primaryImage?.altText || `${project.title} primary preview`;

  // Detect genuine external source-code repository link
  const sourceCodeLink = (project.links || []).find((l) => {
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

  // Category / Project-type label: concise editorial metadata
  const categoryLabel = [
    project.category,
    project.tags && project.tags.length > 0 ? project.tags[0] : null,
  ]
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");

  // Small number of relevant technology labels (up to 3-4)
  const displayTools = (project.tools || []).slice(0, 3);
  const conciseDesc = getConciseDescription(project.description);

  return (
    <article
      className="group relative flex flex-col justify-between rounded-xl border border-[var(--theme-border-strong,#222222)] bg-[var(--theme-bg-surface,#0E0E10)] overflow-hidden transition-all duration-300 hover:border-[var(--theme-gold-text,#E5B842)]/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(229,184,66,0.08)]"
    >
      {/* Top Media Container */}
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`View ${project.title} project details`}
        className="relative block w-full aspect-[16/10] bg-[#0A0A0C] overflow-hidden border-b border-[var(--theme-border-strong,#1E1E22)]"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
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

        {/* Ambient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C]/80 via-transparent to-transparent pointer-events-none" />

        {/* Project Number / Badge Tag */}
        <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#0C0C0E]/90 backdrop-blur-md border border-[#28282D] rounded-[6px] font-mono text-[10px] text-[var(--theme-gold-text,#E5B842)] font-semibold tracking-wider select-none">
            {project.projectNumber || String(index + 1).padStart(2, "0")}
          </span>
          {project.badge && (
            <span className="px-2 py-0.5 bg-[#0C0C0E]/80 border border-[#28282D] rounded-[4px] font-mono text-[9px] text-[#A0A0A5] tracking-wider uppercase">
              {project.badge}
            </span>
          )}
        </div>

        {/* Year Pill (when available) */}
        {project.year && (
          <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 px-2 py-0.5 bg-[#0C0C0E]/80 border border-[#28282D] rounded-[4px] font-mono text-[10px] text-[#88888C] tracking-wider select-none">
            {project.year}
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Category / Subtitle */}
          {categoryLabel && (
            <div className="font-mono text-[11px] font-medium tracking-wider uppercase text-[var(--theme-gold-text,#E5B842)]/90">
              {categoryLabel}
            </div>
          )}

          {/* Project Title */}
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--theme-text-primary,#F3F3F3)] group-hover:text-[var(--theme-gold-text,#E5B842)] transition-colors leading-snug">
            <Link href={`/projects/${project.slug}`} className="focus:outline-none">
              {project.title}
            </Link>
          </h3>

          {/* Concise Description (1-2 sentences) */}
          {conciseDesc && (
            <p className="text-xs sm:text-[13px] text-[var(--theme-text-secondary,#9E9E9E)] leading-relaxed font-normal line-clamp-2">
              {conciseDesc}
            </p>
          )}

          {/* Technology Badges (small number of relevant labels) */}
          {displayTools.length > 0 && (
            <div className="pt-1.5 flex items-center flex-wrap gap-1.5 font-mono text-[11px] text-[#A0A0A5]">
              {displayTools.map((tool, idx) => (
                <span key={tool} className="inline-flex items-center gap-1.5">
                  <span className="text-[#CCCCCC]">{tool}</span>
                  {idx < displayTools.length - 1 && (
                    <span className="text-[var(--theme-gold-text,#E5B842)]/60 text-[10px]" aria-hidden="true">
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
          {/* Prominent View Project Action */}
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 text-[var(--theme-gold-text,#E5B842)] hover:text-[#F0C44E] font-semibold tracking-wider uppercase transition-colors group/btn focus:outline-none"
          >
            <span>VIEW PROJECT</span>
            <span className="text-sm transition-transform duration-200 group-hover/btn:translate-x-1" aria-hidden="true">
              →
            </span>
          </Link>

          {/* Secondary View Source Code Action (only when genuine source code exists) */}
          {sourceCodeLink ? (
            <a
              href={sourceCodeLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--theme-text-muted,#707074)] hover:text-[var(--theme-text-primary,#F3F3F3)] tracking-wider uppercase transition-colors focus:outline-none"
              title="Open GitHub source code repository"
            >
              <span>VIEW SOURCE CODE</span>
              <span className="text-[11px]" aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="text-[10px] text-[#4A4A50] tracking-widest uppercase select-none">
              CASE STUDY
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
