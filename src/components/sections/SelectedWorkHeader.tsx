interface SelectedWorkHeaderProps {
  projectCount?: number;
  indexRange?: string;
}

export default function SelectedWorkHeader({
  projectCount = 4,
  indexRange = "2023–2024"
}: SelectedWorkHeaderProps) {
  const formattedCount = String(projectCount).padStart(2, "0");

  return (
    <div
      id="selected-work"
      className="scroll-mt-20 w-full border-b border-[#1F1F1F] bg-[#0C0C0C] py-8 sm:py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap">
            <span className="font-mono text-xs sm:text-sm font-semibold text-[#E5B842] tracking-wider">
              [SECTION // 01]
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F3F3F3]">
              Selected Work &amp; Case Studies
            </h2>
          </div>
          <div className="font-mono text-xs text-[#707070] tracking-wider uppercase">
            {`${formattedCount} PROJECTS TOTAL`} <span className="text-[#333333] mx-1">/</span> {`INDEX RANGE ${indexRange}`}
          </div>
        </div>
      </div>
    </div>
  );
}
