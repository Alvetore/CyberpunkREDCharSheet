import React, { useRef, useState } from 'react';
import { Character } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Volume2, 
  VolumeX, 
  Languages, 
  Printer, 
  Dice6,
  FileArchive,
  Wand2,
  ShoppingCart,
  Sun,
  Moon,
  Menu,
  X,
  BookA,
  Users
} from 'lucide-react';

interface HeaderProps {
  characters: Character[];
  activeChar: Character;
  onSelectCharacter: (id: string) => void;
  onNewCharacter: () => void;
  onDuplicateCharacter: () => void;
  onDeleteCharacter: () => void;
  onExportCharacter: () => void;
  onExportAll: () => void;
  onImportCharacter: (text: string) => void;
  onOpenDiceRoller: () => void;
  onOpenWizard: () => void;
  onOpenShop: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  lang: Language;
  onToggleLang: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  dualTerms: boolean;
  onToggleDualTerms: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  characters,
  activeChar,
  onSelectCharacter,
  onNewCharacter,
  onDuplicateCharacter,
  onDeleteCharacter,
  onExportCharacter,
  onExportAll,
  onImportCharacter,
  onOpenDiceRoller,
  onOpenWizard,
  onOpenShop,
  theme,
  onToggleTheme,
  lang,
  onToggleLang,
  soundEnabled,
  onToggleSound,
  dualTerms,
  onToggleDualTerms
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onImportCharacter(text);
          sfx.playClick();
          setIsMobileMenuOpen(false);
        }
      };
      reader.readAsText(file);
    }
    // reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <header className="bg-zinc-900 border-b border-red-700/60 sticky top-0 z-30 shadow-lg shadow-black/60 no-print">
      {/* Row 1: Brand & Global App Tools */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="bg-red-600 text-black font-black px-2 sm:px-2.5 py-1 text-xs sm:text-base tracking-widest clip-cyber font-orbitron uppercase border-b-2 border-yellow-400">
            CP-RED
          </div>
          <div>
            <h1 className="font-orbitron font-extrabold text-sm sm:text-base md:text-lg tracking-wider text-red-500 uppercase flex items-center gap-1.5">
              <span>{t.appTitle}</span>
              <span className="text-xs font-rajdhani font-semibold text-zinc-400 hidden xl:inline">
                / {t.sheetSubtitle}
              </span>
            </h1>
          </div>
        </div>

        {/* Right: Quick Tools (Wizard, Shop, Dice Roller) + Settings (Desktop) / Hamburger (Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Character Wizard */}
          <button
            onClick={() => {
              sfx.playClick();
              onOpenWizard();
            }}
            title={lang === 'ru' ? 'Конструктор персонажа (Point-Buy Wizard по правилам CPR)' : 'Character Creation Wizard (CPR Point-Buy & Fast Dirty)'}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-red-950/70 hover:bg-red-600 border border-red-700 text-red-300 hover:text-white text-xs font-bold rounded transition font-orbitron min-h-[36px]"
          >
            <Wand2 size={15} className="text-yellow-400 shrink-0" />
            <span className="hidden sm:inline">{lang === 'ru' ? 'Конструктор' : 'Wizard'}</span>
          </button>

          {/* Shop */}
          <button
            onClick={() => {
              sfx.playClick();
              onOpenShop();
            }}
            title={lang === 'ru' ? 'Магазин DataPool (оружие, броня, импланты, снаряжение)' : 'DataPool Market (Weapons, Armor, Implants, Gear)'}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-yellow-950/70 hover:bg-yellow-600 border border-yellow-700 text-yellow-300 hover:text-black text-xs font-bold rounded transition font-orbitron shadow-sm min-h-[36px]"
          >
            <ShoppingCart size={15} className="text-yellow-400 shrink-0" />
            <span className="hidden sm:inline">{lang === 'ru' ? 'Магазин' : 'Shop'}</span>
          </button>

          {/* Quick Dice Roller Launcher */}
          <button
            onClick={() => {
              sfx.playClick();
              onOpenDiceRoller();
            }}
            title={t.tabDice}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded transition font-orbitron shadow-md shadow-red-950 min-h-[36px]"
          >
            <Dice6 size={16} className="animate-pulse shrink-0" />
            <span className="hidden sm:inline">{t.tabDice}</span>
          </button>

          {/* Desktop Secondary Toolbar (Hidden on screens < lg) */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-zinc-800">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={() => {
                sfx.playClick();
                onToggleTheme();
              }}
              title={theme === 'dark' ? t.themeLight : t.themeDark}
              className={`p-1.5 border rounded transition min-h-[36px] min-w-[36px] flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-zinc-800 text-yellow-400 hover:text-yellow-300 border-zinc-700'
                  : 'bg-zinc-200 text-amber-600 hover:text-amber-700 border-zinc-300 shadow-sm'
              }`}
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? (lang === 'ru' ? 'Звук включен' : 'Sound ON') : (lang === 'ru' ? 'Звук выключен' : 'Sound OFF')}
              className={`p-1.5 border rounded transition min-h-[36px] min-w-[36px] flex items-center justify-center ${
                soundEnabled
                  ? 'bg-zinc-800 text-yellow-400 border-zinc-700'
                  : 'bg-zinc-800/50 text-zinc-500 border-zinc-800'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Dual Terms Toggle */}
            <button
              onClick={() => {
                sfx.playClick();
                onToggleDualTerms();
              }}
              title={lang === 'ru' ? (dualTerms ? 'Скрыть английские названия' : 'Показывать двойные термины (RU/EN)') : (dualTerms ? 'Hide Russian terms' : 'Show bilingual terms')}
              className={`p-1.5 border rounded transition min-h-[36px] min-w-[36px] flex items-center justify-center ${
                dualTerms
                  ? 'bg-red-950/70 text-red-300 border-red-700'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <BookA size={16} />
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              title={t.language}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold font-orbitron text-zinc-200 border border-zinc-700 rounded transition min-h-[36px]"
            >
              <Languages size={14} />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger Toggle (Visible on screens < lg) */}
          <button
            onClick={() => {
              sfx.playClick();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className={`lg:hidden p-1.5 border rounded transition min-h-[36px] min-w-[36px] flex items-center justify-center ${
              isMobileMenuOpen
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
            title={lang === 'ru' ? 'Меню и настройки' : 'Menu & Settings'}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Row 2: Dedicated Character Switcher & Character Actions Bar */}
      <div className="bg-zinc-950 border-t border-zinc-800 px-3 sm:px-6 py-2 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Character Switcher Selector */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-full sm:max-w-md md:max-w-lg">
            <Users size={16} className="text-red-500 shrink-0" />
            <span className="font-orbitron font-bold text-xs uppercase tracking-wider text-zinc-400 shrink-0 hidden xs:inline">
              {lang === 'ru' ? 'Персонаж:' : 'Character:'}
            </span>
            <select
              value={activeChar.id}
              onChange={(e) => {
                sfx.playClick();
                onSelectCharacter(e.target.value);
              }}
              className="w-full bg-zinc-900 border border-zinc-700 hover:border-red-500/80 text-zinc-100 text-xs sm:text-sm font-semibold rounded px-2.5 sm:px-3 py-1.5 focus:border-red-500 focus:outline-none min-h-[36px] transition cursor-pointer"
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.handle ? `${c.handle} (${c.name}) — ${c.role} (Ранг ${c.roleRank})` : `${c.name} — ${c.role} (Ранг ${c.roleRank})`}
                </option>
              ))}
            </select>
          </div>

          {/* Character Action Buttons (Directly attached to character management) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto sm:ml-0">
            {/* New Character Button */}
            <button
              onClick={() => {
                sfx.playClick();
                onNewCharacter();
              }}
              title={t.newCharacter}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-red-600/80 text-zinc-300 hover:text-white border border-zinc-700 hover:border-red-500 rounded text-xs font-semibold transition min-h-[36px]"
            >
              <Plus size={15} className="text-red-400" />
              <span className="hidden sm:inline">{lang === 'ru' ? 'Новый' : 'New'}</span>
            </button>

            {/* Duplicate Button */}
            <button
              onClick={() => {
                sfx.playClick();
                onDuplicateCharacter();
              }}
              title={t.duplicateChar}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-xs font-semibold transition min-h-[36px]"
            >
              <Copy size={15} className="text-yellow-400" />
              <span className="hidden sm:inline">{lang === 'ru' ? 'Копия' : 'Copy'}</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => {
                sfx.playClick();
                onDeleteCharacter();
              }}
              title={t.deleteChar}
              disabled={characters.length <= 1}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-700 rounded text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[36px]"
            >
              <Trash2 size={15} />
              <span className="hidden md:inline">{lang === 'ru' ? 'Удалить' : 'Delete'}</span>
            </button>

            {/* Export single char */}
            <button
              onClick={() => {
                sfx.playClick();
                onExportCharacter();
              }}
              title={t.exportJson}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-xs font-semibold transition min-h-[36px] flex items-center justify-center gap-1"
            >
              <Download size={15} className="text-emerald-400" />
              <span className="hidden xl:inline">{t.exportJson}</span>
            </button>

            {/* Backup All chars */}
            <button
              onClick={() => {
                sfx.playClick();
                onExportAll();
              }}
              title={t.exportAll}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-xs font-semibold transition min-h-[36px] flex items-center justify-center gap-1"
            >
              <FileArchive size={15} className="text-yellow-400" />
              <span className="hidden xl:inline">{t.exportAll}</span>
            </button>

            {/* Import JSON */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title={t.importJson}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-xs font-semibold transition min-h-[36px] flex items-center justify-center gap-1"
            >
              <Upload size={15} className="text-cyan-400" />
              <span className="hidden xl:inline">{t.importJson}</span>
            </button>

            {/* Print button */}
            <button
              onClick={() => {
                sfx.playClick();
                window.print();
              }}
              title={t.printSheet}
              className="hidden sm:flex p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded transition min-h-[36px] min-w-[36px] items-center justify-center"
            >
              <Printer size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Expandable Drawer / Toolbar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-t border-red-900/60 px-3 py-3 shadow-2xl animate-fade-in space-y-3">
          {/* Character Actions Grid */}
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5 font-orbitron">
              {lang === 'ru' ? 'Персонажи' : 'Characters'}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  sfx.playClick();
                  onNewCharacter();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-red-900/60 border border-zinc-800 text-zinc-200 rounded text-xs font-semibold min-h-[40px] transition"
              >
                <Plus size={15} className="text-red-400" />
                <span>{lang === 'ru' ? 'Новый' : 'New'}</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  onDuplicateCharacter();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded text-xs font-semibold min-h-[40px] transition"
              >
                <Copy size={15} className="text-yellow-400" />
                <span>{lang === 'ru' ? 'Копия' : 'Copy'}</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  onDeleteCharacter();
                  setIsMobileMenuOpen(false);
                }}
                disabled={characters.length <= 1}
                className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-red-950 border border-zinc-800 text-red-400 disabled:opacity-30 rounded text-xs font-semibold min-h-[40px] transition"
              >
                <Trash2 size={15} />
                <span>{lang === 'ru' ? 'Удалить' : 'Delete'}</span>
              </button>
            </div>
          </div>

          {/* Settings & Preferences */}
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5 font-orbitron">
              {lang === 'ru' ? 'Настройки и язык' : 'Preferences & Language'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  sfx.playClick();
                  onToggleTheme();
                }}
                className="flex items-center justify-center gap-2 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded text-xs font-semibold min-h-[40px] transition"
              >
                {theme === 'dark' ? <Moon size={15} className="text-yellow-400" /> : <Sun size={15} className="text-amber-500" />}
                <span>{theme === 'dark' ? t.themeLight : t.themeDark}</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  onToggleSound();
                }}
                className="flex items-center justify-center gap-2 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded text-xs font-semibold min-h-[40px] transition"
              >
                {soundEnabled ? <Volume2 size={15} className="text-yellow-400" /> : <VolumeX size={15} className="text-zinc-500" />}
                <span>{soundEnabled ? (lang === 'ru' ? 'Звук: ВКЛ' : 'Sound: ON') : (lang === 'ru' ? 'Звук: ВЫКЛ' : 'Sound: OFF')}</span>
              </button>

              {/* Dual terms toggle */}
              <button
                onClick={() => {
                  sfx.playClick();
                  onToggleDualTerms();
                }}
                className={`flex items-center justify-center gap-2 p-2 border rounded text-xs font-semibold min-h-[40px] transition ${
                  dualTerms ? 'bg-red-950/60 border-red-800 text-red-300' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                }`}
              >
                <BookA size={15} className="text-red-400" />
                <span>{lang === 'ru' ? (dualTerms ? 'Термины: RU/EN' : 'Термины: RU') : (dualTerms ? 'Dual: ON' : 'Dual: OFF')}</span>
              </button>

              {/* Language toggle */}
              <button
                onClick={() => {
                  sfx.playClick();
                  onToggleLang();
                }}
                className="flex items-center justify-center gap-2 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded text-xs font-semibold min-h-[40px] transition font-orbitron"
              >
                <Languages size={15} className="text-cyan-400" />
                <span>{lang === 'ru' ? 'Язык: RU' : 'Lang: EN'}</span>
              </button>
            </div>
          </div>

          {/* Import / Export / Print Actions */}
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5 font-orbitron">
              {lang === 'ru' ? 'Экспорт и Импорт' : 'Backup & Data'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  sfx.playClick();
                  onExportCharacter();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded text-xs font-semibold min-h-[40px] transition"
              >
                <Download size={14} className="text-emerald-400" />
                <span>{t.exportJson}</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  onExportAll();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded text-xs font-semibold min-h-[40px] transition"
              >
                <FileArchive size={14} className="text-yellow-400" />
                <span>{t.exportAll}</span>
              </button>

              <input
                type="file"
                ref={mobileFileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => mobileFileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded text-xs font-semibold min-h-[40px] transition"
              >
                <Upload size={14} className="text-cyan-400" />
                <span>{t.importJson}</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  window.print();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded text-xs font-semibold min-h-[40px] transition"
              >
                <Printer size={14} className="text-zinc-400" />
                <span>{t.printSheet}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
