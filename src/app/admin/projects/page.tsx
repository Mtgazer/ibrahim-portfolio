import { requireAdmin } from "@/lib/auth";
import { getAllAdminProjects } from "@/lib/projects";
import ProjectListTable from "@/components/admin/ProjectListTable";

export default async function AdminProjectsPage() {
  await requireAdmin();
  const allProjects = await getAllAdminProjects();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Page Header */}
      <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-6 flex-wrap gap-4">
        <div>
          <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
            [SYS // ARCHIVE REPOSITORY]
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F3]">
            Portfolio Projects Registry
          </h1>
          <p className="font-mono text-xs text-[#707070] mt-1">
            Manage live project records, edit taxonomy, toggle publication state, and adjust sort hierarchy.
          </p>
        </div>
      </div>

      {/* Projects List & Filter Table */}
      <ProjectListTable initialProjects={allProjects} />
    </main>
  );
}
