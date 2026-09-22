"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DbProjectLink } from "@/types/database";
import {
  createProjectLinkAction,
  updateProjectLinkAction,
  deleteProjectLinkAction,
  reorderProjectLinksAction,
  type ProjectLinkInput,
} from "@/lib/actions/projects";

interface ProjectLinksManagerProps {
  projectId: string;
  initialLinks: DbProjectLink[];
}

export default function ProjectLinksManager({
  projectId,
  initialLinks,
}: ProjectLinksManagerProps) {
  const router = useRouter();
  const [links, setLinks] = useState<DbProjectLink[]>(
    [...initialLinks].sort((a, b) => a.sort_order - b.sort_order)
  );

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form inputs
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ProjectLinkInput["type"]>("case-study");
  const [microcopy, setMicrocopy] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setLabel("");
    setUrl("");
    setType("case-study");
    setMicrocopy("");
    setIsAdding(false);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (link: DbProjectLink) => {
    setEditingId(link.id);
    setLabel(link.label);
    setUrl(link.url);
    setType((link.type as ProjectLinkInput["type"]) || "case-study");
    setMicrocopy(link.microcopy || "");
    setIsAdding(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) {
      setError("Label and URL are both required.");
      return;
    }

    setLoading(true);
    setError(null);

    const linkPayload: ProjectLinkInput = {
      label: label.trim(),
      url: url.trim(),
      type,
      microcopy: microcopy.trim() || null,
    };

    try {
      if (editingId) {
        const res = await updateProjectLinkAction(editingId, projectId, linkPayload);
        if (!res.success) {
          setError(res.error || "Failed to update link.");
          setLoading(false);
          return;
        }

        setLinks((prev) =>
          prev.map((l) =>
            l.id === editingId
              ? {
                  ...l,
                  label: linkPayload.label,
                  url: linkPayload.url,
                  type: linkPayload.type || null,
                  microcopy: linkPayload.microcopy || null,
                }
              : l
          )
        );
      } else {
        const res = await createProjectLinkAction(projectId, linkPayload);
        if (!res.success) {
          setError(res.error || "Failed to create link.");
          setLoading(false);
          return;
        }

        if (res.data?.id) {
          setLinks((prev) => [
            ...prev,
            {
              id: res.data!.id,
              project_id: projectId,
              label: linkPayload.label,
              url: linkPayload.url,
              type: linkPayload.type || null,
              microcopy: linkPayload.microcopy || null,
              sort_order: prev.length + 1,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }

      resetForm();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    setLoading(true);
    setError(null);

    try {
      const res = await deleteProjectLinkAction(linkId, projectId);
      if (!res.success) {
        setError(res.error || "Failed to delete link.");
        setLoading(false);
        return;
      }

      setLinks((prev) => prev.filter((l) => l.id !== linkId));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    setLinks(newLinks);

    try {
      const orderedIds = newLinks.map((l) => l.id);
      await reorderProjectLinksAction(projectId, orderedIds);
      router.refresh();
    } catch (err) {
      console.error("Failed to reorder links:", err);
    }
  };

  return (
    <div className="border border-[#1F1F1F] bg-[#141414] p-6 sm:p-8 space-y-6">
      <div className="border-b border-[#1F1F1F] pb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
            [SECTION 04 // EXTERNAL DESTINATIONS]
          </span>
          <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
            Project Action Links ({links.length})
          </h2>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="font-mono text-xs bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-bold px-4 py-2 uppercase tracking-wider transition-colors cursor-pointer"
          >
            + Add Link
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-[#E55353]/10 border border-[#E55353]/40 font-mono text-xs text-[#E55353]">
          {error}
        </div>
      )}

      {/* Inline Form (Add or Edit) */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSave}
          className="border border-[#2E2E2E] bg-[#0C0C0C] p-5 space-y-4 font-mono text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
            <span className="text-[#E5B842] uppercase font-bold">
              {editingId ? "[EDIT ACTION LINK]" : "[NEW ACTION LINK]"}
            </span>
            <button
              type="button"
              onClick={resetForm}
              className="text-[#707070] hover:text-[#F3F3F3] cursor-pointer"
            >
              [CANCEL]
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9E9E9E] uppercase tracking-wider mb-1.5">
                Display Label <span className="text-[#E5B842]">*</span>
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="VIEW IN-DEPTH CASE STUDY →"
                className="w-full bg-[#141414] border border-[#2E2E2E] focus:border-[#E5B842] text-[#F3F3F3] px-3 py-2 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[#9E9E9E] uppercase tracking-wider mb-1.5">
                Destination URL / Anchor <span className="text-[#E5B842]">*</span>
              </label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://... or #contact"
                className="w-full bg-[#141414] border border-[#2E2E2E] focus:border-[#E5B842] text-[#F3F3F3] px-3 py-2 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[#9E9E9E] uppercase tracking-wider mb-1.5">
                Link Type
              </label>
              <select
                value={type || "case-study"}
                onChange={(e) => setType(e.target.value as ProjectLinkInput["type"])}
                className="w-full bg-[#141414] border border-[#2E2E2E] focus:border-[#E5B842] text-[#F3F3F3] px-3 py-2 outline-hidden"
              >
                <option value="case-study">Case Study (Gold Primary Button)</option>
                <option value="demo">Live Demo</option>
                <option value="github">GitHub Repository</option>
                <option value="figma">Figma Prototype</option>
                <option value="external">External Link</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9E9E9E] uppercase tracking-wider mb-1.5">
                Microcopy / Context Note
              </label>
              <input
                type="text"
                value={microcopy}
                onChange={(e) => setMicrocopy(e.target.value)}
                placeholder="DETAILED RESEARCH & IA"
                className="w-full bg-[#141414] border border-[#2E2E2E] focus:border-[#E5B842] text-[#F3F3F3] px-3 py-2 outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-3.5 py-1.5 border border-[#262626] text-[#9E9E9E] hover:text-[#F3F3F3] uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-bold px-4 py-1.5 uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "SAVING..." : editingId ? "UPDATE LINK" : "ADD LINK"}
            </button>
          </div>
        </form>
      )}

      {/* Links list */}
      {links.length === 0 ? (
        <div className="p-8 border border-dashed border-[#262626] text-center font-mono text-xs text-[#707070]">
          No links added yet. Click &ldquo;+ Add Link&rdquo; to add case study or demo CTA buttons.
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs">
          {links.map((link, idx) => (
            <div
              key={link.id}
              className="border border-[#222222] bg-[#0E0E0E] p-4 flex items-center justify-between flex-wrap gap-4"
            >
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#E5B842] font-semibold">{link.label}</span>
                  {link.type && (
                    <span className="border border-[#333333] px-2 py-0.5 text-[10px] text-[#A0A0A0] uppercase">
                      {link.type}
                    </span>
                  )}
                </div>
                <div className="text-[#707070] text-[11px] truncate">
                  → {link.url}
                </div>
                {link.microcopy && (
                  <div className="text-[#555555] text-[10px] uppercase tracking-wider">
                    {link.microcopy}
                  </div>
                )}
              </div>

              {/* Action Buttons: Move Up, Move Down, Edit, Delete */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMove(idx, "up")}
                  disabled={idx === 0}
                  className="px-2 py-1 border border-[#222222] text-[#9E9E9E] hover:text-[#E5B842] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, "down")}
                  disabled={idx === links.length - 1}
                  className="px-2 py-1 border border-[#222222] text-[#9E9E9E] hover:text-[#E5B842] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(link)}
                  className="px-3 py-1 border border-[#2A2A2A] text-[#E5B842] hover:bg-[#E5B842]/10 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  className="px-3 py-1 border border-[#E55353]/30 text-[#E55353] hover:bg-[#E55353]/10 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
