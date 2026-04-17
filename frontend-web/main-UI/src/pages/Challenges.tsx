import { useNavigate } from "react-router-dom";
import { store } from "@/lib/mockStore";
import { useStore } from "@/hooks/useStore";
import { PageHeader } from "@/components/screensplit/PageHeader";
import { BottomNav } from "@/components/screensplit/BottomNav";
import { Zap, Target, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Challenges() {
  const nav = useNavigate();
  const me = useStore(() => store.currentUser());
  const challenges = useStore(() => store.getGlobalChallenges());

  if (!me) {
    nav("/welcome", { replace: true });
    return null;
  }

  const individual = challenges.filter(c => c.type === 'individual');
  const group = challenges.filter(c => c.type === 'group');

  return (
    <div className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-5">
        <PageHeader
          title="Challenges"
          subtitle="Complete quests to lower your bill"
          right={
            <div className="h-9 w-9 rounded-full bg-accent border-2 border-foreground grid place-items-center">
               <Zap className="h-5 w-5 fill-current" />
            </div>
          }
        />

        {/* Individual Section */}
        <section className="mt-6">
          <SectionHeader icon={Target} title="Screen Sabbath" subtitle="Individual pledges" />
          <div className="space-y-4">
            {individual.map(c => (
              <ChallengeCard key={c.id} challenge={c} onClick={() => nav(`/challenge/${c.id}`)} />
            ))}
          </div>
        </section>

        {/* Group Section */}
        <section className="mt-10">
          <SectionHeader icon={Users} title="Group Pods" subtitle="Scale together" />
          <div className="space-y-4">
            {group.map(c => (
              <ChallengeCard key={c.id} challenge={c} onClick={() => nav(`/challenge/${c.id}`)} />
            ))}
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 px-1">
      <div className="h-10 w-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-display font-black text-lg leading-none">{title}</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, onClick }: { challenge: any, onClick: () => void }) {
  const isJoined = challenge.participants.includes(store.currentUser()?.id);

  return (
    <div 
      onClick={onClick}
      className={cn(
        "chunky-card p-5 cursor-pointer group transition-all active:scale-[0.98]",
        isJoined ? "bg-accent/5" : "bg-card"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-muted border-2 border-foreground flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
          {challenge.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-lg leading-tight truncate">{challenge.title}</h3>
            {isJoined && (
              <span className="bg-primary text-primary-foreground text-[8px] font-black uppercase px-1.5 py-0.5 rounded leading-none">Joined</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-1">{challenge.description}</p>
          
          <div className="mt-3 flex items-center gap-3">
             <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-black uppercase">
                {challenge.reward}
             </div>
             {challenge.type === 'group' && (
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                   <Users className="h-3 w-3" /> {challenge.participants.length} pod
                </div>
             )}
          </div>
        </div>
        <div className="h-10 w-10 rounded-full border-2 border-foreground grid place-items-center self-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
           <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
