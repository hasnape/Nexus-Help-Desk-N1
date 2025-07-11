import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, onEndCallback?: () => void) => void;
  cancel: () => void;
  error: string | null;
  browserSupportsTextToSpeech: boolean;
}

const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null | undefined>(null);
  const { getBCP47Locale, t } = useLanguage(); 

  const browserSupportsTextToSpeech =
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!browserSupportsTextToSpeech) {
      setError(t('speechTts.notSupported', { default: 'Text-to-speech is not supported in this browser.' }));
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    // Some browsers populate voices asynchronously.
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }


    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [browserSupportsTextToSpeech, t]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!browserSupportsTextToSpeech) {
        setError(t('speechTts.notSupported', { default: 'Text-to-speech is not supported in this browser.' }));
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
    }
    
    let cleanedText = text;
    cleanedText = cleanedText.replace(/[*_`]/g, ' ');
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const bcp47Lang = getBCP47Locale(); 
    utterance.lang = bcp47Lang; // Always set the language for the utterance

    let selectedVoice: SpeechSynthesisVoice | undefined = undefined;

    if (voices.length > 0) {
        // Prioritize "Microsoft Julie" for French
        if (bcp47Lang.startsWith('fr')) {
            const julieVoiceNames = [
                "microsoft julie online (natural) - french (france)",
                "microsoft julie - french (france)",
                "microsoft julie", // More generic check
                "julie" // Even more generic, relying on lang filter
            ];

            // Prefer localService "Julie" voice
            selectedVoice = voices.find(v =>
                v.lang.startsWith('fr') && // Ensure it's a French voice
                julieVoiceNames.some(namePart => v.name.toLowerCase().includes(namePart.toLowerCase())) &&
                v.localService
            );

            // Fallback to any "Julie" voice if localService one isn't found
            if (!selectedVoice) {
                selectedVoice = voices.find(v =>
                    v.lang.startsWith('fr') &&
                    julieVoiceNames.some(namePart => v.name.toLowerCase().includes(namePart.toLowerCase()))
                );
            }
        }

        // If "Julie" was not found or language is not French, apply general voice selection logic
        if (!selectedVoice) {
            // Prefer localService voice matching the full BCP-47 language code (e.g., "en-US", "fr-FR")
            let genericSelectedVoice = voices.find(v => v.lang === bcp47Lang && v.localService);
            
            // If not found, try any voice matching the full BCP-47 language code
            if (!genericSelectedVoice) {
                genericSelectedVoice = voices.find(v => v.lang === bcp47Lang);
            }
            
            if (genericSelectedVoice) {
                selectedVoice = genericSelectedVoice;
            }
        }
    }
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    // If no specific voice (Julie or general match) is found,
    // utterance.voice remains unset. The browser will then use its default
    // voice for the language specified in utterance.lang.

    utterance.pitch = 1;
    utterance.rate = 0.95; 

    utteranceRef.current = utterance;
    onEndCallbackRef.current = onEnd;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current();
      }
      // Check if this specific utterance was the one being tracked
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null; 
      }
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      setError(t('ticketDetail.speechPlaybackError', { error: event.error }));
      setIsSpeaking(false);
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current(); 
      }
      if (utteranceRef.current === utterance) {
         utteranceRef.current = null;
      }
    };
    
    window.speechSynthesis.speak(utterance);
  }, [browserSupportsTextToSpeech, getBCP47Locale, voices, t]);

  const cancel = useCallback(() => {
    if (!browserSupportsTextToSpeech || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.cancel();
    // State update for isSpeaking will be handled by the onend event of the utterance.
  }, [browserSupportsTextToSpeech]);

  // Cleanup effect to cancel speech if component unmounts while speaking
  useEffect(() => {
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { isSpeaking, speak, cancel, error, browserSupportsTextToSpeech };
};

export default useTextToSpeech;