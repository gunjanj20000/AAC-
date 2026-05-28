import { Category, LanguageMode } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  languageMode: LanguageMode;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
  languageMode,
}: CategoryTabsProps) {
  const getCategoryStyles = (category: Category, isActive: boolean) => {
    const theme = category.color || '';
    
    // Nice Fitzgerald-aligned colors for standard + custom categories
    const colorPresets: Record<string, { active: string; inactive: string }> = {
      favorites: {
        active: 'bg-rose-500 text-white border-b-4 border-rose-600 shadow-md shadow-rose-200/60 scale-105',
        inactive: 'bg-rose-50/90 hover:bg-rose-100/90 text-rose-700 border-rose-200/80 hover:border-rose-300'
      },
      quick: {
        active: 'bg-pink-500 text-white border-b-4 border-pink-600 shadow-md shadow-pink-200/60 scale-105',
        inactive: 'bg-pink-50/90 hover:bg-pink-100/90 text-pink-700 border-pink-200/80 hover:border-pink-300'
      },
      verbs: {
        active: 'bg-emerald-500 text-white border-b-4 border-emerald-600 shadow-md shadow-emerald-200/60 scale-105',
        inactive: 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-700 border-emerald-200/80 hover:border-emerald-300'
      },
      nouns: {
        active: 'bg-sky-500 text-white border-b-4 border-sky-600 shadow-md shadow-sky-200/60 scale-105',
        inactive: 'bg-sky-50/90 hover:bg-sky-100/90 text-sky-700 border-sky-200/80 hover:border-sky-300'
      },
      feelings: {
        active: 'bg-orange-500 text-white border-b-4 border-orange-600 shadow-md shadow-orange-200/60 scale-105',
        inactive: 'bg-orange-50/90 hover:bg-orange-100/90 text-orange-700 border-orange-200/80 hover:border-orange-300'
      },
      people: {
        active: 'bg-amber-400 text-amber-955 border-b-4 border-amber-500 shadow-md shadow-amber-200/60 scale-105',
        inactive: 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-800 border-amber-200/80 hover:border-amber-300'
      },
      places: {
        active: 'bg-teal-500 text-white border-b-4 border-teal-600 shadow-md shadow-teal-200/60 scale-105',
        inactive: 'bg-teal-50/90 hover:bg-teal-100/90 text-teal-700 border-teal-200/80 hover:border-teal-300'
      },
      // Presets for new custom categories
      purple: {
        active: 'bg-purple-500 text-white border-b-4 border-purple-600 shadow-md shadow-purple-200/60 scale-105',
        inactive: 'bg-purple-50 hover:bg-purple-100/80 text-purple-700 border-purple-200 hover:border-purple-300'
      },
      violet: {
        active: 'bg-violet-500 text-white border-b-4 border-violet-600 shadow-md shadow-violet-200/60 scale-105',
        inactive: 'bg-violet-50 hover:bg-violet-100/80 text-violet-700 border-violet-200 hover:border-violet-300'
      },
      fuchsia: {
        active: 'bg-fuchsia-500 text-white border-b-4 border-fuchsia-600 shadow-md shadow-fuchsia-200/60 scale-105',
        inactive: 'bg-fuchsia-50 hover:bg-fuchsia-100/80 text-fuchsia-700 border-fuchsia-200 hover:border-fuchsia-300'
      },
      rose: {
        active: 'bg-rose-500 text-white border-b-4 border-rose-600 shadow-md shadow-rose-200/60 scale-105',
        inactive: 'bg-rose-50 hover:bg-rose-100/80 text-rose-700 border-rose-200 hover:border-rose-300'
      },
      indigo: {
        active: 'bg-indigo-500 text-white border-b-4 border-indigo-600 shadow-md shadow-indigo-200/60 scale-105',
        inactive: 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border-indigo-200 hover:border-indigo-300'
      },
      cyan: {
        active: 'bg-cyan-500 text-white border-b-4 border-cyan-600 shadow-md shadow-cyan-200/60 scale-105',
        inactive: 'bg-cyan-50 hover:bg-cyan-100/80 text-cyan-700 border-cyan-200 hover:border-cyan-300'
      },
      lime: {
        active: 'bg-lime-500 text-white border-b-4 border-lime-600 shadow-md shadow-lime-200/60 scale-105',
        inactive: 'bg-lime-50 hover:bg-lime-100 text-lime-700 border-lime-200 hover:border-lime-300'
      }
    };

    if (colorPresets[category.id]) {
      return isActive ? colorPresets[category.id].active : colorPresets[category.id].inactive;
    }
    const cleanTheme = theme.replace('theme-', '');
    if (colorPresets[cleanTheme]) {
      return isActive ? colorPresets[cleanTheme].active : colorPresets[cleanTheme].inactive;
    }

    // Direct support for raw presets if specified
    if (colorPresets[theme]) {
      return isActive ? colorPresets[theme].active : colorPresets[theme].inactive;
    }

    return isActive 
      ? 'bg-[#FF8B3D] text-white border-b-4 border-[#D16D29] scale-105' 
      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300';
  };

  return (
    <div id="category-tabs-container" className="py-2 overflow-x-auto scrollbar-none select-none">
      <div className="flex gap-2.5 px-4 pb-1 min-w-max">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          const styles = getCategoryStyles(category, isActive);
          
          return (
            <button
              key={category.id}
              id={`cat-tab-${category.id}`}
              onClick={() => onSelectCategory(category.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-sans font-black tracking-wide transition-all border duration-150 active:scale-95 ${styles}`}
            >
              <span className="text-2xl leading-none select-none">{category.emoji}</span>
              <div className="flex flex-col text-left">
                {languageMode !== 'hindi' && (
                  <span className="text-[15px] min-[390px]:text-[17px] sm:text-[19px] md:text-[21px] font-black leading-tight transition-colors">
                    {category.englishName}
                  </span>
                )}
                {languageMode !== 'english' && (
                  <span className="text-[14px] min-[390px]:text-[16px] sm:text-[18px] md:text-[20px] font-hindi font-black opacity-100 leading-tight mt-0.5">
                    {category.hindiName}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
