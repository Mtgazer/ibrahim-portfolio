import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminProjectById } from "@/lib/projects";
import ProjectForm from "@/components/admin/ProjectForm";
import ProjectLinksManager from "@/components/admin/ProjectLinksManager";
import ProjectImagesManager from "@/components/admin/ProjectImagesManager";
import ProjectDeleteButton from "@/components/admin/ProjectDeleteButton";

export default async function AdminProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const project = await getAdminProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Workspace Header */}
      <div className="border border-[#1F1F1F] bg-[#141414] p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-6 mb-6 flex-wrap gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest">
                [PROJECT WORKSPACE // {project.slug}]
              </span>
              {project.is_published ? (
                <span className="font-mono text-[10px] bg-[#E5B842]/10 border border-[#E5B842]/40 text-[#E5B842] px-2 py-0.5 uppercase">
                  ● LIVE ON ARCHIVE
                </span>
              ) : (
                <span className="font-mono text-[10px] bg-[#222222] border border-[#333333] text-[#707070] px-2 py-0.5 uppercase">
                  ○ DRAFT ONLY
                </span>
              )}
              {project.is_featured && (
                <span className="font-mono text-[10px] text-[#E5B842] border border-[#E5B842]/30 px-2 py-0.5 uppercase">
                  ★ FEATURED
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {project.is_published && (
              <Link
                href="/"
                target="_blank"
                className="font-mono text-xs text-[#E5B842] hover:underline border border-[#E5B842]/40 bg-[#1A1A1A] px-3.5 py-2 uppercase tracking-wider"
              >
                View Public Showcase ↗
              </Link>
            )}
            <ProjectDeleteButton
              projectId={project.id}
              projectTitle={project.title}
              redirectTo="/admin/projects"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-[#707070]">
          <div>
            <span className="block text-[10px] uppercase">Record UUID</span>
            <span className="text-[#9E9E9E] truncate block" title={project.id}>
              {project.id.slice(0, 8)}...
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Category</span>
            <span className="text-[#9E9E9E]">{project.category || "—"}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Year</span>
            <span className="text-[#9E9E9E]">{project.year || "—"}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Sort Order</span>
            <span className="text-[#E5B842]">#{project.sort_order}</span>
          </div>
        </div>
      </div>

      {/* 1. Core Metadata Form */}
      <ProjectForm initialProject={project} mode="edit" />

      {/* 2. Action Links Management */}
      <ProjectLinksManager
        projectId={project.id}
        initialLinks={project.project_links || []}
      />

      {/* 3. Supabase Storage Images Management */}
      <ProjectImagesManager
        projectId={project.id}
        initialImages={project.project_images || []}
      />
    </main>
  );
}
