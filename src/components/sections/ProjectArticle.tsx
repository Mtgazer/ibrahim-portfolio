import Image from "next/image";
import Link from "next/link";
import { EditorialProject } from "@/types";

interface ProjectArticleProps {
  project: EditorialProject;
}

export default function ProjectArticle({ project }: ProjectArticleProps) {
  const isFlipped = project.layoutVariant === "flipped";
  const mediaLayout =
    project.mediaLayout ||
    (project.visuals.screens ? "screen-trio" : "banner-with-grid");

  // Determine primary action link if available
  const primaryLink =
    project.links && project.links.length > 0 ? project.links[0] : null;

  return (
    <article className="w-full py-16 sm:py-24 border-b border-[#1A1A1A] last:border-b-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start ${
            isFlipped ? "lg:grid-flow-dense" : ""
          }`}
        >
          {/* ============================================================= */}
          {/* Content Column                                                */}
          {/* ============================================================= */}
          <div
            className={`space-y-8 ${
              isFlipped
                ? "lg:col-span-5 lg:col-start-8"
                : "lg:col-span-5"
            }`}
          >
            {/* Project Number & Badge */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#E5B842] leading-none select-none">
                {project.projectNumber}
              </span>
              {project.badge && (
                <span className="px-3 py-1 border border-[#E5B842] text-[#E5B842] font-mono text-[11px] tracking-wider uppercase">
                  {project.badge}
                </span>
              )}
            </div>

            {/* Subtitle / Category metadata */}
            {project.subtitle && (
              <div className="font-mono text-xs text-[#7A7A7A] tracking-wider uppercase">
                {project.subtitle}
              </div>
            )}

            {/* Project Title */}
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F3F3F3] leading-[1.15]">
              {project.title}
            </h3>

            {/* Project Description */}
            {project.description && (
              <p className="text-sm sm:text-base text-[#9E9E9E] leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Optional: Growth Note (e.g. Shopping App) */}
            {project.growthNote && (
              <div className="border-l-2 border-[#E5B842] pl-4 py-1.5 space-y-1.5 bg-[#121212]/50">
                <span className="font-mono text-[11px] text-[#E5B842] tracking-wider uppercase block font-semibold">
                  {project.growthNote.title}
                </span>
                <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed italic">
                  &ldquo;{project.growthNote.text}&rdquo;
                </p>
              </div>
            )}

            {/* Metadata Grid (Role, Team Structure, Scope, Status/Timeline) */}
            {(project.role ||
              project.teamStructure ||
              project.disciplineScope ||
              project.statusText) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1C1C1C] font-mono text-xs">
                {project.role && (
                  <div>
                    <span className="text-[#666666] uppercase tracking-wider block text-[10px]">
                      ROLE
                    </span>
                    <span className="text-[#CCCCCC]">{project.role}</span>
                  </div>
                )}
                {project.teamStructure && (
                  <div>
                    <span className="text-[#666666] uppercase tracking-wider block text-[10px]">
                      TEAM STRUCTURE
                    </span>
                    <span className="text-[#CCCCCC]">{project.teamStructure}</span>
                  </div>
                )}
                {project.disciplineScope && (
                  <div>
                    <span className="text-[#666666] uppercase tracking-wider block text-[10px]">
                      DISCIPLINE SCOPE
                    </span>
                    <span className="text-[#CCCCCC]">{project.disciplineScope}</span>
                  </div>
                )}
                {project.statusText && (
                  <div>
                    <span className="text-[#666666] uppercase tracking-wider block text-[10px]">
                      STATUS / TIMELINE
                    </span>
                    <span className="text-[#E5B842]">{project.statusText}</span>
                  </div>
                )}
              </div>
            )}

            {/* Optional: Technical UX Pillars (e.g. Sigma Computer) */}
            {project.pillars && project.pillars.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-[#1C1C1C]">
                {project.pillars.map((pillar) => (
                  <div key={pillar.number} className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-[#E5B842]">
                        {pillar.number}.
                      </span>
                      <h4 className="text-sm font-semibold text-[#F3F3F3]">
                        {pillar.title}
                      </h4>
                    </div>
                    <p className="font-mono text-xs text-[#808080] pl-6 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Optional: Core Component Set (e.g. Book Store) */}
            {project.coreComponentSet && project.coreComponentSet.length > 0 && (
              <div className="border border-[#222222] bg-[#121212] p-5 space-y-3">
                <span className="font-mono text-[11px] text-[#E5B842] tracking-wider uppercase block font-semibold">
                  CORE COMPONENT SET
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-[#B0B0B0]">
                  {project.coreComponentSet.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="text-[#E5B842]">■</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button / Action Links (Data-Driven from project.links with fallback) */}
            {(primaryLink || project.ctaText) && (
              <div className="pt-2 space-y-2">
                {primaryLink ? (
                  primaryLink.type === "case-study" ? (
                    <Link
                      href={primaryLink.url}
                      className="inline-flex items-center gap-2 bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-mono text-xs font-semibold px-6 py-3.5 tracking-wider uppercase transition-colors"
                    >
                      <span>{primaryLink.label}</span>
                    </Link>
                  ) : (
                    <Link
                      href={primaryLink.url}
                      className="inline-block border border-[#262626] hover:border-[#E5B842] bg-[#141414] hover:text-[#E5B842] px-4 py-2.5 font-mono text-xs text-[#A0A0A0] tracking-wider uppercase transition-colors"
                    >
                      {primaryLink.label}
                    </Link>
                  )
                ) : project.ctaMicrocopy ? (
                  <Link
                    href="#contact"
                    className="inline-flex items-center gap-2 bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-mono text-xs font-semibold px-6 py-3.5 tracking-wider uppercase transition-colors"
                  >
                    <span>{project.ctaText}</span>
                  </Link>
                ) : (
                  <div className="inline-block border border-[#262626] bg-[#141414] px-4 py-2.5 font-mono text-xs text-[#A0A0A0] tracking-wider uppercase">
                    {project.ctaText}
                  </div>
                )}

                {/* Optional Microcopy */}
                {(primaryLink?.microcopy || project.ctaMicrocopy) && (
                  <p className="font-mono text-[10px] text-[#666666] tracking-wider uppercase">
                    {primaryLink?.microcopy || project.ctaMicrocopy}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ============================================================= */}
          {/* Visuals Column (Generic Data-Driven Media Presentation)       */}
          {/* ============================================================= */}
          <div
            className={`space-y-4 ${
              isFlipped
                ? "lg:col-span-7 lg:col-start-1"
                : "lg:col-span-7"
            }`}
          >
            {/* Presentation Mode 1: Screen Trio (e.g. Shopping App) */}
            {mediaLayout === "screen-trio" && project.visuals.screens && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start">
                {project.visuals.screens.map((screen, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-none overflow-hidden bg-[#121212] flex flex-col transition-transform duration-300 hover:scale-[1.02] ${
                      screen.isHighlighted
                        ? "border-2 border-[#E5B842]/80 shadow-[0_0_20px_rgba(229,184,66,0.15)]"
                        : "border border-[#222222]"
                    }`}
                  >
                    <div className="relative aspect-[9/19] w-full overflow-hidden">
                      <Image
                        src={screen.src}
                        alt={`${project.title} - screen ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover object-top"
                      />
                    </div>
                    {screen.caption && (
                      <div className="p-2 border-t border-[#1C1C1C] font-mono text-[10px] text-[#7A7A7A] tracking-wider text-center uppercase truncate">
                        {screen.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Presentation Mode 2: Split Panel (Primary viewport + 2 stacked sub-panels) */}
            {mediaLayout === "split-panel" && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Main Phone Viewport */}
                {project.visuals.main && (
                  <div className="sm:col-span-7 border border-[#222222] bg-[#121212] overflow-hidden group">
                    <div className="p-2.5 border-b border-[#1C1C1C] flex justify-between font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wider">
                      <span>{project.visuals.mainCaption || "[VIEWPORT]"}</span>
                      {project.visuals.mainBadge && (
                        <span className="text-[#E5B842]">
                          {project.visuals.mainBadge}
                        </span>
                      )}
                    </div>
                    <div className="relative aspect-[9/14] sm:aspect-[9/16] w-full overflow-hidden">
                      <Image
                        src={project.visuals.main}
                        alt={`${project.title} primary display`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  </div>
                )}

                {/* Secondary Stacked Panels */}
                <div className="sm:col-span-5 space-y-4">
                  {project.visuals.secondaryLeft && (
                    <div className="border border-[#222222] bg-[#121212] overflow-hidden group">
                      {project.visuals.secondaryLeft.caption && (
                        <div className="p-2 border-b border-[#1C1C1C] font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wider">
                          {project.visuals.secondaryLeft.caption}
                        </div>
                      )}
                      <div className="relative aspect-[16/11] w-full overflow-hidden">
                        <Image
                          src={project.visuals.secondaryLeft.src}
                          alt="Detail visual 1"
                          fill
                          sizes="(max-width: 1024px) 100vw, 25vw"
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                  )}
                  {project.visuals.secondaryRight && (
                    <div className="border border-[#222222] bg-[#121212] overflow-hidden group">
                      {project.visuals.secondaryRight.caption && (
                        <div className="p-2 border-b border-[#1C1C1C] font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wider">
                          {project.visuals.secondaryRight.caption}
                        </div>
                      )}
                      <div className="relative aspect-[16/11] w-full overflow-hidden">
                        <Image
                          src={project.visuals.secondaryRight.src}
                          alt="Detail visual 2"
                          fill
                          sizes="(max-width: 1024px) 100vw, 25vw"
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Presentation Mode 3: Banner With Grid (Primary wide banner + 2 sub-grid cards) */}
            {mediaLayout === "banner-with-grid" && (
              <div className="space-y-4">
                {project.visuals.main && (
                  <div className="border border-[#222222] bg-[#121212] overflow-hidden group">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={project.visuals.main}
                        alt={`${project.title} overview`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
                      />
                    </div>
                  </div>
                )}

                {/* Secondary Cards Below Main Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.visuals.secondaryLeft && (
                    <div className="border border-[#222222] bg-[#121212] overflow-hidden">
                      <div className="p-2 border-b border-[#1C1C1C] font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wider">
                        {project.visuals.secondaryLeft.caption}
                      </div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={project.visuals.secondaryLeft.src}
                          alt="Detail left"
                          fill
                          sizes="(max-width: 640px) 100vw, 30vw"
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                  )}
                  {project.visuals.secondaryRight && (
                    <div className="border border-[#222222] bg-[#121212] overflow-hidden">
                      <div className="p-2 border-b border-[#1C1C1C] font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wider">
                        {project.visuals.secondaryRight.caption}
                      </div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={project.visuals.secondaryRight.src}
                          alt="Detail right"
                          fill
                          sizes="(max-width: 640px) 100vw, 30vw"
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================= */}
        {/* Full-Width Metric Pillars Row (Optional, Data-Driven)          */}
        {/* ============================================================= */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#1F1F1F]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="space-y-1.5">
                  <span className="font-mono text-[10px] sm:text-[11px] text-[#707070] tracking-wider uppercase block">
                    {metric.label}
                  </span>
                  <div
                    className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
                      metric.isGold ? "text-[#E5B842]" : "text-[#F3F3F3]"
                    }`}
                  >
                    {metric.value}
                  </div>
                  <p className="font-mono text-[11px] text-[#8E8E8E] leading-relaxed">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
