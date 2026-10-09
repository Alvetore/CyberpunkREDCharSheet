import React, { useState } from 'react';
import { Character } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { 
  FileText, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Calendar, 
  UserPlus, 
  Target, 
  Coins, 
  Skull,
  Search
} from 'lucide-react';

interface NotesSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  lang: Language;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  character,
  onUpdateCharacter,
  lang
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const handleNotesChange = (newNotes: string) => {
    onUpdateCharacter({ ...character, notes: newNotes });
  };

  const handleInsertTemplate = (templateText: string) => {
    sfx.playClick();
    const current = character.notes || '';
    const updated = current ? `${current.trim()}\n\n${templateText}` : templateText;
    handleNotesChange(updated);
  };

  const handleCopyNotes = () => {
    sfx.playClick();
    navigator.clipboard.writeText(character.notes || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearNotes = () => {
    if (!character.notes) return;
    const confirmed = window.confirm(
      lang === 'ru' 
        ? 'Очистить все заметки? Это действие нельзя отменить.' 
        : 'Clear all notes? This cannot be undone.'
    );
    if (confirmed) {
      sfx.playClick();
      handleNotesChange('');
    }
  };

  const wordCount = (character.notes || '').trim() ? (character.notes || '').trim().split(/\s+/).length : 0;
  const charCount = (character.notes || '').length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-yellow-400" />
            <div>
              <h2 className="font-orbitron font-bold text-sm text-yellow-400 uppercase tracking-wider">
                {lang === 'ru' ? 'Игровые Заметки' : 'Session & Game Notes'}
              </h2>
              <span className="text-[11px] text-zinc-400 block">
                {lang === 'ru' 
                  ? 'Журнал приключений, контакты фиксеров, улики и добыча' 
                  : 'Adventure log, contacts, clues, contracts, and loot'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-200 transition"
              title={lang === 'ru' ? 'Скопировать заметки в буфер обмена' : 'Copy notes to clipboard'}
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? (lang === 'ru' ? 'Скопировано!' : 'Copied!') : (lang === 'ru' ? 'Копировать' : 'Copy')}</span>
            </button>

            <button
              onClick={handleClearNotes}
              disabled={!character.notes}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-950 hover:bg-red-950/40 hover:text-red-400 border border-zinc-800 rounded text-xs text-zinc-400 transition disabled:opacity-30 disabled:pointer-events-none"
              title={lang === 'ru' ? 'Очистить заметки' : 'Clear notes'}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Quick Insert Templates */}
        {/* Quick Insert Templates */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x scrollbar-none pt-2 border-t border-zinc-800/80 text-xs -mx-1 px-1">
          <span className="text-zinc-500 text-[11px] mr-1 flex items-center gap-1 shrink-0">
            <Sparkles size={12} className="text-yellow-500" />
            {lang === 'ru' ? 'Шаблоны:' : 'Templates:'}
          </span>

          <button
            onClick={() => handleInsertTemplate(
              lang === 'ru'
                ? `### 📅 Сессия [${new Date().toLocaleDateString()}]:\n- **Место:** \n- **События:** \n- **Итоги:** `
                : `### 📅 Session [${new Date().toLocaleDateString()}]:\n- **Location:** \n- **Events:** \n- **Outcome:** `
            )}
            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[30px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 hover:text-white transition text-[11px] shrink-0"
          >
            <Calendar size={12} className="text-cyan-400" />
            <span>{lang === 'ru' ? '+ Сессия' : '+ Session'}</span>
          </button>

          <button
            onClick={() => handleInsertTemplate(
              lang === 'ru'
                ? `- **👤 NPC / Контакт:** [Имя]\n  - Роль: \n  - Связь: \n  - Отношение: \n  - Заметки: `
                : `- **👤 NPC / Contact:** [Name]\n  - Role: \n  - Affiliation: \n  - Attitude: \n  - Notes: `
            )}
            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[30px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 hover:text-white transition text-[11px] shrink-0"
          >
            <UserPlus size={12} className="text-emerald-400" />
            <span>{lang === 'ru' ? '+ Контакт / NPC' : '+ NPC Contact'}</span>
          </button>

          <button
            onClick={() => handleInsertTemplate(
              lang === 'ru'
                ? `- **🎯 Контракт:** [Название/Цель]\n  - Заказчик: \n  - Задача: \n  - Награда: [eb]\n  - Дедлайн / Риски: `
                : `- **🎯 Contract:** [Name/Target]\n  - Employer: \n  - Objective: \n  - Reward: [eb]\n  - Deadline / Risks: `
            )}
            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[30px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 hover:text-white transition text-[11px] shrink-0"
          >
            <Target size={12} className="text-red-400" />
            <span>{lang === 'ru' ? '+ Контракт' : '+ Contract'}</span>
          </button>

          <button
            onClick={() => handleInsertTemplate(
              lang === 'ru'
                ? `- **📦 Лут / Схрон:** \n  - Предметы: \n  - Локация / Пароль: `
                : `- **📦 Loot / Stash:** \n  - Items: \n  - Location / Code: `
            )}
            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[30px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 hover:text-white transition text-[11px] shrink-0"
          >
            <Coins size={12} className="text-yellow-400" />
            <span>{lang === 'ru' ? '+ Лут' : '+ Loot'}</span>
          </button>

          <button
            onClick={() => handleInsertTemplate(
              lang === 'ru'
                ? `- **💀 Долг / Враг:** [Кто]\n  - Сумма / Причина: \n  - Срок расплаты: `
                : `- **💀 Debt / Nemesis:** [Who]\n  - Amount / Reason: \n  - Due Date: `
            )}
            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[30px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 hover:text-white transition text-[11px] shrink-0"
          >
            <Skull size={12} className="text-purple-400" />
            <span>{lang === 'ru' ? '+ Долг / Угроза' : '+ Debt / Enemy'}</span>
          </button>
        </div>
      </div>

      {/* Textarea Editor */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md space-y-2">
        <textarea
          value={character.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={
            lang === 'ru'
              ? 'Введите любые заметки по ходу игры: события сессии, диалоги, шифры, координаты тайников, имена фиксеров...'
              : 'Write down session notes, dialogue clues, safehouse passwords, fixer names...'
          }
          rows={12}
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 rounded-lg p-3 sm:p-3.5 text-xs sm:text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-y leading-relaxed min-h-[220px]"
        />

        {/* Footer info bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <Check size={12} />
              {lang === 'ru' ? 'Автосохранение активно' : 'Autosaved'}
            </span>
            <span>
              {lang === 'ru' ? `Слов: ${wordCount}` : `Words: ${wordCount}`}
            </span>
            <span>
              {lang === 'ru' ? `Символов: ${charCount}` : `Chars: ${charCount}`}
            </span>
          </div>

          <span className="text-zinc-600 font-mono text-[10px]">
            {lang === 'ru' ? 'Поддерживается Markdown разметка' : 'Markdown supported'}
          </span>
        </div>
      </div>
    </div>
  );
};
