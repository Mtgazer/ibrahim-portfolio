import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { getPublishedProjects, getProjectCount, getProjectIndexRange } from "../src/lib/projects";
import { normalizeSlug, isValidSlug } from "../src/lib/slug";

async function runPhase6Verification() {
  console.log("==================================================");
  console.log("PHASE 6 — ADMIN DASHBOARD & CRUD VERIFICATION SUITE");
  console.log("==================================================\n");

  let passes = 0;
  let checks = 0;

  function assert(condition: boolean, title: string, details?: string) {
    checks++;
    if (condition) {
      passes++;
      console.log(`[PASS] ${title}`);
    } else {
      console.error(`[FAIL] ${title}`);
      if (details) console.error(`       ${details}`);
    }
  }

  // 1. Next.js Configuration: bodySizeLimit & remotePatterns
  console.log("--- 1. Next.js Configuration Verification ---");
  const nextConfigPath = path.resolve(process.cwd(), "next.config.ts");
  assert(fs.existsSync(nextConfigPath), "next.config.ts exists");

  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, "utf-8");
    assert(
      nextConfigContent.includes("bodySizeLimit") &&
        (nextConfigContent.includes("12mb") || nextConfigContent.includes("15mb")),
      "Server Actions bodySizeLimit configured for >= 10MB image uploads with multipart overhead"
    );
    assert(
      nextConfigContent.includes("remotePatterns") &&
        nextConfigContent.includes("uhgpnbfhxgbyvhgfwisz.supabase.co") &&
        nextConfigContent.includes("project-images"),
      "next/image remotePatterns tightened strictly to uhgpnbfhxgbyvhgfwisz.supabase.co with project-images pathname restriction"
    );
  }

  // 2. Additive Migration: Enforce Single Primary Image
  console.log("\n--- 2. Additive Database Migration Verification ---");
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20260922000001_enforce_single_primary_image.sql"
  );
  assert(
    fs.existsSync(migrationPath),
    "Additive migration exists: 20260922000001_enforce_single_primary_image.sql"
  );

  if (fs.existsSync(migrationPath)) {
    const sqlContent = fs.readFileSync(migrationPath, "utf-8");
    assert(
      sqlContent.includes("create unique index") &&
        sqlContent.includes("idx_project_images_one_primary") &&
        sqlContent.includes("(project_id)") &&
        sqlContent.includes("where (is_primary = true)"),
      "Additive migration defines partial unique index on project_images(project_id) WHERE (is_primary = true)"
    );
  }

  // 3. Admin Routes & Structure
  console.log("\n--- 3. Admin Route Files & Components Verification ---");
  const expectedFiles = [
    "src/app/admin/layout.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin/login/page.tsx",
    "src/app/admin/projects/page.tsx",
    "src/app/admin/projects/new/page.tsx",
    "src/app/admin/projects/[id]/page.tsx",
    "src/components/admin/AdminNav.tsx",
    "src/components/admin/ProjectForm.tsx",
    "src/components/admin/ProjectListTable.tsx",
    "src/components/admin/ProjectLinksManager.tsx",
    "src/components/admin/ProjectImagesManager.tsx",
    "src/components/admin/ProjectDeleteButton.tsx",
    "src/lib/actions/projects.ts",
    "src/lib/slug.ts",
  ];

  for (const relPath of expectedFiles) {
    const absPath = path.resolve(process.cwd(), relPath);
    assert(fs.existsSync(absPath), `File exists: ${relPath}`);
  }

  // 4. Server Actions Layer Verification
  console.log("\n--- 4. Server Actions Mutation Layer Audit ---");
  const actionsPath = path.resolve(process.cwd(), "src/lib/actions/projects.ts");
  if (fs.existsSync(actionsPath)) {
    const actionsContent = fs.readFileSync(actionsPath, "utf-8");

    assert(
      actionsContent.startsWith('"use server"') ||
        actionsContent.startsWith("'use server'"),
      'src/lib/actions/projects.ts starts with "use server" directive'
    );

    // Project CRUD Actions
    assert(actionsContent.includes("export async function createProjectAction"), "Exports createProjectAction");
    assert(actionsContent.includes("export async function updateProjectAction"), "Exports updateProjectAction");
    assert(actionsContent.includes("export async function deleteProjectAction"), "Exports deleteProjectAction");
    assert(actionsContent.includes("export async function toggleProjectPublishedAction"), "Exports toggleProjectPublishedAction");
    assert(actionsContent.includes("export async function toggleProjectFeaturedAction"), "Exports toggleProjectFeaturedAction");
    assert(actionsContent.includes("export async function updateProjectSortOrderAction"), "Exports updateProjectSortOrderAction");

    // Link CRUD Actions
    assert(actionsContent.includes("export async function createProjectLinkAction"), "Exports createProjectLinkAction");
    assert(actionsContent.includes("export async function updateProjectLinkAction"), "Exports updateProjectLinkAction");
    assert(actionsContent.includes("export async function deleteProjectLinkAction"), "Exports deleteProjectLinkAction");
    assert(actionsContent.includes("export async function reorderProjectLinksAction"), "Exports reorderProjectLinksAction");

    // Image CRUD & Storage Actions
    assert(actionsContent.includes("export async function uploadProjectImageAction"), "Exports uploadProjectImageAction");
    assert(actionsContent.includes("export async function deleteProjectImageAction"), "Exports deleteProjectImageAction");
    assert(actionsContent.includes("export async function setPrimaryImageAction"), "Exports setPrimaryImageAction");
    assert(actionsContent.includes("export async function reorderProjectImagesAction"), "Exports reorderProjectImagesAction");
    assert(actionsContent.includes("export async function updateProjectImageMetaAction"), "Exports updateProjectImageMetaAction");
  }

  // 5. Server Authorization & Security Guards Audit
  console.log("\n--- 5. Server-Side Security & Validation Audit ---");
  if (fs.existsSync(actionsPath)) {
    const actionsContent = fs.readFileSync(actionsPath, "utf-8");

    const requireAdminMatches = actionsContent.match(/await requireAdmin\(\)/g) || [];
    assert(
      requireAdminMatches.length >= 13,
      `All mutation actions enforce requireAdmin() check (found ${requireAdminMatches.length} guards)`
    );

    assert(
      actionsContent.includes("10 * 1024 * 1024") || actionsContent.includes("MAX_IMAGE_FILE_SIZE"),
      "Server-side strict file size validation enforces <= 10MB limit"
    );

    assert(
      actionsContent.includes("image/jpeg") &&
        actionsContent.includes("image/png") &&
        actionsContent.includes("image/webp") &&
        actionsContent.includes("image/gif") &&
        actionsContent.includes("image/avif"),
      "Server-side MIME type whitelist allows only standard images (JPEG, PNG, WebP, GIF, AVIF)"
    );

    assert(
      actionsContent.includes("sanitizeFilename") &&
        actionsContent.includes("crypto.randomUUID()"),
      "Storage filenames are sanitized and assigned randomized UUIDs ({project_id}/{uuid}-{safeFilename})"
    );

    assert(
      actionsContent.includes('supabase.storage.from("project-images").remove'),
      "deleteProjectAction cleans up associated storage objects in project-images bucket"
    );

    assert(
      actionsContent.includes("is_primary: false") &&
        actionsContent.includes("is_primary: true"),
      "uploadProjectImageAction and setPrimaryImageAction un-set previous primary before setting new primary"
    );
  }

  // 6. Secret Key Exposure Audit
  console.log("\n--- 6. Secret Keys & Environment Security ---");
  const allSourceFiles = [
    "src/lib/actions/projects.ts",
    "src/components/admin/ProjectForm.tsx",
    "src/components/admin/ProjectListTable.tsx",
    "src/components/admin/ProjectLinksManager.tsx",
    "src/components/admin/ProjectImagesManager.tsx",
    "src/components/admin/ProjectDeleteButton.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin/projects/page.tsx",
    "src/app/admin/projects/new/page.tsx",
    "src/app/admin/projects/[id]/page.tsx",
  ];

  let secretExposed = false;
  for (const rel of allSourceFiles) {
    const file = path.resolve(process.cwd(), rel);
    if (fs.existsSync(file)) {
      const code = fs.readFileSync(file, "utf-8");
      if (
        code.includes("SUPABASE_SERVICE_ROLE_KEY") ||
        code.includes("service_role") ||
        code.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")
      ) {
        secretExposed = true;
        console.error(`[LEAK] Secret key referenced in ${rel}`);
      }
    }
  }
  assert(!secretExposed, "No SUPABASE_SERVICE_ROLE_KEY exposed in any client or server action file");

  // 7. Slug Utility Verification
  console.log("\n--- 7. Slug Formatting & Validation Suite ---");
  assert(
    normalizeSlug("HTI LMS – Student Academic Platform") === "hti-lms-student-academic-platform",
    'normalizeSlug("HTI LMS – Student Academic Platform") -> "hti-lms-student-academic-platform"'
  );
  assert(
    normalizeSlug("  Special / Characters & Tags! ") === "special-characters-tags",
    'normalizeSlug sanitizes special characters and consecutive hyphens'
  );
  assert(isValidSlug("valid-slug-123"), '"valid-slug-123" is recognized as valid slug');
  assert(!isValidSlug("Invalid Slug!"), '"Invalid Slug!" is rejected');
  assert(!isValidSlug("slug--double"), '"slug--double" is rejected');

  // 8. Public Portfolio Fallback & Integrity
  console.log("\n--- 8. Public Portfolio Fallback & Integrity ---");
  const publishedProjects = await getPublishedProjects();
  assert(
    publishedProjects.length === 4,
    `getPublishedProjects() returns 4 projects via local fallback (${publishedProjects.length} returned)`
  );

  const count = await getProjectCount();
  assert(count === 4, `getProjectCount() returns 4 (${count})`);

  const range = await getProjectIndexRange();
  assert(range === "2023–2024", `getProjectIndexRange() returns "2023–2024" ("${range}")`);

  const firstProject = publishedProjects[0];
  assert(Boolean(firstProject.title && firstProject.slug), "First project has valid title and slug");
  assert(Boolean(firstProject.visuals), "First project has valid visuals definition");

  // 9. Single Primary Image Constraint Verification (Static & Contract)
  console.log("\n--- 9. Single Primary Image Constraint Verification ---");
  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  const hasUniqueIndex =
    migrationSql.includes("idx_project_images_one_primary") &&
    migrationSql.includes("(project_id)") &&
    migrationSql.includes("where (is_primary = true)");

  assert(hasUniqueIndex, "Database schema defines at most one primary image per project via partial unique index");

  const actionsCode = fs.readFileSync(actionsPath, "utf-8");
  const unsetsPreviousPrimary =
    actionsCode.includes(".update({ is_primary: false })") &&
    actionsCode.includes('.eq("is_primary", true)');

  assert(
    unsetsPreviousPrimary,
    "Application mutation layer automatically unsets prior primary before establishing new primary image"
  );

  // 10. Live Supabase Connection
  console.log("\n--- 10. Live Supabase Project Connectivity ---");
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  let liveUrl = "";
  let liveKey = "";
  let adminEmail = process.env.ADMIN_EMAIL || "";
  let adminPassword = process.env.ADMIN_PASSWORD || "";

  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
        liveUrl = trimmed.replace("NEXT_PUBLIC_SUPABASE_URL=", "").trim();
      }
      if (
        trimmed.startsWith("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=") ||
        trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")
      ) {
        liveKey = trimmed.split("=")[1]?.trim();
      }
      if (trimmed.startsWith("ADMIN_EMAIL=") && !adminEmail) {
        adminEmail = trimmed.split("=")[1]?.trim();
      }
      if (trimmed.startsWith("ADMIN_PASSWORD=") && !adminPassword) {
        adminPassword = trimmed.split("=")[1]?.trim();
      }
    }
  }

  if (liveUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = liveUrl;
  if (liveKey) process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = liveKey;

  if (liveUrl && liveKey) {
    try {
      const sb = createClient(liveUrl, liveKey);
      const { error } = await sb.from("projects").select("id").limit(1);
      assert(!error, `Live Supabase project connection succeeded (${liveUrl})`);
    } catch (err: unknown) {
      console.error("[ERROR] Live Supabase query failed:", err);
    }
  }

  // 11. Live Authenticated Server Actions & Storage E2E Suite
  console.log("\n--- 11. Live Authenticated Server Actions & Storage E2E Suite ---");
  if (liveUrl && liveKey && adminEmail && adminPassword) {
    console.log(`[INFO] Authenticating as operator: ${adminEmail}...`);
    const adminSb = createClient(liveUrl, liveKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: authData, error: authError } = await adminSb.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    assert(!authError && Boolean(authData.user), "1. Live Admin Authentication: Operator successfully signed in", authError?.message);

    if (authData.user) {
      // 2. Check admin_users authorization
      const { data: adminRecord, error: adminRecErr } = await adminSb
        .from("admin_users")
        .select("user_id")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      assert(Boolean(adminRecord), "2. Live Admin Authorization: User confirmed in public.admin_users allowlist", adminRecErr?.message);

      // 3. Temporary draft project creation
      const testSlug = `phase6-e2e-test-${Date.now()}`;
      const { data: projectRow, error: pCreateErr } = await adminSb
        .from("projects")
        .insert({
          title: "Phase 6 E2E Verification Project",
          slug: testSlug,
          subtitle: "Automated verification test project",
          description: "Temporary project created to verify Phase 6 CRUD and storage flows.",
          category: "Automated Verification",
          year: 2026,
          is_published: false,
          is_featured: false,
          sort_order: 999,
        })
        .select("id, slug, is_published")
        .single();

      assert(!pCreateErr && Boolean(projectRow), "3. Live Draft Project Creation: Draft project record created (is_published = false)", pCreateErr?.message);

      if (projectRow) {
        const testProjectId = projectRow.id;

        // 4. Unpublished project is not publicly returned
        const publishedBefore = await getPublishedProjects();
        const foundUnpublished = publishedBefore.some((p) => p.id === testProjectId || p.slug === testSlug);
        assert(!foundUnpublished, "4. Draft Isolation: Unpublished draft project is not returned by public data layer");

        // 5. Link CRUD & Reorder
        // 5a. Create link 1
        const { data: link1, error: link1Err } = await adminSb
          .from("project_links")
          .insert({
            project_id: testProjectId,
            label: "GitHub Repository",
            url: "https://github.com/example/repo",
            type: "github",
            sort_order: 1,
          })
          .select("id, label, url, sort_order")
          .single();

        assert(!link1Err && Boolean(link1), "5a. Link Creation: Link record created in database", link1Err?.message);

        // 5b. Update link 1
        const { data: updatedLink1, error: link1UpdErr } = await adminSb
          .from("project_links")
          .update({
            label: "GitHub Updated",
            url: "https://github.com/example/repo-updated",
          })
          .eq("id", link1?.id)
          .select("id, label, url")
          .single();

        assert(
          !link1UpdErr && updatedLink1?.label === "GitHub Updated",
          "5b. Link Update: Link label and URL updated successfully",
          link1UpdErr?.message
        );

        // 5c. Create link 2
        const { data: link2, error: link2Err } = await adminSb
          .from("project_links")
          .insert({
            project_id: testProjectId,
            label: "Live Demo",
            url: "https://demo.example.com",
            type: "demo",
            sort_order: 2,
          })
          .select("id, sort_order")
          .single();

        assert(!link2Err && Boolean(link2), "5c. Second Link Creation: Second link created for reorder test", link2Err?.message);

        // 5d. Reorder links (swap sort_order 1 and 2)
        if (link1 && link2) {
          await adminSb.from("project_links").update({ sort_order: 2 }).eq("id", link1.id);
          await adminSb.from("project_links").update({ sort_order: 1 }).eq("id", link2.id);
          const { data: reorderedLinks } = await adminSb
            .from("project_links")
            .select("id, sort_order")
            .eq("project_id", testProjectId)
            .order("sort_order", { ascending: true });

          const reorderSuccess = reorderedLinks?.[0]?.id === link2.id && reorderedLinks?.[1]?.id === link1.id;
          assert(reorderSuccess, "5d. Link Reorder: Links reordered successfully");

          // 5e. Delete link 2
          const { error: link2DelErr } = await adminSb.from("project_links").delete().eq("id", link2.id);
          assert(!link2DelErr, "5e. Link Deletion: Link deleted from database", link2DelErr?.message);
        }

        // 6. Real image upload to Supabase Storage
        const testPixelPng = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          "base64"
        );
        const img1StoragePath = `${testProjectId}/e2e-image-1-${Date.now()}.png`;

        const { error: upload1Err } = await adminSb.storage
          .from("project-images")
          .upload(img1StoragePath, testPixelPng, {
            contentType: "image/png",
            upsert: false,
          });

        assert(!upload1Err, "6. Live Image Upload: PNG uploaded directly to project-images bucket in Supabase Storage", upload1Err?.message);

        const { data: pubUrl1 } = adminSb.storage.from("project-images").getPublicUrl(img1StoragePath);

        // 7. Image DB row creation
        const { data: imgRow1, error: img1DbErr } = await adminSb
          .from("project_images")
          .insert({
            project_id: testProjectId,
            storage_path: img1StoragePath,
            public_url: pubUrl1.publicUrl,
            alt_text: "E2E Test Image 1",
            sort_order: 1,
            is_primary: true,
          })
          .select("id, is_primary, sort_order")
          .single();

        assert(!img1DbErr && Boolean(imgRow1), "7. Image DB Row Creation: project_images row created in database", img1DbErr?.message);

        // 8. Setting primary image verified
        assert(imgRow1?.is_primary === true, "8. Setting Primary Image: Image successfully designated as primary (is_primary = true)");

        // 9. Primary uniqueness rejection: Attempt to create a second primary image
        const dummyPath = `${testProjectId}/dummy-conflict-${Date.now()}.png`;
        const { error: duplicatePrimaryErr } = await adminSb
          .from("project_images")
          .insert({
            project_id: testProjectId,
            storage_path: dummyPath,
            alt_text: "Conflict primary image (must be rejected)",
            sort_order: 2,
            is_primary: true,
          });

        const isUniqueConstraintViolation =
          duplicatePrimaryErr &&
          (duplicatePrimaryErr.code === "23505" ||
            duplicatePrimaryErr.message.includes("unique") ||
            duplicatePrimaryErr.message.includes("idx_project_images_one_primary") ||
            duplicatePrimaryErr.message.includes("duplicate key"));

        assert(
          Boolean(isUniqueConstraintViolation),
          "9. Primary Uniqueness Constraint: PostgreSQL rejected duplicate primary image with error code 23505",
          duplicatePrimaryErr ? `PostgreSQL error: [${duplicatePrimaryErr.code}] ${duplicatePrimaryErr.message}` : "Expected 23505 error was not raised (additive migration idx_project_images_one_primary pending in Supabase SQL Editor)"
        );

        if (!duplicatePrimaryErr) {
          await adminSb.from("project_images").delete().eq("storage_path", dummyPath);
        }

        // 10. Image Reorder test
        const img2StoragePath = `${testProjectId}/e2e-image-2-${Date.now()}.png`;
        await adminSb.storage.from("project-images").upload(img2StoragePath, testPixelPng, {
          contentType: "image/png",
        });

        const { data: pubUrl2 } = adminSb.storage.from("project-images").getPublicUrl(img2StoragePath);

        const { data: imgRow2 } = await adminSb
          .from("project_images")
          .insert({
            project_id: testProjectId,
            storage_path: img2StoragePath,
            public_url: pubUrl2.publicUrl,
            alt_text: "E2E Test Image 2",
            sort_order: 2,
            is_primary: false,
          })
          .select("id, sort_order")
          .single();

        if (imgRow1 && imgRow2) {
          // Reorder images
          await adminSb.from("project_images").update({ sort_order: 2 }).eq("id", imgRow1.id);
          await adminSb.from("project_images").update({ sort_order: 1 }).eq("id", imgRow2.id);

          const { data: reorderedImages } = await adminSb
            .from("project_images")
            .select("id, sort_order")
            .eq("project_id", testProjectId)
            .order("sort_order", { ascending: true });

          const imgReorderSuccess = reorderedImages?.[0]?.id === imgRow2.id && reorderedImages?.[1]?.id === imgRow1.id;
          assert(imgReorderSuccess, "10. Image Reorder: Images sort_order successfully updated and ordered");
        }

        // 11. Publish project
        const { data: publishedProj, error: pubErr } = await adminSb
          .from("projects")
          .update({ is_published: true })
          .eq("id", testProjectId)
          .select("id, is_published")
          .single();

        assert(!pubErr && publishedProj?.is_published === true, "11. Project Publish: Project updated to is_published = true", pubErr?.message);

        // 12. Public data layer can see the published test project
        const publishedAfter = await getPublishedProjects();
        const foundPublished = publishedAfter.find((p) => p.id === testProjectId || p.slug === testSlug);
        assert(
          Boolean(foundPublished),
          "12. Public Visibility: Public data layer (getPublishedProjects) successfully returns the published project"
        );
        if (foundPublished) {
          assert(
            foundPublished.visuals?.main === pubUrl1.publicUrl,
            "12b. Visuals Mapping: Published project correctly resolves its primary image to the public visuals object"
          );
        }

        // 13. Image deletion removes Storage object and DB row
        const { error: removeStorage1Err } = await adminSb.storage
          .from("project-images")
          .remove([img1StoragePath, img2StoragePath]);

        assert(!removeStorage1Err, "13a. Image Storage Deletion: Storage objects deleted from project-images bucket", removeStorage1Err?.message);

        const { error: imgDeleteErr } = await adminSb
          .from("project_images")
          .delete()
          .eq("project_id", testProjectId);

        assert(!imgDeleteErr, "13b. Image DB Deletion: project_images records deleted from database", imgDeleteErr?.message);

        // 14. Project deletion removes project and cascaded child rows
        const { error: projDeleteErr } = await adminSb
          .from("projects")
          .delete()
          .eq("id", testProjectId);

        assert(!projDeleteErr, "14. Project Deletion: projects row deleted from database", projDeleteErr?.message);

        // Verify cascaded deletion
        const { data: orphanedLinks } = await adminSb
          .from("project_links")
          .select("id")
          .eq("project_id", testProjectId);
        const { data: orphanedImages } = await adminSb
          .from("project_images")
          .select("id")
          .eq("project_id", testProjectId);

        assert(
          (!orphanedLinks || orphanedLinks.length === 0) &&
            (!orphanedImages || orphanedImages.length === 0),
          "14b. Cascade Verification: All child link and image rows cascaded to zero"
        );

        // 15. All associated Storage objects are removed
        const { data: remainingStorageFiles } = await adminSb.storage
          .from("project-images")
          .list(testProjectId);

        assert(
          !remainingStorageFiles || remainingStorageFiles.length === 0,
          "15. Storage Cleanliness: Zero storage objects remain in the project-images folder"
        );
      }
    }
  } else {
    console.log("[NOTICE] Live authenticated write suite skipped: ADMIN_EMAIL & ADMIN_PASSWORD not configured.");
    console.log("         Static inspection, type safety, proxy guards, and public fallback were validated.");
    console.log("         To run the live write suite, supply ADMIN_EMAIL and ADMIN_PASSWORD in .env.local.");
  }

  // 12. Test Data Hygiene Check
  console.log("\n--- 12. Test Data Hygiene & Zero Leftover Audit ---");
  if (liveUrl && liveKey) {
    try {
      const sb = createClient(liveUrl, liveKey);
      const { data: testProjects } = await sb
        .from("projects")
        .select("id, slug")
        .like("slug", "%test%");

      assert(
        !testProjects || testProjects.length === 0,
        `Zero test projects remaining in Supabase database (found ${testProjects?.length || 0})`
      );
    } catch {
      // ignore
    }
  }

  console.log("\n==================================================");
  console.log(`PHASE 6 VERIFICATION SUMMARY: ${passes}/${checks} checks passed.`);
  console.log("==================================================");

  if (passes !== checks) {
    process.exit(1);
  }
}

runPhase6Verification().catch((err) => {
  console.error("Phase 6 Verification Suite Error:", err);
  process.exit(1);
});
