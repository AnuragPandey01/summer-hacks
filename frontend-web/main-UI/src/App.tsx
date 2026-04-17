import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Welcome from "./pages/Welcome.tsx";
import Groups from "./pages/Groups.tsx";
import GroupDetail from "./pages/GroupDetail.tsx";
import Join from "./pages/Join.tsx";
import Me from "./pages/Me.tsx";
import LeaderboardPage from "./pages/LeaderboardPage.tsx";

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
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/join/:code" element={<Join />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/me" element={<Me />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
