import { personalInfo } from "@/data/personal";

interface Capability {
  code: string;
  title: string;
  description: string;
}

const capabilities: Capability[] = [
  {
    code: "UI DESIGN",
    title: "Visual Design",
    description:
      "Color calibration, typography scales, responsive viewport reflow, and high-fidelity interface layouts crafted with pixel-level discipline."
  },
  {
    code: "UX DESIGN",
    title: "User Research",
    description:
      "User journey mapping, cognitive walkthroughs, information architecture structures, and user testing with real student cohorts."
  },
  {
    code: "SYSTEMS",
    title: "Design Architecture",
    description:
      "Figma variables, atomic design token mapping, component state matrices, and thorough engineering handoff specs."
  },
  {
    code: "INTERACTION",
    title: "Prototyping",
    description:
      "Micro-interaction staging, smart-animate state transitions, mobile gesture mechanics, and realistic presentation flows."
  },
  {
    code: "STRUCTURE",
    title: "Wireframing",
    description:
      "Rapid structural iteration, low-fidelity paper and digital schematics, and functional feature validation before polish."
  },
  {
    code: "TECHNICAL LOGIC",
    title: "Frontend Engineering",
    description:
      "Direct understanding of DOM tree limits, layout constraints, API latency implications, and frontend engineering handoff feasibility."
  }
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 w-full py-16 sm:py-24 border-b border-[#1A1A1A] bg-[#0C0C0C]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Section Label */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative flex items-center justify-center">
              <span
                id="section-marker-about"
                className="w-2 h-2 rounded-full bg-[var(--theme-gold-text,#E5B842)] inline-block transition-all duration-300"
                style={{ boxShadow: "0 0 6px var(--theme-gold-glow, rgba(229,184,66,0.5))" }}
              />
              <span
                id="section-pulse-ring-about"
                className="section-pulse-ring absolute w-2 h-2 rounded-full pointer-events-none opacity-0"
                aria-hidden="true"
              />
              {/* Mobile subtle geometric transition trace stem (in whitespace beneath marker, never crossing text) */}
              <svg
                id="section-trace-about"
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
              ABOUT &amp; CAPABILITIES
            </span>
          </div>

          <div className="w-full h-px bg-[#1F1F1F]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Bio & Core Philosophy */}
          <div className="reveal-heading lg:col-span-5 space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F3F3F3] leading-[1.12]">
              How I think, design, and build.
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#9E9E9E] leading-relaxed">
              {personalInfo.aboutParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Core Daily Toolchain */}
            <div className="space-y-3 pt-4 border-t border-[#1C1C1C]">
              <span className="font-mono text-[11px] text-[#707070] tracking-wider uppercase block">
                CORE DAILY TOOLCHAIN
              </span>
              <div className="flex flex-col gap-2 font-mono text-xs">
                {personalInfo.coreToolchainPills.map((tool, idx) => {
                  const isGold = tool.includes("HTML5");
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-2 border rounded-[6px] w-fit ${
                        isGold
                          ? "border-[#E5B842] text-[#E5B842] bg-[#141414]"
                          : "border-[#222222] text-[#A0A0A0] bg-[#121212]"
                      }`}
                    >
                      {tool}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Capabilities Matrix */}
          <div className="reveal-card reveal-delay-1 lg:col-span-7 space-y-6">
            <div className="font-mono text-xs text-[#707070] tracking-wider uppercase border-b border-[#1C1C1C] pb-4">
              CAPABILITIES MATRIX
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {capabilities.map((item) => (
                <div
                  key={item.code}
                  className="p-5 border border-[#222222] bg-[#121212] rounded-[10px] space-y-2.5 transition-colors hover:border-[#333333]"
                >
                  <span className="font-mono text-[11px] text-[#E5B842] tracking-wider uppercase block font-semibold">
                    {item.code}
                  </span>
                  <h3 className="text-xl font-bold text-[#F3F3F3]">
                    {item.title}
                  </h3>
                  <p className="font-mono text-xs text-[#808080] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
