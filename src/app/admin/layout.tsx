/*
  Admin layout — wraps all /admin/* routes.

  Authentication, session checking, sidebar navigation, and
  logout controls will be implemented in Phase 4.
*/
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Admin shell UI — Phase 4 */}
      {children}
    </div>
  );
}
