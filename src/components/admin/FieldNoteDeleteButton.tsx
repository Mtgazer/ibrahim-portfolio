"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFieldNoteAction } from "@/lib/actions/field-notes";

interface FieldNoteDeleteButtonProps {
  fieldNoteId: string;
  fieldNoteTitle: string;
  redirectTo?: string;
  className?: string;
}

export default function FieldNoteDeleteButton({
  fieldNoteId,
  fieldNoteTitle,
  redirectTo = "/admin/field-notes",
  className,
}: FieldNoteDeleteButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = typedTitle.trim().toLowerCase() === fieldNoteTitle.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    setError(null);

    try {
      const res = await deleteFieldNoteAction(fieldNoteId);
      if (!res.success) {
        setError(res.error || "Failed to delete field note.");
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
          "font-mono text-xs text-[#E55353] hover:text-[#FF6B6B] border border-[#E55353]/30 hover:border-[#E55353] rounded-[6px] px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer"
        }
      >
        [DELETE NOTE]
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[#141414] border border-[#E55353]/40 rounded-[10px] p-6 sm:p-8 space-y-6 text-[#F3F3F3]">
            {/* Header */}
            <div className="border-b border-[#262626] pb-4">
              <span className="font-mono text-[10px] text-[#E55353] uppercase tracking-widest block mb-1">
                [DESTRUCTIVE OPERATION // RECORD PURGE]
              </span>
              <h2 className="text-xl font-bold tracking-tight text-[#F3F3F3]">
                Confirm Field Note Deletion
              </h2>
            </div>

            {/* Warning Text */}
            <div className="space-y-3 font-mono text-xs text-[#9E9E9E] leading-relaxed">
              <p>
                You are about to permanently delete{" "}
                <strong className="text-[#F3F3F3]">&ldquo;{fieldNoteTitle}&rdquo;</strong>.
              </p>
              <p className="text-[#E5B842]">
                This will delete the database record and permanently remove its associated cover image from Supabase Storage bucket &ldquo;field-note-images&rdquo;.
              </p>
              <p className="text-[#707070]">
                To confirm, type the field note title below:
              </p>
              <div className="p-2 bg-[#0C0C0C] border border-[#262626] rounded-[6px] select-all text-[#F3F3F3]">
                {fieldNoteTitle}
              </div>
            </div>

            {/* Input Confirmation */}
            <div>
              <label
                htmlFor="confirm-note-delete-title"
                className="block font-mono text-[10px] uppercase text-[#707070] mb-2"
              >
                Type Title to Confirm
              </label>
              <input
                id="confirm-note-delete-title"
                type="text"
                value={typedTitle}
                onChange={(e) => setTypedTitle(e.target.value)}
                placeholder="Type exact title here..."
                autoComplete="off"
                className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E55353] text-[#F3F3F3] font-mono text-xs px-3 py-2 outline-hidden rounded-[8px]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-[#E55353]/10 border border-[#E55353]/30 rounded-[8px] font-mono text-xs text-[#E55353]">
                {error}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="font-mono text-xs text-[#9E9E9E] hover:text-[#F3F3F3] px-4 py-2 uppercase tracking-wider transition-colors cursor-pointer border border-[#262626] hover:border-[#333333] rounded-[8px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmed || loading}
                className={`font-mono text-xs px-4 py-2 uppercase tracking-wider transition-colors rounded-[8px] ${
                  isConfirmed && !loading
                    ? "bg-[#E55353] hover:bg-[#FF6B6B] text-[#0C0C0C] font-bold cursor-pointer"
                    : "bg-[#222222] text-[#555555] cursor-not-allowed border border-[#333333]"
                }`}
              >
                {loading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
