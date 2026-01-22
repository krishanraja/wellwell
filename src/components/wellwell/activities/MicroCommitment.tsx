import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Send, Clock, Calendar, Target, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicroCommitmentProps {
  prompt: string;
  onComplete: (response: { commitment: string; timeframe: 'today' | 'this_week' | 'ongoing' }) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

const timeframes = [
  { value: 'today' as const, label: 'Today', icon: Clock, description: 'Just for today' },
  { value: 'this_week' as const, label: 'This Week', icon: Calendar, description: 'For the next 7 days' },
  { value: 'ongoing' as const, label: 'Ongoing', icon: Target, description: 'As a new practice' },
];

export function MicroCommitment({ prompt, onComplete, onSkip, isSubmitting }: MicroCommitmentProps) {
  const [commitment, setCommitment] = useState("");
  const [timeframe, setTimeframe] = useState<'today' | 'this_week' | 'ongoing'>('today');
  const [showTextInput, setShowTextInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Check for MediaRecorder support
  useEffect(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsSupported(false);
      setShowTextInput(true);
    }

    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/whisper-transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Transcription failed' }));
        throw new Error(errorData.error || `Transcription failed: ${res.status}`);
      }

      const data = await res.json();

      if (data?.text) {
        const newTranscript = commitment + (commitment ? " " : "") + data.text;
        setCommitment(newTranscript);
        return newTranscript;
      } else {
        throw new Error('No transcription received');
      }
    } catch (error: unknown) {
      console.error('Transcription error:', error);
      // Fall back to text input on error
      setShowTextInput(true);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, [commitment]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
          await transcribeAudio(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error: unknown) {
      console.error('Failed to start recording:', error);
      setShowTextInput(true);
    }
  }, [transcribeAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  const handleSubmit = () => {
    if (commitment.trim()) {
      onComplete({ commitment: commitment.trim(), timeframe });
    }
  };

  const suggestions = [
    "Take 3 mindful breaths before responding to stress",
    "Notice one moment of gratitude",
    "Let go of one thing I can't control",
    "Speak with patience in conversations",
    "Take a 5-minute walking break",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setCommitment(suggestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-5"
    >
      {/* Icon */}
      <motion.div 
        className="flex justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
      </motion.div>

      {/* Prompt */}
      <motion.h2 
        className="text-xl font-display font-semibold text-center text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {prompt}
      </motion.h2>

      {/* Voice-First Input or Text Fallback */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center"
      >
        {!showTextInput && isSupported && !commitment ? (
          // Voice-first interface (only show when no commitment yet)
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Large voice button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isSubmitting || isTranscribing}
              className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                isListening || isTranscribing
                  ? "bg-green-500 scale-110"
                  : "bg-muted/80 hover:bg-muted animate-breathe",
                (isSubmitting || isTranscribing) && "opacity-50 cursor-not-allowed"
              )}
              style={{
                boxShadow: isListening || isTranscribing 
                  ? '0 0 40px hsl(142 70% 45% / 0.5)' 
                  : undefined
              }}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {/* Outer glow ring when active */}
              {(isListening || isTranscribing) && (
                <>
                  <div className="absolute -inset-2 rounded-full border-2 border-green-500/30 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="absolute -inset-4 rounded-full border border-green-500/20 animate-pulse" />
                </>
              )}
              
              {isTranscribing ? (
                <Loader2 className="w-8 h-8 text-black animate-spin" />
              ) : (
                <Mic className={cn(
                  "w-8 h-8 transition-colors duration-300",
                  isListening ? "text-black" : "text-muted-foreground"
                )} />
              )}
            </button>

            {/* Status text */}
            <p className={cn(
              "text-sm font-medium transition-colors duration-300",
              isListening || isTranscribing ? "text-green-400" : "text-foreground"
            )}>
              {isTranscribing ? "Transcribing..." : isListening ? "I'm listening..." : "Tap to speak your commitment"}
            </p>

            {/* Type instead option */}
            {!isListening && (
              <button
                type="button"
                onClick={() => setShowTextInput(true)}
                className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
              >
                — or type instead —
              </button>
            )}

            {/* Tap to stop hint */}
            {isListening && (
              <p className="text-xs text-muted-foreground animate-fade-in">
                Tap the mic when you're done
              </p>
            )}

            {/* Quick suggestions */}
            <div className="w-full space-y-2 mt-2">
              <p className="text-xs text-muted-foreground text-center">Quick ideas:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.slice(0, 3).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                  >
                    {suggestion.length > 30 ? suggestion.slice(0, 30) + "..." : suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Text input or commitment preview
          <div className="w-full">
            {showTextInput || !commitment ? (
              // Text input
              <div className={cn(
                "relative rounded-2xl transition-all duration-300 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-green-500/50 focus-within:shadow-lg focus-within:shadow-green-500/10"
              )}>
                <textarea
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  placeholder="I will..."
                  rows={3}
                  className="w-full bg-white/5 rounded-2xl p-4 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
                />
              </div>
            ) : (
              // Commitment preview (from voice)
              <div className="w-full p-4 bg-white/5 rounded-2xl ring-1 ring-green-500/30">
                <p className="text-xs text-muted-foreground mb-2">Your commitment:</p>
                <p className="text-sm text-foreground">{commitment}</p>
                <button
                  type="button"
                  onClick={() => setShowTextInput(true)}
                  className="mt-2 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
            
            {/* Switch to voice option */}
            {isSupported && showTextInput && !commitment && (
              <button
                type="button"
                onClick={() => setShowTextInput(false)}
                className="mt-2 flex items-center gap-1.5 mx-auto text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                Use voice instead
              </button>
            )}

            {/* Quick suggestions for text input */}
            {showTextInput && !commitment && (
              <div className="space-y-2 mt-4">
                <p className="text-xs text-muted-foreground text-center">Quick ideas:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.slice(0, 3).map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                    >
                      {suggestion.length > 30 ? suggestion.slice(0, 30) + "..." : suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Timeframe selection */}
      {commitment && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm text-muted-foreground text-center">For how long?</p>
          <div className="flex gap-2">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                  timeframe === tf.value 
                    ? "bg-green-500/20 ring-1 ring-green-500/50" 
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                <tf.icon className={cn(
                  "w-5 h-5",
                  timeframe === tf.value ? "text-green-400" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  timeframe === tf.value ? "text-green-400" : "text-muted-foreground"
                )}>
                  {tf.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3"
      >
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Skip
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!commitment.trim() || isSubmitting}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            commitment.trim() 
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:shadow-lg hover:shadow-green-500/20" 
              : "bg-white/10 text-muted-foreground cursor-not-allowed"
          )}
        >
          <span>Commit</span>
          <Send className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
