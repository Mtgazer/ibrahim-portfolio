/*
  /admin/projects/[id] — edit existing project.

  Edit form for all project fields, image management, and link management
  will be implemented in Phase 5.
  Requires: Supabase (Phase 3), authentication (Phase 4).

  params — Promise resolving to { id: string } (project UUID).
  params is awaited here to satisfy Next.js 16 async params convention;
  the value is not used until Phase 5.
*/
export default async function AdminProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params; // resolved in Phase 5 when the edit form is implemented

  return (
    <main>
      {/* Edit project form — Phase 5 */}
    </main>
  );
}
