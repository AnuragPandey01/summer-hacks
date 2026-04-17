import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "@/lib/mockStore";
import { cn } from "@/lib/utils";
import { Smartphone, Trophy, Lock } from "lucide-react";

export default function Welcome() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [authMode, setAuthMode] = useState<"SIGN_IN" | "SIGN_UP">("SIGN_UP");


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
        <div className="mt-8">
          {!showForm ? (
            <button
              onClick={() => { setShowForm(true); setAuthMode("SIGN_UP"); }}
              className="w-full bg-foreground text-background font-display font-black text-xl py-5 rounded-[2rem] shadow-[0_8px_0_hsl(var(--foreground)/0.2)] hover:translate-y-[2px] hover:shadow-[0_6px_0_hsl(var(--foreground)/0.2)] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Get Started
            </button>
          ) : (
            <div className="chunky-card p-6 bg-card border-4 border-foreground animate-rise">
              <div className="flex bg-muted p-1 rounded-xl mb-6 border-2 border-foreground">
                <button 
                  onClick={() => setAuthMode("SIGN_UP")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
                    authMode === "SIGN_UP" ? "bg-foreground text-background" : "text-muted-foreground"
                  )}
                >
                  Join
                </button>
                <button 
                  onClick={() => setAuthMode("SIGN_IN")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
                    authMode === "SIGN_IN" ? "bg-foreground text-background" : "text-muted-foreground"
                  )}
                >
                  Enter
                </button>
              </div>

              <div className="space-y-4">
                {authMode === "SIGN_UP" && (
                    <div className="animate-scale">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Warrior Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Aanya"
                            className="mt-1.5 w-full bg-muted rounded-xl px-4 py-3.5 font-display font-bold border-2 border-foreground outline-none focus:ring-4 ring-primary/20"
                        />
                    </div>
                )}
                <div className="animate-scale">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aanya@gmail.com"
                    className="mt-1.5 w-full bg-muted rounded-xl px-4 py-3.5 font-display font-bold border-2 border-foreground outline-none focus:ring-4 ring-primary/20"
                  />
                </div>
                <div className="animate-scale">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Secret Key</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="mt-1.5 w-full bg-muted rounded-xl px-4 py-3.5 font-display font-bold border-2 border-foreground outline-none focus:ring-4 ring-primary/20"
                  />
                </div>
                <button
                  onClick={signIn}
                  disabled={loading}
                  className="w-full h-14 bg-primary text-primary-foreground font-display font-black text-lg py-3 rounded-2xl border-4 border-foreground shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all disabled:opacity-60 mt-2"
                >
                  {loading ? "Waking Up..." : authMode === "SIGN_UP" ? "Create Account" : "Access Hub"}
                </button>

                <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-foreground/10"></span></div>
                    <span className="relative bg-card px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">OR</span>
                </div>

                <button
                  onClick={signIn}
                  className="w-full bg-card hover:bg-muted text-foreground font-display font-bold py-3 px-4 rounded-xl border-2 border-foreground flex items-center justify-center gap-3 transition-colors"
                >
                  <GoogleMark />
                  <span className="text-sm">Continue with Google</span>
                </button>
              </div>
            </div>
          )}
          <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest mt-6">
            Privacy First · High Fidelity · Beta
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
