import { pb } from "@/lib/pocketbase";
import type { User } from "@/lib/mockStore";
import type { AppUsage, Category } from "@/lib/rank";

export type UsageSnapshotDTO = {
  userId: string;
  apps: AppUsage[];
  updated?: string;
  reportDate?: string;
};

export type SocialUsageResponse = {
  reportDate: string;
  items: UsageSnapshotDTO[];
};

const ADMIN_HEADER = "X-Screen-Usage-Admin-Secret";

export function pbAuthRecordToUser(): User | null {
  const r = pb.authStore.record as
    | {
        id: string;
        email?: string;
        name?: string;
        avatar_emoji?: string;
        streak?: number;
        badges?: unknown;
        bio?: string;
        analytics?: User["analytics"];
        created?: string;
      }
    | null
    | undefined;
  if (!r?.id) return null;
  let joinDate = "—";
  if (r.created) {
    const t = new Date(r.created);
    if (!Number.isNaN(t.getTime())) {
      joinDate = t.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  }
  const badges = Array.isArray(r.badges)
    ? (r.badges as string[]).filter((x) => typeof x === "string")
    : [];
  const analytics =
    Array.isArray(r.analytics) && r.analytics.length > 0
      ? r.analytics
      : Array.from({ length: 7 }).map((_, i) => ({
          date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
          usageMinutes: 0,
        }));
  return {
    id: r.id,
    name: (r.name?.trim() || "You").trim(),
    email: String(r.email ?? ""),
    avatar: (r.avatar_emoji as string)?.trim() || "👤",
    streak: typeof r.streak === "number" ? r.streak : 0,
    badges,
    analytics,
    friendIds: [],
    bio: (r.bio as string)?.trim() || "",
    joinDate,
  };
}

export async function fetchSocialUsage(
  date?: string,
): Promise<SocialUsageResponse> {
  const q = date?.trim() ? `?date=${encodeURIComponent(date.trim())}` : "";
  return pb.send<SocialUsageResponse>(`/usage/social${q}`, { method: "GET" });
}

export async function upsertMyScreenUsage(body: {
  reportDate?: string;
  apps: AppUsage[];
  source?: string;
}): Promise<UsageSnapshotDTO> {
  return pb.send<UsageSnapshotDTO>("/usage/me", {
    method: "POST",
    body: {
      reportDate: body.reportDate,
      apps: body.apps.map((a) => ({
        appName: a.appName,
        category: a.category,
        minutes: a.minutes,
      })),
      source: body.source ?? "web",
    },
  });
}

export async function adminUpsertScreenUsage(opts: {
  adminSecret: string;
  userId: string;
  reportDate?: string;
  apps: AppUsage[];
  source?: string;
}): Promise<UsageSnapshotDTO> {
  return pb.send<UsageSnapshotDTO>("/usage/admin", {
    method: "POST",
    headers: { [ADMIN_HEADER]: opts.adminSecret },
    body: {
      userId: opts.userId.trim(),
      reportDate: opts.reportDate,
      apps: opts.apps.map((a) => ({
        appName: a.appName,
        category: a.category,
        minutes: a.minutes,
      })),
      source: opts.source ?? "admin_dashboard",
    },
  });
}

export const USAGE_CATEGORIES: { value: Category; label: string }[] = [
  { value: "social", label: "Social" },
  { value: "stream", label: "Stream" },
  { value: "neutral", label: "Neutral" },
  { value: "productive", label: "Productive" },
];
