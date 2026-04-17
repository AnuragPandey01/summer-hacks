import { useNavigate } from "react-router-dom";
import { store } from "@/lib/mockStore";
import { pb } from "@/lib/pocketbase";
import { useStore } from "@/hooks/useStore";
import { PageHeader } from "@/components/screensplit/PageHeader";
import { BottomNav } from "@/components/screensplit/BottomNav";
import { AppCategoryBar } from "@/components/screensplit/AppCategoryBar";
import { LogOut } from "lucide-react";

export default function Me() {
  const nav = useNavigate();
  const me = useStore(() => store.currentUser());
  const groups = useStore(() => store.groupsForCurrentUser());

  if (!me) { nav("/welcome", { replace: true }); return null; }
  const usage = store.usageFor(me.id);
  const totalOwed = groups.reduce((s, g) => {
    const r = store.rankedFor(g).find((x) => x.userId === me.id);
    return s + (r?.share ?? 0);
  }, 0);

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5">
        <PageHeader
          title="You"
          subtitle={me.email}
          right={
            <button
              onClick={() => {
                pb.authStore.clear();
                store.signOut();
                nav("/welcome", { replace: true });
              }}
              aria-label="Sign out"
              className="grid place-items-center h-9 w-9 rounded-full border-2 border-foreground bg-card"
            >
              <LogOut className="h-4 w-4" />
            </button>
          }
        />

        <div className="chunky-card-lg p-5 bg-gradient-cream text-center">
          <div className="text-5xl">{me.avatar}</div>
          <p className="mt-2 font-display text-2xl font-bold">{me.name}</p>
          <p className="text-xs text-muted-foreground">Across {groups.length} crews</p>
          <div className="mt-4 inline-block px-4 py-2 rounded-full bg-foreground text-background">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">You owe this week</p>
            <p className="font-display text-2xl font-bold">₹{totalOwed.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {usage && (
          <section className="mt-6 chunky-card p-4 bg-card">
            <h2 className="font-display text-xl font-bold mb-3">Your screen time</h2>
            <AppCategoryBar apps={usage.apps} />
            <ul className="mt-4 space-y-1.5">
              {[...usage.apps]
                .sort((a, b) => b.minutes - a.minutes)
                .slice(0, 6)
                .map((a) => (
                  <li key={a.appName} className="flex items-center justify-between text-sm">
                    <span>{a.appName}</span>
                    <span className="font-mono text-xs text-muted-foreground">{a.minutes}m</span>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
