import { requireAdmin } from "@/lib/auth";

export default async function AdminFieldNotesPlaceholderPage() {
  await requireAdmin();

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

      {/* Information Architecture Placeholder State */}
      <div className="border border-[#1F1F1F] bg-[#141414] rounded-[10px] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E5B842] inline-block animate-pulse" />
          <span className="font-mono text-xs text-[#E5B842] uppercase tracking-wider font-semibold">
            PHASE 1 ARCHITECTURE ACTIVE
          </span>
        </div>
        <p className="font-mono text-xs text-[#9E9E9E] leading-relaxed max-w-2xl">
          Field Notes administration module is registered in the control hierarchy. Full CRUD operations, asset uploads, and database persistence will be provisioned in Phase 2.
        </p>
        <div className="pt-2 font-mono text-[11px] text-[#555555]">
          ROUTE // /admin/field-notes
        </div>
      </div>
    </main>
  );
}
