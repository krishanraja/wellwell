import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceFirstInputProps {
  onTranscript: (text: string) => void;
  onComplete?: () => void;
  placeholder?: string;
  processingText?: string;
  isProcessing?: boolean;
  className?: string;
  disabled?: boolean;
}

export function VoiceFirstInput({ 
  onTranscript, 
  onComplete,
  placeholder = "Tap to speak",
  processingText = "Finding your Stoic truth...",
  isProcessing = false,
  className, 
  disabled 
}: VoiceFirstInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setShowTextInput(true);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + (prev ? " " : "") + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please enable microphone permissions.");
        setShowTextInput(true);
      } else if (event.error !== "aborted") {
        toast.error("Voice input error. Please try again or type instead.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setShowTextInput(true);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // If we have transcript, send it
      if (transcript.trim()) {
        onTranscript(transcript);
        onComplete?.();
      }
    } else {
      try {
        setTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start recognition:", error);
        setShowTextInput(true);
      }
    }
  }, [isListening, transcript, onTranscript, onComplete]);

  const handleTextSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript);
      onComplete?.();
    }
  };

  // Processing state
  if (isProcessing) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.5s" }} />
        </div>
        <p className="text-lg font-medium text-foreground animate-pulse">{processingText}</p>
      </div>
    );
  }

  // Text input fallback or preference
  if (showTextInput) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Share what's on your mind..."
          className="w-full bg-muted/50 rounded-2xl p-4 min-h-[120px] text-foreground placeholder:text-muted-foreground resize-none border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
          disabled={disabled}
        />
        <div className="flex items-center gap-3">
          {isSupported && (
            <button
              type="button"
              onClick={() => setShowTextInput(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mic className="w-4 h-4" />
              Use voice instead
            </button>
          )}
          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={!transcript.trim() || disabled}
            className="ml-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Voice-first interface
  return (
    <div className={cn("flex flex-col items-center justify-center py-4", className)}>
      {/* Main voice button */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={cn(
          "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 mb-6",
          isListening
            ? "bg-primary shadow-2xl shadow-primary/40 scale-110"
            : "bg-muted hover:bg-muted/80 hover:scale-105"
        )}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        {/* Animated rings when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "1.5s" }} />
            <div className="absolute -inset-4 rounded-full border-2 border-primary/30 animate-pulse" />
            <div className="absolute -inset-8 rounded-full border border-primary/20 animate-pulse" style={{ animationDelay: "0.2s" }} />
          </>
        )}
        
        <Mic 
          className={cn(
            "w-10 h-10 transition-all",
            isListening ? "text-primary-foreground" : "text-muted-foreground"
          )} 
        />
      </button>

      {/* Status text */}
      <p className={cn(
        "text-lg font-medium mb-2 transition-colors",
        isListening ? "text-primary" : "text-foreground"
      )}>
        {isListening ? "I'm listening..." : placeholder}
      </p>

      {/* Live transcript */}
      {transcript && (
        <div className="w-full max-w-md mt-4 p-4 bg-muted/50 rounded-2xl animate-fade-up">
          <p className="text-sm text-muted-foreground mb-1">What I heard:</p>
          <p className="text-foreground">{transcript}</p>
        </div>
      )}

      {/* Tap to stop hint when listening */}
      {isListening && (
        <p className="text-sm text-muted-foreground mt-4 animate-fade-up">
          Tap again when finished
        </p>
      )}

      {/* Type instead option */}
      {!isListening && !transcript && (
        <button
          type="button"
          onClick={() => setShowTextInput(true)}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          Or type instead
        </button>
      )}
    </div>
  );
}
