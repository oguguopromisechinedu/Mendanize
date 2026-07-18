"use server";

/** Reports export/schedule are placeholders — no mutations yet (MES-023). */
export async function placeholderAnalyticsAction() {
  return {
    ok: false as const,
    message: "Export and scheduled reports are placeholders in this phase.",
  };
}
