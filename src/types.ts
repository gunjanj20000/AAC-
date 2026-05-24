export interface AACCard {
  id: string;
  englishLabel: string;
  hindiLabel: string;
  englishSpeech?: string; // Optional custom speech text if it differs from the label
  hindiSpeech?: string;   // Optional custom speech text if it differs from the label
  englishAudio?: string;  // Base64 recorded audio URI for English speech
  hindiAudio?: string;    // Base64 recorded audio URI for Hindi speech
  emoji?: string;         // The iconic emoji for visual simplicity
  image?: string;         // Base64 URI or uploaded picture
  category: string;       // e.g., 'social', 'verbs', 'nouns', 'feelings', 'people', 'places'
  color: string;          // hex color or theme code (following the Fitzgerald Key standards)
  isCustom?: boolean;     // track user-created card
  isVisible: boolean;     // optionally hidden by parent
  createdAt?: number;
}

export interface Category {
  id: string;
  englishName: string;
  hindiName: string;
  color: string;          // Category badge coloring
  emoji: string;          // Category symbol
}

export interface VoiceSettings {
  englishVoiceName: string | null;
  hindiVoiceName: string | null;
  speed: number;          // speech response rate (e.g. 0.8 is great for young users)
  pitch: number;          // e.g. 1.2 is a friendlier, higher child-like pitch
  volume: number;         // volume scale for output (0.0 to 1.0)
}

export type LanguageMode = 'english' | 'hindi' | 'both';
