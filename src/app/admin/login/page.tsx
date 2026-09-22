"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin/projects";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === "unauthorized"
      ? "ACCESS DENIED // This account is not listed in the authorized admin allowlist."
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!email.trim() || !password) {
      setErrorMessage("INPUT VALIDATION ERROR // Email and password are both required.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("AUTHENTICATION REJECTED // Invalid email or security credentials.");
        } else {
          setErrorMessage(`AUTHENTICATION ERROR // ${error.message}`);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check authorization directly
        const { data: adminRecord, error: adminError } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (adminError || !adminRecord) {
          // User authenticated with Supabase Auth, but NOT in admin_users allowlist
          await supabase.auth.signOut();
          setErrorMessage(
            "ACCESS DENIED // Identity verified, but account lacks administrative clearance."
          );
          setLoading(false);
          return;
        }

        // Successfully authenticated & authorized
        router.push(nextPath);
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to establish secure connection.";
      setErrorMessage(`SYSTEM ERROR // ${message}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-[#1F1F1F] bg-[#141414] p-8 sm:p-10">
      {/* Editorial Header */}
      <div className="border-b border-[#1F1F1F] pb-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] tracking-widest text-[#E5B842] uppercase">
            [SYS // AUTH-01]
          </span>
          <span className="font-mono text-[10px] tracking-widest text-[#707070] uppercase">
            CLEARANCE REQUIRED
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F3F3F3]">
          Admin Access Control
        </h1>
        <p className="font-mono text-xs text-[#9E9E9E] mt-1.5 leading-relaxed">
          Authorized personnel authentication portal. Single operator access.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 border border-[#E5B842]/40 bg-[#1A1A1A] font-mono text-xs text-[#E5B842] leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="admin-email"
            className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
          >
            Operator Email <span className="text-[#E5B842]">*</span>
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="operator@domain.com"
            className="w-full bg-[#0C0C0C] border border-[#222222] focus:border-[#E5B842] focus:outline-none text-[#F3F3F3] font-mono text-sm px-4 py-3 placeholder:text-[#555555] transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block font-mono text-xs text-[#9E9E9E] uppercase tracking-wider mb-2"
          >
            Passcode <span className="text-[#E5B842]">*</span>
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••••••"
            className="w-full bg-[#0C0C0C] border border-[#222222] focus:border-[#E5B842] focus:outline-none text-[#F3F3F3] font-mono text-sm px-4 py-3 placeholder:text-[#555555] transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E5B842] hover:bg-[#F0C44E] text-[#0C0C0C] font-mono text-xs font-bold uppercase tracking-wider py-3.5 px-6 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>AUTHENTICATING IDENTITY...</span>
            </>
          ) : (
            <span>AUTHENTICATE &amp; ENTER →</span>
          )}
        </button>
      </form>

      {/* Return to Portfolio */}
      <div className="mt-8 pt-6 border-t border-[#1F1F1F] flex items-center justify-between font-mono text-[11px] text-[#707070]">
        <Link
          href="/"
          className="hover:text-[#E5B842] transition-colors tracking-wider"
        >
          ← RETURN TO PUBLIC ARCHIVE
        </Link>
        <span>SECURE // TLS 1.3</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] text-[#F3F3F3] flex flex-col items-center justify-center p-4 sm:p-8">
      <Suspense
        fallback={
          <div className="font-mono text-xs text-[#707070] tracking-widest uppercase">
            INITIALIZING SECURITY GATEWAY...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
