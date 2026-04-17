import { store } from "@/lib/mockStore";
import type { Group } from "@/lib/mockStore";
import { cn } from "@/lib/utils";
import { Lock, Crown, Zap } from "lucide-react";

interface Props {
  group: Group;
  meId: string;
  onPokeJailed?: (userId: string) => void;
  onVouch?: (userId: string) => void;
}

const RANK_TONE = [
  "champ-glow bg-gradient-champ", // 1
  "border-2 border-foreground bg-card",
  "border-2 border-foreground bg-card",
];

export function Leaderboard({ group, meId, onPokeJailed, onVouch }: Props) {
  const ranked = store.rankedFor(group);
  const sorted = [...ranked].sort((a, b) => a.rank - b.rank);
  const lastRank = sorted.length;

  return (
    <ul className="space-y-3">
      {sorted.map((r) => {
        const user = store.getUser(r.userId);
        if (!user) return null;
        const isJailed = r.rank === lastRank && lastRank > 1;
        const isChamp = r.rank === 1;
        const isMe = r.userId === meId;
        const vouched = group.vouchedHostage === r.userId;

        return (
          <li
            key={r.userId}
            className={cn(
              "rounded-[var(--radius)] p-4 animate-rise",
              isJailed && !vouched
                ? "jail-glow bg-gradient-jail text-destructive-foreground"
                : isChamp
                  ? "champ-glow bg-gradient-champ"
                  : "chunky-card",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "grid place-items-center h-12 w-12 rounded-full border-2 border-foreground text-2xl shrink-0 bg-card",
                  isJailed && !vouched && "animate-wiggle",
                )}
              >
                {user.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-display font-bold truncate">
                    {user.name}
                    {isMe && <span className="text-xs ml-1 opacity-70">(you)</span>}
                  </span>
                  {isChamp && <Crown className="h-4 w-4" />}
                  {isJailed && !vouched && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-foreground text-background">
                      <Lock className="h-3 w-3" /> In Jail
                    </span>
                  )}
                  {vouched && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      Bailed out
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono opacity-80">
                  {Math.round(r.weighted)}m weighted · {Math.round(r.raw)}m raw
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  Rank {r.rank}
                </p>
                <p className="font-display text-xl font-bold leading-none">
                  ₹{r.share}
                </p>
                <p className="text-[10px] font-mono opacity-70 mt-0.5">
                  {r.multiplier}× share
                </p>
              </div>
            </div>

            {isJailed && !vouched && !isMe && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onPokeJailed?.(r.userId)}
                  className="flex-1 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-wider py-2 hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-1"
                >
                  <Zap className="h-3 w-3" /> Send roast
                </button>
                <button
                  onClick={() => onVouch?.(r.userId)}
                  className="flex-1 rounded-full bg-card text-foreground border-2 border-foreground text-xs font-bold uppercase tracking-wider py-2 hover:bg-accent transition-colors"
                >
                  Vouch (-0.2×)
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
