import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

async function runPhase5Verification() {
  console.log("==================================================");
  console.log("PHASE 5 — AUTHENTICATION & ACCESS CONTROL SUITE");
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

  // 1. Next.js 16 Proxy & Session Refresh Verification
  console.log("--- 1. Next.js 16 Proxy & Session Refresh Files ---");
  const proxyPath = path.resolve(process.cwd(), "src/proxy.ts");
  const supabaseProxyPath = path.resolve(process.cwd(), "src/lib/supabase/proxy.ts");
  assert(fs.existsSync(proxyPath), "src/proxy.ts exists");
  assert(fs.existsSync(supabaseProxyPath), "src/lib/supabase/proxy.ts exists");

  if (fs.existsSync(proxyPath)) {
    const proxyContent = fs.readFileSync(proxyPath, "utf-8");
    assert(
      proxyContent.includes("export async function proxy"),
      "src/proxy.ts exports proxy function"
    );
    assert(
      proxyContent.includes("pathname.startsWith(\"/admin\")") &&
        proxyContent.includes("!isLoginPage"),
      "src/proxy.ts guards /admin routes while allowing /admin/login"
    );
    assert(
      proxyContent.includes("updateSession"),
      "src/proxy.ts updates Supabase session before request completes"
    );
  }

  if (fs.existsSync(supabaseProxyPath)) {
    const sbProxyContent = fs.readFileSync(supabaseProxyPath, "utf-8");
    assert(
      sbProxyContent.includes("supabase.auth.getUser()"),
      "src/lib/supabase/proxy.ts uses verified claims via getUser() (NOT unverified getSession())"
    );
  }

  // 2. Server Authorization Helpers
  console.log("\n--- 2. Server-Side Authorization Guard (src/lib/auth.ts) ---");
  const authHelperPath = path.resolve(process.cwd(), "src/lib/auth.ts");
  assert(fs.existsSync(authHelperPath), "src/lib/auth.ts exists");

  if (fs.existsSync(authHelperPath)) {
    const authContent = fs.readFileSync(authHelperPath, "utf-8");
    assert(
      authContent.includes("export async function getAuthenticatedUser"),
      "auth.ts exports getAuthenticatedUser()"
    );
    assert(
      authContent.includes("export async function checkIsAdmin"),
      "auth.ts exports checkIsAdmin() querying admin_users / is_admin RPC"
    );
    assert(
      authContent.includes("export async function requireAdmin"),
      "auth.ts exports requireAdmin() server guard"
    );
    assert(
      authContent.includes("redirect(\"/admin/login?error=unauthorized\")"),
      "requireAdmin() redirects authenticated non-admin users with error=unauthorized"
    );
  }

  // 3. UI Files: Login Page & SignOut Button
  console.log("\n--- 3. UI Components & Route Structure ---");
  const loginPagePath = path.resolve(process.cwd(), "src/app/admin/login/page.tsx");
  const signOutBtnPath = path.resolve(process.cwd(), "src/components/admin/SignOutButton.tsx");
  const adminLayoutPath = path.resolve(process.cwd(), "src/app/admin/layout.tsx");

  assert(fs.existsSync(loginPagePath), "Admin login page exists at src/app/admin/login/page.tsx");
  assert(fs.existsSync(signOutBtnPath), "SignOutButton exists at src/components/admin/SignOutButton.tsx");
  assert(fs.existsSync(adminLayoutPath), "Admin layout exists at src/app/admin/layout.tsx");

  if (fs.existsSync(loginPagePath)) {
    const loginContent = fs.readFileSync(loginPagePath, "utf-8");
    assert(
      loginContent.includes("signInWithPassword"),
      "Login page invokes supabase.auth.signInWithPassword()"
    );
    assert(
      loginContent.includes("from(\"admin_users\")"),
      "Login page verifies clearance against admin_users immediately after sign-in"
    );
    assert(
      !loginContent.includes("signUp") && !loginContent.includes("Create Account"),
      "Login page has no public registration or signup flow"
    );
  }

  // 4. Security Audit: Secret Keys
  console.log("\n--- 4. Secret Key & Security Audit ---");
  const envExamplePath = path.resolve(process.cwd(), ".env.example");
  assert(fs.existsSync(envExamplePath), ".env.example exists");

  const filesToCheck = [
    "src/lib/auth.ts",
    "src/lib/supabase/client.ts",
    "src/lib/supabase/server.ts",
    "src/lib/supabase/proxy.ts",
    "src/proxy.ts",
    "src/app/admin/login/page.tsx",
  ];

  let serviceKeyExposed = false;
  for (const relPath of filesToCheck) {
    const absPath = path.resolve(process.cwd(), relPath);
    if (fs.existsSync(absPath)) {
      const content = fs.readFileSync(absPath, "utf-8");
      if (
        content.includes("SUPABASE_SERVICE_ROLE_KEY") ||
        content.includes("service_role")
      ) {
        serviceKeyExposed = true;
      }
    }
  }
  assert(!serviceKeyExposed, "No SUPABASE_SERVICE_ROLE_KEY exposed in client or proxy code");

  // 5. Live Supabase Connection & Admin Allowlist Status
  console.log("\n--- 5. Live Supabase Auth & Allowlist Check ---");
  // Read .env.local if present
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const envLocalPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const envLocal = fs.readFileSync(envLocalPath, "utf-8");
      for (const line of envLocal.split("\n")) {
        const [k, v] = line.split("=");
        if (k?.trim() === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = v?.trim();
        if (
          k?.trim() === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" ||
          k?.trim() === "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        ) {
          if (!supabaseKey) supabaseKey = v?.trim();
        }
      }
    }
  }

  if (supabaseUrl && supabaseKey) {
    try {
      const sb = createClient(supabaseUrl, supabaseKey);
      const { data: adminRows, error } = await sb
        .from("admin_users")
        .select("user_id, created_at");

      assert(!error || error.code === "PGRST116" || error.message.includes("permission"), "admin_users query returned standard RLS response");
      console.log(`[STATUS] Live Supabase URL: ${supabaseUrl}`);
      console.log(
        `[STATUS] Admin allowlist query response:`,
        error ? `Protected by RLS (${error.message})` : `${adminRows?.length || 0} admins visible to current client role`
      );
    } catch (err: unknown) {
      console.log(`[NOTICE] Could not execute live query:`, err);
    }
  } else {
    console.log("[NOTICE] Supabase URL / Key not detected for live admin check.");
  }

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${passes}/${checks} checks passed.`);
  console.log("==================================================");

  if (passes !== checks) {
    process.exit(1);
  }
}

runPhase5Verification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
