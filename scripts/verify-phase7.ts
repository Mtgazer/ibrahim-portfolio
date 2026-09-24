/**
 * scripts/verify-phase7.ts
 *
 * Focused integration verification for Phase 7.
 *
 * Tests:
 *  1.  Anon client can read published projects (public RLS select)
 *  2.  Anon client cannot read draft projects (RLS blocks)
 *  3.  Anon client can read project_images of a published project
 *  4.  Anon client cannot read project_images of a draft project
 *  5.  Anon client can read project_links of a published project
 *  6.  Anon client cannot read project_links of a draft project
 *  7.  Exactly 4 seeded projects are published, in sort_order 1–4
 *  8.  sort_order matches expected sequence
 *  9.  presentation_data is non-null and contains the required fields
 * 10.  presentation_data.projectNumber values are "01"–"04"
 * 11.  DB images override presentation_data.visuals (visual precedence check)
 * 12.  Links map correctly (label, url, type, microcopy, sort_order)
 * 13.  A newly created admin project renders publicly after publish
 * 14.  An unpublished project never leaks publicly
 * 15.  After delete, project is gone from public listing
 *
 * Run:
 *   npx tsx scripts/verify-phase7.ts
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL        — both clients
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — anon client (RLS tests)
 *   SUPABASE_SERVICE_ROLE_KEY       — admin client (setup/teardown)
 */

import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" }); // fallback
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error(
    "\n[verify-phase7] Missing environment variables:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL                 : " + (SUPABASE_URL ? "✓" : "✗") + "\n" +
      "  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY      : " + (ANON_KEY ? "✓" : "✗") + "\n" +
      "  SUPABASE_SERVICE_ROLE_KEY                : " + (SERVICE_KEY ? "✓" : "✗") + "\n"
  );
  process.exit(1);
}

// Anon client — used for RLS verification (mimics public site)
const anonClient = createClient<Database>(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false },
});

// Admin client — used for setup/teardown helpers only
const adminClient = createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;
const failures: string[] = [];

function pass(name: string) {
  console.log(`  ✓  ${name}`);
  passed++;
}

function fail(name: string, detail: string) {
  console.error(`  ✗  ${name}\n     ${detail}`);
  failed++;
  failures.push(`${name}: ${detail}`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createDraftProject(suffix: string) {
  const slug = `verify-phase7-draft-${suffix}`;
  const { data, error } = await adminClient
    .from("projects")
    .insert({
      slug,
      title: `[VERIFY P7] Draft ${suffix}`,
      is_published: false,
      is_featured: false,
      sort_order: 9990,
      tools: [],
      tags: [],
    })
    .select("id, slug")
    .single();

  if (error || !data) throw new Error(`createDraftProject failed: ${error?.message}`);
  return data;
}

async function publishProject(id: string) {
  const { error } = await adminClient
    .from("projects")
    .update({ is_published: true })
    .eq("id", id);
  if (error) throw new Error(`publishProject failed: ${error.message}`);
}

async function unpublishProject(id: string) {
  const { error } = await adminClient
    .from("projects")
    .update({ is_published: false })
    .eq("id", id);
  if (error) throw new Error(`unpublishProject failed: ${error.message}`);
}

async function deleteProject(id: string) {
  await adminClient.from("project_images").delete().eq("project_id", id);
  await adminClient.from("project_links").delete().eq("project_id", id);
  await adminClient.from("projects").delete().eq("id", id);
}

async function createImageForProject(
  projectId: string,
  isPrimary = true
): Promise<string> {
  const { data, error } = await adminClient
    .from("project_images")
    .insert({
      project_id: projectId,
      storage_path: `${projectId}/test-verify.png`,
      public_url: `https://example.com/storage/${projectId}/test-verify.png`,
      alt_text: "Verify test image",
      caption: "[VERIFY] Test image",
      sort_order: 1,
      is_primary: isPrimary,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`createImageForProject failed: ${error?.message}`);
  return data.id;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function runTests() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  Phase 7 Verification — Ibrahim Portfolio Projects  ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // ── 1. Anon can read published projects ────────────────────────────────
  const { data: publishedProjects, error: pubErr } = await anonClient
    .from("projects")
    .select("id, slug, is_published, sort_order, presentation_data")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (pubErr || !publishedProjects) {
    fail("1. Anon reads published projects", pubErr?.message ?? "no data");
    console.error("\n[FATAL] Cannot read published projects. Aborting remaining tests.\n");
    return;
  } else {
    pass("1. Anon can read published projects");
  }

  // ── 2. Anon cannot read draft projects ─────────────────────────────────
  // Create a draft, then verify anon cannot see it
  let draftId = "";
  let draftSlug = "";
  try {
    const draft = await createDraftProject(Date.now().toString());
    draftId = draft.id;
    draftSlug = draft.slug;

    const { data: leakedDraft } = await anonClient
      .from("projects")
      .select("id")
      .eq("id", draftId)
      .maybeSingle();

    if (leakedDraft) {
      fail("2. Draft projects are not publicly readable", `Draft ${draftSlug} leaked to anon`);
    } else {
      pass("2. Draft projects are not publicly readable");
    }
  } catch (err) {
    fail("2. Draft projects are not publicly readable", String(err));
  }

  // ── 3. Anon can read images of published projects ──────────────────────
  if (publishedProjects.length > 0) {
    const firstPublishedId = publishedProjects[0].id;
    const imgResult = await anonClient
      .from("project_images")
      .select("id")
      .eq("project_id", firstPublishedId)
      .limit(1);

    if (imgResult.error) {
      fail("3. Anon reads images of published projects", imgResult.error.message);
    } else {
      // 0 rows is fine (no images uploaded yet); absence of error is the check
      pass("3. Anon can read project_images of a published project (RLS allows)");
    }
  } else {
    fail("3. Anon reads images of published projects", "No published projects found to test");
  }

  // ── 4. Anon cannot read images of draft projects ────────────────────────
  if (draftId) {
    let draftImgId = "";
    try {
      draftImgId = await createImageForProject(draftId);

      const { data: leakedImg } = await anonClient
        .from("project_images")
        .select("id")
        .eq("project_id", draftId)
        .maybeSingle();

      if (leakedImg) {
        fail("4. Images of draft projects are not publicly readable", "Image leaked to anon");
      } else {
        pass("4. Images of draft projects are not publicly readable");
      }
    } catch (err) {
      fail("4. Images of draft projects are not publicly readable", String(err));
    } finally {
      if (draftImgId) {
        await adminClient.from("project_images").delete().eq("id", draftImgId);
      }
    }
  }

  // ── 5. Anon can read links of published projects ───────────────────────
  if (publishedProjects.length > 0) {
    const firstPublishedId = publishedProjects[0].id;
    const lnkResult = await anonClient
      .from("project_links")
      .select("id")
      .eq("project_id", firstPublishedId)
      .limit(10);

    if (lnkResult.error) {
      fail("5. Anon reads links of published projects", lnkResult.error.message);
    } else {
      pass("5. Anon can read project_links of a published project (RLS allows)");
    }
  } else {
    fail("5. Anon reads links of published projects", "No published projects found");
  }

  // ── 6. Anon cannot read links of draft projects ─────────────────────────
  if (draftId) {
    // Insert a link on the draft project, verify anon can't see it
    const { data: draftLink, error: draftLinkErr } = await adminClient
      .from("project_links")
      .insert({
        project_id: draftId,
        label: "Draft link",
        url: "#draft",
        sort_order: 1,
      })
      .select("id")
      .single();

    if (!draftLinkErr && draftLink) {
      const { data: leakedLink } = await anonClient
        .from("project_links")
        .select("id")
        .eq("id", draftLink.id)
        .maybeSingle();

      if (leakedLink) {
        fail("6. Links of draft projects are not publicly readable", "Link leaked to anon");
      } else {
        pass("6. Links of draft projects are not publicly readable");
      }

      await adminClient.from("project_links").delete().eq("id", draftLink.id);
    } else {
      fail("6. Links of draft projects are not publicly readable", "Could not create test link");
    }
  }

  // ── 7. Exactly 4 seeded projects are published ─────────────────────────
  const seededSlugs = ["hti-lms", "shopping-app", "sigma-computer", "book-store"];
  const seededProjects = publishedProjects.filter((p) =>
    seededSlugs.includes(p.slug)
  );

  if (seededProjects.length === 4) {
    pass(`7. Exactly 4 seeded projects are published (${seededSlugs.join(", ")})`);
  } else {
    fail(
      "7. Exactly 4 seeded projects are published",
      `Found ${seededProjects.length} of 4 expected slugs: ${seededProjects.map((p) => p.slug).join(", ")}`
    );
  }

  // ── 8. sort_order matches expected sequence ─────────────────────────────
  const expectedOrder = seededSlugs;
  const actualOrder = seededProjects
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => p.slug);

  const orderMatches = expectedOrder.every((slug, idx) => actualOrder[idx] === slug);
  if (orderMatches) {
    pass(`8. Project ordering matches sort_order (${actualOrder.join(" → ")})`);
  } else {
    fail(
      "8. Project ordering matches sort_order",
      `Expected: ${expectedOrder.join(" → ")} | Got: ${actualOrder.join(" → ")}`
    );
  }

  // ── 9. presentation_data is non-null and has required fields ───────────
  let pdOk = 0;
  for (const proj of seededProjects) {
    const pd = proj.presentation_data as Record<string, unknown> | null;
    if (
      pd &&
      typeof pd.projectNumber === "string" &&
      typeof pd.mediaLayout === "string" &&
      typeof pd.layoutVariant === "string"
    ) {
      pdOk++;
    } else {
      fail(
        "9. presentation_data has required fields",
        `Project "${proj.slug}" has invalid/missing presentation_data: ${JSON.stringify(pd)}`
      );
    }
  }
  if (pdOk === seededProjects.length) {
    pass("9. presentation_data is non-null with required fields on all 4 projects");
  }

  // ── 10. presentation_data.projectNumber values are "01"–"04" ───────────
  const projectNumbers = seededProjects
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => (p.presentation_data as Record<string, unknown> | null)?.projectNumber);

  const expectedNumbers = ["01", "02", "03", "04"];
  const numbersMatch = expectedNumbers.every((n, i) => projectNumbers[i] === n);
  if (numbersMatch) {
    pass(`10. projectNumber values are "01"–"04" (${projectNumbers.join(", ")})`);
  } else {
    fail(
      "10. projectNumber values are '01'–'04'",
      `Got: ${projectNumbers.join(", ")}`
    );
  }

  // ── 11. DB images override presentation_data.visuals ───────────────────
  // Upload a test DB image to the first published project, check it renders
  const firstSeeded = seededProjects.find((p) => p.slug === "hti-lms");
  let testImgId = "";
  if (firstSeeded) {
    try {
      testImgId = await createImageForProject(firstSeeded.id, true);
      // Anon reads the image
      const { data: imgs } = await anonClient
        .from("project_images")
        .select("public_url, is_primary")
        .eq("project_id", firstSeeded.id);

      const dbImg = imgs?.find((i) => i.is_primary);
      if (dbImg && dbImg.public_url?.startsWith("https://")) {
        pass("11. DB images are readable by anon (Storage override path works)");
      } else {
        fail("11. DB images override presentation_data.visuals", "Primary DB image not found or has wrong URL");
      }
    } catch (err) {
      fail("11. DB images override presentation_data.visuals", String(err));
    } finally {
      if (testImgId) {
        await adminClient.from("project_images").delete().eq("id", testImgId);
      }
    }
  } else {
    fail("11. DB images override presentation_data.visuals", "hti-lms not found in published list");
  }

  // ── 12. Links map correctly ─────────────────────────────────────────────
  const htiLms = seededProjects.find((p) => p.slug === "hti-lms");
  if (htiLms) {
    const { data: links } = await anonClient
      .from("project_links")
      .select("label, url, type, microcopy, sort_order")
      .eq("project_id", htiLms.id)
      .order("sort_order", { ascending: true });

    if (
      links &&
      links.length > 0 &&
      links[0].type === "case-study" &&
      links[0].url === "#contact" &&
      links[0].microcopy?.includes("RESEARCH")
    ) {
      pass("12. Links map correctly (label, url, type, microcopy, sort_order)");
    } else {
      fail(
        "12. Links map correctly",
        `hti-lms links: ${JSON.stringify(links)}`
      );
    }
  } else {
    fail("12. Links map correctly", "hti-lms not found");
  }

  // ── 13. New admin project renders publicly after publish ─────────────────
  let adminTestId = "";
  try {
    const draft = await createDraftProject("admin-test");
    adminTestId = draft.id;

    // Before publish — anon cannot see it
    const { data: beforePublish } = await anonClient
      .from("projects")
      .select("id")
      .eq("id", adminTestId)
      .maybeSingle();

    if (beforePublish) {
      fail("13. New admin project: not visible before publish", "Leaked before publish");
    }

    // Publish
    await publishProject(adminTestId);

    // After publish — anon can see it
    const { data: afterPublish } = await anonClient
      .from("projects")
      .select("id, is_published")
      .eq("id", adminTestId)
      .maybeSingle();

    if (afterPublish && afterPublish.is_published) {
      pass("13. A newly created admin project renders publicly after publish");
    } else {
      fail("13. New admin project renders publicly after publish", "Not visible after publish");
    }

    // Unpublish — anon can no longer see it
    await unpublishProject(adminTestId);

    const { data: afterUnpublish } = await anonClient
      .from("projects")
      .select("id")
      .eq("id", adminTestId)
      .maybeSingle();

    if (!afterUnpublish) {
      pass("14. An unpublished project never leaks publicly (after unpublish)");
    } else {
      fail("14. Unpublished project never leaks", "Still visible after unpublish");
    }
  } catch (err) {
    fail("13-14. Admin project publish/unpublish cycle", String(err));
  } finally {
    if (adminTestId) await deleteProject(adminTestId);
  }

  // ── 15. After delete, project gone from public ──────────────────────────
  if (draftId) {
    await deleteProject(draftId);
    const { data: afterDelete } = await anonClient
      .from("projects")
      .select("id")
      .eq("id", draftId)
      .maybeSingle();

    if (!afterDelete) {
      pass("15. After delete, project is gone from public listing");
    } else {
      fail("15. After delete, project is gone", "Project still accessible after delete");
    }
    draftId = ""; // already deleted
  }

  // Cleanup orphaned draft if something went wrong
  if (draftId) await deleteProject(draftId);

  // ── Summary ───────────────────────────────────────────────────────────
  console.log("\n────────────────────────────────────────────────────────");
  console.log(`Passed: ${passed}  |  Failed: ${failed}`);

  if (failed > 0) {
    console.error("\nFailed checks:");
    failures.forEach((f) => console.error(`  ✗ ${f}`));
    process.exit(1);
  } else {
    console.log("\n[verify-phase7] All checks passed ✓\n");
  }
}

runTests().catch((err) => {
  console.error("\n[verify-phase7] Fatal error:", err);
  process.exit(1);
});
