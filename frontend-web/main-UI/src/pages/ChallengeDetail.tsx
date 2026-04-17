import { useParams, useNavigate } from "react-router-dom";
import { store } from "@/lib/mockStore";
import { useStore } from "@/hooks/useStore";
import { PageHeader } from "@/components/screensplit/PageHeader";
import { BottomNav } from "@/components/screensplit/BottomNav";
import { ChevronLeft, Info, Trophy, Users, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ChallengeDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const me = useStore(() => store.currentUser());
  const challenge = useStore(() => store.getChallenge(id!));

  if (!me || !challenge) {
    return (
      <div className="p-10 text-center">
         <p>Challenge not found</p>
         <button onClick={() => nav('/challenges')} className="mt-4 text-primary font-bold">Back to tasks</button>
      </div>
    );
  }

  const isJoined = challenge.participants.includes(me.id);

  const onJoin = () => {
    store.joinChallenge(challenge.id, me.id);
    toast.success("Joined Challenge! 🚀", {
      description: "You are now being tracked. Good luck!"
    });
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-5">
        <div className="pt-6">
           <button 
             onClick={() => nav('/challenges')}
             className="h-10 w-10 rounded-full border-2 border-foreground flex items-center justify-center bg-card shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-muted active:translate-y-0.5 transition-all"
           >
             <ChevronLeft className="h-5 w-5" />
           </button>
        </div>

        <div className="mt-8 text-center">
           <div className="h-24 w-24 rounded-[2rem] bg-card border-4 border-foreground mx-auto flex items-center justify-center text-5xl shadow-[6px_6px_0px_rgba(0,0,0,1)] animate-rise">
              {challenge.emoji}
           </div>
           <h1 className="mt-6 font-display font-black text-3xl leading-tight">{challenge.title}</h1>
           <div className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span className="px-2 py-0.5 rounded bg-foreground text-background">{challenge.category}</span>
              <span>•</span>
              <span>Starts Daily</span>
           </div>
        </div>

        {/* Info Block */}
        <section className="mt-10 space-y-4">
           <div className="chunky-card p-5 bg-card border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                 <Info className="h-4 w-4 text-primary" />
                 <h3 className="font-display font-black text-sm uppercase tracking-wider">Instructions</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                 "{challenge.description}"
              </p>
              <div className="mt-4 pt-4 border-t-2 border-dashed border-foreground/10 space-y-3">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-black uppercase text-muted-foreground tracking-widest">Requirement</span>
                    <span className="font-bold flex items-center gap-1"><Clock className="h-3 w-3" /> {challenge.requirement}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-black uppercase text-muted-foreground tracking-widest">Reward</span>
                    <span className="font-display font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{challenge.reward}</span>
                 </div>
              </div>
           </div>

           {!isJoined ? (
             <button 
               onClick={onJoin}
               className="w-full h-16 rounded-[1.2rem] bg-primary text-primary-foreground font-display font-black text-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
             >
               Accept Challenge
             </button>
           ) : (
             <div className="w-full h-16 rounded-[1.2rem] bg-teal-500 text-white flex items-center justify-center gap-2 font-display font-black text-lg shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="h-6 w-6" /> In Progress
             </div>
           )}
        </section>

        {/* Live Standings/Stats */}
        <section className="mt-12">
           <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display font-black text-xl tracking-tight">Active Pod Participants</h2>
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Real-time stats</span>
           </div>
           
           <div className="space-y-3">
              <ParticipantRow name="Arjun" status="failed" sub="Used Instagram (4m)" avatar="🐯" />
              <ParticipantRow name="Priya" status="success" sub="123m inactivity recorded" avatar="🦄" />
              <ParticipantRow name="You" status="active" sub="Currently tracking..." avatar={me.avatar} />
              <ParticipantRow name="Ishaani" status="active" sub="Last active 2h ago" avatar="🦋" />
           </div>
        </section>

        {/* Verification Logic Box */}
        <section className="mt-12 chunky-card p-5 bg-muted/30 border-2 border-foreground/10 text-center">
           <div className="h-10 w-10 rounded-full bg-white border-2 border-foreground grid place-items-center mx-auto mb-3">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
           </div>
           <h4 className="font-display font-black text-sm uppercase tracking-wider mb-1">How it works</h4>
           <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
              Detection is handled via ScreenSplit's background inactivity hook. We verify you haven't opened any restricted apps during your focus window. GPS inactivity confirms stationary phone placement.
           </p>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

function ParticipantRow({ name, status, sub, avatar }: { name: string, status: 'active' | 'success' | 'failed', sub: string, avatar: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border-2 border-foreground/5 bg-card">
       <div className="h-10 w-10 rounded-xl bg-muted border-2 border-foreground flex items-center justify-center text-xl shrink-0">
          {avatar}
       </div>
       <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm leading-none">{name}</p>
          <p className="text-[10px] font-medium text-muted-foreground mt-1 truncate">{sub}</p>
       </div>
       <div>
          {status === 'active' && <div className="h-6 px-2 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1 text-[9px] font-black uppercase"><Clock className="h-3 w-3" /> Live</div>}
          {status === 'success' && <div className="h-6 px-2 rounded-full bg-teal-100 text-teal-700 border border-teal-200 flex items-center gap-1 text-[9px] font-black uppercase"><CheckCircle2 className="h-3 w-3" /> Pass</div>}
          {status === 'failed' && <div className="h-6 px-2 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center gap-1 text-[9px] font-black uppercase"><AlertCircle className="h-3 w-3" /> Fail</div>}
       </div>
    </div>
  )
}
