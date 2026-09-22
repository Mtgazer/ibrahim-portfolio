import { personalInfo } from "@/data/personal";

export default function EditorialCoordinateBar() {
  return (
    <div className="w-full border-y border-[#1F1F1F] bg-[#0E0E0E] py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-mono text-[11px] sm:text-xs text-[#808080] tracking-wider">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          {/* Index */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E5B842] inline-block" />
            <span className="text-[#A0A0A0]">SYS.INDEX // SELECTED WORKS 2023–2024</span>
          </div>

          {/* Coordinates */}
          <div className="hidden md:block text-[#6E6E6E]">
            LAT: 30.0444° N // LON: 31.2357° E
          </div>

          {/* Department / Category */}
          <div className="hidden sm:block">
            <span>HTI CS // </span>
            <span className="text-[#E5B842] font-medium">INTERACTION & PRODUCT</span>
          </div>

          {/* Commission Status */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] animate-pulse" />
            <span className="text-[#CCCCCC]">{personalInfo.commissionStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
