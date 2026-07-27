/**
 * Role-aware notification destinations (MES-024 / MES-030).
 * Admin UI must never navigate to PublicUser `/account/*` routes.
 */

export type NotificationAudience = "admin" | "public";

const ADMIN_FALLBACK = "/dashboard/notifications/center";
const PUBLIC_FALLBACK = "/account/notifications";

/** Exact path remaps for Admin audience. */
const ACCOUNT_TO_DASHBOARD: Record<string, string> = {
  "/account": "/dashboard",
  "/account/notifications": "/dashboard/notifications/center",
  "/account/preferences": "/dashboard/notifications/preferences",
  "/account/hiring": "/dashboard/marketplace",
  "/account/work": "/dashboard/marketplace",
  "/account/marketplace": "/dashboard/marketplace",
  "/account/tools-marketplace": "/dashboard/marketplace",
  "/account/company": "/dashboard/marketplace",
  "/account/employer": "/dashboard/marketplace",
  "/account/creator": "/dashboard/marketplace",
  "/account/certificates": "/dashboard/certificates",
  "/account/community": "/dashboard/community",
  "/account/ai-tools": "/dashboard/ai-tools",
  "/account/guides": "/dashboard/guides",
  "/account/career": "/dashboard/marketplace",
};

/** Prefix remaps (longest match wins via ordered checks). */
const ACCOUNT_PREFIX_TO_DASHBOARD: Array<[string, string]> = [
  ["/account/hiring", "/dashboard/marketplace"],
  ["/account/work", "/dashboard/marketplace"],
  ["/account/marketplace", "/dashboard/marketplace"],
  ["/account/tools-marketplace", "/dashboard/marketplace"],
  ["/account/company", "/dashboard/marketplace"],
  ["/account/community", "/dashboard/community"],
  ["/account/certificates", "/dashboard/certificates"],
  ["/account/ai-tools", "/dashboard/ai-tools"],
  ["/account/guides", "/dashboard/guides"],
  ["/account/notifications", "/dashboard/notifications/center"],
  ["/account/preferences", "/dashboard/notifications/preferences"],
  ["/account", "/dashboard"],
];

const COMMUNITY_PUBLIC_PREFIX = "/community/";

function stripQueryAndHash(path: string): { path: string; suffix: string } {
  const hashIdx = path.indexOf("#");
  const queryIdx = path.indexOf("?");
  let cut = path.length;
  if (hashIdx >= 0) cut = Math.min(cut, hashIdx);
  if (queryIdx >= 0) cut = Math.min(cut, queryIdx);
  return { path: path.slice(0, cut), suffix: path.slice(cut) };
}

function mapAccountPathToDashboard(pathname: string): string {
  const exact = ACCOUNT_TO_DASHBOARD[pathname];
  if (exact) return exact;
  for (const [prefix, dest] of ACCOUNT_PREFIX_TO_DASHBOARD) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return dest;
    }
  }
  return ADMIN_FALLBACK;
}

/**
 * Resolve a stored notification link for the viewing audience.
 * Admin: always a `/dashboard/...` path (never `/account/...`).
 * Public: keep learner links; never rewrite into Admin dashboard.
 */
export function resolveNotificationLink(
  link: string | null | undefined,
  audience: NotificationAudience,
): string {
  const raw = (link ?? "").trim();
  if (!raw) {
    return audience === "admin" ? ADMIN_FALLBACK : PUBLIC_FALLBACK;
  }

  // Absolute URLs — leave alone for public; admin stays in-app.
  if (/^https?:\/\//i.test(raw)) {
    return audience === "admin" ? ADMIN_FALLBACK : raw;
  }

  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  const { path, suffix } = stripQueryAndHash(normalized);

  if (audience === "admin") {
    if (path.startsWith("/dashboard")) {
      return `${path}${suffix}`;
    }
    if (path.startsWith("/account")) {
      return mapAccountPathToDashboard(path);
    }
    if (path.startsWith(COMMUNITY_PUBLIC_PREFIX) || path === "/community") {
      return "/dashboard/community";
    }
    // Public verify / marketing paths are not Admin destinations.
    if (path.startsWith("/verify") || path.startsWith("/sign-")) {
      return ADMIN_FALLBACK;
    }
    // Any other non-dashboard path → safe Admin fallback
    return ADMIN_FALLBACK;
  }

  // Public audience: never send learners into /dashboard/*
  if (path.startsWith("/dashboard")) {
    return PUBLIC_FALLBACK;
  }
  return `${path}${suffix}`;
}

/** True when a path is safe for Admin notification navigation. */
export function isAdminNotificationLink(link: string | null | undefined): boolean {
  const resolved = resolveNotificationLink(link, "admin");
  return resolved.startsWith("/dashboard");
}
