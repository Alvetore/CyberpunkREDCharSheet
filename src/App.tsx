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
  parseImportedJson,
  hasStorageRecovery,
  exportStorageRecovery
} from './utils/storage';
import { createEmptyCharacter } from './data/initialData';
import { executeCyberpunkCheck, executeDamageRoll, executeDeathSave } from './utils/dice';
import { sfx } from './utils/audio';
import { effectiveStat, initiativeBase, injuryDeathPenalty, netActionBase, selectedWeaponProfile, updateWeaponAmmo, weaponAttackBase, weaponPenetration } from './utils/rules';
import { syncCyberwareWeapons } from './utils/cyberware';

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
import { VehiclesSection } from './components/VehiclesSection';
import { SectionNav, NavigationTab } from './components/SectionNav';

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
  ShoppingCart,
  Car
} from 'lucide-react';

export const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(() => loadStoredCharacters());
  const [saveFailed, setSaveFailed] = useState(false);
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
  const [activeTab, setActiveTab] = useState<NavigationTab>('main');

  // Dice Roller Modal state
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);

  // Damage Calculator & Character Wizard Modals
  const [isDamageCalcOpen, setIsDamageCalcOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // DataPool Shop Modal state
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState<'all' | 'weapons' | 'armor' | 'cyberware' | 'gear' | 'vehicles'>('all');

  const handleOpenShop = (cat: 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear' | 'vehicles' = 'all') => {
    setShopCategory(cat);
    setIsShopOpen(true);
  };

  const t = translations[lang];

  // Current active character
  const activeChar = characters.find((c) => c.id === activeCharId) || characters[0];

  // Save characters to storage on change
  useEffect(() => {
    setSaveFailed(!saveCharactersToStorage(characters));
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
    const updatedWithTimestamp = { ...syncCyberwareWeapons(updated), updatedAt: Date.now() };
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
    const base = initiativeBase(activeChar);

    const result = executeCyberpunkCheck({
      title: lang === 'ru' ? `Инициатива (${activeChar.name})` : `Initiative (${activeChar.name})`,
      type: 'initiative',
      baseVal: base,
      lang
    });
    addRollResult(result);
  };

  const handleRollDeathSave = () => {
    const result = executeDeathSave(effectiveStat(activeChar, 'BODY'), activeChar.deathSavePenalties + injuryDeathPenalty(activeChar), lang);
    handleUpdateActiveCharacter({ ...activeChar, deathSavePenalties: activeChar.deathSavePenalties + 1 });
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

  const handleRollWeaponAttack = (weapon: Weapon, targetDv?: number, rangeStr?: string, autofire = false) => {
    weapon = selectedWeaponProfile(activeChar.weapons.find(item => item.id === weapon.id) ?? weapon);
    if (weapon.attackRequiresRoll === false) return;
    autofire = autofire || weapon.skillId === 'autofire';
    if (weapon.bodyRequirement && effectiveStat(activeChar, 'BODY') < weapon.bodyRequirement) { alert(`BODY ${weapon.bodyRequirement}+`); return; }
    if (autofire && (weapon.currentAmmo < 10 || targetDv === undefined)) {
      alert(lang === 'ru' ? 'Автоогонь требует 10 патронов и DV дистанции.' : 'Autofire needs 10 rounds and a range DV.');
      return;
    }
    const isMelee = weapon.skillId === 'melee_weapon' || weapon.skillId === 'brawling' || weapon.skillId === 'martial_arts' || weapon.category.includes('Melee');
    const baseVal = weaponAttackBase(activeChar, autofire ? { ...weapon, skillId: 'autofire' } : weapon);

    const result = executeCyberpunkCheck({
      title: lang === 'ru' 
        ? `Атака (${isMelee ? 'DEX' : 'REF'}): ${weapon.name}${rangeStr ? ` (${rangeStr})` : weaponPenetration(weapon) === 'half' ? ' [50% SP]' : ''}`
        : `Attack (${isMelee ? 'DEX' : 'REF'}): ${weapon.name}${rangeStr ? ` (${rangeStr})` : weaponPenetration(weapon) === 'half' ? ' [Half SP]' : ''}`,
      type: 'attack',
      baseVal,
      targetDv,
      lang
    });
    addRollResult(result);
    if (autofire) {
      handleUpdateActiveCharacter({ ...activeChar, weapons: activeChar.weapons.map(item => item.id === weapon.id ? updateWeaponAmmo(item, -10) : item) });
      if (result.isSuccess) {
        const damage = executeDamageRoll(`${weapon.name} · Autofire`, '2d6', lang);
        const multiplier = Math.min(result.margin!, weapon.autofireLimit ?? (weapon.category === 'Assault Rifle' ? 4 : 3));
        const spot = activeChar.role === 'Solo' && !activeChar.soloSpotWeaknessUsed ? activeChar.roleAbilities.solo.spotWeakness : 0;
        damage.rawDamage = damage.rawDamage! * multiplier + spot;
        damage.total = damage.rawDamage + (damage.bonusDamage || 0);
        damage.summary += ` · ×${multiplier}${spot ? ` + Spot Weakness ${spot}` : ''} → ${damage.total}`;
        addRollResult(damage);
        if (spot) handleUpdateActiveCharacter({ ...activeChar, soloSpotWeaknessUsed: true, weapons: activeChar.weapons.map(item => item.id === weapon.id ? updateWeaponAmmo(item, -10) : item) });
      }
    }
  };

  const handleRollWeaponDamage = (weapon: Weapon) => {
    weapon = selectedWeaponProfile(activeChar.weapons.find(item => item.id === weapon.id) ?? weapon);
    if (weapon.skillId === 'autofire') { alert(lang === 'ru' ? 'Используйте строку Автоогонь в таблице дистанций: урон зависит от превышения DV.' : 'Use Autofire in the range table: damage depends on the margin over DV.'); return; }
    if (weapon.bodyRequirement && effectiveStat(activeChar, 'BODY') < weapon.bodyRequirement) { alert(`BODY ${weapon.bodyRequirement}+`); return; }
    const isMelee = weaponPenetration(weapon) === 'half';
    const title = lang === 'ru' 
      ? `Урон: ${weapon.name}${isMelee ? ' (Игнорирует 50% SP)' : ''}` 
      : `Damage: ${weapon.name}${isMelee ? ' (Ignores 50% SP)' : ''}`;
    try {
      const result = executeDamageRoll(title, weapon.damage, lang);
      if (weapon.canCrit === false) { result.total -= result.bonusDamage || 0; result.bonusDamage = 0; result.isCritInjury = false; result.summary = `${result.damageDice?.join(' + ')} = ${result.total}`; }
      if (weapon.armorPenetration === 'ignore') result.title += lang === 'ru' ? ' · Напрямую по HP' : ' · Direct HP';
      const spot = activeChar.role === 'Solo' && !activeChar.soloSpotWeaknessUsed ? activeChar.roleAbilities.solo.spotWeakness : 0;
      if (spot) {
        result.total += spot;
        result.rawDamage! += spot;
        result.summary += ` + Spot Weakness ${spot} → ${result.total}`;
        handleUpdateActiveCharacter({ ...activeChar, soloSpotWeaknessUsed: true });
      }
      addRollResult(result);
    } catch (error) { alert(error instanceof Error ? error.message : String(error)); }
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
    return result;
  };

  const handleRollCustomDamage = (title: string, formula: string) => {
    try {
      if (/^\d+$/.test(formula)) {
        addRollResult({ id: crypto.randomUUID(), timestamp: Date.now(), title, type: 'damage', total: Number(formula), rawDamage: Number(formula), summary: `${formula} HP · ${lang === 'ru' ? 'Напрямую, без кубов и абляции' : 'Direct, no dice or ablation'}` });
      } else addRollResult(executeDamageRoll(title, formula, lang));
    } catch (error) { alert(error instanceof Error ? error.message : String(error)); }
  };

  const handleRollInterfaceAction = (actionName: string, dv?: number, bonus = 0) => {
    const baseVal = netActionBase(activeChar, actionName, bonus);

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
    if (!prog.isInstalled || (prog.category !== 'Attacker' && !prog.isActive)) return;
    const baseVal = prog.category === 'Black ICE' ? prog.atkBonus : netActionBase(activeChar, prog.name, prog.atkBonus);

    const result = executeCyberpunkCheck({
      title: lang === 'ru' ? `NET Атака: ${prog.name} (ATK +${prog.atkBonus})` : `NET Attack: ${prog.name} (ATK +${prog.atkBonus})`,
      type: 'net',
      baseVal,
      lang
    });
    addRollResult(result);
    if (prog.category === 'Attacker') handleUpdateActiveCharacter({ ...activeChar, programs: activeChar.programs.map(item => item.id === prog.id ? { ...item, isActive: false } : item) });
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
        {(saveFailed || hasStorageRecovery()) && (
          <div role="alert" className="p-3 border border-amber-500 text-amber-300 rounded text-sm">
            {saveFailed ? (lang === 'ru' ? 'Не удалось сохранить лист. Экспортируйте данные перед закрытием страницы.' : 'Saving failed. Export your data before closing this page.') : (lang === 'ru' ? 'Повреждённое сохранение сохранено отдельно для восстановления.' : 'The damaged original has been preserved for recovery.')}
            <button className="underline ml-3" onClick={exportStorageRecovery}>{lang === 'ru' ? 'Выгрузить резервную копию' : 'Download recovery copy'}</button>
          </div>
        )}
        {/* Core Stats always visible on top */}
        <StatsSection
          character={activeChar}
          onUpdateCharacter={handleUpdateActiveCharacter}
          onRollStat={handleRollStat}
          onRollInitiative={handleRollInitiative}
          onRollDeathSave={handleRollDeathSave}
          onOpenDamageCalc={() => setIsDamageCalcOpen(true)}
          onAddRollResult={addRollResult}
          lang={lang}
        />

        {/* Modern Categorized Navigation Hub (Zero horizontal overflow) */}
        <SectionNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          character={activeChar}
          lang={lang}
        />

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
              onAddRollResult={addRollResult}
              lang={lang}
            />
          )}

          {activeTab === 'gear' && (
            <GearSection
              character={activeChar}
              onUpdateCharacter={handleUpdateActiveCharacter}
              lang={lang}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehiclesSection
              character={activeChar}
              onUpdateCharacter={handleUpdateActiveCharacter}
              onRollCustomCheck={handleRollCustomCheck}
              onRollCustomDamage={handleRollCustomDamage}
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
        key={`${activeChar.id}:${isDamageCalcOpen}`}
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
