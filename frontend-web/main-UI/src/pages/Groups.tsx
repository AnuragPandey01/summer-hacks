import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { store } from "@/lib/mockStore";
import { useStore } from "@/hooks/useStore";
import { PageHeader } from "@/components/screensplit/PageHeader";
import { BottomNav } from "@/components/screensplit/BottomNav";
import { Plus, LogOut, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

const EMOJIS = ["🍕", "🍣", "🌮", "🍜", "🍔", "☕", "🍺", "🥘"];

export default function Groups() {
  const nav = useNavigate();
  const me = useStore(() => store.currentUser());
  const groups = useStore(() => store.groupsForCurrentUser());
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍕");
  const [bill, setBill] = useState("2000");
  const [code, setCode] = useState("");

  if (!me) {
    nav("/welcome", { replace: true });
    return null;
  }

  const create = () => {
    if (!name.trim()) return toast.error("Group needs a name");
    const g = store.createGroup(name.trim(), emoji, Number(bill) || 2000);
    setShowCreate(false);
    setName("");
    nav(`/group/${g.id}`);
  };

  const join = () => {
    const g = store.joinGroup(code.trim());
    if (!g) return toast.error("No group with that code");
    setShowJoin(false);
    setCode("");
    nav(`/group/${g.id}`);
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5">
        <PageHeader
          title={`Hey ${me.name.split(" ")[0]} ${me.avatar}`}
          subtitle="Your crews"
          right={
            <button
              onClick={() => { store.signOut(); nav("/welcome"); }}
              aria-label="Sign out"
              className="grid place-items-center h-9 w-9 rounded-full border-2 border-foreground bg-card hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
            </button>
          }
        />

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="chunky-card p-4 bg-accent text-left hover:-translate-y-0.5 transition-transform"
          >
            <Plus className="h-5 w-5 mb-2" strokeWidth={2.5} />
            <p className="font-display font-bold">New crew</p>
            <p className="text-[11px] text-muted-foreground">Start a split</p>
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="chunky-card p-4 bg-card text-left hover:-translate-y-0.5 transition-transform"
          >
            <Users className="h-5 w-5 mb-2" strokeWidth={2.5} />
            <p className="font-display font-bold">Join with code</p>
            <p className="text-[11px] text-muted-foreground">Got a link?</p>
          </button>
        </div>

        {/* Groups list */}
        <div className="mt-6 space-y-3">
          <h2 className="font-display text-xl font-bold">Crews</h2>
          {groups.length === 0 && (
            <div className="chunky-card p-6 bg-card text-center">
              <Sparkles className="h-6 w-6 mx-auto mb-2" />
              <p className="font-display font-bold">No crews yet</p>
              <p className="text-sm text-muted-foreground">
                Spin up your first split — we'll seed it with 3 demo friends.
              </p>
            </div>
          )}
          {groups.map((g) => {
            const ranked = store.rankedFor(g);
            const me2 = ranked.find((r) => r.userId === me.id);
            return (
              <Link
                key={g.id}
                to={`/group/${g.id}`}
                className="block chunky-card p-4 bg-card hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold truncate">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.memberIds.length} members · ₹{g.bill.toLocaleString("en-IN")}
                    </p>
                  </div>
                  {me2 && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">You owe</p>
                      <p className="font-display font-bold text-lg leading-none">₹{me2.share}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sheets */}
      {showCreate && (
        <Sheet onClose={() => setShowCreate(false)} title="New crew">
          <div className="space-y-3">
            <Field label="Crew name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Friday Night" className="ssp-input" />
            </Field>
            <Field label="Vibe">
              <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`text-xl p-1.5 rounded-lg ${emoji === e ? "bg-accent" : "bg-muted"}`}
                  >{e}</button>
                ))}
              </div>
            </Field>
            <Field label="Bill (₹)">
              <input value={bill} onChange={(e) => setBill(e.target.value)} type="number" className="ssp-input" />
            </Field>
            <button onClick={create} className="ssp-btn">Create crew</button>
          </div>
        </Sheet>
      )}

      {showJoin && (
        <Sheet onClose={() => setShowJoin(false)} title="Join with code">
          <div className="space-y-3">
            <Field label="Invite code">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="ssp-input font-mono tracking-widest text-center text-lg"
              />
            </Field>
            <button onClick={join} className="ssp-btn">Join crew</button>
            <p className="text-[11px] text-center text-muted-foreground">
              Or paste a <code>/join/CODE</code> link in your browser.
            </p>
          </div>
        </Sheet>
      )}

      <BottomNav />

      {/* Local utility classes via tailwind */}
      <style>{`
        .ssp-input { width:100%; background:hsl(var(--muted)); border-radius:0.75rem; padding:0.625rem 0.75rem; font-size:0.875rem; border:2px solid transparent; outline:none; }
        .ssp-input:focus { border-color:hsl(var(--foreground)); }
        .ssp-btn { width:100%; background:hsl(var(--primary)); color:hsl(var(--primary-foreground)); font-family:'Space Grotesk',sans-serif; font-weight:700; padding:0.75rem; border-radius:0.875rem; border:2px solid hsl(var(--foreground)); box-shadow:var(--shadow-chunky); transition:transform .1s; }
        .ssp-btn:hover { transform:translate(2px,2px); box-shadow:none; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40" />
      <div
        className="relative w-full max-w-md bg-background border-t-2 border-foreground rounded-t-[var(--radius)] p-5 pb-8 animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-foreground/30 mb-3" />
        <h2 className="font-display text-2xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
