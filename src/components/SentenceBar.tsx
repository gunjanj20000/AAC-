import { AACCard, LanguageMode } from '../types';
import { Play, RotateCcw, Volume2, HelpCircle } from 'lucide-react';

interface SentenceBarProps {
  sentence: AACCard[];
  onSpeak: () => void;
  onClear: () => void;
  onRemoveCard: (index: number) => void;
  languageMode: LanguageMode;
}

export function SentenceBar({
  sentence,
  onSpeak,
  onClear,
  onRemoveCard,
  languageMode,
}: SentenceBarProps) {
  return (
    <div 
      id="sentence-bar" 
      className="bg-white mx-3 md:mx-4 mt-3 p-3 md:p-4 rounded-3xl border-2 border-amber-200/85 shadow-md relative select-none"
    >
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        
        {/* Selected AAC Cards container (First on mobile, middle on desktop) */}
        <div className="order-1 md:order-2 flex-1 w-full min-h-[76px] md:min-h-[82px] bg-[#FDFCF5] border-2 border-amber-100/70 rounded-2xl p-2 overflow-x-auto flex items-center gap-3 scrollbar-thin shadow-inner">
          {sentence.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-full py-2 text-center select-none">
              <span className="text-slate-500 font-sans font-extrabold text-xs md:text-sm tracking-tight">
                {languageMode === 'hindi' 
                  ? '👇 वाक्य बनाने के लिए नीचे कार्ड चुनें' 
                  : '👇 Tap cards below to build your sentence'}
              </span>
              <span className="text-[10px] md:text-[11px] text-slate-400 font-hindi font-medium mt-0.5">
                {languageMode === 'both' && 'वाक्य बनाने के लिए नीचे कार्ड चुनें'}
              </span>
            </div>
          ) : (
            <div className="flex gap-2.5 px-1">
              {sentence.map((card, idx) => (
                <div
                  key={`${card.id}-${idx}`}
                  id={`sentence-card-${idx}`}
                  onClick={() => onRemoveCard(idx)}
                  className="relative group flex flex-col items-center justify-center min-w-[68px] md:min-w-[76px] h-[72px] md:h-[78px] p-1 md:p-1.5 rounded-xl border border-slate-250/20 shadow-xs active:scale-95 transition-all duration-150 cursor-pointer overflow-hidden animate-fade-in"
                  style={{ backgroundColor: card.color || '#f1f5f9' }}
                >
                  {/* Small absolute indicator for tap-to-remove */}
                  <div className="absolute top-0.5 right-0.5 bg-[#FF8B3D] text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                    ✕
                  </div>
                  
                  {/* Emoji symbol */}
                  <span className="text-xl md:text-2xl leading-none mb-0.5 select-none">
                    {card.emoji || '✨'}
                  </span>

                  {/* Main displayed text based on mode */}
                  <div className="text-center w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {languageMode !== 'hindi' && (
                      <p className="text-[9.5px] md:text-[11px] font-sans font-black text-slate-900 leading-tight">
                        {card.englishLabel}
                      </p>
                    )}
                    {languageMode !== 'english' && (
                      <p className="text-[9px] md:text-[10.5px] font-hindi font-extrabold text-slate-850 leading-none mt-0.5">
                        {card.hindiLabel}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons wrapper (Below cards on mobile, split-positioned via md:contents on desktop) */}
        <div className="order-2 md:order-1 flex items-center gap-2 md:gap-3 shrink-0 md:flex-row md:contents">
          {/* Play / Speak main button */}
          <button
            id="speak-sentence-btn"
            disabled={sentence.length === 0}
            onClick={onSpeak}
            className={`flex-1 md:flex-none px-5 md:px-6 py-2.5 md:py-3.5 rounded-2xl font-extrabold font-sans flex items-center justify-center gap-2 shadow-md border-b-4 transition-all duration-155 active:scale-95 ${
              sentence.length > 0
                ? 'bg-[#FF8B3D] border-[#D16D29] text-white hover:bg-[#FF8B3D]/95 active:translate-y-[2px]'
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Play className={`w-4 h-4 md:w-5 md:h-5 ${sentence.length > 0 ? 'animate-bounce' : ''}`} />
            <span className="text-sm md:text-base whitespace-nowrap">
              {languageMode === 'hindi' ? 'बोलें (Speak)' : 'Speak Sentence'}
            </span>
          </button>

          {/* Clear Sentence button */}
          <button
            id="clear-sentence-btn"
            disabled={sentence.length === 0}
            onClick={onClear}
            className={`px-3 md:px-4 py-2.5 md:py-3.5 rounded-2xl font-bold font-sans flex items-center justify-center gap-1.5 border-b-4 transition-all duration-150 active:scale-95 shrink-0 ${
              sentence.length > 0
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 active:translate-y-[2px]'
                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
            title="Clear all"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs md:inline whitespace-nowrap">
              {languageMode === 'hindi' ? 'साफ करें' : 'Clear'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
