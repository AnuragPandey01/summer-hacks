import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Join from "./pages/Join";
import Me from "./pages/Me";
import LeaderboardPage from "./pages/LeaderboardPage";
import Explore from "./pages/Explore";

import SocialRank from "./pages/SocialRank";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";




const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/group/:id" element={<GroupDetail />} />

          <Route path="/join/:code" element={<Join />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/social" element={<SocialRank />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenge/:id" element={<ChallengeDetail />} />
          <Route path="/me" element={<Me />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
