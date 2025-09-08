"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface VoiceControlsProps {
  onUserSpeech: (text: string) => void;
  onPlayResponse: (text: string) => void;
  isListening: boolean;
  isPlaying: boolean;
  onToggleListening: () => void;
  onTogglePlaying: () => void;
}

export function VoiceControls({
  onUserSpeech,
  onPlayResponse,
  isListening,
  isPlaying,
  onToggleListening,
  onTogglePlaying,
}: VoiceControlsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check for browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onUserSpeech(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Speech recognition failed. Please try again.');
      };
    }
  }, [onUserSpeech]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use a more natural voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Natural')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      synthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
      onPlayResponse(text);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
      {/* Speech Recognition */}
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={onToggleListening}
        disabled={!isSupported}
        className="flex items-center gap-2"
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {isListening ? "Stop" : "Speak"}
      </Button>

      {/* Text-to-Speech */}
      <Button
        variant={isPlaying ? "destructive" : "outline"}
        size="sm"
        onClick={onTogglePlaying}
        className="flex items-center gap-2"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isPlaying ? "Stop" : "Listen"}
      </Button>

      {!isSupported && (
        <span className="text-xs text-muted-foreground">
          Voice features require Chrome/Edge
        </span>
      )}
    </div>
  );
}
