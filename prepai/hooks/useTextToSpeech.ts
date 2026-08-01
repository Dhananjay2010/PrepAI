import { useState, useEffect, useRef } from "react";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);
    }
  }, []);

  const speak = (text: string, rate: number = 1.0, pitch: number = 1.0) => {
    if (!synthRef.current || muted || !text) return;

    synthRef.current.cancel(); // Cancel active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleMute = () => {
    if (!muted) {
      stop();
    }
    setMuted((prev) => !prev);
  };

  return { speak, stop, isSpeaking, muted, toggleMute, isSupported };
}
