import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/wellwell/ProtectedRoute";
import { ErrorBoundary } from "@/components/wellwell/ErrorBoundary";
import { SessionExpiredHandler } from "@/components/wellwell/SessionExpiredHandler";
import { AuthDebugPanel } from "@/components/dev/AuthDebugPanel";
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
import Trends from "./pages/Trends";
import DailyStancesLibrary from "./pages/DailyStancesLibrary";
import MeditationsLibrary from "./pages/MeditationsLibrary";
import WisdomLibrary from "./pages/WisdomLibrary";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once on failure
      retryDelay: 1000, // Wait 1 second between retries
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessionExpiredHandler />
          <AuthDebugPanel />
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                {/* Public SEO pages - no auth required */}
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticle />} />
                
                {/* Protected app routes */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/pulse" element={<ProtectedRoute><Pulse /></ProtectedRoute>} />
                <Route path="/intervene" element={<ProtectedRoute><Intervene /></ProtectedRoute>} />
                <Route path="/debrief" element={<ProtectedRoute><Debrief /></ProtectedRoute>} />
                <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/trends" element={<ProtectedRoute><Trends /></ProtectedRoute>} />
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
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
