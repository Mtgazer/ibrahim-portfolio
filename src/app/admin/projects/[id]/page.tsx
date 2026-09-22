import { requireAdmin } from "@/lib/auth";

export default async function AdminProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border border-[#1F1F1F] bg-[#141414] p-8">
        <h1 className="font-mono text-sm text-[#E5B842] uppercase tracking-wider">
          [EDIT PROJECT WORKSPACE // ID: {id} — DEFERRED TO PHASE 6]
        </h1>
      </div>
    </main>
  );
}
