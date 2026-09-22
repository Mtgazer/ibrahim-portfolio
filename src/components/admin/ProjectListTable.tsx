"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { DbProjectWithRelations } from "@/lib/projects";
import ProjectDeleteButton from "./ProjectDeleteButton";
import {
  toggleProjectPublishedAction,
  toggleProjectFeaturedAction,
} from "@/lib/actions/projects";

interface ProjectListTableProps {
  initialProjects: DbProjectWithRelations[];
}

type FilterTab = "all" | "published" | "draft" | "featured";

export default function ProjectListTable({
  initialProjects,
}: ProjectListTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [projects, setProjects] = useState<DbProjectWithRelations[]>(initialProjects);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (filter === "published") return p.is_published;
    if (filter === "draft") return !p.is_published;
    if (filter === "featured") return p.is_featured;
    return true;
  });

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const newStatus = !currentStatus;

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_published: newStatus } : p))
    );

    try {
      const res = await toggleProjectPublishedAction(id, newStatus);
      if (!res.success) {
        // Rollback on error
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_published: currentStatus } : p))
        );
      }
      router.refresh();
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_published: currentStatus } : p))
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const newStatus = !currentStatus;

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_featured: newStatus } : p))
    );

    try {
      const res = await toggleProjectFeaturedAction(id, newStatus);
      if (!res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_featured: currentStatus } : p))
        );
      }
      router.refresh();
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_featured: currentStatus } : p))
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#1F1F1F] pb-4">
        <div className="flex items-center gap-1 sm:gap-2">
          {(["all", "published", "draft", "featured"] as const).map((tab) => {
            const count = projects.filter((p) => {
              if (tab === "published") return p.is_published;
              if (tab === "draft") return !p.is_published;
              if (tab === "featured") return p.is_featured;
              return true;
            }).length;

            const isActive = filter === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`font-mono text-xs px-3.5 py-1.5 uppercase tracking-wider transition-colors cursor-pointer border ${
                  isActive
                    ? "bg-[#E5B842] text-[#0C0C0C] border-[#E5B842] font-bold"
                    : "text-[#9E9E9E] hover:text-[#F3F3F3] border-[#222222] hover:border-[#333333]"
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <Link
          href="/admin/projects/new"
          className="bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-mono text-xs font-bold px-4 py-2 uppercase tracking-wider transition-colors cursor-pointer"
        >
          + New Project
        </Link>
      </div>

      {/* Projects Table / Cards */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 border border-dashed border-[#262626] text-center font-mono text-xs text-[#707070] space-y-3">
          <p>No projects match the selected &ldquo;{filter}&rdquo; filter.</p>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-[#E5B842] hover:underline"
            >
              Reset to all projects ({projects.length})
            </button>
          )}
        </div>
      ) : (
        <div className="border border-[#1F1F1F] bg-[#141414] overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F1F1F] bg-[#0E0E0E] text-[#707070] uppercase text-[10px] tracking-wider select-none">
                <th className="py-3.5 px-4 w-16">Preview</th>
                <th className="py-3.5 px-4">Title &amp; Slug</th>
                <th className="py-3.5 px-4">Category &amp; Year</th>
                <th className="py-3.5 px-3 w-16 text-center">Order</th>
                <th className="py-3.5 px-3 w-28 text-center">Status</th>
                <th className="py-3.5 px-3 w-28 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredProjects.map((p) => {
                const images = p.project_images || [];
                const primaryImg = images.find((img) => img.is_primary) || images[0];
                const imgSrc = primaryImg?.public_url || primaryImg?.storage_path;
                const isBusy = loadingId === p.id;
                const formattedDate = new Date(p.updated_at).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                );

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#1A1A1A]/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-9 bg-[#0C0C0C] border border-[#222222] overflow-hidden flex items-center justify-center">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={p.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-[#444444] text-[9px] select-none">
                            N/A
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="font-bold text-[#F3F3F3] hover:text-[#E5B842] text-sm transition-colors"
                        >
                          {p.title}
                        </Link>
                        <div className="text-[#707070] text-[11px]">
                          /{p.slug}
                        </div>
                      </div>
                    </td>

                    {/* Category & Year */}
                    <td className="py-3 px-4 text-[#9E9E9E]">
                      <div>{p.category || "—"}</div>
                      <div className="text-[#666666] text-[11px]">
                        {p.year || "—"}
                      </div>
                    </td>

                    {/* Sort Order */}
                    <td className="py-3 px-3 text-center text-[#F3F3F3]">
                      #{p.sort_order}
                    </td>

                    {/* Published Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(p.id, p.is_published)}
                        disabled={isBusy}
                        className={`px-2.5 py-1 text-[10px] uppercase font-bold border transition-colors cursor-pointer ${
                          p.is_published
                            ? "bg-[#E5B842]/10 border-[#E5B842]/50 text-[#E5B842] hover:bg-[#E5B842]/20"
                            : "bg-[#1E1E1E] border-[#333333] text-[#707070] hover:text-[#9E9E9E]"
                        }`}
                        title="Click to toggle publication"
                      >
                        {p.is_published ? "PUBLISHED" : "DRAFT"}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                        disabled={isBusy}
                        className={`px-2 py-1 text-[10px] uppercase border transition-colors cursor-pointer ${
                          p.is_featured
                            ? "border-[#E5B842] text-[#E5B842] bg-[#E5B842]/10"
                            : "border-[#262626] text-[#555555] hover:text-[#888888]"
                        }`}
                        title="Click to toggle featured flag"
                      >
                        {p.is_featured ? "★ YES" : "NO"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <span className="text-[#555555] text-[10px] hidden xl:inline mr-2">
                          Updated {formattedDate}
                        </span>
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="px-3 py-1.5 border border-[#333333] hover:border-[#E5B842] text-[#9E9E9E] hover:text-[#E5B842] uppercase tracking-wider transition-colors"
                        >
                          Edit
                        </Link>
                        <ProjectDeleteButton
                          projectId={p.id}
                          projectTitle={p.title}
                          className="px-2.5 py-1.5 border border-[#E55353]/30 text-[#E55353] hover:bg-[#E55353]/10 uppercase text-[11px] transition-colors"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
