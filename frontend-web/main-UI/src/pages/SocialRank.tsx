import { useNavigate } from "react-router-dom";
import { store } from "@/lib/mockStore";
import { useStore } from "@/hooks/useStore";
import { PageHeader } from "@/components/screensplit/PageHeader";
import { BottomNav } from "@/components/screensplit/BottomNav";
import { Leaderboard } from "@/components/screensplit/Leaderboard";
import { AppCategoryBar } from "@/components/screensplit/AppCategoryBar";
import { TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";

export default function SocialRank() {
  const nav = useNavigate();
  const me = useStore(() => store.currentUser());
  const socialGroup = useStore(() => store.getSocialGroup());

  if (!me || !socialGroup) {
    nav("/welcome", { replace: true });
    return null;
  }

  const myUsage = store.usageFor(me.id);

  const onPokeJailed = (uid: string) => {
    const u = store.getUser(uid);
    toast(`💀 Roast sent to ${u?.name}`, {
      description: '"put the phone down 💀"',
      icon: <Zap className="h-4 w-4" />,
    });
  };

  const onVouch = (uid: string) => {
    // Vouching for social ranking might be tricky as there's no money,
    // but we can still show a toast or implement a mock logic.
    toast(`Vouched for ${store.getUser(uid)?.name}`, {
      description: "Moral support is always good! 🤝"
    });
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5">
        <PageHeader
          title="Social Rank"
          subtitle="Battle your friends for the lowest time"
          right={
            <span className="grid place-items-center h-9 w-9 rounded-full bg-primary/20 border-2 border-foreground text-primary">
              <TrendingUp className="h-4 w-4" />
            </span>
          }
        />

        {/* Your personal breakdown first as "Current Standing" */}
        {myUsage && (
          <section className="mt-4 chunky-card p-5 bg-card">
            <h2 className="font-display text-xl font-bold mb-4">Your usage</h2>
            <AppCategoryBar apps={myUsage.apps} />
            <div className="mt-4 pt-4 border-t-2 border-dashed border-foreground/10 flex justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Raw</p>
                    <p className="font-display text-lg font-bold">{myUsage.apps.reduce((s,a) => s + a.minutes, 0)}m</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Weighted Score</p>
                    <p className="font-display text-lg font-bold text-primary">
                        {Math.round(myUsage.apps.reduce((s,a) => s + a.minutes * (a.category === 'social' ? 2 : a.category === 'stream' ? 1.5 : a.category === 'productive' ? 0.5 : 1), 0))}m
                    </p>
                </div>
            </div>
          </section>
        )}

        {/* The Leaderboard */}
        <section className="mt-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl font-black">Elite Leaderboard</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lowest mins wins</p>
          </div>
          <Leaderboard 
            group={socialGroup} 
            meId={me.id} 
            onPokeJailed={onPokeJailed} 
            onVouch={onVouch} 
          />
        </section>

        {/* Tips / Creativity part */}
        <section className="mt-8 chunky-card p-4 bg-accent/20 border-2 border-dashed border-foreground/30 text-center">
            <p className="font-display font-medium text-sm italic">
                "Digital wellness is better with friends. Keep the streaks alive! 🧘‍♂️"
            </p>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
