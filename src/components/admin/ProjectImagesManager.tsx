"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { DbProjectImage } from "@/types/database";
import {
  uploadProjectImageAction,
  deleteProjectImageAction,
  setPrimaryImageAction,
  reorderProjectImagesAction,
  updateProjectImageMetaAction,
} from "@/lib/actions/projects";

interface ProjectImagesManagerProps {
  projectId: string;
  initialImages: DbProjectImage[];
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function ProjectImagesManager({
  projectId,
  initialImages,
}: ProjectImagesManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<DbProjectImage[]>(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order)
  );

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [isPrimary, setIsPrimary] = useState(initialImages.length === 0);
  const [uploading, setUploading] = useState(false);

  // Metadata Edit state
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [editCaption, setEditCaption] = useState("");

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(
        `INVALID FORMAT // File type "${file.type}" is not supported. Please select JPEG, PNG, WebP, GIF, or AVIF.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      setError(
        `FILE TOO LARGE // File size (${mb} MB) exceeds maximum allowed limit of 10 MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    if (images.length === 0) {
      setIsPrimary(true);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image file to upload.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("altText", altText.trim());
    formData.append("caption", caption.trim());
    formData.append("isPrimary", String(isPrimary));

    try {
      const res = await uploadProjectImageAction(projectId, formData);
      if (!res.success) {
        setError(res.error || "Image upload failed.");
        setUploading(false);
        return;
      }

      setSuccess("IMAGE UPLOADED // Object stored in Supabase Storage and database registered.");
      setSelectedFile(null);
      setFilePreview(null);
      setAltText("");
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      router.refresh();
      // Optimistic refresh
      if (res.data) {
        const newImg: DbProjectImage = {
          id: res.data.id,
          project_id: projectId,
          storage_path: res.data.storagePath,
          public_url: res.data.publicUrl,
          alt_text: altText.trim() || null,
          caption: caption.trim() || null,
          sort_order: images.length + 1,
          is_primary: isPrimary || images.length === 0,
          created_at: new Date().toISOString(),
        };

        setImages((prev) => {
          let updated = [...prev];
          if (newImg.is_primary) {
            updated = updated.map((img) => ({ ...img, is_primary: false }));
          }
          return [...updated, newImg].sort((a, b) => a.sort_order - b.sort_order);
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setError(null);
    setSuccess(null);

    // Optimistically update
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }))
    );

    try {
      const res = await setPrimaryImageAction(projectId, imageId);
      if (!res.success) {
        setError(res.error || "Failed to update primary image.");
        router.refresh();
        return;
      }
      setSuccess("PRIMARY UPDATED // Selected image marked as showcase display.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set primary.");
      router.refresh();
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to permanently delete this image from Supabase Storage?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await deleteProjectImageAction(imageId, projectId);
      if (!res.success) {
        setError(res.error || "Failed to delete image.");
        return;
      }

      setImages((prev) => {
        const filtered = prev.filter((img) => img.id !== imageId);
        // If deleted was primary and others exist, promote first
        const hasPrimary = filtered.some((img) => img.is_primary);
        if (!hasPrimary && filtered.length > 0) {
          filtered[0].is_primary = true;
        }
        return filtered;
      });

      setSuccess("IMAGE REMOVED // File deleted from bucket and record removed.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deletion failed.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setImages(newImages);

    try {
      const orderedIds = newImages.map((img) => img.id);
      await reorderProjectImagesAction(projectId, orderedIds);
      router.refresh();
    } catch (err) {
      console.error("Failed to reorder images:", err);
    }
  };

  const startEditMeta = (img: DbProjectImage) => {
    setEditingImageId(img.id);
    setEditAltText(img.alt_text || "");
    setEditCaption(img.caption || "");
  };

  const handleSaveMeta = async (imageId: string) => {
    try {
      const res = await updateProjectImageMetaAction(imageId, projectId, {
        altText: editAltText,
        caption: editCaption,
      });

      if (!res.success) {
        setError(res.error || "Failed to update metadata.");
        return;
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, alt_text: editAltText || null, caption: editCaption || null }
            : img
        )
      );

      setEditingImageId(null);
      setSuccess("METADATA UPDATED // Accessibility alt text and caption saved.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update metadata.");
    }
  };

  return (
    <div className="border border-[#1F1F1F] bg-[#141414] p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1F1F1F] pb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
            [SECTION 05 // VISUAL ASSETS]
          </span>
          <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
            Supabase Storage Images ({images.length})
          </h2>
        </div>
        <span className="font-mono text-xs text-[#707070]">
          BUCKET: <code className="text-[#E5B842]">project-images</code>
        </span>
      </div>

      {/* Status Banners */}
      {error && (
        <div className="p-4 border border-[#E55353]/40 bg-[#1A1A1A] font-mono text-xs text-[#E55353] flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="hover:underline ml-4 cursor-pointer"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 border border-[#E5B842]/40 bg-[#1A1A1A] font-mono text-xs text-[#E5B842] flex items-center justify-between">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="hover:underline ml-4 cursor-pointer"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {/* UPLOAD PANEL */}
      <form
        onSubmit={handleUpload}
        className="border border-[#262626] bg-[#0C0C0C] p-6 space-y-5 font-mono text-xs"
      >
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
          <span className="text-[#E5B842] font-semibold uppercase tracking-wider">
            [UPLOAD NEW ASSET TO SUPABASE STORAGE]
          </span>
          <span className="text-[#707070] text-[11px]">MAX SIZE: 10MB</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* File Picker & Thumbnail Preview */}
          <div className="md:col-span-4 space-y-3">
            <label className="block text-[#9E9E9E] uppercase tracking-wider">
              Select Image File <span className="text-[#E5B842]">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={handleFileSelect}
              disabled={uploading}
              className="w-full text-xs text-[#9E9E9E] file:mr-3 file:py-2 file:px-3 file:border file:border-[#333333] file:text-xs file:font-mono file:bg-[#1A1A1A] file:text-[#E5B842] hover:file:border-[#E5B842] cursor-pointer"
            />
            {filePreview && (
              <div className="relative aspect-video w-full border border-[#2E2E2E] bg-[#141414] overflow-hidden mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={filePreview}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Metadata: Alt Text, Caption, Primary Toggle */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label className="block text-[#9E9E9E] uppercase tracking-wider mb-1">
                Alt Text (Accessibility) <span className="text-[#E5B842]">*</span>
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Descriptive alt text for screen readers..."
                className="w-full bg-[#141414] border border-[#2E2E2E] focus:border-[#E5B842] text-[#F3F3F3] px-3.5 py-2 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[#9E9E9E] uppercase tracking-wider mb-1">
                Caption / Viewport Badge (Optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. [HTI LMS — PRIMARY SHOWCASE]"
                className="w-full bg-[#141414] border border-[#2E2E2E] focus:border-[#E5B842] text-[#F3F3F3] px-3.5 py-2 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                id="is-primary-checkbox"
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4 accent-[#E5B842] cursor-pointer"
              />
              <label
                htmlFor="is-primary-checkbox"
                className="text-[#F3F3F3] cursor-pointer uppercase tracking-wider"
              >
                Mark as Primary Showcase Image
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-bold px-6 py-2.5 uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>UPLOADING TO STORAGE...</span>
                  </>
                ) : (
                  <span>UPLOAD ASSET →</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* IMAGES GRID */}
      {images.length === 0 ? (
        <div className="p-8 border border-dashed border-[#262626] text-center font-mono text-xs text-[#707070]">
          No images uploaded for this project yet. Use the panel above to upload screenshots or diagrams to Supabase Storage.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          {images.map((img, idx) => {
            const isEditing = editingImageId === img.id;
            const imgSrc = img.public_url || img.storage_path;

            return (
              <div
                key={img.id}
                className={`border bg-[#0C0C0C] flex flex-col justify-between transition-colors ${
                  img.is_primary
                    ? "border-[#E5B842] shadow-[0_0_15px_rgba(229,184,66,0.1)]"
                    : "border-[#222222]"
                }`}
              >
                {/* Thumbnail Display */}
                <div>
                  <div className="relative aspect-video w-full bg-[#121212] overflow-hidden border-b border-[#222222]">
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={img.alt_text || "Project image"}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#555555]">
                        [NO PREVIEW]
                      </div>
                    )}

                    {/* Primary Badge */}
                    {img.is_primary && (
                      <div className="absolute top-2 left-2 bg-[#E5B842] text-[#0C0C0C] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                        ★ PRIMARY
                      </div>
                    )}

                    {/* Sort Order Badge */}
                    <div className="absolute top-2 right-2 bg-black/80 text-[#707070] text-[10px] px-2 py-0.5">
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Metadata display / inline edit */}
                  <div className="p-4 space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#707070] uppercase block mb-1">
                            Alt Text:
                          </label>
                          <input
                            type="text"
                            value={editAltText}
                            onChange={(e) => setEditAltText(e.target.value)}
                            className="w-full bg-[#141414] border border-[#2E2E2E] px-2 py-1 text-xs text-[#F3F3F3]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#707070] uppercase block mb-1">
                            Caption:
                          </label>
                          <input
                            type="text"
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            className="w-full bg-[#141414] border border-[#2E2E2E] px-2 py-1 text-xs text-[#F3F3F3]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveMeta(img.id)}
                            className="px-2.5 py-1 bg-[#E5B842] text-[#0C0C0C] font-bold uppercase text-[10px]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingImageId(null)}
                            className="px-2.5 py-1 border border-[#2E2E2E] text-[#9E9E9E] uppercase text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="text-[10px] text-[#707070] uppercase block">
                            Alt Text:
                          </span>
                          <p className="text-[#CCCCCC] text-[11px] truncate">
                            {img.alt_text || <span className="text-[#555555]">None specified</span>}
                          </p>
                        </div>

                        {img.caption && (
                          <div>
                            <span className="text-[10px] text-[#707070] uppercase block">
                              Caption:
                            </span>
                            <p className="text-[#E5B842] text-[11px] truncate">
                              {img.caption}
                            </p>
                          </div>
                        )}

                        <div className="text-[10px] text-[#555555] truncate" title={img.storage_path}>
                          Path: {img.storage_path}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Controls Footer */}
                <div className="p-3 border-t border-[#1C1C1C] bg-[#101010] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="px-2 py-1 border border-[#262626] text-[#9E9E9E] hover:text-[#E5B842] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Left/Up"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === images.length - 1}
                      className="px-2 py-1 border border-[#262626] text-[#9E9E9E] hover:text-[#E5B842] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Right/Down"
                    >
                      →
                    </button>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startEditMeta(img)}
                        className="px-2 py-1 border border-[#262626] text-[#707070] hover:text-[#F3F3F3] text-[10px] uppercase cursor-pointer"
                        title="Edit metadata"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img.id)}
                        className="px-2 py-1 border border-[#E5B842]/40 text-[#E5B842] hover:bg-[#E5B842]/10 text-[10px] uppercase tracking-wider cursor-pointer"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="px-2 py-1 border border-[#E55353]/30 text-[#E55353] hover:bg-[#E55353]/10 text-[10px] uppercase tracking-wider cursor-pointer"
                      title="Delete Image & Storage Object"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
