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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VoiceFirstInput.tsx:transcribeAudio',message:'Starting transcription',data:{audioBlobSize:audioBlob.size,audioBlobType:audioBlob.type},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Get Supabase URL and anon key from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VoiceFirstInput.tsx:transcribeAudio',message:'Calling whisper-transcribe',data:{hasSupabaseUrl:!!supabaseUrl,hasAnonKey:!!supabaseAnonKey},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      // Call the function directly using fetch (FormData support)
      const response = await fetch(`${supabaseUrl}/functions/v1/whisper-transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: formData,
      });

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VoiceFirstInput.tsx:transcribeAudio',message:'Transcription response received',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Transcription failed' }));
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VoiceFirstInput.tsx:transcribeAudio',message:'Transcription failed',data:{status:response.status,error:errorData.error},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        throw new Error(errorData.error || `Transcription failed: ${response.status}`);
      }

      const data = await response.json();

      if (data?.text) {
        const newTranscript = transcript + (transcript ? " " : "") + data.text;
        setTranscript(newTranscript);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VoiceFirstInput.tsx:transcribeAudio',message:'Transcription successful',data:{textLength:data.text.length,textPreview:data.text.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        return newTranscript;
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VoiceFirstInput.tsx:transcribeAudio',message:'No transcription text in response',data:{hasData:!!data,dataKeys:data ? Object.keys(data) : []},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        throw new Error('No transcription received');
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VoiceFirstInput.tsx:transcribeAudio',message:'Transcription exception',data:{errorMessage:error.message,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
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

  // Processing state - elegant centered
  if (isProcessing) {
    return (
      <div className={cn("flex flex-col items-center justify-center flex-1 min-h-0", className)}>
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-breathe">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
        </div>
        <p className="text-sm font-medium text-foreground">{processingText}</p>
      </div>
    );
  }

  // Text input fallback
  if (showTextInput) {
    return (
      <div className={cn("flex flex-col flex-1 min-h-0", className)}>
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Share what's on your mind..."
          className="flex-1 min-h-[80px] w-full bg-muted/30 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none border border-border/50 focus:border-primary/50 outline-none transition-colors"
          disabled={disabled}
        />
        <div className="flex items-center justify-between mt-3 shrink-0">
          {isSupported && (
            <button
              type="button"
              onClick={() => setShowTextInput(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              Use voice
            </button>
          )}
          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={!transcript.trim() || disabled}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Voice-first interface - large, elegant, centered
  return (
    <div className={cn("flex flex-col items-center justify-center flex-1 min-h-0", className)}>
      {/* Large voice button with breathing animation */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || isTranscribing}
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 mb-3",
          isListening || isTranscribing
            ? "bg-primary scale-110"
            : "bg-muted/80 hover:bg-muted animate-breathe",
          (disabled || isTranscribing) && "opacity-50 cursor-not-allowed"
        )}
        style={{
          boxShadow: isListening || isTranscribing 
            ? '0 0 40px hsl(var(--primary) / 0.5)' 
            : undefined
        }}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        {/* Outer glow ring when active */}
        {(isListening || isTranscribing) && (
          <>
            <div className="absolute -inset-2 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute -inset-4 rounded-full border border-primary/20 animate-pulse" />
          </>
        )}
        
        {isTranscribing ? (
          <Loader2 className="w-7 h-7 text-primary-foreground animate-spin" />
        ) : (
          <Mic className={cn(
            "w-7 h-7 transition-colors duration-300",
            isListening ? "text-primary-foreground" : "text-muted-foreground"
          )} />
        )}
      </button>

      {/* Status text - elegant */}
      <p className={cn(
        "text-sm font-medium transition-colors duration-300 mb-1",
        isListening || isTranscribing ? "text-primary" : "text-foreground"
      )}>
        {isTranscribing ? "Transcribing..." : isListening ? "I'm listening..." : placeholder}
      </p>

      {/* Subtle type option */}
      {!isListening && !transcript && (
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
      {transcript && !isListening && (
        <div className="w-full max-w-xs mt-3 p-3 bg-muted/30 rounded-2xl animate-fade-up">
          <p className="text-xs text-muted-foreground mb-1">What I heard:</p>
          <p className="text-sm text-foreground line-clamp-2">{transcript}</p>
        </div>
      )}
    </div>
  );
}
