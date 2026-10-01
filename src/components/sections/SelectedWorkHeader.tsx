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
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] inline-block shadow-[0_0_6px_rgba(229,184,66,0.5)]" />
          <span className="font-mono text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#E5B842] select-none">
            SELECTED WORK
          </span>
        </div>



        {/* Section Title & Dynamic Count */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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
