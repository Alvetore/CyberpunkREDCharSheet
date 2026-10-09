import React, { useState, useEffect } from 'react';
import { Character } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { 
  Crosshair, 
  BookOpen, 
  HeartCrack, 
  Cpu, 
  Package, 
  Car, 
  ShieldAlert, 
  Compass, 
  FileText,
  Layers,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

export type NavigationTab = 
  | 'main' 
  | 'skills' 
  | 'netrunner' 
  | 'cyberware' 
  | 'injuries' 
  | 'gear' 
  | 'vehicles' 
  | 'lifepath' 
  | 'notes';

export type NavCategory = 'combat' | 'inventory' | 'dossier';

interface SectionNavProps {
  activeTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  character: Character;
  lang: Language;
}

interface TabDef {
  id: NavigationTab;
  labelRu: string;
  labelEn: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: 'red' | 'amber' | 'cyan' | 'yellow';
  getBadge?: (char: Character) => { text?: string; isDot?: boolean; isAlert?: boolean; isPulse?: boolean } | null;
}

interface CategoryDef {
  id: NavCategory;
  titleRu: string;
  titleEn: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: 'red' | 'amber' | 'yellow';
  tabs: TabDef[];
  getGroupBadge?: (char: Character) => { text?: string; isAlert?: boolean } | null;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  activeTab,
  onChangeTab,
  character,
  lang
}) => {
  const t = translations[lang];

  // Helper to get category of any tab
  const getCategoryForTab = (tab: NavigationTab): NavCategory => {
    if (tab === 'gear' || tab === 'vehicles' || tab === 'cyberware') return 'inventory';
    if (tab === 'lifepath' || tab === 'notes') return 'dossier';
    return 'combat';
  };

  // Active Category state
  const [activeCategory, setActiveCategory] = useState<NavCategory>(() => getCategoryForTab(activeTab));

  // Memory of last selected tab per category
  const [lastTabPerCat, setLastTabPerCat] = useState<Record<NavCategory, NavigationTab>>({
    combat: 'main',
    inventory: 'gear',
    dossier: 'lifepath'
  });

  // View mode: 'hubs' (2-tier, never overflows) or 'grid' (all 9 sections in 3 columns on desktop)
  const [viewMode, setViewMode] = useState<'hubs' | 'grid'>(() => {
    const saved = localStorage.getItem('cpr_section_nav_mode');
    return saved === 'grid' ? 'grid' : 'hubs';
  });

  const handleToggleViewMode = () => {
    sfx.playClick();
    const next = viewMode === 'hubs' ? 'grid' : 'hubs';
    setViewMode(next);
    localStorage.setItem('cpr_section_nav_mode', next);
  };

  // Keep active category and last tabs synced with activeTab
  useEffect(() => {
    const cat = getCategoryForTab(activeTab);
    setActiveCategory(cat);
    setLastTabPerCat((prev) => ({
      ...prev,
      [cat]: activeTab
    }));
  }, [activeTab]);

  // Handle switching category in Hubs view
  const handleSelectCategory = (catId: NavCategory) => {
    sfx.playClick();
    setActiveCategory(catId);
    // If the active tab is already in this category, stay on it. Otherwise switch to last remembered tab.
    if (getCategoryForTab(activeTab) !== catId) {
      const targetTab = lastTabPerCat[catId];
      onChangeTab(targetTab);
    }
  };

  const handleSelectTab = (tabId: NavigationTab) => {
    sfx.playClick();
    onChangeTab(tabId);
  };

  // Categories & Tabs Configuration
  const categories: CategoryDef[] = [
    {
      id: 'combat',
      titleRu: 'Бой и Навыки',
      titleEn: 'Combat & Skills',
      icon: Crosshair,
      accent: 'red',
      getGroupBadge: (char) => {
        if (char.criticalInjuries?.some((i) => i.isActive)) {
          return { text: '!', isAlert: true };
        }
        return null;
      },
      tabs: [
        {
          id: 'main',
          labelRu: 'Бой и Роль',
          labelEn: 'Core & Combat',
          icon: Crosshair,
          accentColor: 'red'
        },
        {
          id: 'skills',
          labelRu: 'Навыки',
          labelEn: 'Skills',
          icon: BookOpen,
          accentColor: 'red'
        },
        {
          id: 'injuries',
          labelRu: 'Травмы и Броня',
          labelEn: 'Injuries & Armor',
          icon: HeartCrack,
          accentColor: 'red',
          getBadge: (char) =>
            char.criticalInjuries?.some((i) => i.isActive)
              ? { text: '!', isAlert: true }
              : null
        },
        {
          id: 'netrunner',
          labelRu: 'Нетраннинг',
          labelEn: 'Netrunning',
          icon: Cpu,
          accentColor: 'cyan',
          getBadge: (char) =>
            char.role === 'Netrunner' ? { isPulse: true } : null
        }
      ]
    },
    {
      id: 'inventory',
      titleRu: 'Снаряжение и Гараж',
      titleEn: 'Gear & Garage',
      icon: Layers,
      accent: 'amber',
      getGroupBadge: (char) => {
        if (char.vehicles && char.vehicles.length > 0) {
          return { text: `${char.vehicles.length} ТС` };
        }
        return null;
      },
      tabs: [
        {
          id: 'gear',
          labelRu: 'Снаряжение и Деньги',
          labelEn: 'Gear & Cash',
          icon: Package,
          accentColor: 'amber'
        },
        {
          id: 'vehicles',
          labelRu: 'Гараж и Транспорт',
          labelEn: 'Garage & Vehicles',
          icon: Car,
          accentColor: 'amber',
          getBadge: (char) =>
            char.vehicles && char.vehicles.length > 0
              ? { text: String(char.vehicles.length) }
              : null
        },
        {
          id: 'cyberware',
          labelRu: 'Киберимпланты',
          labelEn: 'Cyberware',
          icon: ShieldAlert,
          accentColor: 'cyan',
          getBadge: (char) =>
            char.cyberware && char.cyberware.length > 0
              ? { text: String(char.cyberware.length) }
              : null
        }
      ]
    },
    {
      id: 'dossier',
      titleRu: 'Досье и Заметки',
      titleEn: 'Dossier & Notes',
      icon: Compass,
      accent: 'yellow',
      getGroupBadge: (char) => {
        if (char.notes) {
          return { text: '•' };
        }
        return null;
      },
      tabs: [
        {
          id: 'lifepath',
          labelRu: 'Жизненный путь',
          labelEn: 'Lifepath',
          icon: Compass,
          accentColor: 'yellow'
        },
        {
          id: 'notes',
          labelRu: 'Заметки',
          labelEn: 'Notes',
          icon: FileText,
          accentColor: 'yellow',
          getBadge: (char) =>
            char.notes ? { isDot: true } : null
        }
      ]
    }
  ];

  const currentCategoryDef = categories.find((c) => c.id === activeCategory) || categories[0];

  return (
    <nav className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 sm:p-2.5 shadow-xl space-y-2 no-print">
      {/* Top Header: Mode Toggle & Current Location Breadcrumb */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] truncate">
          <span className="text-zinc-500 uppercase tracking-wider">
            {lang === 'ru' ? 'РАЗДЕЛ:' : 'SECTION:'}
          </span>
          <span className="font-bold text-zinc-200 uppercase">
            {lang === 'ru' ? currentCategoryDef.titleRu : currentCategoryDef.titleEn}
          </span>
          <ChevronRight size={12} className="text-zinc-600 shrink-0" />
          <span className="font-bold text-red-500 uppercase">
            {(() => {
              const tab = currentCategoryDef.tabs.find((t) => t.id === activeTab);
              return tab ? (lang === 'ru' ? tab.labelRu : tab.labelEn) : '';
            })()}
          </span>
        </div>

        {/* View Mode Toggle Button */}
        <button
          onClick={handleToggleViewMode}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-md transition text-[11px] font-semibold shrink-0"
          title={
            viewMode === 'hubs'
              ? (lang === 'ru' ? 'Переключить на сетку всех разделов' : 'Switch to all sections grid')
              : (lang === 'ru' ? 'Переключить на хабы по категориям' : 'Switch to category hubs')
          }
        >
          {viewMode === 'hubs' ? (
            <>
              <LayoutGrid size={13} className="text-amber-400" />
              <span className="hidden sm:inline">{lang === 'ru' ? 'Все 9 разделов' : 'All Sections'}</span>
            </>
          ) : (
            <>
              <Layers size={13} className="text-red-400" />
              <span className="hidden sm:inline">{lang === 'ru' ? 'По категориям' : 'By Category'}</span>
            </>
          )}
        </button>
      </div>

      {/* MODE 1: Category Hubs Navigation (Default & 100% Screen-Friendly) */}
      {viewMode === 'hubs' && (
        <div className="space-y-2">
          {/* Row 1: The 3 Main Category Hubs (Full Width Grid) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {categories.map((cat) => {
              const isCatActive = activeCategory === cat.id;
              const Icon = cat.icon;
              const groupBadge = cat.getGroupBadge?.(character);

              let activeBorderColor = 'border-red-600 bg-red-950/40 text-red-400';
              let activeIndicatorColor = 'bg-red-500';
              if (cat.accent === 'amber') {
                activeBorderColor = 'border-amber-500 bg-amber-950/40 text-amber-400';
                activeIndicatorColor = 'bg-amber-400';
              } else if (cat.accent === 'yellow') {
                activeBorderColor = 'border-yellow-500 bg-yellow-950/40 text-yellow-400';
                activeIndicatorColor = 'bg-yellow-400';
              }

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`relative flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg border transition-all text-xs font-orbitron font-bold uppercase tracking-wider min-h-[42px] ${
                    isCatActive
                      ? `${activeBorderColor} shadow-md`
                      : 'border-zinc-800/80 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  
                  {/* Category Title */}
                  <span className="truncate text-[11px] sm:text-xs">
                    {lang === 'ru' ? cat.titleRu : cat.titleEn}
                  </span>

                  {/* Badges / Counters */}
                  {groupBadge && (
                    <span
                      className={`ml-auto shrink-0 px-1.5 py-0.2 rounded-full font-bold text-[10px] ${
                        groupBadge.isAlert
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-zinc-800 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {groupBadge.text}
                    </span>
                  )}

                  {/* Active Indicator Underline */}
                  {isCatActive && (
                    <div
                      className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-t ${activeIndicatorColor}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Row 2: Sub-tabs of Active Category (Full Width Grid) */}
          <div
            className={`grid gap-1.5 pt-1 border-t border-zinc-800/80 ${
              currentCategoryDef.tabs.length === 4
                ? 'grid-cols-2 sm:grid-cols-4'
                : currentCategoryDef.tabs.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-2'
            }`}
          >
            {currentCategoryDef.tabs.map((tab) => {
              const isTabActive = activeTab === tab.id;
              const Icon = tab.icon;
              const badge = tab.getBadge?.(character);

              let activeStyles = 'bg-red-600 text-white shadow-md border-red-500';
              if (tab.accentColor === 'amber') {
                activeStyles = 'bg-amber-600 text-white shadow-md border-amber-500';
              } else if (tab.accentColor === 'cyan') {
                activeStyles = 'bg-cyan-600 text-white shadow-md border-cyan-400';
              } else if (tab.accentColor === 'yellow') {
                activeStyles = 'bg-yellow-500 text-black font-extrabold shadow-md border-yellow-400';
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-lg border text-xs font-orbitron font-bold uppercase tracking-wider transition min-h-[40px] truncate ${
                    isTabActive
                      ? activeStyles
                      : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate">
                    {lang === 'ru' ? tab.labelRu : tab.labelEn}
                  </span>

                  {/* Tab Alerts / Badges */}
                  {badge && (
                    <>
                      {badge.text && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                            badge.isAlert
                              ? 'bg-red-950 text-red-200 border border-red-600'
                              : 'bg-zinc-950 text-amber-300 border border-zinc-700'
                          }`}
                        >
                          {badge.text}
                        </span>
                      )}
                      {badge.isDot && (
                        <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                      )}
                      {badge.isPulse && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: All 9 Sections in 3 Categorized Columns (100% On-Screen Desktop View) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            let groupBorderColor = 'border-red-900/60 bg-red-950/10';
            let titleColor = 'text-red-500';
            if (cat.accent === 'amber') {
              groupBorderColor = 'border-amber-900/60 bg-amber-950/10';
              titleColor = 'text-amber-500';
            } else if (cat.accent === 'yellow') {
              groupBorderColor = 'border-yellow-900/60 bg-yellow-950/10';
              titleColor = 'text-yellow-500';
            }

            return (
              <div
                key={cat.id}
                className={`border rounded-lg p-2 flex flex-col justify-between space-y-2 ${groupBorderColor}`}
              >
                {/* Column Group Header */}
                <div className="flex items-center gap-1.5 px-1 font-orbitron font-bold text-[11px] uppercase tracking-wider border-b border-zinc-800/80 pb-1.5">
                  <Icon size={14} className={titleColor} />
                  <span className={titleColor}>
                    {lang === 'ru' ? cat.titleRu : cat.titleEn}
                  </span>
                </div>

                {/* Sub-tab Buttons inside Column */}
                <div className="grid grid-cols-1 gap-1.5">
                  {cat.tabs.map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    const TabIcon = tab.icon;
                    const badge = tab.getBadge?.(character);

                    let activeStyles = 'bg-red-600 text-white shadow border-red-500';
                    if (tab.accentColor === 'amber') {
                      activeStyles = 'bg-amber-600 text-white shadow border-amber-500';
                    } else if (tab.accentColor === 'cyan') {
                      activeStyles = 'bg-cyan-600 text-white shadow border-cyan-400';
                    } else if (tab.accentColor === 'yellow') {
                      activeStyles = 'bg-yellow-500 text-black font-extrabold shadow border-yellow-400';
                    }

                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSelectTab(tab.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-orbitron font-bold uppercase tracking-wider transition min-h-[38px] ${
                          isTabActive
                            ? activeStyles
                            : 'border-zinc-800/80 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <TabIcon size={14} className="shrink-0" />
                          <span className="truncate">
                            {lang === 'ru' ? tab.labelRu : tab.labelEn}
                          </span>
                        </div>

                        {/* Badges */}
                        {badge && (
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {badge.text && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                  badge.isAlert
                                    ? 'bg-red-950 text-red-200 border border-red-600'
                                    : 'bg-zinc-950 text-amber-300 border border-zinc-700'
                                }`}
                              >
                                {badge.text}
                              </span>
                            )}
                            {badge.isDot && (
                              <span className="w-2 h-2 rounded-full bg-yellow-400" />
                            )}
                            {badge.isPulse && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
};
export default SectionNav;
