/**
 * useSpeechRecognition – A robust React hook for browser-native Speech-to-Text.
 *
 * Uses the Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 * No external packages required – this runs entirely in the browser.
 *
 * Features:
 *   - Handles browser support detection
 *   - Manages microphone permissions
 *   - Provides real-time interim transcripts
 *   - Auto-stops after configurable silence timeout
 *   - Cleans up on unmount
 *
 * Returns:
 *   { isListening, transcript, interimTranscript, error, isSupported, startListening, stopListening }
 */
import { useState, useEffect, useRef, useCallback } from 'react';

// Grab the SpeechRecognition constructor (vendor-prefixed in most browsers)
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const useSpeechRecognition = ({
  language = 'en-IN',    // Default to Indian English
  continuous = false,     // Stop after first final result by default
  interimResults = true,  // Show partial results while speaking
  maxDuration = 30000,    // Auto-stop after 30 seconds max
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const isStoppingRef = useRef(false);

  const isSupported = !!SpeechRecognitionAPI;

  // Cleanup timeout helper
  const clearAutoStopTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    clearAutoStopTimeout();
    isStoppingRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped – ignore
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, [clearAutoStopTimeout]);

  // Start listening
  const startListening = useCallback(() => {
    // Reset state
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    isStoppingRef.current = false;

    if (!isSupported) {
      setError(
        'Speech recognition is not supported in your browser. Please use Google Chrome, Microsoft Edge, or Safari.'
      );
      return;
    }

    // Create a fresh instance each time (avoids stale-state bugs)
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);

      // Safety timeout – stop automatically after maxDuration
      clearAutoStopTimeout();
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, maxDuration);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript(finalText);
        setInterimTranscript('');
      }
      if (interimText) {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event) => {
      console.error('SpeechRecognition error:', event.error);

      let message = '';
      switch (event.error) {
        case 'not-allowed':
          message =
            'Microphone access was denied. Please allow microphone permission in your browser settings and try again.';
          break;
        case 'no-speech':
          message = 'No speech was detected. Please try again and speak clearly into your microphone.';
          break;
        case 'audio-capture':
          message =
            'No microphone was found. Please connect a microphone and try again.';
          break;
        case 'network':
          message =
            'A network error occurred during speech recognition. Please check your internet connection.';
          break;
        case 'aborted':
          // User or code intentionally aborted – not an error we need to show
          if (!isStoppingRef.current) {
            message = 'Speech recognition was aborted. Please try again.';
          }
          break;
        case 'language-not-supported':
          message = 'The selected language is not supported for speech recognition.';
          break;
        case 'service-not-allowed':
          message = 'Speech recognition service is not allowed. Please ensure you are using HTTPS.';
          break;
        default:
          message = `Speech recognition error: ${event.error}. Please try again.`;
      }

      if (message) {
        setError(message);
      }
      setIsListening(false);
      setInterimTranscript('');
      clearAutoStopTimeout();
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      clearAutoStopTimeout();
    };

    recognitionRef.current = recognition;

    // Start – this will prompt for microphone permission if not already granted
    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  }, [isSupported, language, continuous, interimResults, maxDuration, clearAutoStopTimeout, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoStopTimeout();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, [clearAutoStopTimeout]);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
  };
};

export default useSpeechRecognition;
