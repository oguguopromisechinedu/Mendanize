import type { Metadata } from "next";

import { getAdminSession } from "@/features/authentication/server";
import { loadAuthSettings, AuthSettingsView } from "@/features/platform-settings";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Authentication",
  robots: { index: false },
};

export default async function Page() {
  const settings = await loadAuthSettings();
  let totpEnabled = false;
  const session = await getAdminSession();
  if (session?.admin?.id && isDatabaseConfigured()) {
    const admin = await getPrisma().admin.findUnique({
      where: { id: session.admin.id },
      select: { totpEnabled: true },
    });
    totpEnabled = Boolean(admin?.totpEnabled);
  }
  return <AuthSettingsView settings={settings} totpEnabled={totpEnabled} />;
}
