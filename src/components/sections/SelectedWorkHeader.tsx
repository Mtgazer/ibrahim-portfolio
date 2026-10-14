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
          <div className="relative flex items-center justify-center">
            <span
              id="section-marker-projects"
              className="w-2 h-2 rounded-full bg-[var(--theme-gold-text,#E5B842)] inline-block transition-all duration-300"
              style={{ boxShadow: "0 0 6px var(--theme-gold-glow, rgba(229,184,66,0.5))" }}
            />
            <span
              id="section-pulse-ring-projects"
              className="section-pulse-ring absolute w-2 h-2 rounded-full pointer-events-none opacity-0"
              aria-hidden="true"
            />
            {/* Mobile subtle geometric transition trace stem (in whitespace beneath marker, never crossing text) */}
            <svg
              id="section-trace-projects"
              className="lg:hidden absolute top-2.5 left-1/2 -translate-x-1/2 w-2.5 h-4 pointer-events-none overflow-visible section-trace-stem"
              viewBox="0 0 10 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M 5 0 L 5 11 L 8 14"
                stroke="var(--theme-ambient-path, rgba(229,184,66,0.2))"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </div>
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
