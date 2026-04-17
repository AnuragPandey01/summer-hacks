import { Link, useLocation } from "react-router-dom";
import { Users, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/groups", icon: Users, label: "Groups" },
  { to: "/leaderboard", icon: Trophy, label: "Rank" },
  { to: "/me", icon: Sparkles, label: "Me" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-4 pb-3 pt-2">
        <div className="chunky-card flex items-center justify-around p-2 bg-card">
          {items.map((it) => {
            const active =
              pathname === it.to ||
              (it.to === "/groups" && pathname.startsWith("/group"));
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2.5} />
                <span className="text-[10px] font-display font-semibold uppercase tracking-wider">
                  {it.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
