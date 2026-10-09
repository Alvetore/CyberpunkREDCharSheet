import React, { useState, useEffect } from 'react';
import { Character, RollResult, Skill, Weapon, ProgramItem, StatKey } from './types/character';
import { Language, translations } from './locales/i18n';
import { 
  loadStoredCharacters, 
  saveCharactersToStorage, 
  getActiveCharacterId, 
  setActiveCharacterId,
  getStoredTheme,
  saveStoredTheme,
  AppTheme,
  exportSingleCharacter,
  exportAllCharacters,
  parseImportedJson
} from './utils/storage';
import { createEmptyCharacter } from './data/initialData';
import { executeCyberpunkCheck, executeDamageRoll, executeDeathSave } from './utils/dice';
import { sfx } from './utils/audio';

import { Header } from './components/Header';
import { StatsSection } from './components/StatsSection';
import { SkillsSection } from './components/SkillsSection';
import { WeaponsSection } from './components/WeaponsSection';
import { NetrunnerSection } from './components/NetrunnerSection';
import { RoleSection } from './components/RoleSection';
import { CyberwareSection } from './components/CyberwareSection';
import { InjuriesSection } from './components/InjuriesSection';
import { LifepathSection } from './components/LifepathSection';
import { GearSection } from './components/GearSection';
import { DiceRollerModal } from './components/DiceRollerModal';
import { DamageCalculatorModal } from './components/DamageCalculatorModal';
import { CharacterWizardModal } from './components/CharacterWizardModal';
import { NotesSection } from './components/NotesSection';
import { DataPoolShopModal } from './components/DataPoolShopModal';

import { 
  Crosshair, 
  BookOpen, 
  Cpu, 
  ShieldAlert, 
  Package, 
  Compass, 
  Dice6, 
  HeartCrack,
  Sparkles,
  FileText,
  ShoppingCart
} from 'lucide-react';

export const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(() => loadStoredCharacters());
  const [activeCharId, setActiveId] = useState<string>(() => {
    const saved = getActiveCharacterId();
    if (saved && characters.some((c) => c.id === saved)) return saved;
    return characters[0]?.id || '';
  });

  const [lang, setLang] = useState<Language>('ru');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [dualTerms, setDualTerms] = useState<boolean>(true);
  const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme());

  // Apply theme to document element
  useEffect(() => {
    saveStoredTheme(theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    sfx.playClick();
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'main' | 'skills' | 'netrunner' | 'cyberware' | 'injuries' | 'gear' | 'lifepath' | 'notes'
  >('main');

  // Dice Roller Modal state
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);

  // Damage Calculator & Character Wizard Modals
  const [isDamageCalcOpen, setIsDamageCalcOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // DataPool Shop Modal state
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState<'all' | 'weapons' | 'armor' | 'cyberware' | 'gear'>('all');

  const handleOpenShop = (cat: 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear' = 'all') => {
    setShopCategory(cat);
    setIsShopOpen(true);
  };

  const t = translations[lang];

  // Current active character
  const activeChar = characters.find((c) => c.id === activeCharId) || characters[0];

  // Save characters to storage on change
  useEffect(() => {
    saveCharactersToStorage(characters);
  }, [characters]);

  // Update active character ID in storage
  useEffect(() => {
    if (activeCharId) {
      setActiveCharacterId(activeCharId);
    }
  }, [activeCharId]);

  // Sync SFX state
  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);

  const handleUpdateActiveCharacter = (updated: Character) => {
    const updatedWithTimestamp = { ...updated, updatedAt: Date.now() };
    setCharacters((prev) =>
      prev.map((c) => (c.id === updated.id ? updatedWithTimestamp : c))
    );
  };

  const handleSelectCharacter = (id: string) => {
    setActiveId(id);
  };

  const handleNewCharacter = () => {
    const newChar = createEmptyCharacter(lang === 'ru' ? `Новый бегущий #${characters.length + 1}` : `New Edgerunner #${characters.length + 1}`, 'Solo');
    setCharacters((prev) => [...prev, newChar]);
    setActiveId(newChar.id);
  };

  const handleDuplicateCharacter = () => {
    if (!activeChar) return;
    const duplicated: Character = {
      ...JSON.parse(JSON.stringify(activeChar)),
      id: 'char-' + Date.now(),
      name: `${activeChar.name} (${lang === 'ru' ? 'Копия' : 'Copy'})`,
      handle: `${activeChar.handle || 'Ghost'} Copy`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setCharacters((prev) => [...prev, duplicated]);
    setActiveId(duplicated.id);
  };

  const handleDeleteCharacter = () => {
    if (characters.length <= 1) return;
    const confirmed = window.confirm(lang === 'ru' ? `Удалить персонажа "${activeChar.name}"?` : `Delete character "${activeChar.name}"?`);
    if (!confirmed) return;

    const remaining = characters.filter((c) => c.id !== activeChar.id);
    setCharacters(remaining);
    setActiveId(remaining[0].id);
  };

  const handleExportCharacter = () => {
    if (activeChar) exportSingleCharacter(activeChar);
  };

  const handleExportAll = () => {
    exportAllCharacters(characters);
  };

  const handleImportCharacter = (jsonText: string) => {
    const parsed = parseImportedJson(jsonText);
    if (!parsed) {
      alert(lang === 'ru' ? 'Ошибка: некорректный формат файла JSON.' : 'Error: Invalid JSON file format.');
      return;
    }

    if (Array.isArray(parsed)) {
      // Multiple characters backup
      setCharacters(parsed);
      setActiveId(parsed[0]?.id || '');
      alert(lang === 'ru' ? `Успешно импортировано ${parsed.length} персонажей!` : `Successfully imported ${parsed.length} characters!`);
    } else {
      // Single character
      const char = parsed as Character;
      if (!char.id || !char.name || !char.stats) {
        alert(lang === 'ru' ? 'Файл не содержит корректных данных персонажа Cyberpunk RED.' : 'File does not contain valid Cyberpunk RED character data.');
        return;
      }
      char.id = 'imported-' + Date.now();
      setCharacters((prev) => [...prev, char]);
      setActiveId(char.id);
      alert(lang === 'ru' ? `Персонаж "${char.name}" успешно импортирован!` : `Character "${char.name}" successfully imported!`);
    }
  };

  const addRollResult = (res: RollResult) => {
    setRollHistory((prev) => [res, ...prev.slice(0, 49)]); // keep last 50
    setIsDiceModalOpen(true);
  };

  // Roll Handlers
  const handleRollStat = (statKey: StatKey, statVal: number) => {
    const result = executeCyberpunkCheck({
      title: lang === 'ru' ? `Проверка ${statKey} (${t[statKey]})` : `${statKey} Check (${t[statKey]})`,
      type: 'stat',
      baseVal: statVal,
      lang
    });
    addRollResult(result);
  };

  const handleRollInitiative = () => {
    const armorPenalty = Math.min(
      activeChar.armor.head.penalty || 0,
      activeChar.armor.body.penalty || 0
    );
    const soloInit = activeChar.role === 'Solo' ? activeChar.roleAbilities.solo.initiativeReaction || 0 : 0;
    const base = activeChar.stats.REF + armorPenalty + soloInit;

    const result = executeCyberpunkCheck({
      title: lang === 'ru' ? `Инициатива (${activeChar.name})` : `Initiative (${activeChar.name})`,
      type: 'initiative',
      baseVal: base,
      lang
    });
    addRollResult(result);
  };

  const handleRollDeathSave = () => {
    const result = executeDeathSave(activeChar.stats.BODY, activeChar.deathSavePenalties, lang);
    addRollResult(result);
  };

  const handleRollSkill = (skill: Skill, effectiveBase: number) => {
    const skillName = lang === 'ru' ? skill.nameRu : skill.nameEn;
    const result = executeCyberpunkCheck({
      title: lang === 'ru' ? `Навык: ${skillName}` : `Skill: ${skillName}`,
      type: 'skill',
      baseVal: effectiveBase,
      lang
    });
    addRollResult(result);
  };

  const handleRollWeaponAttack = (weapon: Weapon, targetDv?: number, rangeStr?: string) => {
    // Find skill base
    const skill = activeChar.skills.find((s) => s.id === weapon.skillId);
    const isMelee = weapon.skillId === 'melee_weapon' || weapon.skillId === 'brawling' || weapon.skillId === 'martial_arts' || weapon.category.includes('Melee');
    const statVal = isMelee ? activeChar.stats.DEX : activeChar.stats.REF;
    const skillLvl = skill ? skill.level : 0;
    const armorPenalty = Math.min(activeChar.armor.head.penalty || 0, activeChar.armor.body.penalty || 0);

    const hpMax = 10 + 5 * Math.ceil((activeChar.stats.BODY + activeChar.stats.WILL) / 2);
    const woundPenalty = activeChar.hpCurrent <= 0 ? -4 : activeChar.hpCurrent <= Math.ceil(hpMax / 2) ? -2 : 0;

    const baseVal = statVal + skillLvl + armorPenalty + woundPenalty;

    const result = executeCyberpunkCheck({
      title: lang === 'ru' 
        ? `Атака (${isMelee ? 'DEX' : 'REF'}): ${weapon.name}${rangeStr ? ` (${rangeStr})` : isMelee ? ' [Ближний бой · 50% SP]' : ''}` 
        : `Attack (${isMelee ? 'DEX' : 'REF'}): ${weapon.name}${rangeStr ? ` (${rangeStr})` : isMelee ? ' [Melee · Half SP]' : ''}`,
      type: 'attack',
      baseVal,
      targetDv,
      lang
    });
    addRollResult(result);
  };

  const handleRollWeaponDamage = (weapon: Weapon) => {
    const isMelee = weapon.skillId === 'melee_weapon' || weapon.skillId === 'brawling' || weapon.skillId === 'martial_arts' || weapon.category.includes('Melee');
    const title = lang === 'ru' 
      ? `Урон: ${weapon.name}${isMelee ? ' (Игнорирует 50% SP)' : ''}` 
      : `Damage: ${weapon.name}${isMelee ? ' (Ignores 50% SP)' : ''}`;
    const result = executeDamageRoll(title, weapon.damage, lang);
    addRollResult(result);
  };

  const handleRollCustomCheck = (title: string, baseVal: number, targetDv?: number, modifiers?: { name: string; val: number }[]) => {
    const result = executeCyberpunkCheck({
      title,
      type: 'attack',
      baseVal,
      targetDv,
      modifiers,
      lang
    });
    addRollResult(result);
  };

  const handleRollCustomDamage = (title: string, formula: string) => {
    const result = executeDamageRoll(title, formula, lang);
    addRollResult(result);
  };

  const handleRollInterfaceAction = (actionName: string, dv?: number, bonus = 0) => {
    const interfaceRank = activeChar.roleAbilities.netrunner.interfaceRank || 4;
    const baseVal = interfaceRank + bonus;

    const result = executeCyberpunkCheck({
      title: `NET: ${actionName}`,
      type: 'net',
      baseVal,
      targetDv: dv,
      lang
    });
    addRollResult(result);
  };

  const handleRollProgramAttack = (prog: ProgramItem) => {
    const interfaceRank = activeChar.roleAbilities.netrunner.interfaceRank || 4;
    const baseVal = interfaceRank + prog.atkBonus;

    const result = executeCyberpunkCheck({
      title: lang === 'ru' ? `NET Атака: ${prog.name} (ATK +${prog.atkBonus})` : `NET Attack: ${prog.name} (ATK +${prog.atkBonus})`,
      type: 'net',
      baseVal
    });
    addRollResult(result);
  };

  if (!activeChar) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-rajdhani selection:bg-red-600 selection:text-white overflow-x-hidden w-full max-w-full">
      {/* Top Navbar */}
      <Header
        characters={characters}
        activeChar={activeChar}
        onSelectCharacter={handleSelectCharacter}
        onNewCharacter={handleNewCharacter}
        onDuplicateCharacter={handleDuplicateCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        onExportCharacter={handleExportCharacter}
        onExportAll={handleExportAll}
        onImportCharacter={handleImportCharacter}
        onOpenDiceRoller={() => setIsDiceModalOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenShop={() => handleOpenShop('all')}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ru' ? 'en' : 'ru')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        dualTerms={dualTerms}
        onToggleDualTerms={() => setDualTerms(!dualTerms)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 md:p-5 space-y-4 pb-24 sm:pb-8 min-w-0">
        {/* Core Stats always visible on top */}
        <StatsSection
          character={activeChar}
          onUpdateCharacter={handleUpdateActiveCharacter}
          onRollStat={handleRollStat}
          onRollInitiative={handleRollInitiative}
          onRollDeathSave={handleRollDeathSave}
          onOpenDamageCalc={() => setIsDamageCalcOpen(true)}
          lang={lang}
        />

        {/* Navigation Tabs (Smooth touch scrolling on mobile) */}
        <div className="border-b border-zinc-800 flex items-center gap-1 overflow-x-auto touch-pan-x scrollbar-none no-print pt-1 -mx-2.5 px-2.5 sm:mx-0 sm:px-0">
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('main');
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2 font-orbitron font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'main'
                ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Crosshair size={15} />
            <span>{t.tabMain}</span>
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('skills');
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2 font-orbitron font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'skills'
                ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen size={15} />
            <span>{t.tabSkills}</span>
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('netrunner');
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2 font-orbitron font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'netrunner'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu size={15} />
            <span>{t.tabNetrunner}</span>
            {activeChar.role === 'Netrunner' && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping ml-0.5" />
            )}
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('injuries');
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2 font-orbitron font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'injuries'
                ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HeartCrack size={15} />
            <span>{t.tabInjuries}</span>
            {activeChar.criticalInjuries.some((i) => i.isActive) && (
              <span className="text-[10px] bg-red-600 text-white px-1.5 rounded-full font-bold">
                !
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('cyberware');
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2 font-orbitron font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'cyberware'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert size={15} />
            <span>{t.tabCyberware}</span>
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('gear');
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2 font-orbitron font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'gear'
                ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Package size={15} />
            <span>{t.tabGear}</span>
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('lifepath');
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2 font-orbitron font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'lifepath'
                ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Compass size={15} />
            <span>{t.tabLifepath}</span>
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('notes');
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2 font-orbitron font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'notes'
                ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText size={15} />
            <span>{t.tabNotes || (lang === 'ru' ? 'Заметки' : 'Notes')}</span>
            {activeChar.notes && (
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 ml-0.5" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="tab-pane">
          {activeTab === 'main' && (
            <div className="space-y-4">
              <RoleSection
                character={activeChar}
                onUpdateCharacter={handleUpdateActiveCharacter}
                lang={lang}
              />
              <WeaponsSection
                character={activeChar}
                onUpdateCharacter={handleUpdateActiveCharacter}
                onRollWeaponAttack={handleRollWeaponAttack}
                onRollWeaponDamage={handleRollWeaponDamage}
                onRollCustomCheck={handleRollCustomCheck}
                onRollCustomDamage={handleRollCustomDamage}
                onOpenShop={handleOpenShop}
                lang={lang}
              />
            </div>
          )}

          {activeTab === 'skills' && (
            <SkillsSection
              character={activeChar}
              onUpdateCharacter={handleUpdateActiveCharacter}
              onRollSkill={handleRollSkill}
              lang={lang}
              dualTerms={dualTerms}
            />
          )}

          {activeTab === 'netrunner' && (
            <NetrunnerSection
              character={activeChar}
              onUpdateCharacter={handleUpdateActiveCharacter}
              onRollInterfaceAction={handleRollInterfaceAction}
              onRollProgramAttack={handleRollProgramAttack}
              lang={lang}
            />
          )}

          {activeTab === 'injuries' && (
            <InjuriesSection
              character={activeChar}
              onUpdateCharacter={handleUpdateActiveCharacter}
              onOpenDamageCalc={() => setIsDamageCalcOpen(true)}
              lang={lang}
            />
          )}

          {activeTab === 'cyberware' && (
            <CyberwareSection
              character={activeChar}
              onUpdateCharacter={handleUpdateActiveCharacter}
              onOpenShop={handleOpenShop}
              lang={lang}
            />
          )}

          {activeTab === 'gear' && (
            <GearSection
              character={activeChar}
              onUpdateCharacter={handleUpdateActiveCharacter}
              onOpenShop={handleOpenShop}
              lang={lang}
            />
          )}

          {activeTab === 'lifepath' && (
            <LifepathSection
              character={activeChar}
              onUpdateCharacter={handleUpdateActiveCharacter}
              lang={lang}
            />
          )}

          {activeTab === 'notes' && (
            <NotesSection
              character={activeChar}
              onUpdateCharacter={handleUpdateActiveCharacter}
              lang={lang}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button for Dice Roller (bottom right) */}
      <div className="fixed bottom-4 right-4 z-40 no-print">
        <button
          onClick={() => {
            sfx.playClick();
            setIsDiceModalOpen(true);
          }}
          className="p-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-2xl shadow-red-950 border-2 border-red-400 transition transform hover:scale-110 flex items-center justify-center group"
          title={t.tabDice}
        >
          <Dice6 size={26} className="group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* Dice Roller Modal */}
      <DiceRollerModal
        isOpen={isDiceModalOpen}
        onClose={() => setIsDiceModalOpen(false)}
        character={activeChar}
        onUpdateCharacter={handleUpdateActiveCharacter}
        lang={lang}
        rollHistory={rollHistory}
        onAddRollResult={(res) => setRollHistory((prev) => [res, ...prev.slice(0, 49)])}
        onClearHistory={() => setRollHistory([])}
      />

      {/* Damage Calculator & Armor Ablation Modal */}
      <DamageCalculatorModal
        isOpen={isDamageCalcOpen}
        onClose={() => setIsDamageCalcOpen(false)}
        character={activeChar}
        onUpdateCharacter={handleUpdateActiveCharacter}
        lang={lang}
      />

      {/* Character Creation Wizard Modal */}
      <CharacterWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCharacterCreated={(newChar) => {
          setCharacters((prev) => [...prev, newChar]);
          setActiveId(newChar.id);
        }}
        lang={lang}
      />

      {/* DataPool Market & Store Modal */}
      <DataPoolShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        character={activeChar}
        onUpdateCharacter={handleUpdateActiveCharacter}
        lang={lang}
        initialCategory={shopCategory}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-3 text-center text-xs text-zinc-600 font-mono no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>CYBERPUNK RED &copy; R. Talsorian Games. Client-side Interactive Character Sheet for GitHub Pages.</span>
          <span>100% Offline • LocalStorage • Auto-save</span>
        </div>
      </footer>
    </div>
  );
};
export default App;
