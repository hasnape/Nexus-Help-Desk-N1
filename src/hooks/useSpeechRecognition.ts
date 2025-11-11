
import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage

// Minimal Web Speech API type declarations (assuming they are defined as before)
interface ISpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: ISpeechRecognitionAlternative;
  readonly length: number;
}
interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}
interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
  readonly emma?: Document | null;
  readonly interpretation?: any;
}
interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string; 
  readonly message: string;
}
interface ISpeechRecognition extends EventTarget {
  grammars: any; 
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onaudiostart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  browserSupportsSpeechRecognition: boolean;
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const { getBCP47Locale, t } = useLanguage(); 

  const browserSupportsSpeechRecognition =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Effect for proactive permission check
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError(t('speechRecognition.notSupported', { default: 'Speech recognition is not supported in this browser.'}));
      return;
    }

    let permissionStatusRef: PermissionStatus | null = null;

    const handlePermissionChange = () => {
        if (permissionStatusRef?.state === 'denied') {
            setError(t('speechRecognition.permissionDeniedProactive', { default: 'Microphone access is currently denied. Please go to your browser\'s site settings, allow microphone access for this page, and then refresh to use voice input.' }));
        } else if (permissionStatusRef?.state === 'granted') {
            setError(prevError => {
                const proactiveDenialError = t('speechRecognition.permissionDeniedProactive', { default: 'Microphone access is currently denied. Please go to your browser\'s site settings, allow microphone access for this page, and then refresh to use voice input.' });
                // Clear error only if it was the proactive denial error
                return prevError === proactiveDenialError ? null : prevError;
            });
        }
    };

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' } as any).then(permissionStatus => {
        permissionStatusRef = permissionStatus;
        if (permissionStatus.state === 'denied') {
          setError(t('speechRecognition.permissionDeniedProactive', { default: 'Microphone access is currently denied. Please go to your browser\'s site settings, allow microphone access for this page, and then refresh to use voice input.' }));
        }
        permissionStatus.onchange = handlePermissionChange;
      }).catch(permError => {
        console.warn("Could not query microphone permission:", permError);
        // Fallback to standard error handling if permission query fails
      });
    }
    
    return () => {
        if (permissionStatusRef) {
            permissionStatusRef.onchange = null;
        }
    };
  }, [browserSupportsSpeechRecognition, t]);

  // Effect for SpeechRecognition instance setup and event handlers
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError(t('speechRecognition.notSupported', { default: 'Speech recognition is not supported in this browser.'}));
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
        setError(t('speechRecognition.notSupported', { default: 'Speech recognition API not found in this browser.'}));
        return;
    }
    
    recognitionRef.current = new SpeechRecognitionAPI() as ISpeechRecognition;
    const recognition = recognitionRef.current;
    
    recognition.lang = getBCP47Locale(); 
    recognition.continuous = false; 
    recognition.interimResults = false;

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error, event.message);
      let newErrorText = '';
      if (event.error === 'no-speech') {
        newErrorText = t('speechRecognition.error.noSpeech', { default: 'No speech detected. Please try speaking again.'});
      } else if (event.error === 'audio-capture') {
        newErrorText = t('speechRecognition.error.audioCapture', { default: 'Audio capture error. Please ensure your microphone is connected and selected, then try again.'});
      } else if (event.error === 'not-allowed') {
        newErrorText = t('speechRecognition.error.notAllowed', { default: 'Microphone access was denied. To use voice input, please allow microphone permission in your browser\'s site settings for this page and refresh.'});
      } else if (event.error === 'network') {
        newErrorText = t('speechRecognition.error.network', { default: 'Network error with speech recognition. Please check your internet connection and try again.'});
      } else {
        newErrorText = t('speechRecognition.error.generic', { error: `${event.error}${event.message ? ` - ${event.message}` : ''}`});
      }
      setError(newErrorText);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop(); 
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onaudiostart = null;
      }
    };
  }, [browserSupportsSpeechRecognition, getBCP47Locale, t]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || !browserSupportsSpeechRecognition) return;
    setTranscript('');
    setError(null); 
    try {
      recognitionRef.current.lang = getBCP47Locale(); 
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      console.error("Error starting speech recognition:", e);
      setError(t('speechRecognition.error.generic', { error: `Could not start listening: ${e.message}` }));
      setIsListening(false);
    }
  }, [isListening, browserSupportsSpeechRecognition, getBCP47Locale, t]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening || !browserSupportsSpeechRecognition) return;
    try {
        recognitionRef.current.stop();
    } catch (e) {
        console.error("Error stopping speech recognition:", e);
    }
  }, [isListening, browserSupportsSpeechRecognition]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    browserSupportsSpeechRecognition,
  };
};

export default useSpeechRecognition;
