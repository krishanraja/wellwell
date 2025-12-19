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

  // Processing state - compact, centered
  if (isProcessing) {
    return (
      <div className={cn("flex flex-col items-center justify-center flex-1 min-h-0", className)}>
        <div className="relative mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.5s" }} />
        </div>
        <p className="text-xs font-medium text-foreground animate-pulse">{processingText}</p>
      </div>
    );
  }

  // Text input fallback - compact
  if (showTextInput) {
    return (
      <div className={cn("flex flex-col flex-1 min-h-0", className)}>
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Share what's on your mind..."
          className="flex-1 min-h-0 w-full bg-muted/50 rounded-lg p-2 text-sm text-foreground placeholder:text-muted-foreground resize-none border border-border focus:border-primary outline-none"
          disabled={disabled}
        />
        <div className="flex items-center gap-2 mt-1.5 shrink-0">
          {isSupported && (
            <button
              type="button"
              onClick={() => setShowTextInput(false)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Mic className="w-3 h-3" />
              Voice
            </button>
          )}
          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={!transcript.trim() || disabled}
            className="ml-auto px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Voice-first interface - compact, centered
  return (
    <div className={cn("flex flex-col items-center justify-center flex-1 min-h-0 py-1", className)}>
      {/* Voice button - smaller */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || isTranscribing}
        className={cn(
          "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-1.5",
          isListening || isTranscribing
            ? "bg-primary shadow-xl shadow-primary/40 scale-105"
            : "bg-muted hover:bg-muted/80",
          (disabled || isTranscribing) && "opacity-50 cursor-not-allowed"
        )}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        {(isListening || isTranscribing) && (
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "1.5s" }} />
        )}
        
        {isTranscribing ? (
          <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
        ) : (
          <Mic className={cn("w-5 h-5", isListening ? "text-primary-foreground" : "text-muted-foreground")} />
        )}
      </button>

      {/* Status text */}
      <p className={cn(
        "text-xs font-medium",
        isListening || isTranscribing ? "text-primary" : "text-foreground"
      )}>
        {isTranscribing ? "Transcribing..." : isListening ? "Listening..." : placeholder}
      </p>

      {/* Type option */}
      {!isListening && !transcript && (
        <button
          type="button"
          onClick={() => setShowTextInput(true)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          Or type instead
        </button>
      )}

      {/* Transcript preview */}
      {transcript && (
        <p className="w-full mt-1.5 p-1.5 bg-muted/50 rounded-lg text-xs text-foreground line-clamp-2 text-center">
          {transcript}
        </p>
      )}
    </div>
  );
}
