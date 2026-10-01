import { requireAdmin } from "@/lib/auth";
import FieldNoteForm from "@/components/admin/FieldNoteForm";

export default async function AdminFieldNotesNewPage() {
  await requireAdmin();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#1F1F1F] pb-6">
        <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
          [SYS // INITIALIZATION // NEW FIELD NOTE]
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
          Create New Field Note
        </h1>
        <p className="font-mono text-xs text-[#707070] mt-1.5 leading-relaxed">
          Record a new design exploration, micro-interaction study, or engineering note. Once created, you can configure cover imagery and live carousel visibility.
        </p>
      </div>

      {/* Creation Form */}
      <FieldNoteForm mode="create" />
    </main>
  );
}
