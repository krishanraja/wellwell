import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/wellwell/Layout';
import { StoicCard, StoicCardHeader, StoicCardContent } from '@/components/wellwell/StoicCard';
import { VirtueBar } from '@/components/wellwell/VirtueBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useVirtueScores } from '@/hooks/useVirtueScores';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { 
  User, 
  Shield, 
  Target, 
  LogOut, 
  Edit2, 
  Check, 
  X,
  Clock,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import type { Persona } from '@/types/database';

const personas: { value: Persona; label: string; description: string }[] = [
  { value: 'strategist', label: 'The Strategist', description: 'Analytical and measured' },
  { value: 'monk', label: 'The Monk', description: 'Contemplative and patient' },
  { value: 'commander', label: 'The Commander', description: 'Direct and decisive' },
  { value: 'friend', label: 'The Friend', description: 'Warm and supportive' },
];

const toolIcons: Record<string, React.ReactNode> = {
  pulse: <Sun className="w-4 h-4 text-primary" />,
  intervene: <Zap className="w-4 h-4 text-amber-500" />,
  debrief: <Moon className="w-4 h-4 text-blue-400" />,
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, isLoading, isUpdating } = useProfile();
  const { scoresMap } = useVirtueScores();
  const { events } = useEvents();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const handleEdit = () => {
    setDisplayName(profile?.display_name || '');
    setSelectedPersona(profile?.persona || null);
    setIsEditing(true);
    logger.interaction('Profile edit started');
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        display_name: displayName || null,
        persona: selectedPersona,
      });
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
      logger.info('Profile updated successfully');
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Could not save your changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    logger.interaction('Sign out from profile');
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  // Get virtue scores for display
  const virtuesData = {
    courage: scoresMap.courage?.score || 50,
    temperance: scoresMap.temperance?.score || 50,
    justice: scoresMap.justice?.score || 50,
    wisdom: scoresMap.wisdom?.score || 50,
  };

  // Get recent events for activity feed
  const recentEvents = events.slice(0, 5);
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">Your Stoic journey</p>
          </div>
          
          {!isEditing ? (
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4" />
              </Button>
              <Button variant="brand" size="icon" onClick={handleSave} disabled={isUpdating}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <StoicCard className="animate-fade-up">
          <StoicCardHeader label="Profile" icon={<User className="w-4 h-4" />} />
          <StoicCardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Persona</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {personas.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setSelectedPersona(p.value)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedPersona === p.value
                            ? 'bg-primary/20 border border-primary'
                            : 'bg-secondary/50 border border-transparent hover:border-border'
                        }`}
                      >
                        <div className="font-medium text-sm">{p.label}</div>
                        <div className="text-xs text-muted-foreground">{p.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">
                      {profile?.display_name || 'Stoic Practitioner'}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                {profile?.persona && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {personas.find(p => p.value === profile.persona)?.label || 'Unknown Persona'}
                  </div>
                )}
                
                {profile?.challenges && profile.challenges.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Challenges</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.challenges.map((c) => (
                        <span key={c} className="px-2 py-1 bg-secondary rounded text-xs capitalize">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {profile?.goals && profile.goals.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.goals.map((g) => (
                        <span key={g} className="px-2 py-1 bg-secondary rounded text-xs capitalize">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </StoicCardContent>
        </StoicCard>

        {/* Virtue Scores */}
        <StoicCard className="animate-fade-up">
          <StoicCardHeader label="Virtue Balance" icon={<Shield className="w-4 h-4" />} />
          <StoicCardContent>
            <VirtueBar virtues={virtuesData} />
          </StoicCardContent>
        </StoicCard>

        {/* Recent Activity */}
        <StoicCard className="animate-fade-up">
          <StoicCardHeader label="Recent Activity" icon={<Clock className="w-4 h-4" />} />
          <StoicCardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="mt-0.5">
                      {toolIcons[event.tool_name] || <Target className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{event.tool_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {event.raw_input.slice(0, 60)}{event.raw_input.length > 60 ? '...' : ''}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(event.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activity yet. Start with a Morning Pulse!
              </p>
            )}
          </StoicCardContent>
        </StoicCard>

        {/* Sign Out */}
        <div className="animate-fade-up" style={{ animationDelay: '320ms' }}>
          <Button 
            variant="minimal" 
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
