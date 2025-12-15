import { Layout } from "@/components/wellwell/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Save, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Persona } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";

const personas = [
  { value: "strategist", label: "Strategist", description: "Keep me sharp" },
  { value: "monk", label: "Monk", description: "Keep me steady" },
  { value: "commander", label: "Commander", description: "Keep me decisive" },
  { value: "friend", label: "Friend", description: "Keep me grounded" },
];

const challenges = [
  { value: "conflict", label: "Conflict", description: "Handling difficult conversations" },
  { value: "pressure", label: "Pressure", description: "Managing stress and deadlines" },
  { value: "uncertainty", label: "Uncertainty", description: "Dealing with the unknown" },
  { value: "overwhelm", label: "Overwhelm", description: "Too many demands at once" },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { user, signOut } = useAuth();
  
  const [displayName, setDisplayName] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setSelectedPersona(profile.persona || "");
      setSelectedChallenges(profile.challenges || []);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        display_name: displayName || null,
        persona: (selectedPersona || null) as Persona | null,
        challenges: selectedChallenges,
      });
      navigate("/profile");
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  const toggleChallenge = (value: string) => {
    setSelectedChallenges(prev =>
      prev.includes(value)
        ? prev.filter(c => c !== value)
        : [...prev, value]
    );
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setIsDeleting(true);
    try {
      // Call edge function to delete account
      // This will cascade delete all user data due to ON DELETE CASCADE
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { userId: user.id }
      });

      if (error) {
        // If edge function doesn't exist yet, show helpful message
        console.error("Delete account error:", error);
        toast.error("Account deletion is not yet available. Please contact support to delete your account.");
        return;
      }

      toast.success("Account deleted successfully");
      await signOut();
      navigate("/landing");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account. Please contact support.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout scrollable={true}>
      <div className="space-y-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-up">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-muted-foreground text-sm">Customize your experience</p>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2 animate-fade-up" style={{ animationDelay: "50ms" }}>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Display Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="pl-10"
            />
          </div>
        </div>

        {/* Persona Selection */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Persona
          </label>
          <div className="grid grid-cols-2 gap-2">
            {personas.map((persona) => (
              <button
                key={persona.value}
                onClick={() => setSelectedPersona(persona.value)}
                className={cn(
                  "p-3 rounded-xl text-left transition-all",
                  selectedPersona === persona.value
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-muted border-2 border-transparent hover:bg-muted/80"
                )}
              >
                <p className="font-medium text-foreground">{persona.label}</p>
                <p className="text-xs text-muted-foreground">{persona.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Selection */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "150ms" }}>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Challenges (select any)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {challenges.map((challenge) => (
              <button
                key={challenge.value}
                onClick={() => toggleChallenge(challenge.value)}
                className={cn(
                  "p-3 rounded-xl text-left transition-all",
                  selectedChallenges.includes(challenge.value)
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-muted border-2 border-transparent hover:bg-muted/80"
                )}
              >
                <p className="font-medium text-foreground">{challenge.label}</p>
                <p className="text-xs text-muted-foreground">{challenge.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full"
            size="lg"
          >
            {isUpdating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Delete Account Section */}
        <div className="animate-fade-up pt-6 border-t border-border" style={{ animationDelay: "250ms" }}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                size="lg"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone. 
                  All your data, including your profile, events, and insights, will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Layout>
  );
}
