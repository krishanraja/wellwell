import { Layout } from "@/components/wellwell/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Bell, Moon, Shield, LogOut, Sparkles, CreditCard, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Settings() {
  const { signOut, user } = useAuth();
  const { isPro, subscription, isLoading, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      refreshSubscription();
      navigate("/settings", { replace: true });
    }
  }, [searchParams]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/landing");
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Failed to open subscription management.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your WellWell experience.</p>
        </div>

        {/* Subscription Section */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">Subscription</h2>
          <div className="stoic-card">
            {isLoading ? (
              <div className="flex justify-center py-2"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : isPro ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">Unlimited access</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-1" />Manage</>}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Free Plan</p>
                    <p className="text-sm text-muted-foreground">Limited daily uses</p>
                  </div>
                </div>
                <Button variant="brand" size="sm" onClick={() => navigate("/pricing")}>
                  <Sparkles className="w-4 h-4 mr-1" />Upgrade
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">Account</h2>
          <div className="stoic-card">
            <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{user?.email}</p>
              <button onClick={() => navigate("/edit-profile")} className="text-sm text-primary hover:underline">Edit profile</button>
            </div>
          </div>
        </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "180ms" }}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">Preferences</h2>
          <div className="stoic-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div><p className="font-medium text-foreground">Notifications</p><p className="text-sm text-muted-foreground">Daily reminders</p></div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <div><p className="font-medium text-foreground">Dark Mode</p><p className="text-sm text-muted-foreground">Coming soon</p></div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} disabled />
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">Privacy</h2>
          <div className="stoic-card">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div><p className="font-medium text-foreground">Your data is private</p><p className="text-sm text-muted-foreground">We never share your reflections.</p></div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
          <Button variant="outline" size="lg" className="w-full text-destructive hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />Sign out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
