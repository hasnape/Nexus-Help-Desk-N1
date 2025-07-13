import { useState, useCallback, useRef, useEffect } from 'react';

// Minimal Web Speech API type declarations
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
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
  length: number;
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

  const browserSupportsSpeechRecognition =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Suppression du contexte de langue, tout est statique en français
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError("La reconnaissance vocale n'est pas prise en charge par votre navigateur.");
      return;
    }

    let permissionStatusRef: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (permissionStatusRef?.state === 'denied') {
        setError("Microphone accès actuellement refusé. Veuillez autoriser l'accès au microphone pour cette page, puis actualisez pour utiliser la saisie vocale.");
      } else if (permissionStatusRef?.state === 'granted') {
        setError((prevError: string | null) => {
          const proactiveDenialError = "Microphone accès actuellement refusé. Veuillez autoriser l'accès au microphone pour cette page, puis actualisez pour utiliser la saisie vocale.";
          return prevError === proactiveDenialError ? null : prevError;
        });
      }
    };

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' } as any).then(permissionStatus => {
        permissionStatusRef = permissionStatus;
        if (permissionStatus.state === 'denied') {
          setError("Microphone accès actuellement refusé. Veuillez autoriser l'accès au microphone pour cette page, puis actualisez pour utiliser la saisie vocale.");
        }
        permissionStatus.onchange = handlePermissionChange;
      }).catch(permError => {
        console.warn("Impossible de vérifier la permission du microphone :", permError);
        // Fallback to standard error handling if permission query fails
      });
    }
    
    return () => {
        if (permissionStatusRef) {
            permissionStatusRef.onchange = null;
        }
    };
  }, [browserSupportsSpeechRecognition]);

  // Configuration de l'instance de reconnaissance vocale
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
        setError("La reconnaissance vocale n'est pas prise en charge par votre navigateur."); 
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
          setError("API de reconnaissance vocale introuvable dans ce navigateur."); 
        return;
    }
    
    recognitionRef.current = new SpeechRecognitionAPI() as ISpeechRecognition;
    const recognition = recognitionRef.current;
    
    recognition.lang = 'fr-FR'; // Langue par défaut : Français (France)
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
      console.error('Erreur de reconnaissance vocale', event.error, event.message);
      let newErrorText = '';
      if (event.error === 'no-speech') {
        newErrorText = 'Aucun discours détecté. Veuillez réessayer.';
      } else if (event.error === 'audio-capture') {
        newErrorText = 'Erreur de capture audio. Assurez-vous que votre microphone est connecté et sélectionné.';
      } else if (event.error === 'not-allowed') {
        newErrorText = 'Accès au microphone refusé. Pour utiliser la saisie vocale, veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur.';
      } else if (event.error === 'network') {
        newErrorText = 'Erreur réseau avec la reconnaissance vocale. Vérifiez votre connexion Internet.';
      } else {
        newErrorText = `Erreur inconnue : ${event.error}${event.message ? ` - ${event.message}` : ''}`;
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
  }, [browserSupportsSpeechRecognition]);

  const startListening = useCallback(() => { 
    if (!recognitionRef.current || isListening || !browserSupportsSpeechRecognition) return;
    setTranscript('');
    setError(null);  
    try {
      recognitionRef.current.lang = 'fr-FR'; // Langue par défaut : Français (France)
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      console.error("Erreur lors du démarrage de la reconnaissance vocale :", e);
      setError(`Impossible de commencer à écouter : ${e.message}`);
      setIsListening(false);
    }
  }, [isListening, browserSupportsSpeechRecognition]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening || !browserSupportsSpeechRecognition) return;
    try {
        recognitionRef.current.stop();
    } catch (e) {
        console.error("Erreur lors de l'arrêt de la reconnaissance vocale :", e);
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
