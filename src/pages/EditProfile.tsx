import { Layout } from "@/components/wellwell/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Save, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const personas = [
  { value: "strategist", label: "Strategist", description: "Analytical and planning-focused" },
  { value: "warrior", label: "Warrior", description: "Action-oriented and courageous" },
  { value: "sage", label: "Sage", description: "Reflective and wisdom-seeking" },
  { value: "guardian", label: "Guardian", description: "Protective and justice-driven" },
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
  
  const [displayName, setDisplayName] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

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
        persona: (selectedPersona || null) as any,
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
    <Layout>
      <div className="space-y-6">
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
      </div>
    </Layout>
  );
}
