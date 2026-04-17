// Mock data layer backed by localStorage. Swap with Supabase later.
// Single export `store` with sync getters and a tiny pub/sub for re-renders.

import type { AppUsage, Category, MemberUsage } from "./rank";
import { rankGroup } from "./rank";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // emoji
  streak: number;
  badges: string[];
  analytics: { date: string; usageMinutes: number }[];
  friendIds: string[];
  bio: string;
  joinDate: string;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  inviteCode: string;
  bill: number;        // current week bill in INR
  memberIds: string[];
  vouchedHostage?: string | null; // userId currently bailed out
  challenges: Challenge[];
  sabbaths: Record<string, boolean>; // userId -> completed this week
}

export interface Challenge {
  id: string;
  title: string;
  emoji: string;
  endsAt: number;
  participants: string[]; // userIds in
  failed: string[];       // userIds who failed
  completed: string[];    // userIds who completed
}

export interface Usage {
  userId: string;
  apps: AppUsage[];
}

const KEY_USER = "ss_current_user";
const KEY_USERS = "ss_users";
const KEY_GROUPS = "ss_groups";
const KEY_USAGE = "ss_usage";

const AVATARS = ["🦊", "🐼", "🦄", "🐸", "🐯", "🐧", "🦉", "🐙"];

const cache = new Map<string, unknown>();

function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? (JSON.parse(raw) as T) : fallback;
    cache.set(key, value);
    return value;
  } catch {
    cache.set(key, fallback);
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  cache.set(key, value);
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function inviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function seedUsage(userId: string): Usage {
  // Random but seeded-ish usage for demo. Real version would import OS data.
  const bag: { name: string; cat: Category }[] = [
    { name: "Instagram", cat: "social" },
    { name: "Twitter", cat: "social" },
    { name: "Snapchat", cat: "social" },
    { name: "YouTube", cat: "stream" },
    { name: "Netflix", cat: "stream" },
    { name: "Reels", cat: "stream" },
    { name: "Maps", cat: "neutral" },
    { name: "Weather", cat: "neutral" },
    { name: "Notion", cat: "productive" },
    { name: "Duolingo", cat: "productive" },
  ];
  const apps: AppUsage[] = bag.map((b) => ({
    appName: b.name,
    category: b.cat,
    minutes: Math.floor(Math.random() * 90) + (b.cat === "social" ? 30 : 5),
  }));
  return { userId, apps };
}

export const store = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  // ---- Auth ----
  currentUser(): User | null {
    return read<User | null>(KEY_USER, null);
  },
  signInWithGoogle(opts?: { name?: string; email?: string }): User {
    const users = read<User[]>(KEY_USERS, []);
    const name = opts?.name?.trim() || "You";
    const email = opts?.email?.trim() || "you@gmail.com";
    let user = users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: uid("u"),
        name,
        email,
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        streak: Math.floor(Math.random() * 10),
        badges: ["Newbie"],
        analytics: Array.from({ length: 7 }).map((_, i) => ({
          date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
          usageMinutes: Math.floor(Math.random() * 180),
        })),
        friendIds: ["u_rahul_demo", "u_priya_demo"],
        bio: "Exploring the digital world, one minute at a time.",
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
      // Ensure these users exist in storage too
      users.push(user);

      write(KEY_USERS, users);
      // seed usage
      const allUsage = read<Usage[]>(KEY_USAGE, []);
      allUsage.push(seedUsage(user.id));
      write(KEY_USAGE, allUsage);
    }
    write(KEY_USER, user);
    emit();
    return user;
  },
  signOut() {
    localStorage.removeItem(KEY_USER);
    emit();
  },

  // ---- Users ----
  getUser(id: string): User | undefined {
    return read<User[]>(KEY_USERS, []).find((u) => u.id === id);
  },

  // ---- Groups ----
  groupsForCurrentUser(): Group[] {
    const me = this.currentUser();
    if (!me) return [];
    return read<Group[]>(KEY_GROUPS, []).filter((g) =>
      g.memberIds.includes(me.id),
    );
  },
  getGroup(id: string): Group | undefined {
    return read<Group[]>(KEY_GROUPS, []).find((g) => g.id === id);
  },
  getGroupByCode(code: string): Group | undefined {
    return read<Group[]>(KEY_GROUPS, []).find(
      (g) => g.inviteCode.toUpperCase() === code.toUpperCase(),
    );
  },
  createGroup(name: string, emoji: string, bill: number): Group {
    const me = this.currentUser();
    if (!me) throw new Error("not signed in");
    const groups = read<Group[]>(KEY_GROUPS, []);
    const friends: User[] = [
      { 
        id: uid("u"), 
        name: "Rahul", 
        email: "rahul@demo.app", 
        avatar: "🐼", 
        streak: 5, 
        badges: ["Consistent", "Early Bird"],
        analytics: Array.from({ length: 7 }).map((_, i) => ({
          date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
          usageMinutes: Math.floor(Math.random() * 120),
        })),
        friendIds: [],
        bio: "Trying to stay away from the scroll! 🧘‍♂️",
        joinDate: "January 2026",
      },
      { 
        id: uid("u"), 
        name: "Priya", 
        email: "priya@demo.app", 
        avatar: "🦄", 
        streak: 12, 
        badges: ["Legend", "Phone Free"],
        analytics: Array.from({ length: 7 }).map((_, i) => ({
          date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
          usageMinutes: Math.floor(Math.random() * 90),
        })),
        friendIds: [],
        bio: "Less screen, more life. ✨",
        joinDate: "December 2025",
      },
      { 
        id: uid("u"), 
        name: "Arjun", 
        email: "arjun@demo.app", 
        avatar: "🐯", 
        streak: 1, 
        badges: ["Starter"],
        analytics: Array.from({ length: 7 }).map((_, i) => ({
          date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
          usageMinutes: Math.floor(Math.random() * 240),
        })),
        friendIds: [],
        bio: "I just love reels and I can't stop. Help! 🤡",
        joinDate: "February 2026",
      },
    ];

    const allUsers = read<User[]>(KEY_USERS, []);
    friends.forEach((f) => allUsers.push(f));
    write(KEY_USERS, allUsers);
    const allUsage = read<Usage[]>(KEY_USAGE, []);
    friends.forEach((f) => allUsage.push(seedUsage(f.id)));
    write(KEY_USAGE, allUsage);

    // Auto-add these friends to user's friend list
    const meIdx = allUsers.findIndex(u => u.id === me.id);
    if (meIdx !== -1) {
      if (!allUsers[meIdx].friendIds) allUsers[meIdx].friendIds = [];
      friends.forEach(f => {
        if (!allUsers[meIdx].friendIds.includes(f.id)) {
          allUsers[meIdx].friendIds.push(f.id);
        }
      });
      write(KEY_USERS, allUsers);
      write(KEY_USER, allUsers[meIdx]);
    }

    const group: Group = {
      id: uid("g"),
      name,
      emoji,
      inviteCode: inviteCode(),
      bill,
      memberIds: [me.id, ...friends.map((f) => f.id)],
      vouchedHostage: null,
      challenges: [],
      sabbaths: {},
    };
    groups.push(group);
    write(KEY_GROUPS, groups);
    emit();
    return group;
  },
  getSocialGroup(): Group | undefined {
    const me = this.currentUser();
    if (!me) return undefined;
    const friendIds = me.friendIds || [];
    return {
      id: "social-group",
      name: "Social Rank",
      emoji: "🏆",
      inviteCode: "FRIENDS",
      bill: 0,
      memberIds: [me.id, ...friendIds],
      challenges: [],
      sabbaths: {},
    };
  },
  joinGroup(code: string): Group | null {

    const me = this.currentUser();
    if (!me) return null;
    const groups = read<Group[]>(KEY_GROUPS, []);
    const idx = groups.findIndex(
      (g) => g.inviteCode.toUpperCase() === code.toUpperCase(),
    );
    if (idx === -1) return null;
    if (!groups[idx].memberIds.includes(me.id)) {
      groups[idx].memberIds.push(me.id);
      // ensure usage exists
      const allUsage = read<Usage[]>(KEY_USAGE, []);
      if (!allUsage.find((u) => u.userId === me.id)) {
        allUsage.push(seedUsage(me.id));
        write(KEY_USAGE, allUsage);
      }
      write(KEY_GROUPS, groups);
      emit();
    }
    return groups[idx];
  },
  updateGroup(id: string, patch: Partial<Group>) {
    const groups = read<Group[]>(KEY_GROUPS, []);
    const i = groups.findIndex((g) => g.id === id);
    if (i === -1) return;
    groups[i] = { ...groups[i], ...patch };
    write(KEY_GROUPS, groups);
    emit();
  },

  // ---- Usage / Ranking ----
  usageFor(userId: string): Usage | undefined {
    return read<Usage[]>(KEY_USAGE, []).find((u) => u.userId === userId);
  },
  rankedFor(group: Group) {
    const usages: MemberUsage[] = group.memberIds.map((id) => {
      const u = this.usageFor(id);
      const sabbathDone = group.sabbaths[id];
      return {
        userId: id,
        apps: u?.apps ?? [],
        redemptionMultiplier: sabbathDone ? 0.7 : 1,
      };
    });
    return rankGroup(usages, group.bill);
  },

  // ---- Redemption ----
  toggleSabbath(groupId: string, userId: string) {
    const g = this.getGroup(groupId);
    if (!g) return;
    const next = { ...g.sabbaths, [userId]: !g.sabbaths[userId] };
    this.updateGroup(groupId, { sabbaths: next });
  },
  startChallenge(groupId: string, title: string, emoji: string, hours: number) {
    const g = this.getGroup(groupId);
    if (!g) return;
    const ch: Challenge = {
      id: uid("ch"),
      title,
      emoji,
      endsAt: Date.now() + hours * 3600_000,
      participants: [...g.memberIds],
      failed: [],
      completed: [],
    };
    this.updateGroup(groupId, { challenges: [...g.challenges, ch] });
  },
  resolveChallenge(groupId: string, challengeId: string, winnerIds: string[]) {
    const g = this.getGroup(groupId);
    if (!g) return;
    const challenges = g.challenges.map((c) => {
      if (c.id !== challengeId) return c;
      const failed = c.participants.filter((p) => !winnerIds.includes(p));
      return { ...c, completed: winnerIds, failed };
    });
    this.updateGroup(groupId, { challenges });
  },

  // ---- Social ----
  vouchHostage(groupId: string, userId: string) {
    this.updateGroup(groupId, { vouchedHostage: userId });
  },

  addFriend(email: string) {
    const me = this.currentUser();
    if (!me) return;
    const users = read<User[]>(KEY_USERS, []);
    const friend = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!friend) throw new Error("User not found");
    if (friend.id === me.id) throw new Error("Can't add yourself");
    
    const meIdx = users.findIndex(u => u.id === me.id);
    if (!users[meIdx].friendIds) users[meIdx].friendIds = [];
    if (users[meIdx].friendIds.includes(friend.id)) return;
    
    users[meIdx].friendIds.push(friend.id);
    write(KEY_USERS, users);
    
    // Update current user cache
    write(KEY_USER, users[meIdx]);
    emit();
  },
  
  friendsForCurrentUser(): User[] {
    const me = this.currentUser();
    if (!me) return [];
    const users = read<User[]>(KEY_USERS, []);
    const friendIds = me.friendIds || [];
    return users.filter(u => friendIds.includes(u.id));
  }
};

// Optional dev seeding: ensure storage is reachable.
try {
  if (typeof window !== "undefined") {
    read(KEY_GROUPS, []);
  }
} catch {
  // ignore
}
