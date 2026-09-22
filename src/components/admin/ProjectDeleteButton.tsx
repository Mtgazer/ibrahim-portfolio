"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProjectAction } from "@/lib/actions/projects";

interface ProjectDeleteButtonProps {
  projectId: string;
  projectTitle: string;
  redirectTo?: string;
  className?: string;
}

export default function ProjectDeleteButton({
  projectId,
  projectTitle,
  redirectTo = "/admin/projects",
  className,
}: ProjectDeleteButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = typedTitle.trim().toLowerCase() === projectTitle.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    setError(null);

    try {
      const res = await deleteProjectAction(projectId);
      if (!res.success) {
        setError(res.error || "Failed to delete project.");
        setLoading(false);
        return;
      }

      setIsOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deletion failed.");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTypedTitle("");
          setError(null);
          setIsOpen(true);
        }}
        className={
          className ||
          "font-mono text-xs text-[#E55353] hover:text-[#FF6B6B] border border-[#E55353]/30 hover:border-[#E55353] px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer"
        }
      >
        [DELETE PROJECT]
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[#141414] border border-[#E55353]/40 p-6 sm:p-8 space-y-6 text-[#F3F3F3]">
            {/* Header */}
            <div className="border-b border-[#262626] pb-4">
              <span className="font-mono text-[10px] text-[#E55353] uppercase tracking-widest block mb-1">
                [DESTRUCTIVE OPERATION // CASSETTE ERASURE]
              </span>
              <h2 className="text-xl font-bold tracking-tight text-[#F3F3F3]">
                Confirm Project Deletion
              </h2>
            </div>

            {/* Warning Text */}
            <div className="space-y-3 font-mono text-xs text-[#9E9E9E] leading-relaxed">
              <p>
                You are about to permanently delete{" "}
                <strong className="text-[#F3F3F3]">&ldquo;{projectTitle}&rdquo;</strong>.
              </p>
              <p className="text-[#E5B842]">
                This will purge all associated database records, project links, and delete all uploaded image files in Supabase Storage.
              </p>
              <p className="text-[#707070]">
                To confirm, type the project title below:
              </p>
              <div className="p-2 bg-[#0C0C0C] border border-[#262626] select-all text-[#F3F3F3]">
                {projectTitle}
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3 bg-[#E55353]/10 border border-[#E55353]/40 font-mono text-xs text-[#E55353]">
                {error}
              </div>
            )}

            {/* Confirmation input */}
            <div>
              <input
                type="text"
                value={typedTitle}
                onChange={(e) => setTypedTitle(e.target.value)}
                placeholder="Type exact title to verify"
                disabled={loading}
                className="w-full bg-[#0C0C0C] border border-[#2E2E2E] focus:border-[#E55353] text-[#F3F3F3] font-mono text-xs px-3.5 py-2.5 outline-hidden disabled:opacity-50"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="font-mono text-xs text-[#9E9E9E] hover:text-[#F3F3F3] border border-[#262626] px-4 py-2 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmed || loading}
                className="font-mono text-xs bg-[#E55353] hover:bg-[#FF6B6B] text-white font-bold px-4 py-2 uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {loading ? "PURGING..." : "CONFIRM PURGE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
