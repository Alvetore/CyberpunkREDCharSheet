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
    effect: 'Наносит 3d6 урона вражеской программе или Black ICE',
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
      name: newProg.name || 'Программа',
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
              <span className="text-[10px] uppercase text-zinc-400 block">Действий в ход</span>
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
              {t.programSlots} (Установлено: {installedPrograms.length} / {character.cyberdeck.programSlotsMax})
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
              {t.hardwareSlots} (Слоты железа)
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
            {t.netActions} (1d10 + Интерфейс {interfaceRank})
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Scanner */}
          <button
            onClick={() => onRollInterfaceAction('Сканирование архитектуры (Scanner)', 8)}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Eye size={13} /> Scanner</span>
              <span className="text-[10px] text-cyan-400 font-mono">DV 8</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Поиск узлов и точек доступа</div>
          </button>

          {/* Backdoor */}
          <button
            onClick={() => onRollInterfaceAction('Взлом шлюза (Backdoor)')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Lock size={13} /> Backdoor</span>
              <span className="text-[10px] text-zinc-400 font-mono">DV Пароля</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Взлом закрытого шлюза</div>
          </button>

          {/* Pathfinder */}
          <button
            onClick={() => onRollInterfaceAction('Разведка архитектуры (Pathfinder)')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Compass size={13} /> Pathfinder</span>
              <span className="text-[10px] text-zinc-400 font-mono">DV Этажа</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Карта архитектуры и Black ICE</div>
          </button>

          {/* Control Node */}
          <button
            onClick={() => onRollInterfaceAction('Управление узлом (Control)')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Sliders size={13} /> Control</span>
              <span className="text-[10px] text-zinc-400 font-mono">DV Узла</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Перехват турелей, камер, дверей</div>
          </button>

          {/* Eye-Dee */}
          <button
            onClick={() => onRollInterfaceAction('Идентификация данных (Eye-Dee)')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Eye size={13} /> Eye-Dee</span>
              <span className="text-[10px] text-zinc-400 font-mono">DV Файла</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Анализ файлов и содержимого</div>
          </button>

          {/* Virus */}
          <button
            onClick={() => onRollInterfaceAction('Внедрение вируса (Virus)')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><Zap size={13} /> Virus</span>
              <span className="text-[10px] text-zinc-400 font-mono">DV Сложности</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Создание постоянного эффекта</div>
          </button>

          {/* Slide */}
          <button
            onClick={() => onRollInterfaceAction('Бегство от ICE (Slide)')}
            className="p-2.5 bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5"><LogOut size={13} /> Slide</span>
              <span className="text-[10px] text-zinc-400 font-mono">vs ICE Percept</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Уход от преследования Black ICE</div>
          </button>

          {/* Safe Jack Out */}
          <button
            onClick={() => onRollInterfaceAction('Экстренное отключение (Jack Out)')}
            className="p-2.5 bg-zinc-950 hover:bg-red-950/40 border border-zinc-800 hover:border-red-600 rounded text-left transition group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-red-300">
              <span className="flex items-center gap-1.5"><LogOut size={13} /> Jack Out</span>
              <span className="text-[10px] text-red-400 font-mono">SAFE / DUMP</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Безопасный разрыв соединения</div>
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
                      title="Удалить программу"
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
                        className="w-5 h-5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-bold text-zinc-300"
                      >
                        -
                      </button>
                      <div className="flex-1 bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
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
                        className="w-5 h-5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-bold text-zinc-300"
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
                    className={`px-2.5 py-1 rounded font-semibold text-[11px] transition ${
                      prog.isInstalled
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {prog.isInstalled ? 'Извлечь' : 'Установить в деку'}
                  </button>

                  {prog.category === 'Attacker' || prog.category === 'Black ICE' ? (
                    <button
                      onClick={() => onRollProgramAttack(prog)}
                      className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 border border-red-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                    >
                      <Flame size={12} />
                      Атака (ATK +{prog.atkBonus})
                    </button>
                  ) : (
                    <button
                      onClick={() => onRollInterfaceAction(`Активация ${prog.name}`, undefined, prog.atkBonus)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-bold flex items-center gap-1"
                    >
                      <Dices size={12} />
                      Запустить
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
          <div className="bg-zinc-900 border-2 border-cyan-500 w-full max-w-md rounded-lg shadow-2xl p-4 space-y-4">
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
                Шаблон программы
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
                <option value="">Выберите программу...</option>
                {PRESET_PROGRAMS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.category} - {p.effect})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-zinc-400 uppercase block mb-1">Название</label>
                <input
                  type="text"
                  value={newProg.name}
                  onChange={(e) => setNewProg({ ...newProg, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 uppercase block mb-1">Класс</label>
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
                <label className="text-[11px] text-zinc-400 uppercase block mb-1">Бонус атаки (ATK)</label>
                <input
                  type="number"
                  value={newProg.atkBonus}
                  onChange={(e) => setNewProg({ ...newProg, atkBonus: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 uppercase block mb-1">REZ (Прочность)</label>
                <input
                  type="number"
                  value={newProg.rezMax}
                  onChange={(e) => setNewProg({ ...newProg, rezMax: parseInt(e.target.value, 10) || 7 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 uppercase block mb-1">Эффект</label>
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
                Отмена
              </button>
              <button
                onClick={handleAddProgram}
                className="px-4 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase rounded"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
