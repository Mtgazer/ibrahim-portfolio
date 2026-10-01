"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { FieldNote } from "@/types";
import {
  createFieldNoteAction,
  updateFieldNoteAction,
  uploadFieldNoteCoverImageAction,
  deleteFieldNoteCoverImageAction,
  type FieldNoteInput,
} from "@/lib/actions/field-notes";
import { normalizeSlug } from "@/lib/slug";
import { formatNoteDate } from "@/lib/date";

interface FieldNoteFormProps {
  initialNote?: FieldNote;
  mode: "create" | "edit";
}

const COMMON_CATEGORIES = [
  "MICRO-INTERACTION",
  "SYSTEMS STUDY",
  "MOBILE STUDY",
  "SPEC DESIGN",
  "UI/UX",
  "ENGINEERING",
  "DESIGN SYSTEM",
];

export default function FieldNoteForm({ initialNote, mode }: FieldNoteFormProps) {
  const router = useRouter();

  // Basic Information
  const [title, setTitle] = useState(initialNote?.title || "");
  const [slug, setSlug] = useState(initialNote?.slug || "");
  const [category, setCategory] = useState(initialNote?.category || "");
  const [noteDate, setNoteDate] = useState(initialNote?.noteDate || "");
  const [noteNumber, setNoteNumber] = useState(
    initialNote?.noteNumber || (initialNote?.sortOrder ? String(initialNote.sortOrder).padStart(2, "0") : "")
  );
  const [description, setDescription] = useState(initialNote?.description || "");

  // Taxonomy & Links
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [newTagInput, setNewTagInput] = useState("");
  const [externalLink, setExternalLink] = useState(initialNote?.externalLink || "");

  // Publication & Ordering
  const [isPublished, setIsPublished] = useState(initialNote?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(initialNote?.isFeatured ?? false);
  const [sortOrder, setSortOrder] = useState<number>(initialNote?.sortOrder ?? 0);

  // Cover Image
  const [coverUrl, setCoverUrl] = useState<string | null>(
    initialNote?.coverImageUrl || initialNote?.coverImagePath || initialNote?.image || null
  );
  const [coverPath, setCoverPath] = useState<string | null>(initialNote?.coverImagePath || null);
  const [coverAltText, setCoverAltText] = useState(initialNote?.coverAltText || "");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // UI States
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-slug generator when typing title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited && mode === "create") {
      setSlug(normalizeSlug(val));
    }
  };

  // Sync note_number when sortOrder changes if not manually customized
  const handleSortOrderChange = (val: number) => {
    setSortOrder(val);
    if (!noteNumber || noteNumber === String(sortOrder).padStart(2, "0")) {
      setNoteNumber(String(val).padStart(2, "0"));
    }
  };

  // Tag Management
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const exists = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setTags([...tags, trimmed]);
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  // Image File Selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image file exceeds 10MB limit.");
      return;
    }

    setSelectedImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localUrl);

    // If in edit mode and note exists, offer direct upload
    if (mode === "edit" && initialNote?.id) {
      handleDirectImageUpload(file);
    }
  };

  const handleDirectImageUpload = async (file: File) => {
    if (!initialNote?.id) return;
    setImageLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    if (coverAltText) {
      formData.append("altText", coverAltText);
    }

    try {
      const res = await uploadFieldNoteCoverImageAction(initialNote.id, formData);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to upload image.");
      } else {
        setSuccessMessage("Cover image successfully uploaded.");
        if (res.data) {
          setCoverUrl(res.data.publicUrl);
          setCoverPath(res.data.storagePath);
          setImagePreviewUrl(null);
          setSelectedImageFile(null);
        }
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Upload error.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteCoverImage = async () => {
    if (mode === "create") {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setCoverUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!initialNote?.id) return;
    if (!confirm("Are you sure you want to remove the cover image?")) return;

    setImageLoading(true);
    setErrorMessage(null);

    try {
      const res = await deleteFieldNoteCoverImageAction(initialNote.id);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to remove cover image.");
      } else {
        setCoverUrl(null);
        setCoverPath(null);
        setImagePreviewUrl(null);
        setSelectedImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSuccessMessage("Cover image removed.");
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error deleting image.");
    } finally {
      setImageLoading(false);
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage("VALIDATION ERROR // Field Note title is required.");
      return;
    }

    setLoading(true);

    const cleanSlug = slug.trim() ? normalizeSlug(slug.trim()) : null;

    const payload: FieldNoteInput = {
      title: title.trim(),
      slug: cleanSlug,
      description: description.trim() || null,
      category: category.trim() || null,
      noteNumber: noteNumber.trim() || String(sortOrder).padStart(2, "0"),
      noteDate: noteDate || null,
      tags,
      externalLink: externalLink.trim() || null,
      isPublished,
      isFeatured,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      coverAltText: coverAltText.trim() || null,
    };

    try {
      if (mode === "create") {
        const res = await createFieldNoteAction(payload);
        if (!res.success || !res.data) {
          setErrorMessage(res.error || "Failed to create field note.");
          setLoading(false);
          return;
        }

        const newId = res.data.id;

        // If an image was selected during create, upload it now
        if (selectedImageFile) {
          const imgFormData = new FormData();
          imgFormData.append("file", selectedImageFile);
          if (coverAltText) imgFormData.append("altText", coverAltText);
          await uploadFieldNoteCoverImageAction(newId, imgFormData);
        }

        router.push(`/admin/field-notes/${newId}`);
        router.refresh();
      } else if (mode === "edit" && initialNote?.id) {
        const res = await updateFieldNoteAction(initialNote.id, payload);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to update field note.");
          setLoading(false);
          return;
        }

        setSuccessMessage("Field Note updated successfully.");
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Submission error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const activePreviewImage = imagePreviewUrl || coverUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Alert Messages */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 bg-[#E55353]/10 border border-[#E55353]/30 rounded-[8px] font-mono text-xs text-[#E55353] flex items-center justify-between"
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
          className="p-4 bg-[#E5B842]/10 border border-[#E5B842]/30 rounded-[8px] font-mono text-xs text-[#E5B842] flex items-center justify-between"
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
      <section className="border border-[#1F1F1F] bg-[#141414] rounded-[10px] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#1F1F1F] pb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
              [SECTION 01 // CONTENT &amp; CLASSIFICATION]
            </span>
            <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
              Basic Field Note Information
            </h2>
          </div>
          <span className="font-mono text-xs text-[#707070]">REQUIRED *</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label
              htmlFor="note-title"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Field Note Title <span className="text-[#E5B842]">*</span>
            </label>
            <input
              id="note-title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Flowly — Multi-State Input Architecture"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors rounded-[8px]"
            />
          </div>

          {/* Slug (Optional) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="note-slug"
                className="font-mono text-xs text-[#9E9E9E] uppercase tracking-wider"
              >
                URL Slug <span className="text-[#707070] text-[10px] font-normal">(Optional unique handle)</span>
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
              <span className="bg-[#1C1C1C] border border-r-0 border-[#262626] text-[#707070] font-mono text-xs px-3 py-2.5 select-none rounded-l-[8px]">
                /field-notes/
              </span>
              <input
                id="note-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                }}
                placeholder="flowly-multi-state-input-architecture"
                className="flex-1 bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors rounded-r-[8px]"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="note-category"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Category / Practice Area
            </label>
            <input
              id="note-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. MICRO-INTERACTION"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors rounded-[8px]"
            />
            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="font-mono text-[10px] text-[#555555]">SUGGESTIONS:</span>
              {COMMON_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="font-mono text-[9px] px-1.5 py-0.5 border border-[#222222] hover:border-[#E5B842]/40 rounded text-[#707070] hover:text-[#E5B842] transition-colors cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Note Date */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="note-date"
                className="font-mono text-xs text-[#9E9E9E] uppercase tracking-wider"
              >
                Calendar Date
              </label>
              {noteDate && (
                <span className="font-mono text-[10px] text-[#E5B842]">
                  PREVIEW: {formatNoteDate(noteDate)}
                </span>
              )}
            </div>
            <input
              id="note-date"
              type="date"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors rounded-[8px]"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="note-description"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Description &amp; Engineering Synopsis
            </label>
            <textarea
              id="note-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State machine exploration for authentication inputs: optical baseline positioning, hairline gold focus boundaries..."
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-xs px-4 py-3 outline-hidden transition-colors rounded-[8px] resize-y"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Taxonomy & Action Links */}
      <section className="border border-[#1F1F1F] bg-[#141414] rounded-[10px] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#1F1F1F] pb-4">
          <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
            [SECTION 02 // TAXONOMY &amp; TARGETS]
          </span>
          <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
            Tags &amp; External Navigation
          </h2>
        </div>

        <div className="space-y-6">
          {/* Interactive Tag Editor */}
          <div>
            <label className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2">
              Topic Tags (stored as text[])
            </label>

            {/* Existing Tag Chips */}
            <div className="flex items-center gap-2 flex-wrap mb-3 min-h-[36px] p-2 bg-[#0C0C0C] border border-[#222222] rounded-[8px]">
              {tags.length === 0 ? (
                <span className="font-mono text-xs text-[#555555]">
                  No tags added yet. Enter a tag below.
                </span>
              ) : (
                tags.map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="inline-flex items-center gap-1.5 bg-[#1C1C1C] border border-[#333333] text-[#F3F3F3] font-mono text-xs px-2.5 py-1 rounded-[6px]"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-[#707070] hover:text-[#E55353] cursor-pointer text-sm font-bold leading-none"
                      title={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Tag Input Box */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g. DAILY UI #001, FIGMA ENGINE..."
                className="flex-1 bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-xs px-3 py-2 outline-hidden rounded-[8px]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="font-mono text-xs px-3 py-2 bg-[#222222] hover:bg-[#2A2A2A] text-[#E5B842] border border-[#333333] rounded-[8px] cursor-pointer"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* External Link */}
          <div>
            <label
              htmlFor="note-external-link"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Action Target Link (CTA Destination)
            </label>
            <input
              id="note-external-link"
              type="text"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="e.g. #contact, https://figma.com/..., https://github.com/..."
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors rounded-[8px]"
            />
            <p className="font-mono text-[10px] text-[#707070] mt-1.5">
              The public card CTA button uses this destination. Defaults safely to &ldquo;#contact&rdquo; if omitted.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Publication & Hierarchy */}
      <section className="border border-[#1F1F1F] bg-[#141414] rounded-[10px] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#1F1F1F] pb-4">
          <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
            [SECTION 03 // PUBLICATION &amp; HIERARCHY]
          </span>
          <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
            Visibility, Technical Note Number &amp; Sort Order
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Note Number */}
          <div>
            <label
              htmlFor="note-number"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Badge Index (NOTE // XX)
            </label>
            <input
              id="note-number"
              type="text"
              value={noteNumber}
              onChange={(e) => setNoteNumber(e.target.value)}
              placeholder="01"
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors rounded-[8px]"
            />
            <p className="font-mono text-[10px] text-[#707070] mt-1.5">
              Derived automatically from sort order if left blank.
            </p>
          </div>

          {/* Sort Order */}
          <div>
            <label
              htmlFor="note-sort-order"
              className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
            >
              Sort Order (Ascending)
            </label>
            <input
              id="note-sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => handleSortOrderChange(Number(e.target.value))}
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-sm px-4 py-2.5 outline-hidden transition-colors rounded-[8px]"
            />
            <p className="font-mono text-[10px] text-[#707070] mt-1.5">
              Controls position in public carousel (1 = first card).
            </p>
          </div>

          {/* Status Controls */}
          <div className="space-y-3">
            <span className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider">
              Status Flags
            </span>

            {/* Published Toggle */}
            <label className="flex items-center gap-3 p-3 bg-[#0C0C0C] border border-[#262626] rounded-[8px] cursor-pointer hover:border-[#333333]">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-[#E5B842] cursor-pointer"
              />
              <span className="font-mono text-xs text-[#F3F3F3]">
                {isPublished ? "PUBLISHED (Live on carousel)" : "DRAFT (Hidden from public)"}
              </span>
            </label>

            {/* Featured Toggle */}
            <label className="flex items-center gap-3 p-3 bg-[#0C0C0C] border border-[#262626] rounded-[8px] cursor-pointer hover:border-[#333333]">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#E5B842] cursor-pointer"
              />
              <span className="font-mono text-xs text-[#F3F3F3]">
                {isFeatured ? "★ FEATURED" : "STANDARD"}
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* SECTION 4: Single Cover Image Management */}
      <section className="border border-[#1F1F1F] bg-[#141414] rounded-[10px] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#1F1F1F] pb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-[#E5B842] uppercase tracking-widest block mb-1">
              [SECTION 04 // STORAGE // COVER IMAGE]
            </span>
            <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3]">
              Field Note Cover Visual
            </h2>
          </div>
          <span className="font-mono text-[10px] text-[#707070]">
            BUCKET: field-note-images (MAX 10MB)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Image Preview Box */}
          <div className="space-y-3">
            <div className="relative w-full aspect-[16/10] bg-[#0C0C0C] border border-[#262626] rounded-[8px] overflow-hidden flex items-center justify-center">
              {activePreviewImage ? (
                <Image
                  src={activePreviewImage}
                  alt={coverAltText || title || "Field Note Cover"}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover"
                />
              ) : (
                <div className="text-center font-mono text-xs text-[#555555] space-y-2 p-6">
                  <div className="text-2xl text-[#333333]">▨</div>
                  <p>No cover image uploaded.</p>
                  <p className="text-[10px] text-[#444444]">Select an image file below to upload.</p>
                </div>
              )}

              {imageLoading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center font-mono text-xs text-[#E5B842]">
                  Processing Image...
                </div>
              )}
            </div>

            {coverPath && (
              <div className="font-mono text-[10px] text-[#666666] truncate" title={coverPath}>
                STORAGE: {coverPath}
              </div>
            )}
          </div>

          {/* Right: Upload & Actions Controls */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="cover-alt-text"
                className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
              >
                Image Alt Text / Accessibility
              </label>
              <input
                id="cover-alt-text"
                type="text"
                value={coverAltText}
                onChange={(e) => setCoverAltText(e.target.value)}
                placeholder="Descriptive alt text for screen readers..."
                className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-xs px-3 py-2 outline-hidden rounded-[8px]"
              />
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="font-mono text-xs px-4 py-2 bg-[#1C1C1C] hover:bg-[#252525] text-[#E5B842] border border-[#E5B842]/40 rounded-[8px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                {activePreviewImage ? "Replace Cover Image" : "Upload Cover Image"}
              </button>

              {activePreviewImage && (
                <button
                  type="button"
                  onClick={handleDeleteCoverImage}
                  disabled={imageLoading}
                  className="font-mono text-xs px-3 py-2 text-[#E55353] hover:bg-[#E55353]/10 border border-[#E55353]/30 rounded-[8px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Remove Cover
                </button>
              )}
            </div>

            <div className="font-mono text-[10px] text-[#666666] leading-relaxed pt-2">
              Supported formats: JPEG, PNG, WebP, GIF, AVIF. Max file size: 10 MB.
              {mode === "create" && selectedImageFile && (
                <p className="text-[#E5B842] mt-1">
                  ✓ File &ldquo;{selectedImageFile.name}&rdquo; will be uploaded when this note is created.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Form Bottom Actions */}
      <div className="flex items-center justify-between border-t border-[#1F1F1F] pt-6 flex-wrap gap-4">
        <Link
          href="/admin/field-notes"
          className="font-mono text-xs text-[#9E9E9E] hover:text-[#F3F3F3] border border-[#222222] hover:border-[#333333] px-4 py-2.5 uppercase tracking-wider rounded-[8px] transition-colors"
        >
          ← Return to Registry
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || imageLoading}
            className="font-mono text-xs font-bold px-6 py-2.5 bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] uppercase tracking-wider rounded-[8px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : mode === "create" ? "Create Field Note" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
