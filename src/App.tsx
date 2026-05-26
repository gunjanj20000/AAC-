import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AACCard, LanguageMode, VoiceSettings, Category } from './types';
import { DEFAULT_CARDS, DEFAULT_CATEGORIES } from './defaultCards';
import { CategoryTabs } from './components/CategoryTabs';
import { CardGrid } from './components/CardGrid';
import { SentenceBar } from './components/SentenceBar';
import { ChildLockModal } from './components/ChildLockModal';
import { ParentModal } from './components/ParentModal';
import { speakText, stopSpeech, playCustomAudio } from './utils/speech';
import { playTapBubbleSound, playChimeSuccessSound, triggerHapticFeedback } from './utils/audioEffects';
import { 
  Settings, Lock, Languages, Sparkles, VolumeX, 
  HelpCircle, Home, LogOut
} from 'lucide-react';

const speakSingleCard = async (card: AACCard, mode: LanguageMode, settings: VoiceSettings) => {
  if (mode === 'english') {
    if (card.englishAudio) {
      await playCustomAudio(card.englishAudio);
    } else {
      const text = card.englishSpeech || card.englishLabel;
      await speakText(text, 'en', settings);
    }
  } else if (mode === 'hindi') {
    if (card.hindiAudio) {
      await playCustomAudio(card.hindiAudio);
    } else {
      const text = card.hindiSpeech || card.hindiLabel;
      await speakText(text, 'hi', settings);
    }
  } else {
    // Mode is 'both'
    if (card.englishAudio) {
      await playCustomAudio(card.englishAudio);
    } else {
      const text = card.englishSpeech || card.englishLabel;
      await speakText(text, 'en', settings);
    }
    
    await new Promise(resolve => setTimeout(resolve, 250));
    
    if (card.hindiAudio) {
      await playCustomAudio(card.hindiAudio);
    } else {
      const text = card.hindiSpeech || card.hindiLabel;
      await speakText(text, 'hi', settings);
    }
  }
};

export default function App() {
  // --- STATE ---
  const [cards, setCards] = useState<AACCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('quick');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('hindi');
  const [sentence, setSentence] = useState<AACCard[]>([]);
  
  // Modals & Parent Mode
  const [parentMode, setParentMode] = useState(false);
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);

  // Zoom Focus Overlay Card State
  const [activeZoomCard, setActiveZoomCard] = useState<AACCard | null>(null);

  useEffect(() => {
    if (activeZoomCard) {
      const timer = setTimeout(() => {
        setActiveZoomCard(null);
      }, 1600); // Gentle 1.6-sec display time corresponding to vocal pacing
      return () => clearTimeout(timer);
    }
  }, [activeZoomCard]);
  
  // Speech Voice Config
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    englishVoiceName: '',
    hindiVoiceName: '',
    speed: 0.8,
    pitch: 1.15,
    volume: 1.0,
    hapticEnabled: true,
    hapticPattern: 'normal'
  });

  // Time based greeting calculation
  const [greeting, setGreeting] = useState({ eng: 'Hello', hin: 'नमस्ते' });

  // PWA & Connection States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Filter display-mode standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    playTapBubbleSound();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Install Choice: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // --- INITIALIZATION ---

  // Seed cards and settings from localStorage if available
  useEffect(() => {
    // 1. Initialise AAC cards
    const cachedCards = localStorage.getItem('aac_cards_list');
    if (cachedCards) {
      try {
        setCards(JSON.parse(cachedCards));
      } catch {
        setCards(DEFAULT_CARDS);
        localStorage.setItem('aac_cards_list', JSON.stringify(DEFAULT_CARDS));
      }
    } else {
      setCards(DEFAULT_CARDS);
      localStorage.setItem('aac_cards_list', JSON.stringify(DEFAULT_CARDS));
    }

    // 1.5 Initialise AAC categories
    const cachedCats = localStorage.getItem('aac_categories_list');
    if (cachedCats) {
      try {
        setCategories(JSON.parse(cachedCats));
      } catch {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem('aac_categories_list', JSON.stringify(DEFAULT_CATEGORIES));
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('aac_categories_list', JSON.stringify(DEFAULT_CATEGORIES));
    }

    // 2. Initialise Voice settings
    const cachedVoice = localStorage.getItem('aac_voice_settings');
    if (cachedVoice) {
      try {
        setVoiceSettings(JSON.parse(cachedVoice));
      } catch {
        // use default
      }
    }

    // 3. Initialise Language Mode
    const cachedLang = localStorage.getItem('aac_language_mode');
    if (cachedLang && cachedLang !== 'both') {
      setLanguageMode(cachedLang as LanguageMode);
    } else {
      setLanguageMode('hindi');
    }

    // Calcular greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting({ eng: 'Good Morning', hin: 'शुभ प्रभात' });
    } else if (hour < 17) {
      setGreeting({ eng: 'Good Afternoon', hin: 'शुभ दोपहर' });
    } else {
      setGreeting({ eng: 'Good Evening', hin: 'शुभ संध्या' });
    }
  }, []);

  // --- ACTIONS & HANDLERS ---
  const handleSaveCards = (updatedCards: AACCard[]) => {
    setCards(updatedCards);
    localStorage.setItem('aac_cards_list', JSON.stringify(updatedCards));
  };

  const handleLanguageChange = (mode: LanguageMode) => {
    setLanguageMode(mode);
    localStorage.setItem('aac_language_mode', mode);
    playTapBubbleSound();
    if (voiceSettings.hapticEnabled !== false) {
      triggerHapticFeedback('soft');
    }
  };

  const clearSentence = useCallback(() => {
    setSentence([]);
    playTapBubbleSound();
    stopSpeech();
    if (voiceSettings.hapticEnabled !== false) {
      triggerHapticFeedback('double');
    }
  }, [voiceSettings]);

  const handleCardTap = useCallback((card: AACCard) => {
    // Play sensory sound click first for responsive UI feedback
    playTapBubbleSound();

    // Trigger tactile haptic confirmation if enabled for sensory preferences
    if (voiceSettings.hapticEnabled !== false) {
      triggerHapticFeedback(voiceSettings.hapticPattern || 'normal');
    }

    // Increment usage/clicks
    setCards((prevCards) => {
      const updated = prevCards.map((c) => {
        if (c.id === card.id) {
          return { ...c, usageCount: (c.usageCount || 0) + 1 };
        }
        return c;
      });
      localStorage.setItem('aac_cards_list', JSON.stringify(updated));
      return updated;
    });

    if (parentMode) {
      // In parent mode, speak the card or toggle. Let's make it speak so parents can check translations!
    } else {
      // Add text symbol to sentence builder list
      setSentence((prev) => [...prev, card]);
      setActiveZoomCard(card); // Zoom trigger for the exciting pop-out animation
    }

    // Perform speech action using our routing utility
    speakSingleCard(card, languageMode, voiceSettings).catch(err => {
      console.error('Core card playback failed', err);
    });
  }, [languageMode, voiceSettings, parentMode]);

  const handleSpeakSentence = async () => {
    if (sentence.length === 0) return;
    
    // Play sound click
    playTapBubbleSound();

    try {
      // Check if any card has recorded custom voices. If yes, sequence them word by word.
      const hasAnyCustomAudio = sentence.some(c => 
        (languageMode === 'english' && c.englishAudio) || 
        (languageMode === 'hindi' && c.hindiAudio) ||
        (languageMode === 'both' && (c.englishAudio || c.hindiAudio))
      );

      if (hasAnyCustomAudio) {
        for (const card of sentence) {
          await speakSingleCard(card, languageMode, voiceSettings);
          // Wait 350ms between sequential words
          await new Promise(resolve => setTimeout(resolve, 350));
        }
      } else {
        // Standard concatenated text flow for fluid TTS phrasing
        const engSpeechWords = sentence.map(c => c.englishSpeech || c.englishLabel);
        const hinSpeechWords = sentence.map(c => c.hindiSpeech || c.hindiLabel);

        const fullEngSentence = engSpeechWords.join(' ');
        const fullHinSentence = hinSpeechWords.join(', '); // Comma provides better TTS pacing in Hindi

        if (languageMode === 'english') {
          await speakText(fullEngSentence, 'en', voiceSettings);
        } else if (languageMode === 'hindi') {
          await speakText(fullHinSentence, 'hi', voiceSettings);
        } else {
          // Speak English compiled phrase, then Hindi compiled phrase
          await speakText(fullEngSentence, 'en', voiceSettings);
          await new Promise(resolve => setTimeout(resolve, 600));
          await speakText(fullHinSentence, 'hi', voiceSettings);
        }
      }
    } catch (err) {
      console.error('Sentence Speech failed', err);
    }
  };

  const handleRemoveCardAt = (idx: number) => {
    setSentence((prev) => prev.filter((_, i) => i !== idx));
    playTapBubbleSound();
  };

  // Parent Mode Operations
  const handleAddCard = (newCardData: Omit<AACCard, 'id' | 'isVisible'> & { isVisible: boolean }) => {
    const freshCard: AACCard = {
      ...newCardData,
      id: `custom-${Date.now()}`,
      createdAt: Date.now()
    };
    const updated = [freshCard, ...cards];
    handleSaveCards(updated);
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = cards.filter(c => c.id !== cardId);
    handleSaveCards(updated);
    // Remove if it's currently in the sentence bar too
    setSentence(prev => prev.filter(c => c.id !== cardId));
  };

  const handleUpdateCard = (cardId: string, updatedFields: Partial<AACCard>) => {
    const updated = cards.map(c => c.id === cardId ? { ...c, ...updatedFields } : c);
    handleSaveCards(updated);
  };

  const handleToggleCardVisibility = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      const updated = cards.map(c => c.id === cardId ? { ...c, isVisible: !c.isVisible } : c);
      handleSaveCards(updated);
    }
  };

  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const customId = `custom-cat-${Date.now()}`;
    const freshCategory: Category = {
      ...newCat,
      id: customId
    };
    const updated = [...categories, freshCategory];
    setCategories(updated);
    localStorage.setItem('aac_categories_list', JSON.stringify(updated));
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    localStorage.setItem('aac_categories_list', JSON.stringify(updated));
    
    // Clean up cards in that category to avoid orphan tags
    const cleanCards = cards.filter(c => c.category !== catId);
    handleSaveCards(cleanCards);

    if (activeCategory === catId) {
      setActiveCategory(updated[0]?.id || 'quick');
    }
  };

  const handleSaveVoiceSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    localStorage.setItem('aac_voice_settings', JSON.stringify(newSettings));
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all vocabulary and categories to original defaults? This will delete all custom cards/categories.')) {
      handleSaveCards(DEFAULT_CARDS);
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('aac_categories_list', JSON.stringify(DEFAULT_CATEGORIES));
      setSentence([]);
      setLanguageMode('hindi');
      localStorage.setItem('aac_language_mode', 'hindi');
      
      const resetVoice: VoiceSettings = { englishVoiceName: '', hindiVoiceName: '', speed: 0.8, pitch: 1.15, volume: 1.0, hapticEnabled: true, hapticPattern: 'normal' };
      setVoiceSettings(resetVoice);
      localStorage.setItem('aac_voice_settings', JSON.stringify(resetVoice));

      playChimeSuccessSound();
    }
  };

  return (
    <div id="aac-app-root" className="min-h-screen flex flex-col bg-[#FDFCF5] relative pb-10 select-none">
      
      {/* ⚠️ PARENT ACTIVE BAR */}
      {parentMode && (
        <div id="parent-active-banner" className="bg-[#FF8B3D] text-white px-4 py-2 border-b-4 border-[#D16D29] font-sans font-bold text-center text-xs md:text-sm flex items-center justify-center gap-3 shadow-md z-30 animate-pulse">
          <span>🛠️ Parent Mode Active: Click cards to hide/reveal or click Manage to add/edit.</span>
          <button
            id="exit-parent-banner-btn"
            onClick={() => {
              setParentMode(false);
              playTapBubbleSound();
            }}
            className="bg-slate-900 border-2 border-slate-700 text-white hover:bg-slate-950 rounded-xl px-3 py-1.5 text-[11px] font-sans font-bold cursor-pointer flex items-center gap-1 transition-all shadow-sm"
          >
            <LogOut className="w-3 h-3" /> Exit Parent Mode
          </button>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-white border-b-2 border-amber-100 shadow-sm px-4 py-2 sticky top-0 z-20 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2">
          
          {/* Branded Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-lg shadow-xs border border-amber-200">🗣️</div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base md:text-lg font-black font-sans text-slate-800 tracking-tight">AAC</h1>
              {parentMode && (
                <span className="bg-red-50 text-red-650 border border-red-200 font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded-md uppercase">
                  Admin Active
                </span>
              )}
            </div>
          </div>


          {/* Core Navigation, Language Toggle Control */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Language switch toggle (English vs. Hindi) */}
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200 shadow-inner">
              <button
                id="lang-eng-btn"
                onClick={() => handleLanguageChange('english')}
                className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer min-w-[70px] text-center ${
                  languageMode === 'english'
                    ? 'bg-sky-500 text-white shadow-xs border-b border-sky-600'
                    : 'text-slate-600 hover:bg-slate-150'
                }`}
              >
                🇬🇧 Eng
              </button>
              <button
                id="lang-hin-btn"
                onClick={() => handleLanguageChange('hindi')}
                className={`px-4 py-1.5 text-xs font-black font-hindi rounded-xl transition-all cursor-pointer min-w-[70px] text-center ${
                  languageMode !== 'english'
                    ? 'bg-emerald-500 text-white shadow-xs border-b border-emerald-600'
                    : 'text-slate-600 hover:bg-slate-150'
                }`}
              >
                🇮🇳 हिंदी
              </button>
            </div>

            {/* Install PWA Prompt Button */}
            {showInstallBtn && (
              <button
                id="install-pwa-btn"
                onClick={handleInstallPWA}
                className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-[#FF8B3D] text-white font-sans font-black text-xs rounded-xl shadow-md shadow-pink-100 flex items-center gap-1.5 transform hover:scale-105 active:scale-95 cursor-pointer border-b-2 border-pink-700 transition-all text-center animate-bounce"
                title="Install bilingual AAC app locally on this device!"
              >
                <span>📥</span> Install App
              </button>
            )}



            {/* Settings Parent Panel Gear */}
            {!parentMode ? (
              <button
                id="trigger-parent-lock-btn"
                onClick={() => {
                  setIsLockOpen(true);
                  playTapBubbleSound();
                }}
                className="p-2.5 bg-slate-100 text-slate-705 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95 cursor-pointer font-bold font-sans text-xs"
                title="Parent Settings"
              >
                <Settings className="w-4 h-4 animate-spin-slow" />
                <span className="hidden lg:inline">Parent Mode</span>
              </button>
            ) : (
              <button
                id="trigger-parent-modal-btn"
                onClick={() => {
                  setIsParentModalOpen(true);
                  playTapBubbleSound();
                }}
                className="p-2.5 bg-amber-400 text-slate-900 border-2 border-amber-500 rounded-xl transition-all flex items-center gap-1 transform hover:scale-105 active:scale-95 cursor-pointer font-extrabold font-sans text-xs"
                title="Add & Manage Cards"
              >
                <Settings className="w-4 h-4" />
                <span>Manage</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* --- SENTENCE BUILDER PANEL --- */}
      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Sentence input assembler bar */}
        <SentenceBar
          sentence={sentence}
          onSpeak={handleSpeakSentence}
          onClear={clearSentence}
          onRemoveCard={handleRemoveCardAt}
          languageMode={languageMode}
        />

        {/* --- CATEGORY CAROUSEL TABS --- */}
        <div className="mt-4 bg-transparent shrink-0">
          <CategoryTabs
            categories={categories}
            activeCategoryId={activeCategory}
            onSelectCategory={(id) => {
              setActiveCategory(id);
              playTapBubbleSound();
            }}
            languageMode={languageMode}
          />
        </div>

        {/* --- MAIN INTERACTIVE CARD GRID --- */}
        <div className="flex-1 mt-2">
          <CardGrid
            cards={cards.filter((card) => card.category === activeCategory)}
            onCardTap={handleCardTap}
            languageMode={languageMode}
            parentMode={parentMode}
            onToggleVisibility={handleToggleCardVisibility}
          />
        </div>

      </main>

      {/* --- FOOTER BRIEF INFORMATION --- */}
      <footer className="mt-12 text-center text-slate-400 text-xs font-sans max-w-7xl mx-auto w-full px-4 border-t border-slate-100 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p>
            Designed with 💙 for nonverbal and neurodivergent young learners.
          </p>
          <div className="flex gap-4">
            <span>💡 Tip: Click Parent Mode (Default PIN: 1234) to add custom picture cards.</span>
          </div>
        </div>
      </footer>

      {/* --- SYSTEM GATE & PREFERENCE MODALS --- */}
      
      {/* 1. Child Lock Prompt */}
      {isLockOpen && (
        <ChildLockModal
          isOpen={isLockOpen}
          onClose={() => setIsLockOpen(false)}
          onSuccess={() => {
            setIsLockOpen(false);
            setParentMode(true);
            playChimeSuccessSound();
            // Automatically open parent dashboard directly on successful lock challenge completion!
            setIsParentModalOpen(true);
          }}
        />
      )}

      {/* 2. Parent Administration Panel */}
      {isParentModalOpen && (
        <ParentModal
          isOpen={isParentModalOpen}
          onClose={() => setIsParentModalOpen(false)}
          categories={categories}
          cards={cards}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          onUpdateCard={handleUpdateCard}
          voiceSettings={voiceSettings}
          onSaveVoiceSettings={handleSaveVoiceSettings}
          onResetToDefaults={handleResetToDefaults}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCards={handleSaveCards}
        />
      )}

      {/* 3. Tapped Card Visual Pop-Forward Zoom Overlay */}
      <AnimatePresence>
        {activeZoomCard && (
          <motion.div
            id="active-card-zoom-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveZoomCard(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-100 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 8 }}
              transition={{ type: "spring", damping: 15, stiffness: 140 }}
              style={{ backgroundColor: activeZoomCard.color || '#FEF08A' }}
              className="w-full max-w-[340px] sm:max-w-md aspect-square md:max-w-lg rounded-[2.5rem] border-8 shadow-2xl p-6 md:p-10 flex flex-col items-center justify-center gap-6 border-b-12 select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* FITZGERALD KEY top tag marker indicator */}
              <div className="w-24 h-2 bg-black/5 rounded-full mb-1" />

              <div className="flex-1 flex items-center justify-center w-full">
                {activeZoomCard.image ? (
                  <motion.img
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    src={activeZoomCard.image}
                    alt={activeZoomCard.englishLabel}
                    className="object-cover rounded-3xl w-40 h-40 md:w-56 md:h-56 border-4 border-white/60 shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-8xl min-[390px]:text-9xl md:text-[11.5rem] leading-none select-none filter drop-shadow-xl"
                  >
                    {activeZoomCard.emoji || '🎈'}
                  </motion.span>
                )}
              </div>

              {/* Combined Bilingual Text Labels */}
              <div className="text-center space-y-2 pb-2">
                {languageMode !== 'hindi' && (
                  <h2 className="font-sans font-black text-slate-950 text-2xl min-[390px]:text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none uppercase">
                    {activeZoomCard.englishLabel}
                  </h2>
                )}
                {languageMode !== 'english' && (
                  <h2 className="font-hindi font-black text-slate-950 text-2.5xl min-[390px]:text-3.5xl sm:text-[40px] md:text-[46px] leading-tight block mt-1">
                    {activeZoomCard.hindiLabel}
                  </h2>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
