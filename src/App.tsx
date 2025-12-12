import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            <Route path="/decision" element={<ProtectedRoute><Decision /></ProtectedRoute>} />
            <Route path="/conflict" element={<ProtectedRoute><Conflict /></ProtectedRoute>} />
            <Route path="/weekly-reset" element={<ProtectedRoute><WeeklyReset /></ProtectedRoute>} />
            <Route path="/monthly-narrative" element={<ProtectedRoute><MonthlyNarrative /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
