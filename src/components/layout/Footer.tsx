import { personalInfo } from "@/data/personal";

export default function Footer() {
  return (
    <footer className="w-full bg-[#090909] border-t border-[#1F1F1F] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#666666] tracking-wider uppercase">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-center sm:text-left">
          <span>LOCATION: {personalInfo.location.toUpperCase()}</span>
          <span className="text-[#333333] hidden sm:inline" aria-hidden="true">•</span>
          <span>TIMEZONE: {personalInfo.timezone.toUpperCase()}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2 text-center sm:text-right">
          <span>
            &copy; {new Date().getFullYear()} {personalInfo.name.toUpperCase()} — ALL RIGHTS RESERVED
          </span>
          <a
            href="#home"
            className="text-[#888888] hover:text-[#E5B842] transition-colors inline-flex items-center gap-1 cursor-pointer"
            aria-label="Back to top"
          >
            <span>BACK TO TOP</span>
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

