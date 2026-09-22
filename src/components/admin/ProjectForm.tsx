"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createProjectAction,
  updateProjectAction,
  type ProjectInput,
} from "@/lib/actions/projects";
import { normalizeSlug } from "@/lib/slug";
import type { DbProjectWithRelations } from "@/lib/projects";

interface ProjectFormProps {
  initialProject?: DbProjectWithRelations;
  mode: "create" | "edit";
}

export default function ProjectForm({ initialProject, mode }: ProjectFormProps) {
  const router = useRouter();

  // Basic Information
  const [title, setTitle] = useState(initialProject?.title || "");
  const [slug, setSlug] = useState(initialProject?.slug || "");
  const [subtitle, setSubtitle] = useState(initialProject?.subtitle || "");
  const [description, setDescription] = useState(initialProject?.description || "");

  // Classification & Metadata
  const [category, setCategory] = useState(initialProject?.category || "");
  const [year, setYear] = useState<number | "">(initialProject?.year ?? new Date().getFullYear());
  const [role, setRole] = useState(initialProject?.role || "");
  const [toolsInput, setToolsInput] = useState((initialProject?.tools || []).join(", "));
  const [tagsInput, setTagsInput] = useState((initialProject?.tags || []).join(", "));

  // Publication & Ordering
  const [isPublished, setIsPublished] = useState(initialProject?.is_published ?? false);
  const [isFeatured, setIsFeatured] = useState(initialProject?.is_featured ?? false);
  const [sortOrder, setSortOrder] = useState<number>(initialProject?.sort_order ?? 0);

  // UI States
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-slug generator when typing title (in create mode unless manually edited)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited && mode === "create") {
      setSlug(normalizeSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic Validation
    if (!title.trim()) {
      setErrorMessage("VALIDATION ERROR // Project title is required.");
      return;
    }

    const cleanSlug = normalizeSlug(slug || title);
    if (!cleanSlug) {
      setErrorMessage("VALIDATION ERROR // A valid URL-safe slug is required.");
      return;
    }

    setLoading(true);

    const tools = toolsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const projectData: ProjectInput = {
      title: title.trim(),
      slug: cleanSlug,
      subtitle: subtitle.trim() || null,
      description: description.trim() || null,
      category: category.trim() || null,
      year: typeof year === "number" ? year : null,
      role: role.trim() || null,
      tools,
      tags,
      isPublished,
      isFeatured,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    };

    try {
      if (mode === "create") {
        const res = await createProjectAction(projectData);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to create project.");
          setLoading(false);
          return;
        }

        router.push(`/admin/projects/${res.data?.id}`);
        router.refresh();
      } else if (mode === "edit" && initialProject) {
        const res = await updateProjectAction(initialProject.id, projectData);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to update project.");
          setLoading(false);
          return;
        }

        setSuccessMessage("CHANGES SAVED // Project record updated successfully.");
        setLoading(false);
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "System error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Alert Banners */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 border border-[#E55353]/40 bg-[#1A1A1A] font-mono text-xs text-[#E55353] leading-relaxed flex items-center justify-between"
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="hover:underline ml-4 cursor-pointer"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-4 border border-[#E5B842]/40 bg-[#1A1A1A] font-mono text-xs text-[#E5B842] leading-relaxed flex items-center justify-between"
        >
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="hover:underline ml-4 cursor-pointer"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {/* SECTION 1: Core Information */}
      <section className="border border-[#1F1F1F] bg-[#141414] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#1F1F1F] pb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
              [SECTION 01 // CORE METRICS]
            </span>
            <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
              Basic Project Information
            </h2>
          </div>
          <span className="font-mono text-xs text-[#707070]">REQUIRED *</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label
              htmlFor="project-title"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Project Title <span className="text-[#E5B842]">*</span>
            </label>
            <input
              id="project-title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. HTI LMS – Student Academic Platform"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors"
            />
          </div>

          {/* Slug */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="project-slug"
                className="font-mono text-xs text-[#9E9E9E] uppercase tracking-wider"
              >
                URL Slug <span className="text-[#E5B842]">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setSlug(normalizeSlug(title));
                  setSlugManuallyEdited(false);
                }}
                className="font-mono text-[10px] text-[#707070] hover:text-[#E5B842] underline tracking-wider cursor-pointer"
              >
                [AUTO-GENERATE FROM TITLE]
              </button>
            </div>
            <div className="flex items-center">
              <span className="bg-[#1C1C1C] border border-r-0 border-[#262626] text-[#707070] font-mono text-xs px-3 py-2.5 select-none">
                /projects/
              </span>
              <input
                id="project-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                }}
                placeholder="hti-lms-student-academic-platform"
                className="flex-1 bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors"
              />
            </div>
            <p className="font-mono text-[10px] text-[#707070] mt-1.5 tracking-wider">
              Must be unique, lowercase, and URL-safe. Hyphens only.
            </p>
          </div>

          {/* Subtitle / Department */}
          <div className="md:col-span-2">
            <label
              htmlFor="project-subtitle"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Subtitle / Context Tagline
            </label>
            <input
              id="project-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. HTI COMPUTER SCIENCE · ACADEMIC PLATFORM"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="project-description"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Description / Overview
            </label>
            <textarea
              id="project-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A comprehensive summary of the project architecture, goals, and design execution..."
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] text-sm px-4 py-2.5 outline-hidden transition-colors leading-relaxed"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Classification & Architecture */}
      <section className="border border-[#1F1F1F] bg-[#141414] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#1F1F1F] pb-4">
          <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
            [SECTION 02 // CLASSIFICATION]
          </span>
          <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
            Discipline, Role &amp; Toolset
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category */}
          <div>
            <label
              htmlFor="project-category"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Category
            </label>
            <input
              id="project-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Academic Platform"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors"
            />
          </div>

          {/* Year */}
          <div>
            <label
              htmlFor="project-year"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Year
            </label>
            <input
              id="project-year"
              type="number"
              min={2000}
              max={2099}
              value={year}
              onChange={(e) =>
                setYear(e.target.value === "" ? "" : parseInt(e.target.value, 10))
              }
              placeholder="2024"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="project-role"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Role
            </label>
            <input
              id="project-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. UI/UX Team Lead & Designer"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors"
            />
          </div>

          {/* Tools */}
          <div className="md:col-span-3">
            <label
              htmlFor="project-tools"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Tools &amp; Technologies (comma-separated)
            </label>
            <input
              id="project-tools"
              type="text"
              value={toolsInput}
              onChange={(e) => setToolsInput(e.target.value)}
              placeholder="Figma, FigJam, React Tokens, Tailwind CSS"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors"
            />
          </div>

          {/* Tags */}
          <div className="md:col-span-3">
            <label
              htmlFor="project-tags"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Tags / Disciplines (comma-separated)
            </label>
            <input
              id="project-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="UI/UX Design, Design Systems, Education, Product Architecture"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Publication & Visibility */}
      <section className="border border-[#1F1F1F] bg-[#141414] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#1F1F1F] pb-4">
          <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
            [SECTION 03 // DISPOSITION]
          </span>
          <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
            Visibility &amp; Homepage Ordering
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Published Toggle */}
          <div className="border border-[#262626] bg-[#0C0C0C] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="project-published"
                className="font-mono text-xs font-semibold text-[#F3F3F3] uppercase tracking-wider cursor-pointer"
              >
                Published Status
              </label>
              <input
                id="project-published"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-[#E5B842] cursor-pointer"
              />
            </div>
            <p className="font-mono text-[10px] text-[#707070] leading-relaxed">
              {isPublished
                ? "[LIVE] Visible on the public portfolio homepage."
                : "[DRAFT] Hidden from the public portfolio."}
            </p>
          </div>

          {/* Featured Toggle */}
          <div className="border border-[#262626] bg-[#0C0C0C] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="project-featured"
                className="font-mono text-xs font-semibold text-[#F3F3F3] uppercase tracking-wider cursor-pointer"
              >
                Featured Flag
              </label>
              <input
                id="project-featured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#E5B842] cursor-pointer"
              />
            </div>
            <p className="font-mono text-[10px] text-[#707070] leading-relaxed">
              {isFeatured
                ? "[FEATURED] Marked for priority or showcase highlighting."
                : "[STANDARD] Standard portfolio display index."}
            </p>
          </div>

          {/* Sort Order */}
          <div className="border border-[#262626] bg-[#0C0C0C] p-4 space-y-2">
            <label
              htmlFor="project-sort-order"
              className="block font-mono text-xs font-semibold text-[#F3F3F3] uppercase tracking-wider"
            >
              Sort Order Index
            </label>
            <input
              id="project-sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                )
              }
              className="w-full bg-[#141414] border border-[#2E2E2E] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-3 py-1.5 outline-hidden"
            />
            <p className="font-mono text-[10px] text-[#707070] leading-relaxed">
              Lower numbers appear first on the public homepage (1, 2, 3...).
            </p>
          </div>
        </div>
      </section>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-between border-t border-[#1F1F1F] pt-6 flex-wrap gap-4">
        <Link
          href="/admin/projects"
          className="font-mono text-xs text-[#9E9E9E] hover:text-[#F3F3F3] border border-[#262626] px-5 py-3 uppercase tracking-wider transition-colors"
        >
          ← Return to Project List
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-mono text-xs font-bold uppercase tracking-wider px-8 py-3.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>SAVING RECORD...</span>
            </>
          ) : mode === "create" ? (
            <span>CREATE PROJECT RECORD →</span>
          ) : (
            <span>SAVE METADATA CHANGES</span>
          )}
        </button>
      </div>
    </form>
  );
}
