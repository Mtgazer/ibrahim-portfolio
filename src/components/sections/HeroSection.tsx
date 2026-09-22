import Link from "next/link";
import { personalInfo } from "@/data/personal";

export default function HeroSection() {
  const pills = [
    "UI/UX DESIGN",
    "VISUAL SYSTEMS",
    "UX THINKING",
    "DESIGN ARCHITECTURE",
    "INTERACTIVE PROTOTYPING"
  ];

  return (
    <section className="relative w-full pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column (Main Editorial Content) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Dossier Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] border border-[#262626] font-mono text-[11px] text-[#A0A0A0] tracking-wider">
              <span className="w-2 h-2 bg-[#E5B842] inline-block" />
              <span>PORTFOLIO DOSSIER · {personalInfo.dossierVersion}</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-[#F3F3F3] leading-[1.08]">
              Designing digital products with{" "}
              <span className="text-[#E5B842] italic font-serif font-normal">clarity</span>,
              structure, and intent.
            </h1>

            {/* Bio Paragraph */}
            <p className="text-base sm:text-lg text-[#9E9E9E] leading-relaxed max-w-2xl font-normal">
              {personalInfo.bioSummary}
            </p>

            {/* Tag Pills */}
            <div className="space-y-2.5 pt-2">
              <div className="flex flex-wrap gap-2">
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className="px-3 py-1 bg-[#141414] border border-[#222222] text-[#8E8E8E] font-mono text-[11px] tracking-wider uppercase"
                  >
                    {pill}
                  </span>
                ))}
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-[#141414] border border-[#E5B842]/50 text-[#E5B842] font-mono text-[11px] tracking-wider uppercase">
                  CS ENGINEERING FOCUS
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-6">
              <Link
                href="#selected-work"
                className="inline-flex items-center gap-2 border border-[#E5B842] bg-transparent text-[#E5B842] hover:bg-[#E5B842] hover:text-black px-6 py-3.5 font-mono text-xs uppercase tracking-wider transition-all duration-200 group"
              >
                <span>EXPLORE SELECTED WORK</span>
                <span className="transition-transform group-hover:translate-y-0.5">↓</span>
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center gap-2 font-mono text-xs text-[#8E8E8E] hover:text-white uppercase tracking-wider pb-0.5 border-b border-[#333333] hover:border-white transition-colors"
              >
                <span>ABOUT & BACKGROUND</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Right Column (Technical Metadata & Philosophy) */}
          <div className="lg:col-span-4 lg:border-l lg:border-[#1F1F1F] lg:pl-8 xl:pl-10 space-y-8">
            {/* Technical Metadata Table */}
            <div className="space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-[#1A1A1A] gap-1">
                <span className="text-[#666666] tracking-wider uppercase">DISCIPLINE</span>
                <span className="text-[#D4D4D4] font-medium text-right sm:text-left">Product & Systems Design</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-[#1A1A1A] gap-1">
                <span className="text-[#666666] tracking-wider uppercase">ACADEMIC ANCHOR</span>
                <span className="text-[#D4D4D4] text-right sm:text-left">{personalInfo.academicAnchor}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-[#1A1A1A] gap-1">
                <span className="text-[#666666] tracking-wider uppercase">DEPARTMENT</span>
                <span className="text-[#D4D4D4] text-right sm:text-left">{personalInfo.department}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-[#1A1A1A] gap-1">
                <span className="text-[#666666] tracking-wider uppercase">ACTIVE TOOLCHAIN</span>
                <span className="text-[#E5B842] text-right sm:text-left">
                  {personalInfo.activeToolchain.join(" · ")}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-[#1A1A1A] gap-1">
                <span className="text-[#666666] tracking-wider uppercase">ROLE CALIBRATION</span>
                <span className="text-[#D4D4D4] text-right sm:text-left">{personalInfo.role}</span>
              </div>
            </div>

            {/* Design Philosophy Card */}
            <div className="bg-[#121212] border border-[#222222] p-5 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#E5B842] tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]" />
                <span>DESIGN PHILOSOPHY</span>
              </div>
              <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed italic">
                &ldquo;{personalInfo.designPhilosophy}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
