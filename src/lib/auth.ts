import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export interface AdminAuthResult {
  user: User | null;
  isAdmin: boolean;
}

/**
 * Retrieves the currently authenticated Supabase user using verified claims.
 * Returns null if not authenticated or Supabase is not configured.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Checks whether a given user ID exists in the public.admin_users allowlist.
 * Queries PostgreSQL directly using the security definer function or table RLS.
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  try {
    // 1. Try public.is_admin RPC function
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "is_admin"
    );
    if (!rpcError && typeof rpcResult === "boolean") {
      return rpcResult;
    }

    // 2. Query public.admin_users directly
    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return false;
    return (data as { user_id: string }).user_id === userId;
  } catch {
    return false;
  }
}

/**
 * Inspects both authentication and admin authorization without throwing redirects.
 */
export async function getAdminAuthStatus(): Promise<AdminAuthResult> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { user: null, isAdmin: false };
  }

  const isAdmin = await checkIsAdmin(user.id);
  return { user, isAdmin };
}

/**
 * Server-side guard for protected administrative routes.
 * Ensures that the requester is both:
 * 1. Authenticated with Supabase Auth (if not, redirects to /admin/login)
 * 2. Authorized as an administrator in public.admin_users (if not, redirects with unauthorized error)
 */
export async function requireAdmin(): Promise<User> {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/admin/login");
  }

  const isAdmin = await checkIsAdmin(user.id);
  if (!isAdmin) {
    redirect("/admin/login?error=unauthorized");
  }

  return user;
}
