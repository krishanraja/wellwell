import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Sparkles, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReflectionPromptProps {
  prompt: string;
  onSubmit: (response: string) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

export function ReflectionPrompt({ prompt, onSubmit, onSkip, isSubmitting }: ReflectionPromptProps) {
  const [response, setResponse] = useState("");
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
        const newTranscript = response + (response ? " " : "") + data.text;
        setResponse(newTranscript);
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
  }, [response]);

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
    if (response.trim()) {
      onSubmit(response.trim());
    }
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
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
          <MessageSquare className="w-8 h-8 text-amber-400" />
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
        {!showTextInput && isSupported ? (
          // Voice-first interface
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Large voice button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isSubmitting || isTranscribing}
              className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                isListening || isTranscribing
                  ? "bg-amber-500 scale-110"
                  : "bg-muted/80 hover:bg-muted animate-breathe",
                (isSubmitting || isTranscribing) && "opacity-50 cursor-not-allowed"
              )}
              style={{
                boxShadow: isListening || isTranscribing 
                  ? '0 0 40px hsl(45 100% 60% / 0.5)' 
                  : undefined
              }}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {/* Outer glow ring when active */}
              {(isListening || isTranscribing) && (
                <>
                  <div className="absolute -inset-2 rounded-full border-2 border-amber-500/30 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="absolute -inset-4 rounded-full border border-amber-500/20 animate-pulse" />
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
              isListening || isTranscribing ? "text-amber-400" : "text-foreground"
            )}>
              {isTranscribing ? "Transcribing..." : isListening ? "I'm listening..." : "Tap to speak"}
            </p>

            {/* Type instead option */}
            {!isListening && !response && (
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

            {/* Transcript preview */}
            {response && !isListening && (
              <div className="w-full p-4 bg-white/5 rounded-2xl ring-1 ring-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">What I heard:</p>
                  <span className="text-xs text-muted-foreground/50">
                    {response.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <p className="text-sm text-foreground">{response}</p>
                {response.length > 20 && (
                  <div className="flex justify-end mt-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Text input fallback
          <div className="w-full">
            <div className={cn(
              "relative rounded-2xl transition-all duration-300 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:shadow-lg focus-within:shadow-amber-500/10"
            )}>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full bg-white/5 rounded-2xl p-4 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
              />
              
              {/* Character hint */}
              <div className="absolute bottom-3 left-4 text-xs text-muted-foreground/50">
                {response.length > 0 && <span>{response.split(/\s+/).filter(Boolean).length} words</span>}
              </div>

              {/* Sparkle indicator when typing */}
              {response.length > 20 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-3 right-3"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
              )}
            </div>
            
            {/* Switch to voice option */}
            {isSupported && (
              <button
                type="button"
                onClick={() => setShowTextInput(false)}
                className="mt-2 flex items-center gap-1.5 mx-auto text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                Use voice instead
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!response.trim() || isSubmitting}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            response.trim() 
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-lg hover:shadow-amber-500/20" 
              : "bg-white/10 text-muted-foreground cursor-not-allowed"
          )}
        >
          <span>Submit</span>
          <Send className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
