import React, { useState } from 'react';
import { Character, ProgramItem, ProgramCategory } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { PRESET_PROGRAMS } from '../data/initialData';
import { sfx } from '../utils/audio';
import { 
  Cpu, 
  Terminal, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Eye, 
  Lock, 
  Compass, 
  Sliders, 
  LogOut,
  Dices
} from 'lucide-react';

interface NetrunnerSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onRollInterfaceAction: (actionName: string, dv?: number, bonus?: number) => void;
  onRollProgramAttack: (program: ProgramItem) => void;
  lang: Language;
}

export const NetrunnerSection: React.FC<NetrunnerSectionProps> = ({
  character,
  onUpdateCharacter,
  onRollInterfaceAction,
  onRollProgramAttack,
  lang
}) => {
  const t = translations[lang];
  const interfaceRank = character.roleAbilities.netrunner.interfaceRank || 4;

  // Calculate CPR Net Actions per turn based on Interface Rank
  const netActionsPerTurn = interfaceRank >= 10 ? 5 : interfaceRank >= 7 ? 4 : interfaceRank >= 4 ? 3 : 2;

  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProg, setNewProg] = useState<Partial<ProgramItem>>({
    name: 'Sword',
    category: 'Attacker',
    atkBonus: 2,
    defBonus: 0,
    rezMax: 7,
    rezCurrent: 7,
    effect: lang === 'ru' ? 'Наносит 3d6 урона вражеской программе или Black ICE' : 'Deals 3d6 damage to enemy Program or Black ICE',
    isInstalled: true
  });

  const installedPrograms = character.programs.filter((p) => p.isInstalled);

  const handleToggleInstall = (progId: string) => {
    sfx.playClick();
    const updated = character.programs.map((p) => {
      if (p.id === progId) {
        return { ...p, isInstalled: !p.isInstalled };
      }
      return p;
    });
    onUpdateCharacter({ ...character, programs: updated });
  };

  const handleAdjustRez = (progId: string, delta: number) => {
    sfx.playClick();
    const updated = character.programs.map((p) => {
      if (p.id === progId) {
        return { ...p, rezCurrent: Math.max(0, Math.min(p.rezMax, p.rezCurrent + delta)) };
      }
      return p;
    });
    onUpdateCharacter({ ...character, programs: updated });
  };

  const handleDeleteProgram = (progId: string) => {
    sfx.playClick();
    const updated = character.programs.filter((p) => p.id !== progId);
    onUpdateCharacter({ ...character, programs: updated });
  };

  const handleAddProgram = () => {
    sfx.playClick();
    const prog: ProgramItem = {
      id: 'prog-' + Date.now(),
      name: newProg.name || (lang === 'ru' ? 'Программа' : 'Program'),
      category: (newProg.category as ProgramCategory) || 'Booster',
      atkBonus: newProg.atkBonus || 0,
      defBonus: newProg.defBonus || 0,
      rezMax: newProg.rezMax || 7,
      rezCurrent: newProg.rezMax || 7,
      effect: newProg.effect || '',
      isInstalled: true
    };
    onUpdateCharacter({
      ...character,
      programs: [...character.programs, prog]
    });
    setShowAddProgram(false);
  };

  return (
    <div className="space-y-4">
      {/* Cyberdeck Status Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Cpu size={20} className="text-cyan-400" />
            <div>
              <h2 className="font-orbitron font-bold text-sm text-cyan-400 uppercase tracking-wider">
                {t.netrunnerTitle}
              </h2>
              <span className="text-xs text-zinc-400 font-mono">
                {character.cyberdeck.name}
              </span>
            </div>
          </div>

          {/* Interface Rank & Actions per turn */}
          <div className="flex items-center gap-3">
            <div className="bg-zinc-950 border border-cyan-800/60 px-3 py-1.5 rounded text-center">
              <span className="text-[10px] uppercase text-zinc-400 block">{t.interfaceRank}</span>
              <span className="font-orbitron font-extrabold text-lg text-cyan-300">
                {interfaceRank}
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded text-center">
              <span className="text-[10px] uppercase text-zinc-400 block">{lang === 'ru' ? 'Действий в ход' : 'Actions / Turn'}</span>
              <span className="font-orbitron font-extrabold text-lg text-yellow-400">
                {netActionsPerTurn} NET
              </span>
            </div>
          </div>
        </div>

        {/* Deck Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-zinc-400 block mb-1 uppercase font-semibold text-[10px]">
              {t.deckModel}
            </label>
            <input
              type="text"
              value={character.cyberdeck.name}
              onChange={(e) =>
                onUpdateCharacter({
                  ...character,
                  cyberdeck: { ...character.cyberdeck, name: e.target.value }
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-100 font-bold focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1 uppercase font-semibold text-[10px]">
              {t.programSlots} ({lang === 'ru' ? 'Установлено' : 'Installed'}: {installedPrograms.length} / {character.cyberdeck.programSlotsMax})
            </label>
            <input
              type="number"
              value={character.cyberdeck.programSlotsMax}
              onChange={(e) =>
                onUpdateCharacter({
                  ...character,
                  cyberdeck: {
                    ...character.cyberdeck,
                    programSlotsMax: parseInt(e.target.value, 10) || 5
                  }
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-100 font-bold focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1 uppercase font-semibold text-[10px]">
              {t.hardwareSlots} ({lang === 'ru' ? 'Слоты железа' : 'Hardware Slots'})
            </label>
            <input
              type="number"
              value={character.cyberdeck.hardwareSlotsMax}
              onChange={(e) =>
                onUpdateCharacter({
                  ...character,
                  cyberdeck: {
                    ...character.cyberdeck,
                    hardwareSlotsMax: parseInt(e.target.value, 10) || 3
                  }
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-100 font-bold focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quick Net Actions Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md">
        <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
          <Terminal size={16} className="text-cyan-400" />
          <h3 className="font-orbitron font-bold text-xs text-cyan-400 uppercase tracking-wider">
            {t.netActions} (1d10 + {lang === 'ru' ? 'Интерфейс' : 'Interface'} {interfaceRank})
          </h3>
        </div>

        <div className="grid grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Scanner */}
          <button
            onClick={() => onRollInterfaceAction(lang === 'ru' ? 'Сканирование архитектуры (Scanner)' : 'Scanner Action', 8)}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Eye size={13} /> Scanner</span>
              <span className="text-[10px] text-cyan-400 font-mono">DV 8</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">{lang === 'ru' ? 'Поиск узлов и точек доступа' : 'Find nodes and access points'}</div>
          </button>

          {/* Backdoor */}
          <button
            onClick={() => onRollInterfaceAction(lang === 'ru' ? 'Взлом шлюза (Backdoor)' : 'Backdoor Action')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Lock size={13} /> Backdoor</span>
              <span className="text-[10px] text-zinc-400 font-mono">{lang === 'ru' ? 'DV Пароля' : 'Password DV'}</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">{lang === 'ru' ? 'Взлом закрытого шлюза' : 'Break through locked gate'}</div>
          </button>

          {/* Pathfinder */}
          <button
            onClick={() => onRollInterfaceAction(lang === 'ru' ? 'Разведка архитектуры (Pathfinder)' : 'Pathfinder Action')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Compass size={13} /> Pathfinder</span>
              <span className="text-[10px] text-zinc-400 font-mono">{lang === 'ru' ? 'DV Этажа' : 'Floor DV'}</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">{lang === 'ru' ? 'Карта архитектуры и Black ICE' : 'Map architecture and Black ICE'}</div>
          </button>

          {/* Control Node */}
          <button
            onClick={() => onRollInterfaceAction(lang === 'ru' ? 'Управление узлом (Control)' : 'Control Action')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Sliders size={13} /> Control</span>
              <span className="text-[10px] text-zinc-400 font-mono">{lang === 'ru' ? 'DV Узла' : 'Node DV'}</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">{lang === 'ru' ? 'Перехват турелей, камер, дверей' : 'Control turrets, cameras, doors'}</div>
          </button>

          {/* Eye-Dee */}
          <button
            onClick={() => onRollInterfaceAction(lang === 'ru' ? 'Идентификация данных (Eye-Dee)' : 'Eye-Dee Action')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Eye size={13} /> Eye-Dee</span>
              <span className="text-[10px] text-zinc-400 font-mono">{lang === 'ru' ? 'DV Файла' : 'File DV'}</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">{lang === 'ru' ? 'Анализ файлов и содержимого' : 'Inspect files and contents'}</div>
          </button>

          {/* Virus */}
          <button
            onClick={() => onRollInterfaceAction(lang === 'ru' ? 'Внедрение вируса (Virus)' : 'Virus Action')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Zap size={13} /> Virus</span>
              <span className="text-[10px] text-zinc-400 font-mono">{lang === 'ru' ? 'DV Сложности' : 'Virus DV'}</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">{lang === 'ru' ? 'Создание постоянного эффекта' : 'Create persistent effect'}</div>
          </button>

          {/* Slide */}
          <button
            onClick={() => onRollInterfaceAction(lang === 'ru' ? 'Бегство от ICE (Slide)' : 'Slide Action')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><LogOut size={13} /> Slide</span>
              <span className="text-[10px] text-zinc-400 font-mono">vs ICE Percept</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">{lang === 'ru' ? 'Уход от преследования Black ICE' : 'Flee pursuing Black ICE'}</div>
          </button>

          {/* Safe Jack Out */}
          <button
            onClick={() => onRollInterfaceAction(lang === 'ru' ? 'Экстренное отключение (Jack Out)' : 'Jack Out Action')}
            className="p-2.5 bg-zinc-950 hover:bg-red-950/40 border border-zinc-800 hover:border-red-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-red-300">
              <span className="flex items-center gap-1.5"><LogOut size={13} /> Jack Out</span>
              <span className="text-[10px] text-red-400 font-mono">SAFE / DUMP</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">{lang === 'ru' ? 'Безопасный разрыв соединения' : 'Safe disconnection from Net'}</div>
          </button>
        </div>
      </div>

      {/* Programs List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-cyan-400" />
            <h3 className="font-orbitron font-bold text-xs text-cyan-400 uppercase tracking-wider">
              {t.programs} ({installedPrograms.length} / {character.cyberdeck.programSlotsMax})
            </h3>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              setShowAddProgram(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase rounded transition font-orbitron"
          >
            <Plus size={14} />
            <span>{t.addProgram}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {character.programs.map((prog) => {
            const isDerezzed = prog.rezCurrent <= 0;

            return (
              <div
                key={prog.id}
                className={`border rounded-lg p-3 transition flex flex-col justify-between ${
                  !prog.isInstalled
                    ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                    : isDerezzed
                    ? 'bg-red-950/20 border-red-900'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-bold text-xs text-white">
                          {prog.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            prog.category === 'Attacker'
                              ? 'bg-red-950 text-red-400'
                              : prog.category === 'Defender'
                              ? 'bg-blue-950 text-blue-400'
                              : prog.category === 'Black ICE'
                              ? 'bg-purple-950 text-purple-400'
                              : 'bg-emerald-950 text-emerald-400'
                          }`}
                        >
                          {prog.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{prog.effect}</div>
                    </div>

                    <button
                      onClick={() => handleDeleteProgram(prog.id)}
                      className="text-zinc-600 hover:text-red-400 p-0.5"
                      title={lang === 'ru' ? "Удалить программу" : "Delete program"}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* REZ Bar & Status */}
                  <div className="my-2 bg-zinc-900 p-2 rounded border border-zinc-850">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-zinc-400 font-semibold uppercase">{t.rez} (HP):</span>
                      <span className={`font-mono font-bold ${isDerezzed ? 'text-red-500' : 'text-zinc-200'}`}>
                        {prog.rezCurrent} / {prog.rezMax} {isDerezzed ? '(DEREZZED!)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustRez(prog.id, -1)}
                        className="w-7 h-7 sm:w-5 sm:h-5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs font-bold text-zinc-300 flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <div className="flex-1 bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className={`h-full transition-all ${
                            isDerezzed ? 'bg-red-600' : 'bg-cyan-500'
                          }`}
                          style={{
                            width: `${Math.round((prog.rezCurrent / prog.rezMax) * 100)}%`
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleAdjustRez(prog.id, 1)}
                        className="w-7 h-7 sm:w-5 sm:h-5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs font-bold text-zinc-300 flex items-center justify-center transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-900 text-xs">
                  <button
                    onClick={() => handleToggleInstall(prog.id)}
                    className={`px-3 py-1.5 min-h-[34px] sm:min-h-[28px] rounded font-semibold text-[11px] transition flex items-center justify-center ${
                      prog.isInstalled
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {prog.isInstalled ? (lang === 'ru' ? 'Извлечь' : 'Uninstall') : (lang === 'ru' ? 'Установить в деку' : 'Install to Deck')}
                  </button>

                  {prog.category === 'Attacker' || prog.category === 'Black ICE' ? (
                    <button
                      onClick={() => onRollProgramAttack(prog)}
                      className="px-3 py-1.5 min-h-[34px] sm:min-h-[28px] bg-red-900/60 hover:bg-red-800 border border-red-700 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Flame size={12} />
                      {lang === 'ru' ? 'Атака' : 'Attack'} (ATK +{prog.atkBonus})
                    </button>
                  ) : (
                    <button
                      onClick={() => onRollInterfaceAction(lang === 'ru' ? `Активация ${prog.name}` : `Activate ${prog.name}`, undefined, prog.atkBonus)}
                      className="px-3 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-bold flex items-center justify-center gap-1"
                    >
                      <Dices size={12} />
                      {lang === 'ru' ? 'Запустить' : 'Run'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Program Modal */}
      {showAddProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-zinc-900 border-2 border-cyan-500 w-full max-w-md rounded-lg shadow-2xl p-4 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-orbitron font-bold text-cyan-400 text-sm uppercase">
                {t.addProgram}
              </h3>
              <button
                onClick={() => setShowAddProgram(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                {lang === 'ru' ? 'Шаблон программы' : 'Program Template'}
              </label>
              <select
                onChange={(e) => {
                  const preset = PRESET_PROGRAMS.find((p) => p.name === e.target.value);
                  if (preset) {
                    setNewProg({ ...newProg, ...preset });
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-xs"
              >
                <option value="">{lang === 'ru' ? 'Выберите программу...' : 'Select program...'}</option>
                {PRESET_PROGRAMS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.category} - {p.effect})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-zinc-400 uppercase block mb-1">{lang === 'ru' ? 'Название' : 'Name'}</label>
                <input
                  type="text"
                  value={newProg.name}
                  onChange={(e) => setNewProg({ ...newProg, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 uppercase block mb-1">{lang === 'ru' ? 'Класс' : 'Class'}</label>
                <select
                  value={newProg.category}
                  onChange={(e) => setNewProg({ ...newProg, category: e.target.value as ProgramCategory })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-100"
                >
                  <option value="Booster">Booster</option>
                  <option value="Defender">Defender</option>
                  <option value="Attacker">Attacker</option>
                  <option value="Black ICE">Black ICE</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 uppercase block mb-1">{lang === 'ru' ? 'Бонус атаки (ATK)' : 'Attack Bonus (ATK)'}</label>
                <input
                  type="number"
                  value={newProg.atkBonus}
                  onChange={(e) => setNewProg({ ...newProg, atkBonus: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 uppercase block mb-1">{lang === 'ru' ? 'REZ (Прочность)' : 'REZ (HP)'}</label>
                <input
                  type="number"
                  value={newProg.rezMax}
                  onChange={(e) => setNewProg({ ...newProg, rezMax: parseInt(e.target.value, 10) || 7 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 uppercase block mb-1">{lang === 'ru' ? 'Эффект' : 'Effect'}</label>
              <input
                type="text"
                value={newProg.effect}
                onChange={(e) => setNewProg({ ...newProg, effect: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddProgram(false)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded"
              >
                {lang === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                onClick={handleAddProgram}
                className="px-4 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase rounded"
              >
                {lang === 'ru' ? 'Добавить' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
