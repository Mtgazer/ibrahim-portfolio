/**
 * scripts/seed-phase7.ts
 *
 * Seeds the four portfolio projects into Supabase (projects table, project_links).
 * Populates the presentation_data JSONB column with all editorial metadata so
 * the public site can render projects entirely from Supabase without consulting
 * the local projects.ts array at runtime.
 *
 * Security:
 *   - Uses SUPABASE_SERVICE_ROLE_KEY (server-side only, never NEXT_PUBLIC_*).
 *   - This key MUST remain in .env.local / local admin tooling only.
 *   - Never expose the service-role key in client code, deployed bundles,
 *     NEXT_PUBLIC_* vars, .env.example, or committed secrets.
 *
 * Run:
 *   npx tsx scripts/seed-phase7.ts
 *
 * Prerequisites:
 *   - SUPABASE_SERVICE_ROLE_KEY set in .env.local
 *   - NEXT_PUBLIC_SUPABASE_URL set in .env.local
 *   - Phase 7 migration already applied (presentation_data column exists)
 */

import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" }); // fallback
import { createClient } from "@supabase/supabase-js";
import type { Database, PresentationData } from "../src/types/database";

// ---------------------------------------------------------------------------
// Guard: never allow the service-role key to sneak into client env vars
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "\n[seed-phase7] Missing required environment variables.\n" +
      "  NEXT_PUBLIC_SUPABASE_URL  : " + (SUPABASE_URL ? "✓" : "✗ MISSING") + "\n" +
      "  SUPABASE_SERVICE_ROLE_KEY : " + (SERVICE_ROLE_KEY ? "✓" : "✗ MISSING") + "\n\n" +
      "Set them in .env.local and run again.\n"
  );
  process.exit(1);
}

if (SERVICE_ROLE_KEY.startsWith("sb_publishable_")) {
  console.error(
    "\n[seed-phase7] SUPABASE_SERVICE_ROLE_KEY is set to a publishable key.\n" +
      "The service_role key is a DIFFERENT, secret key.\n\n" +
      "Steps to get it:\n" +
      "  1. Go to https://supabase.com/dashboard\n" +
      "  2. Select your project (uhgpnbfhxgbyvhgfwisz)\n" +
      "  3. Settings → API\n" +
      "  4. Under 'Project API keys', copy the 'service_role' key\n" +
      "     (it starts with 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')\n" +
      "  5. Set SUPABASE_SERVICE_ROLE_KEY=<that-key> in .env.local\n"
  );
  process.exit(1);
}

if (!SERVICE_ROLE_KEY.startsWith("eyJ")) {
  console.error(
    "\n[seed-phase7] SUPABASE_SERVICE_ROLE_KEY does not look like a valid JWT.\n" +
      "The service_role key starts with 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'.\n" +
      "Find it in Supabase Dashboard → Settings → API → Project API keys.\n"
  );
  process.exit(1);
}

// Admin client (service role — bypasses RLS, server-side seed only)
const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

interface SeedProject {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  year: number;
  role: string;
  tools: string[];
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  presentation_data: PresentationData;
  links: Array<{
    label: string;
    url: string;
    type: "case-study" | "demo" | "github" | "figma" | "external" | null;
    microcopy: string | null;
    sort_order: number;
  }>;
}

const SEED_PROJECTS: SeedProject[] = [
  {
    slug: "hti-lms",
    title: "HTI LMS – Student Academic Platform",
    subtitle: "HTI COMPUTER SCIENCE · ACADEMIC PLATFORM",
    description:
      "A comprehensive, student-focused Learning Management System architected to replace fragmented academic legacy portals. Unifies dynamic course modules, lecture stream schedules, assignment submission cycles, and an interactive real-time GPA recalculation engine into an intuitive, cohesive digital ecosystem.",
    category: "Academic Platform",
    year: 2024,
    role: "UI/UX Team Lead & Designer",
    tools: ["Figma", "FigJam", "React Tokens", "Tailwind CSS"],
    tags: ["UI/UX Design", "Design Systems", "Education", "Product Architecture"],
    is_published: true,
    is_featured: true,
    sort_order: 1,
    presentation_data: {
      projectNumber: "01",
      badge: "PRIMARY FLAGSHIP CASE STUDY",
      teamStructure: "2 UI Designers, 2 Dev Engineers",
      disciplineScope: "UX Research, UI System, Tokens",
      statusText: "Design System Published & Handed Off",
      ctaText: "VIEW IN-DEPTH CASE STUDY →",
      ctaMicrocopy: "DETAILED RESEARCH, INFORMATION ARCHITECTURE & INTERACTIVE FLOW",
      layoutVariant: "standard",
      mediaLayout: "banner-with-grid",
      metrics: [
        {
          label: "STUDENT INTAKE TESTING",
          value: "48+",
          detail: "HTI CS students surveyed in discovery",
          isGold: true,
        },
        {
          label: "NAVIGATION EFFICIENCY",
          value: "-42%",
          detail: "Reduction in clicks to locate course materials",
        },
        {
          label: "SYSTEM COMPONENTS",
          value: "64",
          detail: "Reusable variants built in Figma library",
        },
        {
          label: "ENGINEERING ALIGNMENT",
          value: "100%",
          detail: "Specs structured with React/Tailwind tokens",
          isGold: true,
        },
      ],
      // Temporary fallback visuals — overridden by DB project_images if present.
      // If all Storage images are deleted, these public/ paths render as fallback.
      visuals: {
        main: "/images/projects/p1-main.png",
        mainCaption: "[HTI LMS — PRIMARY SHOWCASE]",
        secondaryLeft: {
          src: "/images/projects/p1-sec1.png",
          caption: "[HTI LMS - COURSES HUB]  GRID VIEW",
        },
        secondaryRight: {
          src: "/images/projects/p1-sec2.png",
          caption: "[HTI LMS - DESIGN SYSTEM] FIGMA TOKENS",
        },
      },
    },
    links: [
      {
        label: "VIEW IN-DEPTH CASE STUDY →",
        url: "#contact",
        type: "case-study",
        microcopy: "DETAILED RESEARCH, INFORMATION ARCHITECTURE & INTERACTIVE FLOW",
        sort_order: 1,
      },
    ],
  },
  {
    slug: "shopping-app",
    title: "Shopping App – Mobile Retail Experience",
    subtitle: "[MOBILE COMMERCE · UI EXPLORATION]",
    description:
      "An exploratory mobile retail concept built early in my design journey. Crafted to deeply explore mobile visual hierarchy, tactile product cards, intuitive category filtering, and micro-interactions during the bag-to-checkout sequence.",
    category: "Mobile Commerce",
    year: 2023,
    role: "UI Designer (Solo Exploration)",
    tools: ["Figma", "Micro-Interactions", "Mobile Prototyping"],
    tags: ["Mobile Retail", "UI Exploration", "E-Commerce"],
    is_published: true,
    is_featured: false,
    sort_order: 2,
    presentation_data: {
      projectNumber: "02",
      teamStructure: "Mobile Screens, Clickable Prototype",
      statusText: "2 Weeks Sprint · 2023",
      layoutVariant: "standard",
      mediaLayout: "screen-trio",
      growthNote: {
        title: "REFLECTIVE GROWTH NOTE",
        text: "Created prior to transitioning to comprehensive design system tokens. This project was a foundational milestone where I refined visual rhythm, typography proportions, and spacing discipline on mobile touch targets.",
      },
      // Temporary fallback visuals — overridden by DB project_images if present.
      visuals: {
        screens: [
          {
            src: "/images/projects/p2-hero.png",
            caption: "[SHOPPING APP – HERO SCREEN]",
          },
          {
            src: "/images/projects/p2-detail.png",
            caption: "[SHOPPING APP – PRODUCT DETAIL]",
            isHighlighted: true,
          },
          {
            src: "/images/projects/p2-cart.png",
            caption: "[SHOPPING APP – CART & SUMMARY]",
          },
        ],
      },
    },
    links: [],
  },
  {
    slug: "sigma-computer",
    title: "Sigma Computer – Hardware Discovery Concept",
    subtitle: "[CONCEPT PROJECT · HARDWARE CATALOG]",
    description:
      "High-end PC components present complex spec sheets that overwhelm typical mobile shoppers. Sigma Computer restructures hardware shopping by transforming dense benchmark tables into scannable visual comparison modules with real-time compatibility validation.",
    category: "Hardware Catalog",
    year: 2024,
    role: "Product Interface Architect",
    tools: ["Figma", "Component Architecture", "Design Tokens"],
    tags: ["Hardware Specs", "Design Systems", "Filter UX"],
    is_published: true,
    is_featured: false,
    sort_order: 3,
    presentation_data: {
      projectNumber: "03",
      ctaText: "FIGMA PROTOTYPE READY · MOBILE SPEC BREAKDOWN",
      layoutVariant: "flipped",
      mediaLayout: "split-panel",
      pillars: [
        {
          number: "01",
          title: "Visual Spec Hierarchy",
          description:
            "Prioritized wattage, socket dimensions, and clock speeds to prevent hardware mismatches.",
        },
        {
          number: "02",
          title: "Filter Taxonomy Optimization",
          description:
            "Progressive disclosure filter drawer allowing power users to isolate exact chipsets in 2 taps.",
        },
        {
          number: "03",
          title: "Engineering-Centric Aesthetic",
          description:
            "Monochrome blueprint UI with micro-accent gold status indicators.",
        },
      ],
      // Temporary fallback visuals — overridden by DB project_images if present.
      visuals: {
        main: "/images/projects/p3-main.png",
        mainCaption: "[SIGMA — HARDWARE HOME]  MOBILE VIEWPORT",
        mainBadge: "MOBILE SPEC",
        secondaryLeft: {
          src: "/images/projects/p3-spec.png",
          caption: "[SIGMA — SPEC DETAIL]  METRICS",
        },
        secondaryRight: {
          src: "/images/projects/p3-filter.png",
          caption: "[SIGMA — FILTER DRAWER]  TAXONOMY",
        },
      },
    },
    links: [
      {
        label: "FIGMA PROTOTYPE READY · MOBILE SPEC BREAKDOWN",
        url: "#contact",
        type: "figma",
        microcopy: null,
        sort_order: 1,
      },
    ],
  },
  {
    slug: "book-store",
    title: "Book Store – Reader Discovery & Marketplace",
    subtitle: "[EDITORIAL COMMERCE · COMPONENT ARCHITECTURE]",
    description:
      "An exploration of editorial book discovery centered around atomic UI architecture. Built specifically to demonstrate systematic component variants: dynamic cover ratios, typography-led excerpt cards, audio vs. physical purchase toggles, and robust empty/error authentication states.",
    category: "Editorial Commerce",
    year: 2024,
    role: "Design Systems Designer",
    tools: ["Figma Variables", "Atomic Design", "Prototyping"],
    tags: ["Editorial", "Atomic Tokens", "Design System"],
    is_published: true,
    is_featured: false,
    sort_order: 4,
    presentation_data: {
      projectNumber: "04",
      layoutVariant: "standard",
      mediaLayout: "split-panel",
      coreComponentSet: [
        "BookCard / Editorial",
        "BookCard / Compact",
        "Author Bio Drawer",
        "Audio Sample Player",
        "Rating Distribution",
        "Auth Modal Variations",
      ],
      // Temporary fallback visuals — overridden by DB project_images if present.
      visuals: {
        main: "/images/projects/p4-main.png",
        mainCaption: "[BOOK STORE — HOME]  FEED",
        mainBadge: "FEED",
        secondaryLeft: {
          src: "/images/projects/p4-cards.png",
          caption: "[BOOK STORE — CARD VARIANTS]",
        },
        secondaryRight: {
          src: "/images/projects/p4-auth.png",
          caption: "[BOOK STORE — AUTH STATES]",
        },
      },
    },
    links: [],
  },
];

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function upsertProject(proj: SeedProject): Promise<string> {
  // 1. Upsert the project row (match on slug)
  const { data: projectRow, error: projectErr } = await supabase
    .from("projects")
    .upsert(
      {
        slug: proj.slug,
        title: proj.title,
        subtitle: proj.subtitle,
        description: proj.description,
        category: proj.category,
        year: proj.year,
        role: proj.role,
        tools: proj.tools,
        tags: proj.tags,
        is_published: proj.is_published,
        is_featured: proj.is_featured,
        sort_order: proj.sort_order,
        presentation_data: proj.presentation_data as unknown as Database["public"]["Tables"]["projects"]["Insert"]["presentation_data"],
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (projectErr || !projectRow) {
    throw new Error(
      `Failed to upsert project "${proj.slug}": ${projectErr?.message ?? "unknown"}`
    );
  }

  const projectId = projectRow.id;

  // 2. Delete existing links for idempotency, then re-insert
  if (proj.links.length > 0) {
    await supabase
      .from("project_links")
      .delete()
      .eq("project_id", projectId);

    const linkRows = proj.links.map((l) => ({
      project_id: projectId,
      label: l.label,
      url: l.url,
      type: l.type,
      microcopy: l.microcopy,
      sort_order: l.sort_order,
    }));

    const { error: linkErr } = await supabase
      .from("project_links")
      .insert(linkRows);

    if (linkErr) {
      throw new Error(
        `Failed to insert links for "${proj.slug}": ${linkErr.message}`
      );
    }
  }

  return projectId;
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  Phase 7 Seed — Ibrahim Portfolio Projects  ║");
  console.log("╚══════════════════════════════════════════════╝\n");
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`Projects to seed: ${SEED_PROJECTS.length}\n`);

  const results: { slug: string; id: string; status: "ok" | "error"; error?: string }[] = [];

  for (const proj of SEED_PROJECTS) {
    try {
      const id = await upsertProject(proj);
      console.log(`  ✓  ${proj.slug}  →  ${id}`);
      results.push({ slug: proj.slug, id, status: "ok" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${proj.slug}  →  ${msg}`);
      results.push({ slug: proj.slug, id: "", status: "error", error: msg });
    }
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const failed = results.filter((r) => r.status === "error").length;

  console.log(`\n────────────────────────────────────────────────`);
  console.log(`Seeded: ${ok}/${SEED_PROJECTS.length}  |  Failed: ${failed}`);

  if (failed > 0) {
    console.error("\n[seed-phase7] Some projects failed to seed. Check errors above.");
    process.exit(1);
  }

  console.log("\n[seed-phase7] Done. Run scripts/verify-phase7.ts to validate.\n");
}

main().catch((err) => {
  console.error("\n[seed-phase7] Fatal error:", err);
  process.exit(1);
});
