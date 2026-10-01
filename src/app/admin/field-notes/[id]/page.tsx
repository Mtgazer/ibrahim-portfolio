import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getFieldNoteById } from "@/lib/field-notes";
import FieldNoteForm from "@/components/admin/FieldNoteForm";
import FieldNoteDeleteButton from "@/components/admin/FieldNoteDeleteButton";

export default async function AdminFieldNoteEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const note = await getFieldNoteById(id);

  if (!note) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Workspace Header */}
      <div className="border border-[#1F1F1F] bg-[#141414] rounded-[10px] p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-6 mb-6 flex-wrap gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest">
                [FIELD NOTE WORKSPACE // {note.slug || note.id.slice(0, 8)}]
              </span>
              {note.isPublished ? (
                <span className="font-mono text-[10px] bg-[#E5B842]/10 border border-[#E5B842]/40 rounded-[6px] text-[#E5B842] px-2 py-0.5 uppercase">
                  ● LIVE ON CAROUSEL
                </span>
              ) : (
                <span className="font-mono text-[10px] bg-[#222222] border border-[#333333] rounded-[6px] text-[#707070] px-2 py-0.5 uppercase">
                  ○ DRAFT ONLY
                </span>
              )}
              {note.isFeatured && (
                <span className="font-mono text-[10px] text-[#E5B842] border border-[#E5B842]/30 rounded-[6px] px-2 py-0.5 uppercase">
                  ★ FEATURED
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
              {note.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {note.isPublished && (
              <Link
                href="/#field-notes"
                target="_blank"
                className="font-mono text-xs text-[#E5B842] hover:underline border border-[#E5B842]/40 bg-[#1A1A1A] rounded-[8px] px-3.5 py-2 uppercase tracking-wider"
              >
                View Public Carousel ↗
              </Link>
            )}
            <FieldNoteDeleteButton
              fieldNoteId={note.id}
              fieldNoteTitle={note.title}
              redirectTo="/admin/field-notes"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono text-xs text-[#707070]">
          <div>
            <span className="block text-[10px] uppercase">Record UUID</span>
            <span className="text-[#9E9E9E] truncate block" title={note.id}>
              {note.id.slice(0, 8)}...
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Category</span>
            <span className="text-[#9E9E9E] truncate block">{note.category || "—"}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Note Index</span>
            <span className="text-[#9E9E9E]">NOTE // {note.noteNumber || "—"}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Date</span>
            <span className="text-[#9E9E9E]">{note.date || note.noteDate || "—"}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Sort Order</span>
            <span className="text-[#E5B842]">#{note.sortOrder}</span>
          </div>
        </div>
      </div>

      {/* Field Note Edit Form */}
      <FieldNoteForm initialNote={note} mode="edit" />
    </main>
  );
}
