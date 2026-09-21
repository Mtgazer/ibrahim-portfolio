import { redirect } from "next/navigation";

/*
  /admin — redirects to /admin/projects.
  The admin dashboard root has no content of its own.
*/
export default function AdminPage() {
  redirect("/admin/projects");
}
