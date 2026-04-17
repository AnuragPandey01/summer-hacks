import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { store } from "@/lib/mockStore";

export default function Join() {
  const { code } = useParams();
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    const me = store.currentUser();
    if (!me) {
      sessionStorage.setItem("ss_pending_join", code);
      nav("/welcome", { replace: true });
      return;
    }
    const g = store.getGroupByCode(code);
    if (!g) { setError("This invite code doesn't exist."); return; }
    const joined = store.joinGroup(code);
    if (joined) nav(`/group/${joined.id}`, { replace: true });
  }, [code, nav]);

  return (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      {error ? (
        <div>
          <p className="font-display text-2xl font-bold">{error}</p>
          <button onClick={() => nav("/groups")} className="mt-3 underline">Go to your crews</button>
        </div>
      ) : (
        <p className="font-display text-2xl animate-pulse">Joining…</p>
      )}
    </div>
  );
}
