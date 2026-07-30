import { loadDelivery } from "@/features/notifications/server";
import type { Metadata } from "next"

import { DeliverySettingsView } from "@/features/notifications";

export const metadata: Metadata = {
  title: "Delivery settings",
  robots: { index: false },
}

export default async function Page() {
  const settings = await loadDelivery()
  return <DeliverySettingsView settings={settings} />
}
