import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <WifiOff className="h-12 w-12 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
      <p className="text-sm text-muted-foreground">
        Mendanize needs a connection for most features. If you&apos;ve read articles
        or guide lessons recently, sign in to your account to access them from your
        offline library.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline">
          <Link href="/account/offline">Offline library</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Try again</Link>
        </Button>
      </div>
    </div>
  );
}
