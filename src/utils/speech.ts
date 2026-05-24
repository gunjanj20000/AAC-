import { VoiceSettings } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentAudioElement: HTMLAudioElement | null = null;

// Stop any currently playing audio (including TTS and user recordings)
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement = null;
  }
}

/**
 * Plays custom recorded audio from a base64 Data URI
 * @param dataURI The base64 or source URI of the audio
 */
export function playCustomAudio(dataURI: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (currentAudioElement) {
        currentAudioElement.pause();
        currentAudioElement = null;
      }

      const audio = new Audio(dataURI);
      currentAudioElement = audio;

      audio.onended = () => {
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        resolve();
      };

      audio.onerror = (e) => {
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        reject(new Error('Failed to play custom recorded audio clip.'));
      };

      audio.play().catch((err) => {
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Get the list of all available voices on the browser
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Speaks text using the standard Web Speech API with language and customization support.
 * @param text The string to speak
 * @param lang Either 'en' or 'hi'
 * @param customSettings Voice volume, pitch, speed, and name
 */
export function speakText(
  text: string,
  lang: 'en' | 'hi',
  customSettings?: VoiceSettings
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('Speech Synthesis not supported in this browser.'));
      return;
    }

    // Cancel anything playing right now to speak instantly
    stopSpeech();

    // Ensure we are speaking something
    if (!text.trim()) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    // Standardize language code
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    // Apply voice settings if provided
    if (customSettings) {
      const voices = window.speechSynthesis.getVoices();

      // Find customized voice by name if specified
      const chosenVoiceName = lang === 'hi' ? customSettings.hindiVoiceName : customSettings.englishVoiceName;
      if (chosenVoiceName) {
        const matchingVoice = voices.find(v => v.name === chosenVoiceName);
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      // If no voice matched, try to find a reasonable fallback for the language
      if (!utterance.voice) {
        const fallbackLang = lang === 'hi' ? 'hi' : 'en';
        const fallbackVoice = voices.find(v => v.lang.toLowerCase().startsWith(fallbackLang));
        if (fallbackVoice) {
          utterance.voice = fallbackVoice;
        }
      }

      // Set customized rate & pitch & volume
      utterance.rate = customSettings.speed;
      utterance.pitch = customSettings.pitch;
      utterance.volume = typeof customSettings.volume === 'number' ? customSettings.volume : 1.0;
    } else {
      // Gentle child-friendly defaults: slower rate (0.85) is much easier for autistic children
      utterance.rate = 0.85;
      utterance.pitch = 1.1; // friendly, higher pitch
      utterance.volume = 1.0; // max loudness
    }

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };

    utterance.onerror = (e) => {
      currentUtterance = null;
      // Synthesizing can fail if user cancels it, which is expected
      if (e.error !== 'interrupted') {
        reject(e);
      } else {
        resolve();
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}
