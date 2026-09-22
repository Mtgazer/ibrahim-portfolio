import { requireAdmin } from "@/lib/auth";

export default async function AdminProjectsPage() {
  const user = await requireAdmin();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border border-[#1F1F1F] bg-[#141414] p-8 sm:p-12">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-6 mb-8 flex-wrap gap-4">
          <div>
            <span className="font-mono text-xs text-[#E5B842] tracking-wider uppercase">
              [SYS // PHASE-05 // ACCESS CONTROL]
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3] mt-1">
              Admin Workspace
            </h1>
          </div>
          <div className="font-mono text-xs text-[#E5B842] border border-[#E5B842]/40 bg-[#1A1A1A] px-3.5 py-1.5 uppercase tracking-wider">
            STATUS: CLEARANCE VERIFIED
          </div>
        </div>

        <div className="space-y-4 font-mono text-xs text-[#9E9E9E] leading-relaxed max-w-2xl">
          <p>
            <strong className="text-[#F3F3F3]">Operator Identity:</strong>{" "}
            <span className="text-[#E5B842]">{user.email}</span>
          </p>
          <p>
            <strong className="text-[#F3F3F3]">Authenticated UUID:</strong>{" "}
            <span className="text-[#707070]">{user.id}</span>
          </p>
          <p>
            <strong className="text-[#F3F3F3]">Authorization Verification:</strong>{" "}
            Record confirmed in <code className="text-[#E5B842]">public.admin_users</code>.
          </p>
          <div className="mt-8 pt-6 border-t border-[#1F1F1F] text-[#707070]">
            [SYSTEM NOTE: Full project CRUD UI and Supabase Storage management will be introduced in Phase 6.]
          </div>
        </div>
      </div>
    </main>
  );
}
