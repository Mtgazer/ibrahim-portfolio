import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardStats, getAllAdminProjects } from "@/lib/projects";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const stats = await getAdminDashboardStats();
  const allProjects = await getAllAdminProjects();
  const recentProjects = allProjects.slice(0, 5);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header & Identity Section */}
      <div className="border border-[#1F1F1F] bg-[#141414] p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-6 mb-6 flex-wrap gap-4">
          <div>
            <span className="font-mono text-[10px] text-[#E5B842] tracking-widest uppercase block mb-1">
              [SYSTEM // CONTROL DISPOSITION]
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/projects/new"
              className="bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-mono text-xs font-bold px-4 py-2.5 uppercase tracking-wider transition-colors"
            >
              + Create Project
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-[#9E9E9E]">
          <div>
            <span className="text-[#707070] block text-[10px] uppercase">
              Authenticated Operator
            </span>
            <span className="text-[#F3F3F3] font-semibold">{user.email}</span>
          </div>
          <div>
            <span className="text-[#707070] block text-[10px] uppercase">
              Security Clearance
            </span>
            <span className="text-[#E5B842]">Verified in public.admin_users</span>
          </div>
          <div>
            <span className="text-[#707070] block text-[10px] uppercase">
              Storage Bucket
            </span>
            <span className="text-[#F3F3F3]">project-images (Supabase Storage)</span>
          </div>
        </div>
      </div>

      {/* 2. Portfolio Metric Cards */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Projects */}
          <div className="border border-[#1F1F1F] bg-[#141414] p-5 space-y-2">
            <span className="font-mono text-[10px] text-[#707070] uppercase tracking-wider block">
              Total Projects
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-[#F3F3F3]">
              {String(stats.total).padStart(2, "0")}
            </div>
            <p className="font-mono text-[10px] text-[#555555]">
              Records in Supabase PostgreSQL
            </p>
          </div>

          {/* Published */}
          <div className="border border-[#1F1F1F] bg-[#141414] p-5 space-y-2">
            <span className="font-mono text-[10px] text-[#707070] uppercase tracking-wider block">
              Published Live
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-[#E5B842]">
              {String(stats.published).padStart(2, "0")}
            </div>
            <p className="font-mono text-[10px] text-[#555555]">
              Visible on public homepage
            </p>
          </div>

          {/* Drafts */}
          <div className="border border-[#1F1F1F] bg-[#141414] p-5 space-y-2">
            <span className="font-mono text-[10px] text-[#707070] uppercase tracking-wider block">
              Draft Projects
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-[#9E9E9E]">
              {String(stats.drafts).padStart(2, "0")}
            </div>
            <p className="font-mono text-[10px] text-[#555555]">
              Hidden from public index
            </p>
          </div>

          {/* Featured */}
          <div className="border border-[#1F1F1F] bg-[#141414] p-5 space-y-2">
            <span className="font-mono text-[10px] text-[#707070] uppercase tracking-wider block">
              Featured Flagged
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-[#F3F3F3]">
              {String(stats.featured).padStart(2, "0")}
            </div>
            <p className="font-mono text-[10px] text-[#555555]">
              Showcase highlights
            </p>
          </div>
        </div>
      </section>

      {/* 3. Quick Action & Overview Area */}
      <section className="border border-[#1F1F1F] bg-[#141414] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4 flex-wrap gap-4">
          <div>
            <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
              [DISPOSITION // INDEX PREVIEW]
            </span>
            <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
              Recent Projects Overview
            </h2>
          </div>

          <Link
            href="/admin/projects"
            className="font-mono text-xs text-[#E5B842] hover:underline uppercase tracking-wider"
          >
            View All Projects ({allProjects.length}) →
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-10 border border-dashed border-[#262626] text-center font-mono text-xs text-[#707070] space-y-3">
            <p>No project records currently exist in Supabase.</p>
            <p className="text-[11px] text-[#555555]">
              (The public site is currently rendering the 4 reference demonstration projects via local fallback.)
            </p>
            <div className="pt-2">
              <Link
                href="/admin/projects/new"
                className="inline-block bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-mono text-xs font-bold px-4 py-2 uppercase tracking-wider transition-colors"
              >
                + Create First Supabase Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#1F1F1F] font-mono text-xs">
            {recentProjects.map((p) => {
              const imageCount = p.project_images?.length || 0;
              const linkCount = p.project_links?.length || 0;

              return (
                <div
                  key={p.id}
                  className="py-4 flex items-center justify-between flex-wrap gap-4 hover:bg-[#1A1A1A]/40 transition-colors px-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#F3F3F3] text-sm">
                        {p.title}
                      </span>
                      {p.is_published ? (
                        <span className="px-2 py-0.5 text-[10px] bg-[#E5B842]/10 border border-[#E5B842]/30 text-[#E5B842] uppercase">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] bg-[#222222] border border-[#333333] text-[#707070] uppercase">
                          Draft
                        </span>
                      )}
                      {p.is_featured && (
                        <span className="text-[#E5B842] text-[10px]">★ Featured</span>
                      )}
                    </div>
                    <div className="text-[#707070] text-[11px]">
                      Slug: <span className="text-[#9E9E9E]">{p.slug}</span> · Order:{" "}
                      <span className="text-[#9E9E9E]">{p.sort_order}</span> · Images:{" "}
                      <span className="text-[#9E9E9E]">{imageCount}</span> · Links:{" "}
                      <span className="text-[#9E9E9E]">{linkCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="px-3.5 py-1.5 border border-[#333333] hover:border-[#E5B842] text-[#9E9E9E] hover:text-[#E5B842] uppercase tracking-wider transition-colors"
                    >
                      Manage Project →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
