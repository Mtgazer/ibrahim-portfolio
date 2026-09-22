"use client";

import { useState } from "react";

export default function DailyUISection() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section id="daily-ui" className="scroll-mt-20 w-full py-16 sm:py-24 border-b border-[#1A1A1A] bg-[#0C0C0C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-xs text-[#E5B842] tracking-wider uppercase">
            <span className="w-2 h-2 bg-[#E5B842] inline-block" />
            <span>MICRO-INTERACTION &amp; STATE SYSTEM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F3F3F3]">
            Daily UI &amp; Interface Explorations –{" "}
            <span className="text-[#E5B842]">Flowly</span>
          </h2>
          <p className="text-sm sm:text-base text-[#9E9E9E] leading-relaxed">
            Focusing on rigorous state management in input design: validating how micro-interactions communicate state changes (default, filled, and error handling) with clear affordances and zero ambiguity.
          </p>
        </div>

        {/* 3 Interactive State Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Default / Initial Rest */}
          <div className="border border-[#222222] bg-[#121212] p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#707070] tracking-wider uppercase border-b border-[#1C1C1C] pb-3">
                <span>01 // INITIAL REST</span>
                <span>[FLOWLY — DEFAULT]</span>
              </div>

              {/* Form Content */}
              <div className="space-y-5">
                <div className="w-8 h-8 rounded bg-[#1C1C1C] flex items-center justify-center font-bold text-sm text-[#A0A0A0]">
                  F
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-[#F3F3F3]">Welcome Back</h4>
                  <p className="text-xs text-[#707070]">Enter credentials to authenticate.</p>
                </div>

                <div className="space-y-4 pt-1 font-mono text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#666666] tracking-wider uppercase block">
                      EMAIL ADDRESS
                    </label>
                    <div className="w-full bg-[#181818] border border-[#262626] px-3.5 py-2.5 text-[#606060] text-xs">
                      name@institution.edu
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#666666] tracking-wider uppercase block">
                      PASSWORD
                    </label>
                    <div className="w-full bg-[#181818] border border-[#262626] px-3.5 py-2.5 text-[#606060] text-xs flex justify-between items-center">
                      <span>••••••••••••</span>
                      <span className="text-[#555555]">👁</span>
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full mt-2 bg-[#222222] text-[#606060] py-3 text-xs tracking-wider uppercase font-semibold cursor-not-allowed"
                  >
                    SIGN IN
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1C1C1C] font-mono text-[11px] text-[#666666] leading-relaxed">
              Muted contrast boundaries, resting typography labels positioned with precise optical baseline alignment.
            </div>
          </div>

          {/* Card 2: Active Focus / Filled (Highlighted in Gold) */}
          <div className="border-2 border-[#E5B842]/80 shadow-[0_0_30px_rgba(229,184,66,0.12)] bg-[#121212] p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#E5B842] tracking-wider uppercase border-b border-[#2A2414] pb-3">
                <span>02 // ACTIVE FOCUS</span>
                <span>[FLOWLY — FILLED]</span>
              </div>

              {/* Form Content */}
              <div className="space-y-5">
                <div className="w-8 h-8 rounded bg-[#E5B842] flex items-center justify-center font-bold text-sm text-black">
                  F
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-[#F3F3F3]">Welcome Back</h4>
                  <p className="text-xs text-[#8E8E8E]">Enter credentials to authenticate.</p>
                </div>

                <div className="space-y-4 pt-1 font-mono text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#E5B842] tracking-wider uppercase block">
                      EMAIL ADDRESS
                    </label>
                    <div className="w-full bg-[#181818] border border-[#E5B842] px-3.5 py-2.5 text-[#F3F3F3] text-xs flex justify-between items-center">
                      <span>khalil.cs@hti.edu.eg</span>
                      <span className="text-[#E5B842]">✓</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#E5B842] tracking-wider uppercase block">
                      PASSWORD
                    </label>
                    <div className="w-full bg-[#181818] border border-[#E5B842] px-3.5 py-2.5 text-[#F3F3F3] text-xs flex justify-between items-center">
                      <span>{showPassword ? "superSecret2024!" : "••••••••••••••••"}</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#E5B842] hover:text-white"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? "👁" : "🔒"}
                      </button>
                    </div>
                  </div>

                  <button className="w-full mt-2 bg-[#E5B842] hover:bg-[#F0C44E] text-black py-3 text-xs tracking-wider uppercase font-semibold transition-colors flex items-center justify-center gap-1">
                    <span>SIGN IN</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2A2414] font-mono text-[11px] text-[#C2A34A] leading-relaxed">
              Champagne gold hairline focus triggers, positive validation glyphs, and high-contrast CTA activation.
            </div>
          </div>

          {/* Card 3: Error Validation */}
          <div className="border border-[#382020] bg-[#121212] p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#E57373] tracking-wider uppercase border-b border-[#2E1818] pb-3">
                <span>03 // ERROR VALIDATION</span>
                <span>[FLOWLY — ERROR]</span>
              </div>

              {/* Form Content */}
              <div className="space-y-5">
                <div className="w-8 h-8 rounded bg-[#2A1616] flex items-center justify-center font-bold text-sm text-[#E57373]">
                  F
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-[#F3F3F3]">Welcome Back</h4>
                  <p className="text-xs text-[#707070]">Enter credentials to authenticate.</p>
                </div>

                <div className="space-y-4 pt-1 font-mono text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-[#E57373] tracking-wider uppercase block">
                        EMAIL ADDRESS
                      </label>
                      <span className="text-[10px] text-[#E57373] uppercase tracking-wider">
                        INVALID DOMAIN
                      </span>
                    </div>
                    <div className="w-full bg-[#181818] border border-[#E57373] px-3.5 py-2.5 text-[#F3F3F3] text-xs flex justify-between items-center">
                      <span>khalil.invalid@xyz</span>
                      <span className="text-[#E57373]">!</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#666666] tracking-wider uppercase block">
                      PASSWORD
                    </label>
                    <div className="w-full bg-[#181818] border border-[#262626] px-3.5 py-2.5 text-[#606060] text-xs flex justify-between items-center">
                      <span>••••••••</span>
                      <span className="text-[#555555]">👁</span>
                    </div>
                  </div>

                  <button className="w-full mt-2 border border-[#E57373]/60 bg-[#1E1212] hover:bg-[#2A1616] text-[#E57373] py-3 text-xs tracking-wider uppercase font-semibold transition-colors">
                    REVIEW CREDENTIALS
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E1818] font-mono text-[11px] text-[#9E6666] leading-relaxed">
              Semantic error boundary, contextual inline explanation string, preventing cognitive frustration.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
