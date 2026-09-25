import Image from "next/image";
import Link from "next/link";
import { fieldNotes } from "@/data/fieldNotes";

export default function FieldNotesSection() {
  return (
    <section
      id="field-notes"
      aria-labelledby="field-notes-heading"
      className="scroll-mt-20 w-full py-16 sm:py-24 border-b border-[#1A1A1A] bg-[#0C0C0C]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs text-[#E5B842] tracking-wider uppercase">
            <span className="w-2 h-2 bg-[#E5B842] inline-block" />
            <span>DISPATCHES &amp; EXPERIMENTS // LAB NOTEBOOK</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#1A1A1A]">
            <div className="space-y-2 max-w-3xl">
              <h2
                id="field-notes-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F3F3F3]"
              >
                Field Notes{" "}
                <span className="text-[#707070] font-normal text-2xl sm:text-3xl md:text-4xl">
                  {"// Practice Area"}
                </span>
              </h2>
              <p className="text-sm sm:text-base text-[#9E9E9E] leading-relaxed">
                Daily UI explorations, micro-interactions, component architecture
                studies, and design experiments from my ongoing workbench.
              </p>
            </div>
            <div className="font-mono text-xs text-[#707070] tracking-wider uppercase flex-shrink-0">
              <span className="text-[#E5B842]">{fieldNotes.length} ENTRIES</span>{" "}
              <span className="text-[#333333] mx-1">/</span> ONGOING PRACTICE
            </div>
          </div>
        </div>

        {/* 3-Col Desktop, 2-Col Tablet, 1-Col Mobile Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fieldNotes.map((note) => (
            <article
              key={note.id}
              className="group relative border border-[#1F1F1F] hover:border-[#E5B842]/60 bg-[#121212] transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Card Image / Visual Preview Container */}
              {note.image && (
                <div className="relative w-full aspect-[16/10] bg-[#161616] overflow-hidden border-b border-[#1F1F1F] group-hover:border-[#E5B842]/30 transition-colors">
                  <Image
                    src={note.image}
                    alt={`${note.title} visual exploration preview`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {/* Technical Coordinate Watermark */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#0C0C0C]/85 backdrop-blur-sm border border-[#262626] font-mono text-[10px] text-[#A0A0A0] tracking-wider uppercase">
                    NOTE // {note.noteNumber}
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Category & Date Metadata */}
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-wider uppercase">
                    <span className="text-[#E5B842] font-medium">
                      {note.category}
                    </span>
                    {note.date && (
                      <span className="text-[#707070]">{note.date}</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#F3F3F3] group-hover:text-[#E5B842] transition-colors leading-snug">
                    <Link
                      href={note.href || "#contact"}
                      className="focus:outline-none focus:underline"
                    >
                      {note.title}
                    </Link>
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-[#8E8E8E] leading-relaxed line-clamp-3">
                    {note.description}
                  </p>
                </div>

                {/* Footer Tag & CTA */}
                <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between font-mono text-[10px] text-[#707070]">
                  {note.tag ? (
                    <span className="px-2 py-0.5 bg-[#181818] border border-[#262626] text-[#A0A0A0] uppercase tracking-wider">
                      {note.tag}
                    </span>
                  ) : (
                    <span />
                  )}

                  <Link
                    href={note.href || "#contact"}
                    className="text-[#707070] group-hover:text-[#E5B842] transition-colors flex items-center gap-1 focus:outline-none focus:text-[#E5B842]"
                  >
                    <span>EXPLORE</span>
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
