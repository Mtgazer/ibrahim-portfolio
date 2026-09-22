import { getAuthenticatedUser } from "@/lib/auth";
import SignOutButton from "@/components/admin/SignOutButton";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F3F3F3] flex flex-col">
      {/* Admin Editorial Header Bar — Only rendered when user has an active session */}
      {user && (
        <header className="border-b border-[#1F1F1F] bg-[#141414] px-4 sm:px-8 py-3 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/"
              className="font-mono text-xs text-[#E5B842] hover:underline tracking-wider"
            >
              [PUBLIC ARCHIVE]
            </Link>
            <span className="text-[#333333]">/</span>
            <span className="font-mono text-xs text-[#9E9E9E]">ADMIN CONTROL</span>
            <span className="font-mono text-[10px] bg-[#E5B842]/10 text-[#E5B842] border border-[#E5B842]/30 px-2 py-0.5 uppercase tracking-widest">
              [AUTHORIZED ADMIN]
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[#707070]">
              OP: <span className="text-[#F3F3F3]">{user.email}</span>
            </span>
            <SignOutButton />
          </div>
        </header>
      )}

      <div className="flex-1">{children}</div>
    </div>
  );
}
