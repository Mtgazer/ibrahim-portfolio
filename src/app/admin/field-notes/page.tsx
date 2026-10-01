import { requireAdmin } from "@/lib/auth";
import { getAllAdminFieldNotes } from "@/lib/field-notes";
import FieldNoteListTable from "@/components/admin/FieldNoteListTable";

export default async function AdminFieldNotesPage() {
  await requireAdmin();
  const allNotes = await getAllAdminFieldNotes();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Page Header */}
      <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-6 flex-wrap gap-4">
        <div>
          <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
            [SYS // FIELD NOTES ARCHIVE]
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
            Field Notes Management
          </h1>
          <p className="font-mono text-xs text-[#707070] mt-1">
            Editorial workbench entries, UI explorations, micro-interaction studies, and design tokens.
          </p>
        </div>
      </div>

      {/* Field Notes Registry Table */}
      <FieldNoteListTable initialNotes={allNotes} />
    </main>
  );
}
