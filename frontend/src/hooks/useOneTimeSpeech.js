import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for one-time TTS playback using Web Speech API (SpeechSynthesisUtterance).
 * Guarantees that once playback begins/finishes for an item, replay is permanently disabled.
 */
export const useOneTimeSpeech = (itemId) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState(null);

  const utteranceRef = useRef(null);

  // Reset played flag when the item ID changes
  useEffect(() => {
    // Cancel any active speech when switching items
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPlayed(false);
    setHasStarted(false);
    setError(null);
  }, [itemId]);

  const speak = useCallback(
    (text, onComplete) => {
      if (!window.speechSynthesis) {
        setError('Speech Synthesis is not supported in your browser.');
        return;
      }

      if (hasStarted || isPlayed || isPlaying) {
        // Enforce strict one-time play rule
        return;
      }

      try {
        window.speechSynthesis.cancel(); // Clear any pending queue
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';

        utterance.onstart = () => {
          setIsPlaying(true);
          setHasStarted(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setIsPlayed(true);
          if (onComplete) onComplete();
        };

        utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e);
          setIsPlaying(false);
          setIsPlayed(true); // Gating rule: mark played even on error to prevent re-attempts
          setError('Audio playback error.');
          if (onComplete) onComplete();
        };

        utteranceRef.current = utterance;
        setHasStarted(true);
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Speech synthesis exception:', err);
        setError('Could not initialize speech synthesis.');
      }
    },
    [hasStarted, isPlayed, isPlaying]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isPlaying,
    isPlayed,
    hasStarted,
    error,
    speak,
    stop,
  };
};
