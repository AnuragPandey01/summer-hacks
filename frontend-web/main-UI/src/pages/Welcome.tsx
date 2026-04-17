import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "@/lib/mockStore";
import { Smartphone, Trophy, Lock } from "lucide-react";

export default function Welcome() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);

  const signIn = () => {
    setLoading(true);
    setTimeout(() => {
      store.signInWithGoogle({
        name: name || "You",
        email: email || `you+${Date.now()}@gmail.com`,
      });
      nav("/groups", { replace: true });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pt-12 pb-8 flex flex-col min-h-screen">
        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 self-start mb-6 px-3 py-1.5 rounded-full bg-foreground text-background text-[11px] font-bold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Beta · invite only
          </div>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight">
            Split the bill.<br />
            <span className="bg-accent px-2 -mx-1 inline-block rotate-[-1deg]">
              Pay your screens.
            </span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            Whoever doom-scrolled the most picks up the biggest tab.
            Friend-tested, science-adjacent, undeniably fair.
          </p>

          {/* Mini feature pills */}
          <div className="mt-8 grid grid-cols-3 gap-2">
            <Pill icon={<Smartphone className="h-4 w-4" />} label="Weighted apps" />
            <Pill icon={<Trophy className="h-4 w-4" />} label="Live ranks" />
            <Pill icon={<Lock className="h-4 w-4" />} label="Jail mode" />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 space-y-3">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-primary text-primary-foreground font-display font-bold text-lg py-4 rounded-[var(--radius)] border-2 border-foreground shadow-chunky-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <GoogleMark />
              Continue with Google
            </button>
          ) : (
            <div className="chunky-card p-4 space-y-3 bg-card">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aanya"
                  className="mt-1 w-full bg-muted rounded-xl px-3 py-2.5 text-sm border-2 border-transparent focus:border-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Gmail</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aanya@gmail.com"
                  className="mt-1 w-full bg-muted rounded-xl px-3 py-2.5 text-sm border-2 border-transparent focus:border-foreground outline-none"
                />
              </div>
              <button
                onClick={signIn}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-display font-bold py-3 rounded-xl border-2 border-foreground shadow-chunky hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <GoogleMark />
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          )}
          <p className="text-[11px] text-center text-muted-foreground leading-snug">
            Mock auth for prototype. Real Google OAuth lights up<br />when you enable Lovable Cloud.
          </p>
        </div>
      </div>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="chunky-card p-3 bg-card flex flex-col items-center gap-1 text-center">
      <span className="grid place-items-center h-8 w-8 rounded-full bg-accent">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">{label}</span>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12s4.2 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
