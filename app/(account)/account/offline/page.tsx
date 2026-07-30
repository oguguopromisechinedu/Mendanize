import { OfflineLibraryView } from "@/features/pwa/components/offline-library";

export const metadata = { title: "Offline library" };

export default function AccountOfflinePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Offline library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Articles and guide lessons you&apos;ve opened are saved here for offline reading.
        </p>
      </div>
      <OfflineLibraryView />
    </div>
  );
}
