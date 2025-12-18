import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceFirstInputProps {
  onTranscript: (text: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  placeholder?: string;
  processingText?: string;
  isProcessing?: boolean;
  className?: string;
  disabled?: boolean;
}

export function VoiceFirstInput({ 
  onTranscript, 
  onComplete,
  onError,
  placeholder = "Tap to speak",
  processingText = "Finding your Stoic truth...",
  isProcessing = false,
  className, 
  disabled 
}: VoiceFirstInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

      // Get Supabase URL and anon key from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      // Call the function directly using fetch (FormData support)
      const response = await fetch(`${supabaseUrl}/functions/v1/whisper-transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Transcription failed' }));
        throw new Error(errorData.error || `Transcription failed: ${response.status}`);
      }

      const data = await response.json();

      if (data?.text) {
        const newTranscript = transcript + (transcript ? " " : "") + data.text;
        setTranscript(newTranscript);
        return newTranscript;
      } else {
        throw new Error('No transcription received');
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      onError?.(error.message || 'Failed to transcribe audio. Please try again or type instead.');
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, [transcript, onError]);

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
          const newTranscript = await transcribeAudio(audioBlob);
          if (newTranscript) {
            onTranscript(newTranscript);
            onComplete?.();
          }
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setTranscript("");
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        onError?.("Microphone access denied. Please enable microphone permissions.");
      } else {
        onError?.("Failed to start recording. Please try again or type instead.");
      }
      setShowTextInput(true);
    }
  }, [transcribeAudio, onTranscript, onComplete, onError]);

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

  const handleTextSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript);
      onComplete?.();
    }
  };

  // Processing state - compact
  if (isProcessing) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-4", className)}>
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.5s" }} />
        </div>
        <p className="text-sm font-medium text-foreground animate-pulse">{processingText}</p>
      </div>
    );
  }

  // Text input fallback or preference - compact
  if (showTextInput) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Share what's on your mind..."
          className="w-full bg-muted/50 rounded-xl p-3 min-h-[80px] text-sm text-foreground placeholder:text-muted-foreground resize-none border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
          disabled={disabled}
        />
        <div className="flex items-center gap-2">
          {isSupported && (
            <button
              type="button"
              onClick={() => setShowTextInput(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              Voice
            </button>
          )}
          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={!transcript.trim() || disabled}
            className="ml-auto px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Voice-first interface - compact layout
  return (
    <div className={cn("flex flex-col items-center justify-center py-2", className)}>
      {/* Main voice button - more compact */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || isTranscribing}
        className={cn(
          "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 mb-4",
          isListening || isTranscribing
            ? "bg-primary shadow-2xl shadow-primary/40 scale-110"
            : "bg-muted hover:bg-muted/80 hover:scale-105",
          (disabled || isTranscribing) && "opacity-50 cursor-not-allowed"
        )}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        {/* Animated rings when listening or transcribing */}
        {(isListening || isTranscribing) && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "1.5s" }} />
            <div className="absolute -inset-3 rounded-full border-2 border-primary/30 animate-pulse" />
            <div className="absolute -inset-6 rounded-full border border-primary/20 animate-pulse" style={{ animationDelay: "0.2s" }} />
          </>
        )}
        
        {isTranscribing ? (
          <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
        ) : (
          <Mic 
            className={cn(
              "w-8 h-8 transition-all",
              isListening ? "text-primary-foreground" : "text-muted-foreground"
            )} 
          />
        )}
      </button>

      {/* Status text - compact */}
      <p className={cn(
        "text-base font-medium mb-1 transition-colors",
        isListening || isTranscribing ? "text-primary" : "text-foreground"
      )}>
        {isTranscribing ? "Transcribing..." : isListening ? "I'm listening..." : placeholder}
      </p>

      {/* Live transcript - compact */}
      {transcript && (
        <div className="w-full max-w-md mt-3 p-3 bg-muted/50 rounded-xl animate-fade-up">
          <p className="text-xs text-muted-foreground mb-0.5">What I heard:</p>
          <p className="text-sm text-foreground">{transcript}</p>
        </div>
      )}

      {/* Tap to stop hint when listening */}
      {isListening && (
        <p className="text-xs text-muted-foreground mt-3 animate-fade-up">
          Tap again when finished
        </p>
      )}

      {/* Type instead option - compact */}
      {!isListening && !transcript && (
        <button
          type="button"
          onClick={() => setShowTextInput(true)}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          Or type instead
        </button>
      )}
    </div>
  );
}
