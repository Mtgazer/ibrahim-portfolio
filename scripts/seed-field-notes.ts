/**
 * scripts/seed-field-notes.ts
 *
 * Seeds reference Field Notes into Supabase (field_notes table).
 * Reuses verified existing field note content from src/data/fieldNotes.ts
 * to establish the production/staging database baseline without inventing
 * unverified claims.
 *
 * Run:
 *   npx tsx scripts/seed-field-notes.ts
 */

import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" });
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.log(
    "\n[seed-field-notes] SUPABASE_SERVICE_ROLE_KEY not configured in .env.local.\n" +
      "  Migration SQL in supabase/migrations/20261001000000_create_field_notes_schema.sql\n" +
      "  defines the table and initial structure.\n"
  );
  process.exit(0);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

export const referenceFieldNotes = [
  {
    id: "f0000001-0000-0000-0000-000000000001",
    title: "Flowly — Multi-State Input Architecture",
    slug: "flowly-multi-state-input-architecture",
    note_number: "01",
    category: "MICRO-INTERACTION",
    note_date: "2024-10-01",
    description:
      "State machine exploration for authentication inputs: optical baseline positioning, hairline gold focus boundaries, and semantic error states with zero cognitive friction.",
    cover_image_path: null,
    cover_image_url: "/images/projects/p4-auth.png",
    cover_alt_text: "Flowly input state machine and authentication architecture preview",
    tags: ["DAILY UI #001", "FIGMA ENGINE"],
    external_link: "#contact",
    is_published: true,
    is_featured: true,
    sort_order: 1,
  },
  {
    id: "f0000001-0000-0000-0000-000000000002",
    title: "Spatial Auto-Layout & Design Tokens",
    slug: "spatial-auto-layout-design-tokens",
    note_number: "02",
    category: "SYSTEMS STUDY",
    note_date: "2024-09-01",
    description:
      "Constructing mathematical 4px rhythm scales, dark-mode token hierarchies, and auto-layout nesting rules engineered for 1:1 React and Tailwind CSS handoff.",
    cover_image_path: null,
    cover_image_url: "/images/projects/p1-sec2.png",
    cover_alt_text: "Design tokens and spatial auto-layout hierarchy diagram",
    tags: ["FIGMA TOKENS", "DESIGN SYSTEM"],
    external_link: "#contact",
    is_published: true,
    is_featured: true,
    sort_order: 2,
  },
  {
    id: "f0000001-0000-0000-0000-000000000003",
    title: "Tactile Product Cards & Touch Hierarchies",
    slug: "tactile-product-cards-touch-hierarchies",
    note_number: "03",
    category: "MOBILE STUDY",
    note_date: "2024-08-01",
    description:
      "Evaluating thumb-zone ergonomics, tactile micro-elevations, and glanceable pricing hierarchies within dense mobile commerce feeds.",
    cover_image_path: null,
    cover_image_url: "/images/projects/p2-detail.png",
    cover_alt_text: "Mobile product card elevations and ergonomic thumb zones",
    tags: ["MOBILE SPEC", "ERGONOMICS"],
    external_link: "#contact",
    is_published: true,
    is_featured: false,
    sort_order: 3,
  },
  {
    id: "f0000001-0000-0000-0000-000000000004",
    title: "High-Density Hardware Telemetry HUD",
    slug: "high-density-hardware-telemetry-hud",
    note_number: "04",
    category: "SPEC DESIGN",
    note_date: "2024-07-01",
    description:
      "Designing data-dense specifications, power wattage indicators, and memory bandwidth hierarchies with monospaced clarity for technical consumers.",
    cover_image_path: null,
    cover_image_url: "/images/projects/p3-spec.png",
    cover_alt_text: "Hardware specification telemetry HUD interface",
    tags: ["HARDWARE CATALOG", "TELEMETRY"],
    external_link: "#contact",
    is_published: true,
    is_featured: false,
    sort_order: 4,
  },
  {
    id: "f0000001-0000-0000-0000-000000000005",
    title: "Editorial Book Covers & Dynamic Aspect Bounds",
    slug: "editorial-book-covers-dynamic-aspect-bounds",
    note_number: "05",
    category: "LAYOUT EXPERIMENT",
    note_date: "2024-06-01",
    description:
      "Handling unpredictable publisher cover ratios through responsive CSS containment and disciplined negative space surrounding typographic metadata.",
    cover_image_path: null,
    cover_image_url: "/images/projects/p4-cards.png",
    cover_alt_text: "Dynamic aspect bounds and responsive book cover grid",
    tags: ["EDITORIAL COMMERCE", "CSS CONSTRAINTS"],
    external_link: "#contact",
    is_published: true,
    is_featured: false,
    sort_order: 5,
  },
  {
    id: "f0000001-0000-0000-0000-000000000006",
    title: "Faceted Filter Triggers & Search Heuristics",
    slug: "faceted-filter-triggers-search-heuristics",
    note_number: "06",
    category: "RAPID PROTOTYPE",
    note_date: "2024-05-01",
    description:
      "Reducing discovery steps via contextual sticky filter chips, instant matching previews, and tactile filter drawer transitions.",
    cover_image_path: null,
    cover_image_url: "/images/projects/p3-filter.png",
    cover_alt_text: "Faceted filter drawer and contextual chip heuristics",
    tags: ["INTERACTION FLOW", "PROTOTYPE"],
    external_link: "#contact",
    is_published: true,
    is_featured: false,
    sort_order: 6,
  },
  {
    // Draft note to verify RLS privacy rule (must NEVER leak to anon/public users)
    id: "f0000001-0000-0000-0000-000000000007",
    title: "[DRAFT] Laptop Price Prediction ML Pipeline & Heuristics",
    slug: "draft-laptop-price-prediction-ml-pipeline",
    note_number: "07",
    category: "AI & DATA SCIENCE",
    note_date: "2024-11-01",
    description:
      "Internal research on gradient boosting models for multi-variant laptop pricing estimations and feature importance visualizations.",
    cover_image_path: null,
    cover_image_url: "/images/projects/p3-spec.png",
    cover_alt_text: "Internal ML pricing pipeline experimentation notes",
    tags: ["MACHINE LEARNING", "DATA SCIENCE"],
    external_link: "#contact",
    is_published: false, // DRAFT
    is_featured: false,
    sort_order: 7,
  },
];

async function seed() {
  console.log("Seeding Field Notes into Supabase...");

  for (const note of referenceFieldNotes) {
    const { error } = await supabase.from("field_notes").upsert(note, {
      onConflict: "id",
    });

    if (error) {
      console.error(`Error inserting ${note.title}:`, error.message);
    } else {
      console.log(`✓ Seeded note ${note.note_number}: ${note.title} (${note.is_published ? "Published" : "Draft"})`);
    }
  }

  console.log("\nField Notes seeding completed successfully.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
