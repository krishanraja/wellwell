import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/wellwell/ProtectedRoute";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Pulse from "./pages/Pulse";
import Intervene from "./pages/Intervene";
import Debrief from "./pages/Debrief";
import More from "./pages/More";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Decision from "./pages/Decision";
import Conflict from "./pages/Conflict";
import WeeklyReset from "./pages/WeeklyReset";
import MonthlyNarrative from "./pages/MonthlyNarrative";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Library from "./pages/Library";
import History from "./pages/History";
import EditProfile from "./pages/EditProfile";
import DailyStancesLibrary from "./pages/DailyStancesLibrary";
import MeditationsLibrary from "./pages/MeditationsLibrary";
import WisdomLibrary from "./pages/WisdomLibrary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/pulse" element={<ProtectedRoute><Pulse /></ProtectedRoute>} />
            <Route path="/intervene" element={<ProtectedRoute><Intervene /></ProtectedRoute>} />
            <Route path="/debrief" element={<ProtectedRoute><Debrief /></ProtectedRoute>} />
            <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/decision" element={<ProtectedRoute><Decision /></ProtectedRoute>} />
            <Route path="/conflict" element={<ProtectedRoute><Conflict /></ProtectedRoute>} />
            <Route path="/weekly-reset" element={<ProtectedRoute><WeeklyReset /></ProtectedRoute>} />
            <Route path="/monthly-narrative" element={<ProtectedRoute><MonthlyNarrative /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/library/stances" element={<ProtectedRoute><DailyStancesLibrary /></ProtectedRoute>} />
            <Route path="/library/meditations" element={<ProtectedRoute><MeditationsLibrary /></ProtectedRoute>} />
            <Route path="/library/wisdom" element={<ProtectedRoute><WisdomLibrary /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
