import React, { useRef } from 'react';
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
  Moon
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
        }
      };
      reader.readAsText(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-zinc-900 border-b border-red-700/60 sticky top-0 z-30 shadow-lg shadow-black/60 no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-black font-black px-2.5 py-1 text-sm sm:text-base tracking-widest clip-cyber font-orbitron uppercase border-b-2 border-yellow-400">
            CP-RED
          </div>
          <div>
            <h1 className="font-orbitron font-extrabold text-base sm:text-lg tracking-wider text-red-500 uppercase flex items-center gap-2">
              {t.appTitle}
              <span className="text-xs font-rajdhani font-semibold text-zinc-400 hidden md:inline">
                / {t.sheetSubtitle}
              </span>
            </h1>
          </div>
        </div>

        {/* Character switcher */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <label className="text-xs text-zinc-400 font-semibold uppercase hidden sm:inline">
            {t.selectCharacter}
          </label>
          <select
            value={activeChar.id}
            onChange={(e) => {
              sfx.playClick();
              onSelectCharacter(e.target.value);
            }}
            className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none max-w-[170px] sm:max-w-[210px] truncate"
          >
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.handle ? `${c.handle} (${c.role})` : `${c.name} (${c.role})`}
              </option>
            ))}
          </select>

          {/* New Character Button */}
          <button
            onClick={() => {
              sfx.playClick();
              onNewCharacter();
            }}
            title={t.newCharacter}
            className="p-1.5 bg-zinc-800 hover:bg-red-600/80 text-zinc-300 hover:text-white border border-zinc-700 rounded transition"
          >
            <Plus size={16} />
          </button>

          {/* Character Creation Wizard Button */}
          <button
            onClick={() => {
              sfx.playClick();
              onOpenWizard();
            }}
            title={lang === 'ru' ? 'Конструктор персонажа (Point-Buy Wizard по правилам CPR)' : 'Character Creation Wizard (CPR Point-Buy & Fast Dirty)'}
            className="flex items-center gap-1 px-2 py-1.5 bg-red-950/70 hover:bg-red-600 border border-red-700 text-red-300 hover:text-white text-xs font-bold rounded transition font-orbitron"
          >
            <Wand2 size={14} className="text-yellow-400" />
            <span className="hidden md:inline">{lang === 'ru' ? 'Конструктор' : 'Wizard'}</span>
          </button>

          {/* DataPool Market Button */}
          <button
            onClick={() => {
              sfx.playClick();
              onOpenShop();
            }}
            title={lang === 'ru' ? 'Магазин DataPool (оружие, броня, импланты, снаряжение)' : 'DataPool Market (Weapons, Armor, Implants, Gear)'}
            className="flex items-center gap-1 px-2 py-1.5 bg-yellow-950/70 hover:bg-yellow-600 border border-yellow-700 text-yellow-300 hover:text-black text-xs font-bold rounded transition font-orbitron shadow-sm"
          >
            <ShoppingCart size={14} className="text-yellow-400" />
            <span className="hidden md:inline">{lang === 'ru' ? 'Магазин' : 'Shop'}</span>
          </button>

          {/* Duplicate Button */}
          <button
            onClick={() => {
              sfx.playClick();
              onDuplicateCharacter();
            }}
            title={t.duplicateChar}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded transition"
          >
            <Copy size={16} />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              sfx.playClick();
              onDeleteCharacter();
            }}
            title={t.deleteChar}
            disabled={characters.length <= 1}
            className="p-1.5 bg-zinc-800 hover:bg-red-900/80 text-zinc-400 hover:text-red-300 border border-zinc-700 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Dice Roller launcher */}
          <button
            onClick={() => {
              sfx.playClick();
              onOpenDiceRoller();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded transition font-orbitron shadow-md shadow-red-950"
          >
            <Dice6 size={16} className="animate-pulse" />
            <span className="hidden sm:inline">{t.tabDice}</span>
          </button>

          {/* Export single char */}
          <button
            onClick={() => {
              sfx.playClick();
              onExportCharacter();
            }}
            title={t.exportJson}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded transition"
          >
            <Download size={16} />
          </button>

          {/* Backup All chars */}
          <button
            onClick={() => {
              sfx.playClick();
              onExportAll();
            }}
            title={t.exportAll}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded transition hidden sm:inline-flex"
          >
            <FileArchive size={16} />
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
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded transition"
          >
            <Upload size={16} />
          </button>

          {/* Print button */}
          <button
            onClick={() => {
              sfx.playClick();
              window.print();
            }}
            title={t.printSheet}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded transition hidden md:inline-flex"
          >
            <Printer size={16} />
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={() => {
              sfx.playClick();
              onToggleTheme();
            }}
            title={theme === 'dark' ? t.themeLight : t.themeDark}
            className={`p-1.5 border rounded transition ${
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
            className={`p-1.5 border rounded transition ${
              soundEnabled
                ? 'bg-zinc-800 text-yellow-400 border-zinc-700'
                : 'bg-zinc-800/50 text-zinc-500 border-zinc-800'
            }`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            title={t.language}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold font-orbitron text-zinc-200 border border-zinc-700 rounded transition"
          >
            <Languages size={14} />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
