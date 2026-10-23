import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProjectGallery from "@/components/portfolio/ProjectGallery";
import { getProjectBySlug } from "@/lib/projects";

interface ProjectDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project || !project.isPublished) {
    return {
      title: "Project Not Found | Ibrahim Khalil",
      description: "The requested project case study could not be found.",
    };
  }

  const title = `${project.title} — Case Study | Ibrahim Khalil`;
  const description =
    project.caseStudy?.overview ||
    project.description ||
    `Detailed case study of ${project.title} by Ibrahim Khalil.`;

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

export default async function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // Draft and unpublished projects return 404
  if (!project || !project.isPublished) {
    notFound();
  }

  // Identify external source-code and demo links
  const links = project.links || [];
  const sourceCodeLink = links.find((l) => {
    if (l.type === "case-study") return false;
    if (l.type === "github") return true;
    const label = (l.label || "").toLowerCase();
    const url = (l.url || "").toLowerCase();
    return (
      label.includes("source") ||
      label.includes("github") ||
      label.includes("codebase") ||
      url.includes("github.com") ||
      url.includes("gitlab.com")
    );
  });

  const demoLink = links.find((l) => {
    if (l.type === "demo") return true;
    const label = (l.label || "").toLowerCase();
    return label.includes("demo") || label.includes("live") || label.includes("preview");
  });

  const otherLinks = links.filter((l) => l !== sourceCodeLink && l !== demoLink && l.type !== "case-study");

  // Case study content model (with backwards-compatible fallbacks)
  const caseStudy = project.caseStudy;
  const overview = caseStudy?.overview || project.description;
  const problem = caseStudy?.problem;
  const solution = caseStudy?.solution;

  // Features list: from caseStudy.features, or presentation_data coreComponentSet
  const features =
    caseStudy?.features && caseStudy.features.length > 0
      ? caseStudy.features
      : project.coreComponentSet && project.coreComponentSet.length > 0
      ? project.coreComponentSet
      : null;

  // Architecture description: from caseStudy.architecture, or presentation_data pillars
  const architecture = caseStudy?.architecture;
  const pillars = project.pillars && project.pillars.length > 0 ? project.pillars : null;
  const challenges = caseStudy?.challenges;
  const outcomes = caseStudy?.outcomes || project.growthNote?.text;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg-page,#0A0A0C)] text-[var(--theme-text-primary,#F3F3F3)]">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[var(--theme-border-strong,#1E1E22)] pb-4">
          <Link
            href="/#my-projects"
            className="inline-flex items-center gap-2 font-mono text-xs text-[var(--theme-gold-text,#E5B842)] hover:underline uppercase tracking-wider transition-colors"
          >
            <span aria-hidden="true">←</span>
            <span>BACK TO SELECTED WORK</span>
          </Link>

          <span className="font-mono text-xs text-[#707074] tracking-widest uppercase">
            PROJECT // {project.projectNumber || "01"}
          </span>
        </div>

        {/* Section A: Project Header */}
        <header className="space-y-6">
          <div className="space-y-3">
            {/* Category, Year, and Status Badge */}
            <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
              {project.category && (
                <span className="text-[var(--theme-gold-text,#E5B842)] font-semibold tracking-wider uppercase">
                  [ {project.category} ]
                </span>
              )}
              {project.year && (
                <span className="text-[#88888C] tracking-wider">
                  {project.year}
                </span>
              )}
              {project.statusText && (
                <span className="px-2 py-0.5 bg-[#141416] border border-[#26262B] rounded text-[10px] text-[#A0A0A5] uppercase">
                  {project.statusText}
                </span>
              )}
            </div>

            {/* Main Project Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F3F3F3] leading-[1.15]">
              {project.title}
            </h1>

            {/* Subtitle / Architectural Focus */}
            {project.subtitle && (
              <p className="text-base sm:text-lg text-[var(--theme-gold-text,#E5B842)]/90 font-mono tracking-wide">
                {project.subtitle}
              </p>
            )}
          </div>

          {/* Metadata Grid (Role, Tools, Disciplines) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--theme-border-strong,#1E1E22)] font-mono text-xs">
            {project.role && (
              <div>
                <span className="text-[#707074] uppercase tracking-wider block text-[10px] mb-1">
                  ROLE &amp; RESPONSIBILITY
                </span>
                <span className="text-[#D0D0D5]">{project.role}</span>
              </div>
            )}

            {project.tools && project.tools.length > 0 && (
              <div>
                <span className="text-[#707074] uppercase tracking-wider block text-[10px] mb-1">
                  CORE TECHNOLOGIES
                </span>
                <div className="flex items-center flex-wrap gap-1.5 text-[#D0D0D5]">
                  {project.tools.map((t, i) => (
                    <span key={t}>
                      {t}
                      {i < project.tools.length - 1 && <span className="text-[#55555A]"> ·</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div>
                <span className="text-[#707074] uppercase tracking-wider block text-[10px] mb-1">
                  DISCIPLINES &amp; PATTERNS
                </span>
                <div className="flex items-center flex-wrap gap-1.5 text-[#D0D0D5]">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#141416] border border-[#222226] rounded text-[10px] text-[#A0A0A5]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* External Action Links (Source Code, Live Demo) */}
          {(sourceCodeLink || demoLink || otherLinks.length > 0) && (
            <div className="flex items-center gap-3 pt-3 flex-wrap">
              {sourceCodeLink && (
                <a
                  href={sourceCodeLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-[var(--theme-gold-text,#E5B842)] hover:bg-[var(--theme-gold-text,#E5B842)] hover:text-black text-[var(--theme-gold-text,#E5B842)] font-mono text-xs font-semibold px-4 py-2.5 rounded-[8px] uppercase tracking-wider transition-all"
                >
                  <span>VIEW SOURCE CODE</span>
                  <span aria-hidden="true">↗</span>
                </a>
              )}

              {demoLink && (
                <a
                  href={demoLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[var(--theme-gold-text,#E5B842)] hover:bg-[#F0C44E] text-black font-mono text-xs font-semibold px-4 py-2.5 rounded-[8px] uppercase tracking-wider transition-all"
                >
                  <span>LIVE DEMO</span>
                  <span aria-hidden="true">↗</span>
                </a>
              )}

              {otherLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border border-[#28282D] hover:border-[var(--theme-gold-text,#E5B842)] text-[#A0A0A5] hover:text-[#F3F3F3] font-mono text-xs px-3.5 py-2.5 rounded-[8px] uppercase tracking-wider transition-all"
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}
        </header>

        {/* Section B & C: Interactive Visual Gallery */}
        <ProjectGallery
          images={project.images || []}
          fallbackImage={project.visuals?.main}
          projectTitle={project.title}
        />

        {/* Section D: Project Overview & Scope */}
        {overview && (
          <section className="space-y-4 border-t border-[var(--theme-border-strong,#1E1E22)] pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--theme-gold-text,#E5B842)] uppercase tracking-wider">
              <span>{"// 01"}</span>
              <span>PROJECT OVERVIEW</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
              Context &amp; Purpose
            </h2>
            <p className="text-base sm:text-lg text-[#B0B0B5] leading-relaxed max-w-4xl font-normal whitespace-pre-line">
              {overview}
            </p>
          </section>
        )}

        {/* Problem & Solution Asymmetric Grid (when available) */}
        {(problem || solution) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[var(--theme-border-strong,#1E1E22)] pt-10">
            {problem && (
              <div className="space-y-3 rounded-xl border border-[#222226] bg-[#0E0E10] p-6 sm:p-7">
                <span className="font-mono text-xs text-[#E55353] font-semibold uppercase tracking-wider block">
                  [ THE CHALLENGE // PROBLEM ]
                </span>
                <h3 className="text-xl font-bold text-[#F3F3F3] tracking-tight">
                  Problem &amp; Motivation
                </h3>
                <p className="text-sm text-[#A0A0A5] leading-relaxed font-normal whitespace-pre-line">
                  {problem}
                </p>
              </div>
            )}

            {solution && (
              <div className="space-y-3 rounded-xl border border-[var(--theme-gold-text,#E5B842)]/30 bg-[#0E0E10] p-6 sm:p-7">
                <span className="font-mono text-xs text-[var(--theme-gold-text,#E5B842)] font-semibold uppercase tracking-wider block">
                  [ THE EXECUTION // SOLUTION ]
                </span>
                <h3 className="text-xl font-bold text-[#F3F3F3] tracking-tight">
                  Engineered Approach
                </h3>
                <p className="text-sm text-[#A0A0A5] leading-relaxed font-normal whitespace-pre-line">
                  {solution}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Section E: Features and Functionality */}
        {features && features.length > 0 && (
          <section className="space-y-6 border-t border-[var(--theme-border-strong,#1E1E22)] pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--theme-gold-text,#E5B842)] uppercase tracking-wider">
              <span>{"// 02"}</span>
              <span>FEATURES &amp; CAPABILITIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
              Key Implementation Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-[#222226] bg-[#0E0E10] p-4 font-mono text-xs text-[#CCCCCC]"
                >
                  <span className="text-[var(--theme-gold-text,#E5B842)] font-bold text-sm shrink-0">
                    ■
                  </span>
                  <span className="leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section F: Architecture and Engineering Decisions */}
        {(architecture || pillars || challenges || outcomes) && (
          <section className="space-y-8 border-t border-[var(--theme-border-strong,#1E1E22)] pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--theme-gold-text,#E5B842)] uppercase tracking-wider">
              <span>{"// 03"}</span>
              <span>SYSTEM ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
              Engineering Decisions &amp; Patterns
            </h2>

            {/* Architecture Statement */}
            {architecture && (
              <div className="rounded-xl border border-[#26262B] bg-[#121214] p-6 sm:p-8 space-y-3">
                <span className="font-mono text-xs text-[var(--theme-gold-text,#E5B842)] font-semibold uppercase tracking-wider block">
                  LAYERED STRUCTURE &amp; DESIGN PATTERNS
                </span>
                <p className="text-sm sm:text-base text-[#B0B0B5] leading-relaxed whitespace-pre-line font-normal">
                  {architecture}
                </p>
              </div>
            )}

            {/* Technical Pillars (when configured) */}
            {pillars && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {pillars.map((pillar) => (
                  <div
                    key={pillar.number}
                    className="rounded-xl border border-[#222226] bg-[#0E0E10] p-5 space-y-2"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs text-[var(--theme-gold-text,#E5B842)] font-bold">
                      <span>{pillar.number}.</span>
                      <span>{pillar.title}</span>
                    </div>
                    <p className="text-xs text-[#8E8E94] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Challenges & Outcomes Split */}
            {(challenges || outcomes) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {challenges && (
                  <div className="rounded-xl border border-[#222226] bg-[#0E0E10] p-6 space-y-2">
                    <span className="font-mono text-xs text-[#E5B842] uppercase tracking-wider block font-semibold">
                      CHALLENGES OVERCOME
                    </span>
                    <p className="text-xs sm:text-sm text-[#A0A0A5] leading-relaxed whitespace-pre-line">
                      {challenges}
                    </p>
                  </div>
                )}
                {outcomes && (
                  <div className="rounded-xl border border-[#222226] bg-[#0E0E10] p-6 space-y-2">
                    <span className="font-mono text-xs text-[var(--theme-gold-text,#E5B842)] uppercase tracking-wider block font-semibold">
                      OUTCOMES &amp; LESSONS LEARNED
                    </span>
                    <p className="text-xs sm:text-sm text-[#A0A0A5] leading-relaxed whitespace-pre-line">
                      {outcomes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Section G: Next Actions / Bottom Navigation */}
        <section className="border-t border-[var(--theme-border-strong,#1E1E22)] pt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/#my-projects"
            className="inline-flex items-center gap-2 font-mono text-xs text-[#A0A0A5] hover:text-[var(--theme-gold-text,#E5B842)] border border-[#26262B] rounded-[8px] px-5 py-3 uppercase tracking-wider transition-colors"
          >
            <span>← RETURN TO ALL PROJECTS</span>
          </Link>

          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-[var(--theme-gold-text,#E5B842)] hover:bg-[#F0C44E] text-black font-mono text-xs font-semibold px-6 py-3 rounded-[8px] uppercase tracking-wider transition-colors"
          >
            <span>DISCUSS THIS PROJECT</span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
