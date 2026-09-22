import Link from "next/link";
import { personalInfo } from "@/data/personal";

export default function Footer() {
  return (
    <footer className="w-full bg-[#090909] border-t border-[#1F1F1F] py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Area */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          {/* Left: Availability & Message */}
          <div className="space-y-2 max-w-lg">
            <span className="font-mono text-[11px] text-[#E5B842] tracking-wider uppercase block">
              AVAILABLE FOR SELECTED COMMISSIONS
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
              Let&apos;s build something thoughtful.
            </h3>
          </div>

          {/* Right: Quick Links */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[#666666] uppercase tracking-wider block text-[10px]">
                DIRECT TRANSMISSION
              </span>
              <a
                href={`mailto:${personalInfo.email}`}
                className="text-[#D4D4D4] hover:text-[#E5B842] transition-colors"
              >
                {personalInfo.email}
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-[#666666] uppercase tracking-wider block text-[10px]">
                PROFESSIONAL NETWORK
              </span>
              <Link
                href={personalInfo.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4D4D4] hover:text-[#E5B842] transition-colors"
              >
                linkedin.com/in/ibrahimkhalil
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#666666] tracking-wider uppercase">
          <div>
            LOC: CAIRO, EGYPT [{personalInfo.coordinates}]
          </div>
          <div>
            &copy; {new Date().getFullYear()} {personalInfo.name.toUpperCase()} — ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </footer>
  );
}
