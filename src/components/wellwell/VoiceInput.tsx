import { useState, useRef, useEffect } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, className, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please enable microphone permissions.");
      } else if (event.error !== "aborted") {
        toast.error("Voice input error. Please try again.");
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
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start recognition:", error);
        toast.error("Failed to start voice input");
      }
    }
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={cn(
        "p-3 rounded-xl transition-all duration-200",
        isListening
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          : "bg-primary/20 text-primary hover:bg-primary/30",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
    >
      <Mic className={cn("w-5 h-5", isListening && "animate-pulse")} />
    </button>
  );
}
