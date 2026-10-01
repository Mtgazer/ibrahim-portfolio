"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FieldNote } from "@/types";
import FieldNoteDeleteButton from "./FieldNoteDeleteButton";
import {
  toggleFieldNotePublishedAction,
  toggleFieldNoteFeaturedAction,
  updateFieldNoteSortOrderAction,
} from "@/lib/actions/field-notes";

interface FieldNoteListTableProps {
  initialNotes: FieldNote[];
}

type FilterTab = "all" | "published" | "draft" | "featured";

export default function FieldNoteListTable({
  initialNotes,
}: FieldNoteListTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<FieldNote[]>(initialNotes);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingOrderNoteId, setEditingOrderNoteId] = useState<string | null>(null);
  const [tempOrder, setTempOrder] = useState<number>(0);

  // Filter & Search logic
  const filteredNotes = notes.filter((n) => {
    // 1. Status Filter
    if (filter === "published" && !n.isPublished) return false;
    if (filter === "draft" && n.isPublished) return false;
    if (filter === "featured" && !n.isFeatured) return false;

    // 2. Search Query (Title, Category, Tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchCategory = n.category?.toLowerCase().includes(q) ?? false;
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCategory && !matchTags) return false;
    }

    return true;
  });

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const newStatus = !currentStatus;

    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPublished: newStatus } : n))
    );

    try {
      const res = await toggleFieldNotePublishedAction(id, newStatus);
      if (!res.success) {
        // Rollback
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isPublished: currentStatus } : n))
        );
      }
      router.refresh();
    } catch {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isPublished: currentStatus } : n))
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const newStatus = !currentStatus;

    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFeatured: newStatus } : n))
    );

    try {
      const res = await toggleFieldNoteFeaturedAction(id, newStatus);
      if (!res.success) {
        // Rollback
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isFeatured: currentStatus } : n))
        );
      }
      router.refresh();
    } catch {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isFeatured: currentStatus } : n))
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleSaveSortOrder = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note || note.sortOrder === tempOrder) {
      setEditingOrderNoteId(null);
      return;
    }

    const previousOrder = note.sortOrder;
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, sortOrder: tempOrder } : n))
    );
    setEditingOrderNoteId(null);

    try {
      const res = await updateFieldNoteSortOrderAction(id, tempOrder);
      if (!res.success) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, sortOrder: previousOrder } : n))
        );
      }
      router.refresh();
    } catch {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, sortOrder: previousOrder } : n))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "published", "draft", "featured"] as const).map((tab) => {
            const count = notes.filter((n) => {
              if (tab === "published") return n.isPublished;
              if (tab === "draft") return !n.isPublished;
              if (tab === "featured") return n.isFeatured;
              return true;
            }).length;

            const isActive = filter === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`font-mono text-xs px-3.5 py-1.5 uppercase tracking-wider transition-colors cursor-pointer border rounded-[6px] whitespace-nowrap ${
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

        {/* Right Controls: Search and + Create Action */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, category, tags..."
              className="w-full bg-[#0C0C0C] border border-[#262626] focus:border-[#E5B842] text-[#F3F3F3] font-mono text-xs px-3 py-1.5 outline-hidden rounded-[8px] placeholder:text-[#555555]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#F3F3F3] font-mono text-xs"
              >
                ×
              </button>
            )}
          </div>

          <Link
            href="/admin/field-notes/new"
            className="bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-mono text-xs font-bold px-4 py-2 uppercase tracking-wider transition-colors cursor-pointer rounded-[8px] whitespace-nowrap"
          >
            + Create Field Note
          </Link>
        </div>
      </div>

      {/* Field Notes Table */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 border border-dashed border-[#262626] text-center font-mono text-xs text-[#707070] space-y-3 rounded-[10px]">
          <p>
            {notes.length === 0
              ? "No Field Notes registered in the archive yet."
              : `No notes match the active filter or search query.`}
          </p>
          {notes.length === 0 ? (
            <Link
              href="/admin/field-notes/new"
              className="inline-block text-[#E5B842] hover:underline"
            >
              + Create your first Field Note
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              className="text-[#E5B842] hover:underline cursor-pointer"
            >
              Reset filters ({notes.length} total notes)
            </button>
          )}
        </div>
      ) : (
        <div className="border border-[#1F1F1F] bg-[#141414] rounded-[10px] overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#1F1F1F] bg-[#0E0E0E] text-[#707070] uppercase text-[10px] tracking-wider select-none">
                <th className="py-3.5 px-4 w-16">Preview</th>
                <th className="py-3.5 px-4">Note Index &amp; Title</th>
                <th className="py-3.5 px-4">Category &amp; Date</th>
                <th className="py-3.5 px-3 w-20 text-center">Order</th>
                <th className="py-3.5 px-3 w-28 text-center">Status</th>
                <th className="py-3.5 px-3 w-24 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredNotes.map((note) => {
                const isBusy = loadingId === note.id;
                const cover = note.coverImageUrl || note.coverImagePath || note.image;
                const formattedDate = note.date || note.noteDate || "—";
                const isEditingOrder = editingOrderNoteId === note.id;

                return (
                  <tr
                    key={note.id}
                    className="hover:bg-[#1A1A1A]/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-9 bg-[#0C0C0C] border border-[#222222] rounded-[6px] overflow-hidden flex items-center justify-center">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={note.coverAltText || note.title}
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

                    {/* Title & Technical Note # */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#A0A0A5] bg-[#1C1C1C] border border-[#282828] rounded px-1.5 py-0.2 select-none">
                            NOTE // {note.noteNumber || String(note.sortOrder).padStart(2, "0")}
                          </span>
                          {note.slug && (
                            <span className="text-[#707070] text-[10px]">
                              /{note.slug}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/admin/field-notes/${note.id}`}
                          className="font-bold text-[#F3F3F3] hover:text-[#E5B842] text-sm transition-colors block line-clamp-1"
                        >
                          {note.title}
                        </Link>
                      </div>
                    </td>

                    {/* Category & Date */}
                    <td className="py-3 px-4 text-[#9E9E9E]">
                      <div className="text-[11px] font-semibold text-[#CCCCCC]">
                        {note.category || "—"}
                      </div>
                      <div className="text-[#666666] text-[10px]">
                        {formattedDate}
                      </div>
                    </td>

                    {/* Sort Order (Interactive) */}
                    <td className="py-3 px-3 text-center text-[#F3F3F3]">
                      {isEditingOrder ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={tempOrder}
                            onChange={(e) => setTempOrder(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveSortOrder(note.id);
                              if (e.key === "Escape") setEditingOrderNoteId(null);
                            }}
                            autoFocus
                            className="w-14 bg-[#0C0C0C] border border-[#E5B842] text-center text-xs py-0.5 rounded text-[#F3F3F3] outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveSortOrder(note.id)}
                            className="text-[#E5B842] text-[11px] hover:underline"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOrderNoteId(note.id);
                            setTempOrder(note.sortOrder);
                          }}
                          title="Click to change sort order"
                          className="hover:text-[#E5B842] hover:underline cursor-pointer px-1 py-0.5"
                        >
                          #{note.sortOrder}
                        </button>
                      )}
                    </td>

                    {/* Published Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(note.id, note.isPublished)}
                        disabled={isBusy}
                        className={`px-2.5 py-1 text-[10px] uppercase font-bold border rounded-[6px] transition-colors cursor-pointer ${
                          note.isPublished
                            ? "bg-[#E5B842]/10 border-[#E5B842]/50 text-[#E5B842] hover:bg-[#E5B842]/20"
                            : "bg-[#1E1E1E] border-[#333333] text-[#707070] hover:text-[#9E9E9E]"
                        }`}
                        title="Click to toggle publication status"
                      >
                        {note.isPublished ? "PUBLISHED" : "DRAFT"}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(note.id, note.isFeatured)}
                        disabled={isBusy}
                        className={`px-2 py-1 text-[10px] uppercase border rounded-[6px] transition-colors cursor-pointer ${
                          note.isFeatured
                            ? "border-[#E5B842] text-[#E5B842] bg-[#E5B842]/10"
                            : "border-[#262626] text-[#555555] hover:text-[#888888]"
                        }`}
                        title="Click to toggle featured flag"
                      >
                        {note.isFeatured ? "★ YES" : "NO"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Link
                          href={`/admin/field-notes/${note.id}`}
                          className="px-3 py-1.5 border border-[#333333] hover:border-[#E5B842] text-[#9E9E9E] hover:text-[#E5B842] uppercase tracking-wider transition-colors rounded-[6px]"
                        >
                          Edit
                        </Link>
                        <FieldNoteDeleteButton
                          fieldNoteId={note.id}
                          fieldNoteTitle={note.title}
                          className="px-2.5 py-1.5 border border-[#E55353]/30 text-[#E55353] hover:bg-[#E55353]/10 uppercase text-[11px] transition-colors rounded-[6px]"
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
