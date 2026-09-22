"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={
        className ||
        "font-mono text-xs text-[#9E9E9E] hover:text-[#E5B842] border border-[#222222] hover:border-[#E5B842] px-3 py-1.5 transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer"
      }
    >
      {loading ? "TERMINATING..." : "[TERMINATE SESSION]"}
    </button>
  );
}
