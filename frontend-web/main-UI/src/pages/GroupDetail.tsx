import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { store } from "@/lib/mockStore";
import { useStore } from "@/hooks/useStore";
import { PageHeader } from "@/components/screensplit/PageHeader";
import { BottomNav } from "@/components/screensplit/BottomNav";
import { Leaderboard } from "@/components/screensplit/Leaderboard";
import { BillBreakdown } from "@/components/screensplit/BillBreakdown";
import { RedemptionPanel } from "@/components/screensplit/RedemptionPanel";
import { AppCategoryBar } from "@/components/screensplit/AppCategoryBar";
import { Share2, Pencil, Check, Zap } from "lucide-react";
import { toast } from "sonner";

export default function GroupDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const me = useStore(() => store.currentUser());
  const group = useStore(() => (id ? store.getGroup(id) : undefined));
  const [editingBill, setEditingBill] = useState(false);
  const [billDraft, setBillDraft] = useState("");

  if (!me) { nav("/welcome", { replace: true }); return null; }
  if (!group) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <p className="font-display text-2xl font-bold">Crew not found</p>
          <button onClick={() => nav("/groups")} className="mt-3 underline">Back to crews</button>
        </div>
      </div>
    );
  }

  const myUsage = store.usageFor(me.id);
  const inviteUrl = `${window.location.origin}/join/${group.inviteCode}`;

  const share = async () => {
    const text = `Join my ScreenSplit crew "${group.name}" ${group.emoji}\nCode: ${group.inviteCode}\n${inviteUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Join ${group.name}`, text, url: inviteUrl });
      } else {
        await navigator.clipboard.writeText(text);
        toast("Invite copied", { description: "Paste it into Gmail or anywhere." });
      }
    } catch { /* user cancelled */ }
  };

  const gmailShare = () => {
    const subject = encodeURIComponent(`Join my ScreenSplit crew: ${group.name}`);
    const body = encodeURIComponent(
      `Hey,\n\nJoin my ScreenSplit crew "${group.name}" ${group.emoji}.\n\nUse this code: ${group.inviteCode}\nor open: ${inviteUrl}\n\nLet's see who scrolls the most this week 👀`,
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, "_blank");
  };

  const saveBill = () => {
    const n = Number(billDraft);
    if (!n || n < 1) return toast.error("Enter a positive number");
    store.updateGroup(group.id, { bill: n });
    setEditingBill(false);
    toast("Bill updated");
  };

  const onPokeJailed = (uid: string) => {
    const u = store.getUser(uid);
    toast(`💀 Roast sent to ${u?.name}`, {
      description: '"put the phone down 💀"',
      icon: <Zap className="h-4 w-4" />,
    });
  };

  const onVouch = (uid: string) => {
    store.vouchHostage(group.id, uid);
    const u = store.getUser(uid);
    toast(`You vouched for ${u?.name}`, {
      description: "Their bill hostage is lifted. Costs you 0.2× score.",
    });
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5">
        <PageHeader
          back
          title={`${group.emoji} ${group.name}`}
          subtitle={`${group.memberIds.length} members · code ${group.inviteCode}`}
          right={
            <button
              onClick={share}
              aria-label="Share invite"
              className="grid place-items-center h-9 w-9 rounded-full border-2 border-foreground bg-accent hover:opacity-90"
            >
              <Share2 className="h-4 w-4" />
            </button>
          }
        />

        {/* Bill */}
        <div className="relative">
          <BillBreakdown group={group} />
          <button
            onClick={() => { setBillDraft(String(group.bill)); setEditingBill(true); }}
            className="absolute top-4 right-4 grid place-items-center h-8 w-8 rounded-full bg-card border-2 border-foreground/20 hover:bg-accent"
            aria-label="Edit bill"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>

        {editingBill && (
          <div className="mt-3 chunky-card p-3 bg-card flex items-center gap-2">
            <span className="font-display font-bold text-lg">₹</span>
            <input
              autoFocus
              type="number"
              value={billDraft}
              onChange={(e) => setBillDraft(e.target.value)}
              className="flex-1 bg-muted rounded-lg px-3 py-2 outline-none border-2 border-transparent focus:border-foreground"
            />
            <button
              onClick={saveBill}
              className="grid place-items-center h-9 w-9 rounded-full bg-primary text-primary-foreground"
            >
              <Check className="h-4 w-4" strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Invite via Gmail */}
        <div className="mt-4 chunky-card p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✉️</div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold leading-tight">Invite via Gmail</p>
              <p className="text-[11px] text-muted-foreground truncate">{inviteUrl}</p>
            </div>
            <button
              onClick={gmailShare}
              className="px-3 py-2 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-wider"
            >
              Send
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <section className="mt-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-xl font-bold">Leaderboard</h2>
            <p className="text-xs text-muted-foreground">Lowest screen time wins</p>
          </div>
          <Leaderboard group={group} meId={me.id} onPokeJailed={onPokeJailed} onVouch={onVouch} />
        </section>

        {/* My breakdown */}
        {myUsage && (
          <section className="mt-6 chunky-card p-4 bg-card">
            <h2 className="font-display text-xl font-bold mb-3">Your week</h2>
            <AppCategoryBar apps={myUsage.apps} />
          </section>
        )}

        {/* Redemption */}
        <section className="mt-6">
          <RedemptionPanel group={group} meId={me.id} />
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
