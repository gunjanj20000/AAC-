import React, { useState, useEffect } from 'react';
import { AACCard, Category, VoiceSettings } from '../types';
import { 
  X, Plus, Trash2, Save, RotateCcw, Volume2, 
  Settings, Image, Tag, Languages, Palette, 
  Download, Upload, Eye, EyeOff, Check, Pencil,
  GripVertical, ChevronLeft, HelpCircle, ListFilter,
  Mic, Square, Play
} from 'lucide-react';
import { getAvailableVoices, stopSpeech, speakText, playCustomAudio } from '../utils/speech';
import { triggerHapticFeedback } from '../utils/audioEffects';

interface ParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  cards: AACCard[];
  onAddCard: (card: Omit<AACCard, 'id' | 'isVisible'> & { isVisible: boolean }) => void;
  onDeleteCard: (id: string) => void;
  onUpdateCard: (id: string, updated: Partial<AACCard>) => void;
  voiceSettings: VoiceSettings;
  onSaveVoiceSettings: (settings: VoiceSettings) => void;
  onResetToDefaults: () => void;
  onAddCategory?: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory?: (id: string) => void;
  onReorderCards?: (reorderedCards: AACCard[]) => void;
}

// Color palette options according to Fitzgerald Key categories & safe clear colors
const FJ_COLOR_OPTIONS = [
  { hex: '#FBCFE8', label: 'Phrases / Social (Pink)' },
  { hex: '#BBF7D0', label: 'Actions / Verbs (Green)' },
  { hex: '#FED7AA', label: 'Objects / Nouns (Orange)' },
  { hex: '#BAE6FD', label: 'Feelings & Body (Blue)' },
  { hex: '#FEF08A', label: 'People / Who (Yellow)' },
  { hex: '#99F6E4', label: 'Places / Where (Teal)' },
  { hex: '#F3F4F6', label: 'Special / Other (Gray)' },
];

const PRESET_EMOJIS = [
  '🍕', '🍔', '🍟', '🍲', '🍪', '🍎', '🍌', '🥛', '🥤', '🍼',
  '🚽', '🧼', '🛁', '🪥', '🛌', '🧸', '🚗', '🎈', '⚽', '🎨',
  '🏠', '🏫', '🛝', '🛒', '📚', '📺', '🎵', '👨', '👩', '🧒',
  '👵', '👴', '🧑‍🤝‍🧑', '🐶', '🐱', '👍', '👎', '🆘', '🛑', '➕',
  '🙏', '🥺', '😊', '😢', '🤤', '🥵', '🥱', '😡', '🤕', '😨'
];

export function ParentModal({
  isOpen,
  onClose,
  categories,
  cards,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  voiceSettings,
  onSaveVoiceSettings,
  onResetToDefaults,
  onAddCategory,
  onDeleteCategory,
  onReorderCards,
}: ParentModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'settings'>(() => {
    const cached = localStorage.getItem('aac_last_active_tab');
    if (cached === 'create' || cached === 'manage' || cached === 'settings') {
      return cached;
    }
    return 'create';
  });

  useEffect(() => {
    localStorage.setItem('aac_last_active_tab', activeTab);
  }, [activeTab]);

  const [manageCategoryFilter, setManageCategoryFilter] = useState<string>('all');
  const [manageSortMethod, setManageSortMethod] = useState<'manual' | 'alphabetical' | 'most-used' | 'newest'>('manual');
  
  // Custom Card State
  const [englishLabel, setEnglishLabel] = useState('');
  const [hindiLabel, setHindiLabel] = useState('');
  const [englishSpeech, setEnglishSpeech] = useState('');
  const [hindiSpeech, setHindiSpeech] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'quick');
  const [selectedColor, setSelectedColor] = useState('#FBCFE8');
  const [selectedEmoji, setSelectedEmoji] = useState('🍎');
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Custom Category State
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catEnglishName, setCatEnglishName] = useState('');
  const [catHindiName, setCatHindiName] = useState('');
  const [catEmoji, setCatEmoji] = useState('📂');
  const [catColor, setCatColor] = useState('purple');

  // Voice State
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedEngVoice, setSelectedEngVoice] = useState(voiceSettings.englishVoiceName || '');
  const [selectedHinVoice, setSelectedHinVoice] = useState(voiceSettings.hindiVoiceName || '');
  const [voiceSpeed, setVoiceSpeed] = useState(voiceSettings.speed);
  const [voicePitch, setVoicePitch] = useState(voiceSettings.pitch);
  const [voiceVolume, setVoiceVolume] = useState(typeof voiceSettings.volume === 'number' ? voiceSettings.volume : 1.0);

  // Haptic Sensory States
  const [hapticEnabled, setHapticEnabled] = useState(voiceSettings.hapticEnabled !== false);
  const [hapticPattern, setHapticPattern] = useState<'soft' | 'normal' | 'heavy' | 'double'>(voiceSettings.hapticPattern || 'normal');

  // Active Card Editing State
  const [editingCard, setEditingCard] = useState<AACCard | null>(null);
  const [editEnglishLabel, setEditEnglishLabel] = useState('');
  const [editHindiLabel, setEditHindiLabel] = useState('');
  const [editEnglishSpeech, setEditEnglishSpeech] = useState('');
  const [editHindiSpeech, setEditHindiSpeech] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editColor, setEditColor] = useState('#FEF08A');
  const [editEmoji, setEditEmoji] = useState('🍎');
  const [editCustomImage, setEditCustomImage] = useState<string | undefined>(undefined);

  // Custom Audio Recording states
  const [englishAudio, setEnglishAudio] = useState<string | undefined>(undefined);
  const [hindiAudio, setHindiAudio] = useState<string | undefined>(undefined);
  const [editEnglishAudio, setEditEnglishAudio] = useState<string | undefined>(undefined);
  const [editHindiAudio, setEditHindiAudio] = useState<string | undefined>(undefined);

  const [recordingTarget, setRecordingTarget] = useState<'english' | 'hindi' | 'edit-english' | 'edit-hindi' | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startRecording = async (target: 'english' | 'hindi' | 'edit-english' | 'edit-hindi') => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
        setFormError('Microphone audio recording is not supported on this browser version/view.');
        return;
      }

      setFormError('');
      // Request active microphone capture stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Str = reader.result as string;
          if (target === 'english') {
            setEnglishAudio(base64Str);
          } else if (target === 'hindi') {
            setHindiAudio(base64Str);
          } else if (target === 'edit-english') {
            setEditEnglishAudio(base64Str);
          } else if (target === 'edit-hindi') {
            setEditHindiAudio(base64Str);
          }
        };
        reader.readAsDataURL(blob);
        // Turn off stream hardware mic cleanly
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setRecordingTarget(target);
      recorder.start();
    } catch (err) {
      console.error('Audio startRecording error', err);
      setFormError('Microphone access denied or error starting recording. Verify permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setRecordingTarget(null);
    setMediaRecorder(null);
  };

  const playRecordedSample = async (dataUri: string) => {
    try {
      setSuccessMsg('Playing voice memo preview...');
      await playCustomAudio(dataUri);
      setTimeout(() => setSuccessMsg(''), 1000);
    } catch (err) {
      setFormError('Playback failed. Check if audio was recorded properly!');
    }
  };

  // Drag-and-Drop / Card Ordering State variables
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedCardCategory, setDraggedCardCategory] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);

  // Native HTML5 Drag and Drop events
  const handleDragStart = (e: React.DragEvent, cardId: string, catId: string) => {
    setDraggedCardId(cardId);
    setDraggedCardCategory(catId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e: React.DragEvent, cardId: string, catId: string) => {
    e.preventDefault();
    if (catId !== draggedCardCategory) return; // Only reorder within the same category
    if (cardId !== dragOverCardId) {
      setDragOverCardId(cardId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCardId(null);
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string, catId: string) => {
    e.preventDefault();
    if (!draggedCardId || catId !== draggedCardCategory) {
      setDraggedCardId(null);
      setDraggedCardCategory(null);
      setDragOverCardId(null);
      return;
    }

    if (draggedCardId === targetCardId) {
      setDraggedCardId(null);
      setDraggedCardCategory(null);
      setDragOverCardId(null);
      return;
    }

    const sameCatCards = cards.filter(c => c.category === catId);
    const srcIndex = sameCatCards.findIndex(c => c.id === draggedCardId);
    const destIndex = sameCatCards.findIndex(c => c.id === targetCardId);

    if (srcIndex !== -1 && destIndex !== -1) {
      const reorderedSameCat = [...sameCatCards];
      const [removed] = reorderedSameCat.splice(srcIndex, 1);
      reorderedSameCat.splice(destIndex, 0, removed);

      let replacementIndex = 0;
      const finalCards = cards.map(c => {
        if (c.category === catId) {
          return reorderedSameCat[replacementIndex++];
        }
        return c;
      });

      if (onReorderCards) {
        onReorderCards(finalCards);
      }
    }

    setDraggedCardId(null);
    setDraggedCardCategory(null);
    setDragOverCardId(null);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDraggedCardCategory(null);
    setDragOverCardId(null);
  };

  // Move earlier (left) or later (right) via manual accessible arrow buttons
  const handleMoveCard = (cardId: string, direction: 'earlier' | 'later') => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    const catId = card.category;
    const sameCatCards = cards.filter(c => c.category === catId);
    const index = sameCatCards.findIndex(c => c.id === cardId);
    
    if (index === -1) return;
    
    const targetIndex = direction === 'earlier' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sameCatCards.length) return;
    
    const reorderedSameCat = [...sameCatCards];
    const temp = reorderedSameCat[index];
    reorderedSameCat[index] = reorderedSameCat[targetIndex];
    reorderedSameCat[targetIndex] = temp;
    
    let replacementIndex = 0;
    const finalCards = cards.map(c => {
      if (c.category === catId) {
        return reorderedSameCat[replacementIndex++];
      }
      return c;
    });
    
    if (onReorderCards) {
      onReorderCards(finalCards);
    }
  };

  // PWA update state and control handler
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleCheckForPWAUpdate = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Progressive Web App features are not supported by this browser version/view.');
      return;
    }

    setCheckingUpdate(true);
    setSuccessMsg('Checking for application updates...');
    setFormError('');

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // If no registrations found, let's try a fresh register call
      if (registrations.length === 0) {
        await navigator.serviceWorker.register('/sw.js');
        setSuccessMsg('Bilingual AAC Service Worker registered successfully! Reloading to activate...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      let foundUpdate = false;
      for (const reg of registrations) {
        // Force checking local sw.js update on server
        await reg.update();
        if (reg.installing || reg.waiting) {
          foundUpdate = true;
          const activeWorker = reg.installing || reg.waiting;
          if (activeWorker) {
            activeWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }

      // Clear local browser cache storages so dynamically fetched codes are purged cleanly
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }

      setSuccessMsg('Offline code cache purged and latest update requested successfully! Syncing & Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.warn('PWA Update Check failed:', err);
      // Hard fallback - force reload ignoring cache if possible
      setSuccessMsg('Synchronising system resources. Force reloading application...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleStartEdit = (card: AACCard) => {
    setEditingCard(card);
    setEditEnglishLabel(card.englishLabel);
    setEditHindiLabel(card.hindiLabel);
    setEditEnglishSpeech(card.englishSpeech || card.englishLabel);
    setEditHindiSpeech(card.hindiSpeech || card.hindiLabel);
    setEditCategory(card.category);
    setEditColor(card.color || '#FEF08A');
    setEditEmoji(card.emoji || '🍎');
    setEditCustomImage(card.image);
    setEditEnglishAudio(card.englishAudio);
    setEditHindiAudio(card.hindiAudio);
    setFormError('');
  };

  // Helper to compress an uploaded image client-side to keep base64 storage under 60-80kb
  const compressImage = (file: File, maxWidth = 320, maxHeight = 320, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Scale dimensions to hold aspect ratio within maxWidth / maxHeight bounds
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not request canvas 2D context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => {
          reject(new Error('Selected file could not be decoded as an image.'));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Could not read the uploaded image file.'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSuccessMsg('Processing and compressing image...');
      setFormError('');
      compressImage(file)
        .then((compressedBase64) => {
          setEditCustomImage(compressedBase64);
          setEditEmoji(''); // Clear default emoji if custom image uploaded
          setFormError('');
          setSuccessMsg('Image processed and compressed successfully!');
          setTimeout(() => setSuccessMsg(''), 2000);
        })
        .catch((err) => {
          setSuccessMsg('');
          setFormError(err.message || 'Error uploading and compressing image.');
        });
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    if (!editEnglishLabel.trim() || !editHindiLabel.trim()) {
      setFormError('Please enter labels in both English and Hindi.');
      return;
    }

    onUpdateCard(editingCard.id, {
      englishLabel: editEnglishLabel.trim(),
      hindiLabel: editHindiLabel.trim(),
      englishSpeech: editEnglishSpeech.trim() || editEnglishLabel.trim(),
      hindiSpeech: editHindiSpeech.trim() || editHindiLabel.trim(),
      category: editCategory,
      color: editColor,
      emoji: editCustomImage ? undefined : editEmoji,
      image: editCustomImage,
      englishAudio: editEnglishAudio,
      hindiAudio: editHindiAudio,
    });

    setEditingCard(null);
    setEditEnglishAudio(undefined);
    setEditHindiAudio(undefined);
    setSuccessMsg('Card updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  useEffect(() => {
    if (isOpen) {
      // Fetch available TTS voices
      const voices = getAvailableVoices();
      setAvailableVoices(voices);

      // Listen for async voice changes in browser
      const handleVoicesChanged = () => {
        setAvailableVoices(getAvailableVoices());
      };
      window.speechSynthesis?.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis?.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, [isOpen]);

  // Synchronize internal voice state if props change
  useEffect(() => {
    setSelectedEngVoice(voiceSettings.englishVoiceName || '');
    setSelectedHinVoice(voiceSettings.hindiVoiceName || '');
    setVoiceSpeed(voiceSettings.speed);
    setVoicePitch(voiceSettings.pitch);
    setHapticEnabled(voiceSettings.hapticEnabled !== false);
    setHapticPattern(voiceSettings.hapticPattern || 'normal');
  }, [voiceSettings]);

  if (!isOpen) return null;

  // Handle custom image uploads via Base64 mapping
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSuccessMsg('Processing and compressing image...');
      setFormError('');
      compressImage(file)
        .then((compressedBase64) => {
          setCustomImage(compressedBase64);
          setSelectedEmoji(''); // Clear emoji if custom image is uploaded
          setFormError('');
          setSuccessMsg('Image processed and compressed successfully!');
          setTimeout(() => setSuccessMsg(''), 2000);
        })
        .catch((err) => {
          setSuccessMsg('');
          setFormError(err.message || 'Error uploading and compressing image.');
        });
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!catEnglishName.trim()) {
      setFormError('Please enter a category name in English.');
      return;
    }
    if (!catHindiName.trim()) {
      setFormError('Please enter a category name in Hindi.');
      return;
    }

    if (onAddCategory) {
      onAddCategory({
        englishName: catEnglishName.trim(),
        hindiName: catHindiName.trim(),
        emoji: catEmoji || '📂',
        color: catColor
      });
      setSuccessMsg(`Category "${catEnglishName}" added successfully!`);
      
      setCatEnglishName('');
      setCatHindiName('');
      setCatEmoji('📂');
      setCatColor('purple');
      setShowCategoryForm(false);

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!englishLabel.trim() || !hindiLabel.trim()) {
      setFormError('Please enter labels in both English and Hindi.');
      return;
    }

    onAddCard({
      englishLabel: englishLabel.trim(),
      hindiLabel: hindiLabel.trim(),
      englishSpeech: englishSpeech.trim() || englishLabel.trim(),
      hindiSpeech: hindiSpeech.trim() || hindiLabel.trim(),
      emoji: customImage ? undefined : selectedEmoji,
      image: customImage,
      category: selectedCategory,
      color: selectedColor,
      isCustom: true,
      isVisible: true,
      englishAudio,
      hindiAudio,
    });

    // Reset Form
    setEnglishLabel('');
    setHindiLabel('');
    setEnglishSpeech('');
    setHindiSpeech('');
    setCustomImage(undefined);
    setSelectedEmoji('🍎');
    setEnglishAudio(undefined);
    setHindiAudio(undefined);
    setFormError('');
    setSuccessMsg('Card added successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveVoiceConfig = () => {
    onSaveVoiceSettings({
      englishVoiceName: selectedEngVoice ? selectedEngVoice : null,
      hindiVoiceName: selectedHinVoice ? selectedHinVoice : null,
      speed: parseFloat(voiceSpeed.toString()),
      pitch: parseFloat(voicePitch.toString()),
      volume: parseFloat(voiceVolume.toString()),
      hapticEnabled,
      hapticPattern,
    });
    setSuccessMsg('Voice settings updated!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleTestVoice = (lang: 'en' | 'hi') => {
    const sampleText = lang === 'en' 
      ? 'Hello, how can I help you today?' 
      : 'नमस्ते, आज मैं आपकी क्या सहायता कर सकता हूँ?';
    
    // Construct local momentary voice variables for testing
    const testConfig: VoiceSettings = {
      englishVoiceName: selectedEngVoice || null,
      hindiVoiceName: selectedHinVoice || null,
      speed: Number(voiceSpeed),
      pitch: Number(voicePitch),
      volume: Number(voiceVolume)
    };

    speakText(sampleText, lang, testConfig).catch((err) => {
      console.error('Test speech failed', err);
    });
  };

  // Group and sort cards by category for ease of management
  const getCardsByCategory = (catId: string) => {
    const items = cards.filter(c => c.category === catId);
    if (manageSortMethod === 'alphabetical') {
      return [...items].sort((a, b) => a.englishLabel.localeCompare(b.englishLabel));
    }
    if (manageSortMethod === 'most-used') {
      return [...items].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    }
    if (manageSortMethod === 'newest') {
      return [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return items; // 'manual' mode
  };

  // Backup configuration via JSON Export
  const handleExportData = () => {
    const payload = JSON.stringify({ cards, voiceSettings }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bilingual-aac-board-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import configuration JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (Array.isArray(parsed.cards)) {
            // Re-inflate into the system
            if (window.confirm('Do you want to restore these settings? This will overwrite current cards.')) {
              localStorage.setItem('aac_cards_list', JSON.stringify(parsed.cards));
              if (parsed.voiceSettings) {
                localStorage.setItem('aac_voice_settings', JSON.stringify(parsed.voiceSettings));
              }
              window.location.reload();
            }
          } else {
            alert('Invalid backup schema.');
          }
        } catch {
          alert('Could not parse layout settings file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div id="parent-modal-overlay" className="fixed inset-0 bg-slate-50 z-45 flex flex-col select-none animate-fade-in">
      <div 
        id="parent-modal-dialog" 
        className="bg-white w-full h-full flex flex-col relative overflow-hidden"
      >
        {/* Banner */}
        <div className="bg-[#FDFCF0] px-6 py-4 border-b-2 border-[#FFDE59] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛠️</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black font-sans text-slate-800">AAC Settings & Customization</h2>
            </div>
          </div>
          <button 
            id="close-parent-modal" 
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-2xl shadow-xs transition-all border border-slate-200 font-sans font-black text-sm cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            id="tab-create-card"
            onClick={() => { setActiveTab('create'); setFormError(''); }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 md:px-5 py-2.5 md:py-3 rounded-xl font-bold font-sans text-xs md:text-sm whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#FF8B3D] text-white shadow-sm border-b-2 border-[#D16D29]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Create Picture Card</span>
          </button>
          
          <button
            id="tab-manage-cards"
            onClick={() => { setActiveTab('manage'); setFormError(''); }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 md:px-5 py-2.5 md:py-3 rounded-xl font-bold font-sans text-xs md:text-sm whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-[#FF8B3D] text-white shadow-sm border-b-2 border-[#D16D29]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span>Manage Cards ({cards.length})</span>
          </button>

          <button
            id="tab-speech-settings"
            onClick={() => { setActiveTab('settings'); setFormError(''); }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 md:px-5 py-2.5 md:py-3 rounded-xl font-bold font-sans text-xs md:text-sm whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#FF8B3D] text-white shadow-sm border-b-2 border-[#D16D29]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-105'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Voice & Speech</span>
          </button>
        </div>

        {/* Dynamic Inner Panel View scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Global Alert messages */}
          {successMsg && (
            <div id="parent-success-alert" className="mb-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 font-sans font-semibold animate-pulse">
              <Check className="w-4 h-4" /> {successMsg}
            </div>
          )}
          {formError && (
            <div id="parent-error-alert" className="mb-4 bg-rose-50 border-2 border-rose-200 text-rose-800 px-4 py-3 rounded-2xl text-sm font-sans font-semibold">
              ⚠️ {formError}
            </div>
          )}

          {/* TAB 1: CARD CREATOR */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateCard} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Customizer Left Block */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2 border-b pb-2">
                    <Palette className="w-5 h-5 text-slate-500" />
                    <span>Visual Appearance</span>
                  </h3>
                  
                  {/* Category Selection */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-600">Board Category</label>
                      <button
                        type="button"
                        onClick={() => setShowCategoryForm(!showCategoryForm)}
                        className="text-xs font-extrabold text-[#FF8B3D] hover:text-[#D16D29] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {showCategoryForm ? '✕ Close Category Builder' : '➕ Build New Category'}
                      </button>
                    </div>

                    {showCategoryForm && (
                      <div className="mb-4 p-4 bg-orange-50/50 border-2 border-orange-200/50 rounded-2xl space-y-3.5">
                        <div className="flex items-center gap-2 border-b pb-1.5 border-orange-200/20">
                          <span className="text-sm">✨</span>
                          <h4 className="text-xs font-black text-slate-800">New Speech Board Category</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">English Category Name</label>
                            <input
                              type="text"
                              value={catEnglishName}
                              onChange={(e) => setCatEnglishName(e.target.value)}
                              placeholder="Toys, Outdoors"
                              className="w-full p-2.5 rounded-xl border border-orange-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Hindi Category Name</label>
                            <input
                              type="text"
                              value={catHindiName}
                              onChange={(e) => setCatHindiName(e.target.value)}
                              placeholder="खिलौने, बाहर"
                              className="w-full p-2.5 rounded-xl border border-orange-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase font-sans">Category Emoji Symbol</label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                maxLength={2}
                                value={catEmoji}
                                onChange={(e) => setCatEmoji(e.target.value)}
                                className="w-12 p-2.5 text-center text-sm rounded-xl border border-orange-200 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-300"
                              />
                              <div className="flex-1 overflow-x-auto scrollbar-none flex gap-1 bg-white border border-slate-200 rounded-xl p-1.5 items-center">
                                {['🧩', '🏃', '🍕', '🧸', '🏠', '🏥', '🚌', '🐱', '🎭', '🌳', '🎒', '🌦️'].map(emo => (
                                  <button
                                    key={emo}
                                    type="button"
                                    onClick={() => setCatEmoji(emo)}
                                    className="p-1 hover:bg-orange-100 rounded text-sm shrink-0 cursor-pointer"
                                  >
                                    {emo}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Badge Theme Color</label>
                            <select
                              value={catColor}
                              onChange={(e) => setCatColor(e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-orange-200 bg-white text-xs font-bold font-sans uppercase focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
                            >
                              <option value="purple">💜 Deep Purple</option>
                              <option value="violet">🔮 Violet Indigo</option>
                              <option value="fuchsia">🌸 Fuchsia Pink</option>
                              <option value="rose">🌹 Sweet Rose</option>
                              <option value="indigo">🌌 Cosmic Indigo</option>
                              <option value="cyan">🌊 Ocean Cyan</option>
                              <option value="lime">🍏 Bright Lime</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1 animate-fadeIn">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCategoryForm(false);
                              setCatEnglishName('');
                              setCatHindiName('');
                            }}
                            className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-[10.5px] font-bold cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateCategory}
                            className="px-3.5 py-1.5 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-[10.5px] font-black cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Save Category
                          </button>
                        </div>
                      </div>
                    )}

                    <select
                      id="card-category-select"
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        // Auto-assign Fitzgerald Key color based on chosen category for helper UX!
                        if (e.target.value === 'quick') setSelectedColor('#FBCFE8');
                        else if (e.target.value === 'verbs') setSelectedColor('#BBF7D0');
                        else if (e.target.value === 'nouns') setSelectedColor('#FED7AA');
                        else if (e.target.value === 'feelings') setSelectedColor('#BAE6FD');
                        else if (e.target.value === 'people') setSelectedColor('#FEF08A');
                        else if (e.target.value === 'places') setSelectedColor('#99F6E4');
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400 bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.emoji} {cat.englishName} ({cat.hindiName})</option>
                      ))}
                    </select>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Card Theme Coding (Fitzgerald Key colors recommended!)</label>
                    <div className="flex flex-wrap gap-2">
                      {FJ_COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.hex}
                          type="button"
                          onClick={() => setSelectedColor(opt.hex)}
                          className="w-9 h-9 rounded-xl border-2 transition-all relative flex items-center justify-center cursor-pointer shadow-xs"
                          style={{ 
                            backgroundColor: opt.hex,
                            borderColor: selectedColor === opt.hex ? '#3b82f6' : 'rgba(0,0,0,0.1)' 
                          }}
                          title={opt.label}
                        >
                          {selectedColor === opt.hex && <span className="text-blue-600">✔</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Symbol choice */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Symbol Representation</label>
                    
                    {/* Choose between Emoji Preset or Custom Camera Upload */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <label className="border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:bg-slate-50 border-amber-300 bg-amber-50/20">
                        <span className="text-xl">😀</span>
                        <span className="text-xs font-bold font-sans">Use Cute Emoji</span>
                      </label>
                      
                      <label className="border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:bg-slate-50 border-slate-200">
                        <Image className="w-5 h-5 text-slate-500" />
                        <span className="text-xs font-bold font-sans">Upload Picture</span>
                        <input
                          id="custom-img-uploader"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {customImage ? (
                      <div className="bg-slate-100 p-3 rounded-2xl flex items-center justify-between border">
                        <div className="flex items-center gap-3">
                          <img src={customImage} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-white shadow-xs" />
                          <div>
                            <p className="text-xs font-bold text-slate-700 font-sans">Custom image loaded</p>
                            <p className="text-[10px] text-slate-400 font-sans">Clears current Emoji</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomImage(undefined)}
                          className="p-1 px-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tap an emoji below:</span>
                        <div className="h-32 overflow-y-auto p-2 bg-slate-50 rounded-2xl border flex flex-wrap gap-1.5 justify-center">
                          {PRESET_EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setSelectedEmoji(emoji)}
                              className={`w-9 h-9 text-2xl flex items-center justify-center rounded-xl transition-all ${
                                selectedEmoji === emoji ? 'bg-amber-400 shadow-md scale-110' : 'hover:bg-slate-200'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Translation Right Block */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2 border-b pb-2">
                    <Languages className="w-5 h-5 text-slate-500" />
                    <span>Labels & Audio Speech</span>
                  </h3>
                  
                  {/* English Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Visual Symbol Label (English)</label>
                    <input
                      id="card-eng-label"
                      type="text"
                      placeholder="e.g. Eat Apple"
                      value={englishLabel}
                      onChange={(e) => setEnglishLabel(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400"
                    />
                  </div>

                  {/* Hindi Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Visual Symbol Label (Hindi / हिंदी)</label>
                    <input
                      id="card-hin-label"
                      type="text"
                      placeholder="जैसे सेब खाना है"
                      value={hindiLabel}
                      onChange={(e) => setHindiLabel(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400"
                    />
                  </div>

                  {/* English Speech Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      What to Speak in English? (Leave blank to use visual label)
                    </label>
                    <input
                      id="card-eng-speech"
                      type="text"
                      placeholder="e.g. I want to eat an apple, please"
                      value={englishSpeech}
                      onChange={(e) => setEnglishSpeech(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400 bg-slate-50/50"
                    />

                    {/* English Voice Override Recorder */}
                    <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-3 mt-1.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                          <Mic className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Custom English Voice Recording (Optional)</span>
                        </span>
                        {englishAudio && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1.5">
                        {recordingTarget === 'english' ? (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 animate-pulse"
                          >
                            <Square className="w-3 h-3 fill-white" />
                            <span>Stop Rec</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={recordingTarget !== null}
                            onClick={() => startRecording('english')}
                            className={`px-2.5 py-1.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${
                              recordingTarget !== null ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Mic className="w-3 h-3" />
                            <span>{englishAudio ? 'Re-record English' : 'Record English Voice'}</span>
                          </button>
                        )}

                        {englishAudio && (
                          <>
                            <button
                              type="button"
                              onClick={() => playRecordedSample(englishAudio)}
                              className="px-2 py-1.5 bg-indigo-100/50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-indigo-700" />
                              <span>Play Recording</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEnglishAudio(undefined)}
                              className="px-2 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-[10.5px] font-bold cursor-pointer"
                            >
                              Clear
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hindi Speech Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      बिस्तार से हिंदी में क्या बोला जाए? (खाली छोड़ने पर लेबल बोलेगा)
                    </label>
                    <input
                      id="card-hin-speech"
                      type="text"
                      placeholder="जैसे मम्मी मुझे सेब खाना है"
                      value={hindiSpeech}
                      onChange={(e) => setHindiSpeech(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400 bg-slate-50/50"
                    />

                    {/* Hindi Voice Override Recorder */}
                    <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-3 mt-1.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                          <Mic className="w-3.5 h-3.5 text-indigo-500" />
                          <span>कस्टम हिंदी आवाज़ रिकॉर्ड करें (वैकल्पिक)</span>
                        </span>
                        {hindiAudio && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            सक्रिय
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {recordingTarget === 'hindi' ? (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 animate-pulse"
                          >
                            <Square className="w-3 h-3 fill-white" />
                            <span>रिकॉर्डिंग रोकें</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={recordingTarget !== null}
                            onClick={() => startRecording('hindi')}
                            className={`px-2.5 py-1.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${
                              recordingTarget !== null ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Mic className="w-3 h-3" />
                            <span>{hindiAudio ? 'फिर से रिकॉर्ड करें' : 'हिंदी आवाज़ रिकॉर्ड करें'}</span>
                          </button>
                        )}

                        {hindiAudio && (
                          <>
                            <button
                              type="button"
                              onClick={() => playRecordedSample(hindiAudio)}
                              className="px-2 py-1.5 bg-indigo-100/50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-indigo-700" />
                              <span>सुने</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setHindiAudio(undefined)}
                              className="px-2 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-[10.5px] font-bold cursor-pointer"
                            >
                              हटाएं
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100 justify-end">
                <button
                  type="submit"
                  id="submit-new-card-btn"
                  className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-2xl font-bold font-sans text-sm shadow-md shadow-amber-300/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create AAC Card</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MANAGE & REORDER CARDS */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 p-4 rounded-2xl border gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-755 font-sans">Vocabulary Backup</h4>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    id="export-settings-btn"
                    type="button"
                    onClick={handleExportData}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold font-sans text-xs text-slate-700 hover:bg-slate-105 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                  
                  <label className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold font-sans text-xs text-slate-700 hover:bg-slate-105 transition-colors cursor-pointer relative">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import</span>
                    <input
                      id="import-backup-file"
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    id="reset-original-btn"
                    type="button"
                    onClick={onResetToDefaults}
                    className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-50 border border-rose-250/60 rounded-xl font-bold font-sans text-xs text-rose-700 hover:bg-rose-100/80 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Filter & Sort Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter Dropdown */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-amber-100 text-[#FF8B3D] rounded-xl shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-850 justify-between">Filter Category</h5>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <select
                      id="manage-category-filter-dropdown"
                      value={manageCategoryFilter}
                      onChange={(e) => setManageCategoryFilter(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-205 rounded-xl font-sans font-extrabold text-xs text-slate-700 shadow-xs focus:ring-2 focus:ring-amber-300 focus:outline-none transition-all cursor-pointer appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
                    >
                      <option value="all">📂 View All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.englishName} ({cat.hindiName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Card Sorting Dropdown */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-200/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-blue-105 text-indigo-600 rounded-xl shrink-0">
                      <ListFilter className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-850">Sort Vocabulary</h5>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <select
                      id="manage-sorting-dropdown"
                      value={manageSortMethod}
                      onChange={(e) => setManageSortMethod(e.target.value as any)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-205 rounded-xl font-sans font-extrabold text-xs text-slate-700 shadow-xs focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all cursor-pointer appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
                    >
                      <option value="manual">📂 Custom / Manual Drag</option>
                      <option value="alphabetical">🔤 Alphabetical (A-Z)</option>
                      <option value="most-used">🔥 Most Used (Frequency)</option>
                      <option value="newest">🆕 Newest Created</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grouped Catalog */}
              <div className="space-y-6">
                {categories
                  .filter((cat) => manageCategoryFilter === 'all' || cat.id === manageCategoryFilter)
                  .map((cat) => {
                    const itemsInCat = getCardsByCategory(cat.id);
                    return (
                    <div key={cat.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                        <h4 className="font-sans font-bold text-slate-700 flex items-center gap-2">
                          <span className="text-lg">{cat.emoji}</span>
                          <span className="font-black text-slate-800">{cat.englishName} ({cat.hindiName})</span>
                          <span className="text-xs text-slate-400 font-medium font-sans">({itemsInCat.length} items)</span>
                        </h4>

                        {/* If category is custom, allow deleting it */}
                        {cat.id.startsWith('custom-cat-') && onDeleteCategory && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete the category "${cat.englishName}"? This will also delete ALL cards belonging to this category!`)) {
                                onDeleteCategory(cat.id);
                              }
                            }}
                            className="text-xs text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-1 bg-white hover:bg-rose-50 px-2.5 py-1.5 border border-rose-200 rounded-xl cursor-pointer transition-colors shrink-0"
                            title="Delete custom category and all its cards"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Category</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                        {itemsInCat.map((card) => {
                          return (
                            <div 
                              key={card.id} 
                              draggable={manageSortMethod === 'manual'}
                              onDragStart={(e) => manageSortMethod === 'manual' && handleDragStart(e, card.id, cat.id)}
                              onDragOver={(e) => manageSortMethod === 'manual' && handleDragOver(e, card.id, cat.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => manageSortMethod === 'manual' && handleDrop(e, card.id, cat.id)}
                              onDragEnd={handleDragEnd}
                              style={{ backgroundColor: card.color || '#fff' }}
                              className={`p-3 rounded-xl border transition-all flex items-center justify-between group/card ${
                                draggedCardId === card.id 
                                  ? 'opacity-40 border-2 border-dashed border-amber-400 scale-95' 
                                  : dragOverCardId === card.id 
                                    ? 'border-2 border-dashed border-amber-500 bg-amber-50/55 scale-98 shadow-inner' 
                                    : 'border-black/10 hover:shadow-xs hover:border-black/20'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                {/* Grip Handle for Drag and Drop */}
                                {manageSortMethod === 'manual' && (
                                  <div 
                                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-0.5 select-none"
                                    title="Hold and drag to reorder cards within this category!"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                )}

                                <span className="text-2xl leading-none origin-center shrink-0">
                                  {card.image ? (
                                    <img src={card.image} alt="" className="w-7 h-7 object-cover rounded-md pointer-events-none" />
                                  ) : (
                                    card.emoji || '✨'
                                  )}
                                </span>
                                <div className="text-left overflow-hidden select-text">
                                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">{card.englishLabel}</p>
                                  <p className="text-[10px] font-hindi font-semibold text-slate-500 truncate mt-0.5">{card.hindiLabel}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {/* Toggle visible */}
                                <button
                                  type="button"
                                  onClick={() => onUpdateCard(card.id, { isVisible: !card.isVisible })}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    card.isVisible 
                                      ? 'bg-slate-150 border-slate-250 hover:bg-slate-200 text-slate-600' 
                                      : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-600'
                                  }`}
                                  title={card.isVisible ? 'Hide card' : 'Un-hide card'}
                                >
                                  {card.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>

                                {/* Edit button */}
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(card)}
                                  className="p-1.5 bg-amber-100/80 text-amber-805 hover:bg-amber-205 border border-amber-300/40 rounded-lg transition-all cursor-pointer"
                                  title="Edit card"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete "${card.englishLabel}"?`)) {
                                      onDeleteCard(card.id);
                                    }
                                  }}
                                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-250 rounded-lg transition-all cursor-pointer"
                                  title="Delete card"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: VOICE & TEXT TO SPEECH (TTS) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              {/* English Accent */}
              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">English Speech Engine Accent</label>
                <div className="flex gap-2">
                  <select
                    id="eng-voice-select"
                    value={selectedEngVoice}
                    onChange={(e) => setSelectedEngVoice(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400 bg-white text-sm"
                  >
                    <option value="">-- Browser Default Voice --</option>
                    {availableVoices
                      .filter(v => v.lang.toLowerCase().startsWith('en'))
                      .map(v => (
                        <option key={v.name} value={v.name}>{v.name} ({v.lang}) {v.localService ? '• Local' : ''}</option>
                      ))
                    }
                  </select>
                  <button
                    type="button"
                    onClick={() => handleTestVoice('en')}
                    className="px-4 bg-slate-100 border text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold font-sans cursor-pointer transition-colors"
                  >
                    🔊 Test Voice
                  </button>
                </div>
              </div>

              {/* Hindi Accent */}
              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">Hindi Speech Engine Accent (हिंदी आवाज)</label>
                <div className="flex gap-2">
                  <select
                    id="hin-voice-select"
                    value={selectedHinVoice}
                    onChange={(e) => setSelectedHinVoice(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400 bg-white text-sm"
                  >
                    <option value="">-- Browser Default Voice --</option>
                    {availableVoices
                      .filter(v => v.lang.toLowerCase().startsWith('hi'))
                      .map(v => (
                        <option key={v.name} value={v.name}>{v.name} ({v.lang}) {v.localService ? '• Local' : ''}</option>
                      ))
                    }
                  </select>
                  <button
                    type="button"
                    onClick={() => handleTestVoice('hi')}
                    className="px-4 bg-slate-100 border text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold font-sans cursor-pointer transition-colors"
                  >
                    🔊 आवाज टेस्ट करें
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Speech rate/speed slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                    <span>Speech Rate (Speed)</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{voiceSpeed}x</span>
                  </div>
                  <input
                    id="speed-range-slider"
                    type="range"
                    min="0.4"
                    max="1.6"
                    step="0.05"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-2 bg-slate-150 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>Very Slow</span>
                    <span>Normal (1.0x)</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Speech pitch slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                    <span>Voice Pitch (Tone)</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{voicePitch}x</span>
                  </div>
                  <input
                    id="pitch-range-slider"
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={voicePitch}
                    onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-2 bg-slate-150 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>Deeper</span>
                    <span>Normal (1.0x)</span>
                    <span>High/Child</span>
                  </div>
                </div>

                {/* Speech volume level slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                    <span>Voice Volume Boost</span>
                    <span className="text-[#FF8B3D] bg-orange-50 px-2 py-0.5 rounded-lg font-black">{Math.round(voiceVolume * 100)}%</span>
                  </div>
                  <input
                    id="volume-range-slider"
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={voiceVolume}
                    onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-2 bg-slate-150 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>Soft</span>
                    <span>Medium (50%)</span>
                    <span>Maximum (100%)</span>
                  </div>
                </div>
              </div>

              {/* Tactile Preference & Haptic Feedback - Simplified On/Off */}
              <div className="bg-emerald-50/45 border border-emerald-100 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-850 flex items-center gap-2">
                    <span>📳</span>
                    <span>Sensory Tactile Feedback (Haptics)</span>
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="haptic-toggle-switch"
                      type="checkbox"
                      checked={hapticEnabled}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setHapticEnabled(val);
                        if (val) triggerHapticFeedback('normal');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* PWA Update Card */}
              <div className="border-2 border-slate-100 rounded-2xl p-5 bg-slate-50 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <span>📱</span>
                    <span>Progressive Web App Updates</span>
                  </h4>
                  
                  <button
                    type="button"
                    onClick={handleCheckForPWAUpdate}
                    disabled={checkingUpdate}
                    className={`px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold font-sans text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 border-b-2 border-indigo-800 cursor-pointer ${
                      checkingUpdate ? 'opacity-50 cursor-not-allowed bg-indigo-400 animate-pulse' : 'hover:bg-indigo-700'
                    }`}
                  >
                    <span>🔄</span>
                    <span>{checkingUpdate ? 'Updating...' : 'Update Application'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  id="save-voice-config-btn"
                  onClick={handleSaveVoiceConfig}
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-2xl font-bold font-sans text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Voice Setup</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* --- EDIT CARD OVERLAY DIALOG --- */}
        {editingCard && (
          <div id="edit-card-overlay" className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90%] overflow-y-auto p-6 border-4 border-[#FFDE59] shadow-2xl relative">
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-sans text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                <span>Edit AAC Card Details</span>
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card Style & Image (Left Block) */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-755 flex items-center gap-2 border-b pb-2">
                      <Palette className="w-4 h-4 text-slate-500" />
                      <span>Card Visuals</span>
                    </h4>

                    {/* Fitzgerald Key Color Picker */}
                    <div>
                      <span className="block text-xs font-bold text-slate-600 mb-2">Card Type Color (Fitzgerald Key):</span>
                      <div className="flex flex-wrap gap-2">
                        {FJ_COLOR_OPTIONS.map((col) => (
                          <button
                            key={col.hex}
                            type="button"
                            onClick={() => setEditColor(col.hex)}
                            style={{ backgroundColor: col.hex }}
                            className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                              editColor === col.hex ? 'border-slate-800 scale-110 shadow-sm' : 'border-black/10'
                            }`}
                            title={col.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Category Select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Board Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400 bg-white"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.emoji} {c.englishName} ({c.hindiName})</option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Image or Emoji */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="block text-xs font-bold text-slate-600">Symbol Source:</span>
                        <label className="flex items-center gap-1 text-[11px] font-bold text-[#FF8B3D] bg-orange-50 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                          <Image className="w-3.5 h-3.5" />
                          <span>Upload Picture</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {editCustomImage ? (
                        <div className="bg-slate-100 p-3 rounded-2xl flex items-center justify-between border">
                          <div className="flex items-center gap-3">
                            <img src={editCustomImage} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-white shadow-xs" />
                            <div>
                              <p className="text-xs font-bold text-slate-700 font-sans">Custom image loaded</p>
                              <p className="text-[10px] text-slate-400 font-sans">Clears current Emoji</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditCustomImage(undefined)}
                            className="p-1 px-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tap an emoji:</span>
                          <div className="h-32 overflow-y-auto p-2 bg-slate-50 rounded-2xl border flex flex-wrap gap-1.5 justify-center">
                            {PRESET_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setEditEmoji(emoji);
                                  setEditCustomImage(undefined);
                                }}
                                className={`w-9 h-9 text-2xl flex items-center justify-center rounded-xl transition-all ${
                                  editEmoji === emoji && !editCustomImage ? 'bg-amber-400 shadow-md scale-110' : 'hover:bg-slate-200'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Labels & Speech (Right Block) */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-755 flex items-center gap-2 border-b pb-2">
                      <Languages className="w-4 h-4 text-slate-500" />
                      <span>Labels & Speech</span>
                    </h4>

                    {/* English Label */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Visual Symbol Label (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Eat Apple"
                        value={editEnglishLabel}
                        onChange={(e) => setEditEnglishLabel(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400"
                      />
                    </div>

                    {/* Hindi Label */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Visual Symbol Label (Hindi / हिंदी)</label>
                      <input
                        type="text"
                        placeholder="जैसे सेब खाना है"
                        value={editHindiLabel}
                        onChange={(e) => setEditHindiLabel(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400"
                      />
                    </div>

                    {/* English Speech Text */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        What to Speak in English? (Leave blank to use visual label)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. I want to eat an apple, please"
                        value={editEnglishSpeech}
                        onChange={(e) => setEditEnglishSpeech(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400 bg-slate-50/50"
                      />

                      {/* Edit English Voice Override Recorder */}
                      <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-3 mt-1.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                            <Mic className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Custom English Voice Recording (Optional)</span>
                          </span>
                          {editEnglishAudio && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5">
                          {recordingTarget === 'edit-english' ? (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 animate-pulse"
                            >
                              <Square className="w-3 h-3 fill-white" />
                              <span>Stop Rec</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={recordingTarget !== null}
                              onClick={() => startRecording('edit-english')}
                              className={`px-2.5 py-1.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${
                                recordingTarget !== null ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <Mic className="w-3 h-3" />
                              <span>{editEnglishAudio ? 'Re-record English' : 'Record English Voice'}</span>
                            </button>
                          )}

                          {editEnglishAudio && (
                            <>
                              <button
                                type="button"
                                onClick={() => playRecordedSample(editEnglishAudio)}
                                className="px-2 py-1.5 bg-indigo-100/50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-indigo-700" />
                                <span>Play Recording</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditEnglishAudio(undefined)}
                                className="px-2 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-[10.5px] font-bold cursor-pointer"
                              >
                                Clear
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hindi Speech Text */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        बिस्तार से हिंदी में क्या बोला जाए? (खाली छोड़ने पर लेबल बोलेगा)
                      </label>
                      <input
                        type="text"
                        placeholder="जैसे मम्मी मुझे सेब खाना है"
                        value={editHindiSpeech}
                        onChange={(e) => setEditHindiSpeech(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 font-sans focus:border-amber-400 bg-slate-50/50"
                      />

                      {/* Edit Hindi Voice Override Recorder */}
                      <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-3 mt-1.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                            <Mic className="w-3.5 h-3.5 text-indigo-500" />
                            <span>कस्टम हिंदी आवाज़ रिकॉर्ड करें (वैकल्पिक)</span>
                          </span>
                          {editHindiAudio && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              सक्रिय
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {recordingTarget === 'edit-hindi' ? (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 animate-pulse"
                            >
                              <Square className="w-3 h-3 fill-white" />
                              <span>रिकॉर्डिंग रोकें</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={recordingTarget !== null}
                              onClick={() => startRecording('edit-hindi')}
                              className={`px-2.5 py-1.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${
                                recordingTarget !== null ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <Mic className="w-3 h-3" />
                              <span>{editHindiAudio ? 'फिर से रिकॉर्ड करें' : 'हिंदी आवाज़ रिकॉर्ड करें'}</span>
                            </button>
                          )}

                          {editHindiAudio && (
                            <>
                              <button
                                type="button"
                                onClick={() => playRecordedSample(editHindiAudio)}
                                className="px-2 py-1.5 bg-indigo-100/50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-indigo-700" />
                                <span>सुने</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditHindiAudio(undefined)}
                                className="px-2 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-[10.5px] font-bold cursor-pointer"
                              >
                                हटाएं
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {formError && (
                  <p className="text-sm font-bold text-rose-500 font-sans bg-rose-50 p-2.5 rounded-xl border border-rose-100">{formError}</p>
                )}

                <div className="flex gap-4 pt-4 border-t border-slate-100 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold font-sans text-sm transition-all"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#FF8B3D] hover:bg-[#FF8B3D]/95 text-white rounded-2xl font-bold font-sans text-sm border-b-4 border-[#D16D29] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Check className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
