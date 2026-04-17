import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { store, User } from "@/lib/mockStore";
import { useStore } from "@/hooks/useStore";
import { PageHeader } from "@/components/screensplit/PageHeader";
import { BottomNav } from "@/components/screensplit/BottomNav";
import { UserPlus, Flame, Trophy, BarChart3, X, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UserProfileOverlay } from "@/components/screensplit/UserProfileOverlay";

export default function Groups() {

  const nav = useNavigate();
  const me = useStore(() => store.currentUser());
  const friends = useStore(() => store.friendsForCurrentUser());
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState("");

  if (!me) {
    nav("/welcome", { replace: true });
    return null;
  }

  const addFriend = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      store.addFriend(email);
      toast.success("Friend added!");
      setShowAdd(false);
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add friend");
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5">
        <PageHeader
          title="Friends"
          subtitle="Track your crew members"
          right={
            <button
              onClick={() => setShowAdd(true)}
              className="grid place-items-center h-9 w-9 rounded-full border-2 border-foreground bg-primary text-primary-foreground hover:bg-primary/90 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          }
        />

        <div className="mt-6 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                    placeholder="Search friends..." 
                    className="w-full bg-card border-2 border-foreground rounded-xl pl-10 pr-4 py-2.5 font-display font-medium outline-none focus:ring-2 ring-primary/20 transition-all"
                />
            </div>

          {friends.length === 0 ? (
            <div className="chunky-card p-8 bg-card text-center border-2 border-dashed border-foreground/20 mt-4">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-display font-bold text-lg">No friends yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add friends by email to track their screen time performance!
              </p>
              <button 
                onClick={() => setShowAdd(true)}
                className="mt-6 px-6 py-2 bg-foreground text-background font-display font-bold rounded-full hover:opacity-90"
              >
                Find Friends
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {friends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFriend(f)}
                  className="chunky-card p-4 bg-card hover:-translate-y-1 transition-all border-2 border-foreground flex items-center gap-4 text-left active:scale-[0.98]"
                >
                  <div className="h-14 w-14 rounded-full border-2 border-foreground bg-accent grid place-items-center text-3xl shrink-0">
                    {f.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-lg leading-tight truncate">{f.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {f.streak > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                          <Flame className="h-3 w-3 fill-current" /> {f.streak} Day Streak
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {f.badges.length} Badges
                      </span>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full border-2 border-foreground flex items-center justify-center opacity-20 group-hover:opacity-100 italic font-black text-xs">
                    i
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm bg-background border-4 border-foreground rounded-[2rem] p-6 animate-scale shadow-[8px_8px_0px_rgba(0,0,0,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl font-black mb-4">Add Friend</h2>
            <form onSubmit={addFriend} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Friend's Email</label>
                <input 
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@gmail.com" 
                    className="w-full mt-1.5 bg-muted border-2 border-foreground rounded-xl px-4 py-3 font-display font-bold outline-none focus:border-primary transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full h-12 bg-primary text-primary-foreground font-display font-black rounded-xl border-2 border-foreground shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Add Friend
              </button>
              <button 
                type="button"
                onClick={() => setShowAdd(false)}
                className="w-full text-sm font-bold text-muted-foreground underline"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedFriend && (
        <UserProfileOverlay 
          user={selectedFriend} 
          onClose={() => setSelectedFriend(null)} 
        />
      )}


      <BottomNav />
    </div>
  );
}
