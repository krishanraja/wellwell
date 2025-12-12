import { Layout } from "@/components/wellwell/Layout";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User, Flame, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const streak = 7;
  const virtues = { courage: 65, temperance: 72, justice: 58, wisdom: 80 };

  return (
    <Layout>
      <div className="flex-1 flex flex-col gap-3">
        <div className="stoic-card-compact flex items-center gap-4 animate-fade-up">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-7 h-7 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-foreground truncate">{profile?.display_name || user?.email?.split("@")[0] || "Stoic"}</h1>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 animate-fade-up" style={{ animationDelay: "50ms" }}>
          <div className="stoic-card-compact text-center"><p className="text-xs text-muted-foreground mb-1">Persona</p><p className="font-display font-semibold text-foreground capitalize">{profile?.persona || "Strategist"}</p></div>
          <div className="stoic-card-compact text-center"><div className="flex items-center justify-center gap-1.5"><Flame className="w-4 h-4 text-coral" /><span className="font-display text-xl font-bold text-foreground">{streak}</span></div><p className="text-xs text-muted-foreground">day streak</p></div>
        </div>
        <div className="stoic-card-compact animate-fade-up" style={{ animationDelay: "100ms" }}><p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Virtue Balance</p><VirtueBar {...virtues} /></div>
        <div className="stoic-card-compact flex-1 min-h-0 overflow-hidden animate-fade-up" style={{ animationDelay: "150ms" }}><p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</p><div className="space-y-2 text-sm"><div className="flex items-center justify-between py-1.5 border-b border-border/50"><span className="text-foreground">Morning Pulse</span><span className="text-muted-foreground text-xs">Today</span></div><div className="flex items-center justify-between py-1.5 border-b border-border/50"><span className="text-foreground">Intervene</span><span className="text-muted-foreground text-xs">Yesterday</span></div><div className="flex items-center justify-between py-1.5"><span className="text-foreground">Decision Tool</span><span className="text-muted-foreground text-xs">2 days ago</span></div></div></div>
        <div className="grid grid-cols-2 gap-2 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Button variant="outline" size="lg" onClick={() => navigate("/settings")} className="w-full"><Settings className="w-4 h-4" />Settings</Button>
          <Button variant="outline" size="lg" onClick={async () => { await signOut(); navigate("/landing"); }} className="w-full text-coral hover:text-coral"><LogOut className="w-4 h-4" />Sign Out</Button>
        </div>
      </div>
    </Layout>
  );
}
