import { AACCard, LanguageMode } from '../types';
import { Sparkles, EyeOff } from 'lucide-react';

function adjustColorBrightness(hex: string, percent: number): string {
  try {
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex, 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    
    return '#' + (
      0x1000000 + 
      clamp(R) * 0x10000 + 
      clamp(G) * 0x100 + 
      clamp(B)
    ).toString(16).slice(1);
  } catch {
    return hex;
  }
}

interface CardGridProps {
  cards: AACCard[];
  onCardTap: (card: AACCard) => void;
  languageMode: LanguageMode;
  parentMode: boolean;
  onToggleVisibility?: (id: string) => void;
}

export function CardGrid({
  cards,
  onCardTap,
  languageMode,
  parentMode,
  onToggleVisibility,
}: CardGridProps) {
  // If no cards are visible or present
  const availableCards = parentMode ? cards : cards.filter(c => c.isVisible);

  if (availableCards.length === 0) {
    return (
      <div id="empty-grid-indicator" className="flex flex-col items-center justify-center p-12 text-center select-none bg-amber-50/20 rounded-3xl border-4 border-dashed border-[#FFDE59] m-4">
        <Sparkles className="w-10 h-10 text-amber-400 mb-3 animate-spin duration-3000" />
        <h4 className="text-lg font-bold font-sans text-slate-700">No cards here</h4>
        <p className="text-sm font-sans text-slate-400 mt-1">
          {parentMode ? 'Add some cards or unhide existing cards.' : 'Ask mama or papa to add cards here!'}
        </p>
      </div>
    );
  }

  return (
    <div 
      id="aac-cards-grid" 
      className="grid grid-cols-2 min-[390px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3.5 px-3 md:px-4 py-2 mt-1 select-none"
    >
      {availableCards.map((card) => {
        const isCurrentlyHidden = !card.isVisible;
        const baseColor = card.color || '#FEF08A';
        const borderColor = adjustColorBrightness(baseColor, -20);
        const shadowColor = adjustColorBrightness(baseColor, -35);
        
        return (
          <div
            key={card.id}
            id={`aac-card-${card.id}`}
            onClick={() => {
              if (parentMode && onToggleVisibility) {
                // In parent mode, clicking is dedicated to configuring, but we can also speak it optionally.
                onCardTap(card);
              } else if (!isCurrentlyHidden) {
                onCardTap(card);
              }
            }}
            className={`relative group flex flex-col items-center justify-between p-2 pb-2.5 rounded-2xl border-2 card-shadow aspect-square cursor-pointer select-none transition-all duration-100 ${
              isCurrentlyHidden ? 'opacity-50 grayscale border-dashed' : ''
            }`}
            style={{ 
              backgroundColor: baseColor,
              borderColor: borderColor,
              ['--shadow-color' as any]: shadowColor
            }}
            title={card.englishLabel}
          >
            {/* Fitzgerald Key Standard Category indicator bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/5 rounded-t-2xl" />

            {/* Hidden state / Custom card badge */}
            <div className="absolute top-2.5 left-2.5 flex gap-1 items-center z-10">
              {card.isCustom && (
                <span className="bg-[#FF8B3D]/95 text-white font-bold text-[8px] px-1 py-0.5 rounded shadow-xs select-none">
                  Custom
                </span>
              )}
              {isCurrentlyHidden && (
                <span className="bg-slate-700/90 text-white font-bold text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5 select-none">
                  <EyeOff className="w-2.5 h-2.5" /> Hidden
                </span>
              )}
            </div>

            {/* Quick action button for parents to toggle visibility */}
            {parentMode && onToggleVisibility && (
              <button
                id={`hide-btn-${card.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(card.id);
                }}
                className="absolute top-2 right-2 p-1 bg-slate-900/80 text-white rounded-lg hover:bg-slate-950 transition-colors shadow-sm z-15"
                title={isCurrentlyHidden ? 'Show card' : 'Hide card'}
              >
                {isCurrentlyHidden ? (
                  <span className="text-[9px] px-1 font-sans font-bold">Show</span>
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Custom Picture or Emoji */}
            <div className="flex-1 w-full h-full min-h-0 flex items-center justify-center relative mt-3 mb-1 overflow-hidden">
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.englishLabel}
                  className="object-cover rounded-xl w-[94%] h-[94%] pointer-events-none select-none border border-slate-200/40 shadow-sm group-hover:scale-105 transition-transform duration-150 animate-fade-in"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-[58px] min-[395px]:text-[70px] sm:text-[84px] md:text-[100px] leading-none select-none transform group-hover:scale-110 transition-transform duration-150 filter drop-shadow-md">
                  {card.emoji || '🎈'}
                </span>
              )}
            </div>

            {/* Bilingual display labels with optimized size hierarchies */}
            <div className={`w-full text-center mt-1 shrink-0 flex flex-col justify-end ${
              languageMode === 'both' ? 'min-h-[34px]' : 'min-h-[18px]'
            }`}>
              {/* English label */}
              {languageMode !== 'hindi' && (
                <span className="font-sans font-black text-slate-900 text-[12px] min-[390px]:text-[13px] sm:text-[14px] md:text-[16px] leading-none block tracking-tight truncate uppercase">
                  {card.englishLabel}
                </span>
              )}

              {/* Hindi label */}
              {languageMode !== 'english' && (
                <span className="font-hindi font-black text-slate-900 text-[11px] min-[390px]:text-[12px] sm:text-[13px] md:text-[15px] leading-none block mt-0.5 truncate">
                  {card.hindiLabel}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
