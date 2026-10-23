import SectionMarker from "@/components/navigation/SectionMarker";

interface SelectedWorkHeaderProps {
  projectCount?: number;
  indexRange?: string;
}

export default function SelectedWorkHeader({
  projectCount = 4,
}: SelectedWorkHeaderProps) {
  const formattedCount = String(projectCount).padStart(2, "0");

  return (
    <div
      id="my-projects"
      className="scroll-mt-20 w-full border-b border-[#1F1F1F] bg-[#0C0C0C] py-8 sm:py-12 relative"
    >
      <span id="selected-work" className="absolute -top-20 pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Label */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <SectionMarker sectionId="my-projects" />
          <span className="font-mono text-[11px] sm:text-xs lg:text-[13px] font-semibold tracking-wider text-[var(--theme-gold-text,#E5B842)]/75 select-none">
            02
          </span>
          <span
            className="w-1 h-1 rounded-full bg-[var(--theme-border-strong,#333333)] shrink-0"
            aria-hidden="true"
          />
          <span className="font-mono text-xs sm:text-sm lg:text-[16px] xl:text-[17px] font-semibold tracking-[0.14em] uppercase text-[var(--theme-gold-text,#E5B842)] select-none">
            SELECTED WORK
          </span>
        </div>



        {/* Section Title & Dynamic Count */}
        <div className="reveal-heading flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F3F3F3]">
            Selected Work &amp; Case Studies
          </h2>
          <div className="font-mono text-xs text-[#707070] tracking-wider uppercase">
            {`${formattedCount} PROJECTS TOTAL`}
          </div>
        </div>
      </div>
    </div>
  );
}
