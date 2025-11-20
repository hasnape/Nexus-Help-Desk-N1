import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface SpeakOptions {
  messageId?: string;
  onEnd?: () => void;
}

interface TextToSpeechHook {
  isSpeaking: boolean;
  speakingMessageId: string | null;
  speak: (text: string, options?: SpeakOptions) => void;
  cancel: () => void;
  error: string | null;
  browserSupportsTextToSpeech: boolean;
}

const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null>(null);
  const { getBCP47Locale, t } = useLanguage();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const browserSupportsTextToSpeech =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  useEffect(() => {
    if (!browserSupportsTextToSpeech) {
      setError(
        t("speechTts.notSupported", {
          default: "Text-to-speech is not supported in this browser.",
        })
      );
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
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

  const selectVoice = useCallback(
    (bcp47Lang: string): SpeechSynthesisVoice | undefined => {
      if (voices.length === 0) return undefined;

      let selectedVoice: SpeechSynthesisVoice | undefined;
      if (bcp47Lang.startsWith("fr")) {
        const julieVoiceNames = [
          "microsoft julie online (natural) - french (france)",
          "microsoft julie - french (france)",
          "microsoft julie",
          "julie",
        ];

        selectedVoice = voices.find(
          (voice) =>
            voice.lang.startsWith("fr") &&
            julieVoiceNames.some((namePart) => voice.name.toLowerCase().includes(namePart.toLowerCase())) &&
            voice.localService
        );

        if (!selectedVoice) {
          selectedVoice = voices.find(
            (voice) =>
              voice.lang.startsWith("fr") &&
              julieVoiceNames.some((namePart) => voice.name.toLowerCase().includes(namePart.toLowerCase()))
          );
        }
      }

      if (!selectedVoice) {
        selectedVoice = voices.find((voice) => voice.lang === bcp47Lang && voice.localService);
      }
      if (!selectedVoice) {
        selectedVoice = voices.find((voice) => voice.lang === bcp47Lang);
      }

      return selectedVoice;
    },
    [voices]
  );

  const cancel = useCallback(() => {
    if (!browserSupportsTextToSpeech) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    onEndCallbackRef.current = null;
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, [browserSupportsTextToSpeech]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!browserSupportsTextToSpeech) {
        setError(
          t("speechTts.notSupported", {
            default: "Text-to-speech is not supported in this browser.",
          })
        );
        return;
      }

      const { messageId, onEnd } = options || {};
      if (messageId && isSpeaking && speakingMessageId === messageId) {
        cancel();
        return;
      }

      cancel();

      let cleanedText = text.replace(/[*_`]/g, " ");
      cleanedText = cleanedText.replace(/\s+/g, " ").trim();

      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const bcp47Lang = getBCP47Locale();
      utterance.lang = bcp47Lang;
      const selectedVoice = selectVoice(bcp47Lang);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.pitch = 1;
      utterance.rate = 0.95;

      utteranceRef.current = utterance;
      onEndCallbackRef.current = onEnd ?? null;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
        setSpeakingMessageId(messageId ?? null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
        }
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
        }
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        setError(t("ticketDetail.speechPlaybackError", { error: event.error }));
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
        }
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [browserSupportsTextToSpeech, cancel, getBCP47Locale, isSpeaking, selectVoice, speakingMessageId, t]
  );

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { isSpeaking, speakingMessageId, speak, cancel, error, browserSupportsTextToSpeech };
};

export default useTextToSpeech;
