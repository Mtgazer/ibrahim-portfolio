/**
 * Formats an ISO / SQL date string (YYYY-MM-DD) into editorial uppercase (e.g. "OCT 2024").
 * Safe for use in both Server and Client Components.
 */
export function formatNoteDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      if (!isNaN(year) && !isNaN(month)) {
        const d = new Date(Date.UTC(year, month - 1, 1));
        return d
          .toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          })
          .toUpperCase();
      }
    }
    return dateStr.toUpperCase();
  } catch {
    return String(dateStr).toUpperCase();
  }
}
