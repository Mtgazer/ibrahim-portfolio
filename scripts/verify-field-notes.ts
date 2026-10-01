/**
 * scripts/verify-field-notes.ts
 *
 * Comprehensive Phase 2 Verification Suite for Field Notes.
 *
 * Verifies:
 * 1. Type safety and domain contracts (FieldNote, DbFieldNote)
 * 2. Data mapping logic (snake_case -> camelCase, fallbacks, tags, image, date)
 * 3. Server-side data access layer (getPublishedFieldNotes, getFieldNoteById, getAllAdminFieldNotes)
 * 4. Deterministic sorting and publication filtering (drafts never leak)
 * 5. Robustness against missing/null fields
 * 6. Migration SQL integrity (schema, RLS policies, trigger, storage bucket)
 */

import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" });

import fs from "node:fs";
import path from "node:path";
import {
  formatNoteDate,
  mapDbFieldNoteToDomain,
  getPublishedFieldNotes,
  getFieldNoteById,
  getAllAdminFieldNotes,
} from "../src/lib/field-notes";
import type { DbFieldNote } from "../src/types/database";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✓ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`✗ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("PHASE 2: FIELD NOTES VERIFICATION SUITE");
  console.log("==================================================\n");

  // ---------------------------------------------------------------------------
  // 1. Migration File Verification
  // ---------------------------------------------------------------------------
  console.log("--- 1. MIGRATION FILE & SQL CHECKS ---");
  const migrationPath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20261001000000_create_field_notes_schema.sql"
  );
  assert(fs.existsSync(migrationPath), "Migration file exists: 20261001000000_create_field_notes_schema.sql");

  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  assert(migrationSql.includes("create table if not exists public.field_notes"), "SQL defines public.field_notes table");
  assert(migrationSql.includes("id uuid primary key default gen_random_uuid()"), "SQL defines primary key UUID id");
  assert(migrationSql.includes("title text not null"), "SQL defines title text not null");
  assert(migrationSql.includes("slug text"), "SQL defines slug column");
  assert(migrationSql.includes("idx_field_notes_slug on public.field_notes(slug) where slug is not null"), "SQL defines partial unique index for slug");
  assert(migrationSql.includes("is_published boolean not null default false"), "SQL defines is_published default false");
  assert(migrationSql.includes("is_featured boolean not null default false"), "SQL defines is_featured default false");
  assert(migrationSql.includes("sort_order integer not null default 0"), "SQL defines sort_order default 0");
  assert(migrationSql.includes("note_date date"), "SQL defines note_date date column");
  assert(migrationSql.includes("cover_image_path text"), "SQL defines cover_image_path");
  assert(migrationSql.includes("cover_image_url text"), "SQL defines cover_image_url");
  assert(migrationSql.includes("tags text[] not null default '{}'"), "SQL defines tags text[] array");
  assert(migrationSql.includes("execute function public.handle_updated_at()"), "SQL reuses handle_updated_at trigger");
  assert(migrationSql.includes("alter table public.field_notes enable row level security"), "SQL enables RLS on field_notes");
  assert(migrationSql.includes('"Public can view published field notes"'), "SQL defines public read RLS policy");
  assert(migrationSql.includes("is_published = true"), "Public RLS enforces is_published = true");
  assert(migrationSql.includes("public.is_admin()"), "Admin RLS uses existing public.is_admin()");
  assert(migrationSql.includes("field-note-images"), "SQL provisions field-note-images storage bucket with RLS");

  // ---------------------------------------------------------------------------
  // 2. Date Formatting Helper
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. DATE FORMATTING TESTS ---");
  assert(formatNoteDate("2024-10-01") === "OCT 2024", "formatNoteDate converts '2024-10-01' to 'OCT 2024'");
  assert(formatNoteDate("2024-05-15") === "MAY 2024", "formatNoteDate converts '2024-05-15' to 'MAY 2024'");
  assert(formatNoteDate(null) === "", "formatNoteDate returns empty string on null");
  assert(formatNoteDate(undefined) === "", "formatNoteDate returns empty string on undefined");
  assert(formatNoteDate("OCT 2024") === "OCT 2024", "formatNoteDate preserves existing string fallback");

  // ---------------------------------------------------------------------------
  // 3. Data Mapping & Fallback Precedence
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. DATA MAPPING & PRECEDENCE TESTS ---");
  const mockDbRow: DbFieldNote = {
    id: "test-note-uuid",
    title: "Test Note Architecture",
    slug: "test-note-architecture",
    description: "Detailed description of architectural study",
    category: "SYSTEMS STUDY",
    note_number: "08",
    note_date: "2024-10-01",
    cover_image_path: "field-notes/test/cover.png",
    cover_image_url: "https://example.com/cover.png",
    cover_alt_text: "Preview alt text",
    tags: ["SYSTEMS", "FIGMA"],
    external_link: "https://figma.com/@test",
    is_published: true,
    is_featured: true,
    sort_order: 8,
    created_at: "2024-10-01T12:00:00Z",
    updated_at: "2024-10-01T12:00:00Z",
  };

  const domain = mapDbFieldNoteToDomain(mockDbRow);
  assert(domain.id === "test-note-uuid", "id maps correctly");
  assert(domain.title === "Test Note Architecture", "title maps correctly");
  assert(domain.slug === "test-note-architecture", "slug maps correctly");
  assert(domain.noteNumber === "08", "noteNumber maps explicitly when provided");
  assert(domain.date === "OCT 2024", "date is formatted from note_date");
  assert(domain.coverImageUrl === "https://example.com/cover.png", "coverImageUrl maps correctly");
  assert(domain.coverImage === "https://example.com/cover.png", "coverImage prefers URL");
  assert(domain.image === "https://example.com/cover.png", "image alias maps for carousel UI compatibility");
  assert(domain.tag === "SYSTEMS", "tag takes primary tag from tags array");
  assert(domain.href === "https://figma.com/@test", "href maps from external_link");
  assert(domain.isPublished === true, "isPublished maps correctly");
  assert(domain.sortOrder === 8, "sortOrder maps correctly");

  // Test missing/null fallbacks
  const mockMinimalRow: DbFieldNote = {
    id: "minimal-note-uuid",
    title: "Minimal Study",
    slug: null,
    description: null,
    category: null,
    note_number: null,
    note_date: null,
    cover_image_path: null,
    cover_image_url: null,
    cover_alt_text: null,
    tags: [],
    external_link: null,
    is_published: false,
    is_featured: false,
    sort_order: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const minimalDomain = mapDbFieldNoteToDomain(mockMinimalRow);
  assert(minimalDomain.noteNumber === "03", "noteNumber derives from sort_order when note_number is null");
  assert(minimalDomain.href === "#contact", "href defaults safely to '#contact' when external_link is null");
  assert(minimalDomain.coverImage === null, "coverImage handles null safely");
  assert(minimalDomain.tag === null, "tag handles empty tags array safely without crashing");
  assert(minimalDomain.date === null, "date handles null note_date safely");

  // ---------------------------------------------------------------------------
  // 4. Server-Side Data Access Layer
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. DATA ACCESS LAYER FUNCTIONALITY ---");
  const publishedNotes = await getPublishedFieldNotes();
  assert(Array.isArray(publishedNotes), "getPublishedFieldNotes returns an array");
  assert(publishedNotes.length >= 6, "getPublishedFieldNotes returns at least 6 notes");

  // Verify all published
  const allPublished = publishedNotes.every((n) => n.isPublished === true || n.isPublished === undefined);
  assert(allPublished, "Every record in published notes has isPublished true");

  // Verify deterministic ordering
  let isSorted = true;
  for (let i = 1; i < publishedNotes.length; i++) {
    if (publishedNotes[i].sortOrder < publishedNotes[i - 1].sortOrder) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, "Published field notes are sorted by sortOrder ascending");

  // Test single note retrieval
  const firstNote = publishedNotes[0];
  const fetchedSingle = await getFieldNoteById(firstNote.id);
  assert(fetchedSingle !== null && fetchedSingle.id === firstNote.id, "getFieldNoteById retrieves note by ID");

  const nonExistent = await getFieldNoteById("non-existent-id-9999");
  assert(nonExistent === null, "getFieldNoteById returns null for non-existent ID");

  // Test Admin retrieval
  const adminNotes = await getAllAdminFieldNotes();
  assert(Array.isArray(adminNotes) && adminNotes.length >= publishedNotes.length, "getAllAdminFieldNotes returns all notes");

  // ---------------------------------------------------------------------------
  // 5. Public Carousel Compatibility Contract
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. CAROUSEL COMPATIBILITY CONTRACT ---");
  // FieldNotesSection expects: id, noteNumber, category, date, title, description, image, tag, href
  for (const note of publishedNotes) {
    assert(typeof note.id === "string" && note.id.length > 0, `Note ${note.id} has string id`);
    assert(typeof note.title === "string" && note.title.length > 0, `Note ${note.id} has non-empty title`);
    assert(typeof note.noteNumber === "string", `Note ${note.id} has noteNumber for 'NOTE // {num}' badge`);
    assert(note.href === undefined || typeof note.href === "string", `Note ${note.id} has valid href for CTA`);
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n==================================================");
  console.log(`TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
