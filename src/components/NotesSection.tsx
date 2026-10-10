import React, { useState, useRef, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
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
  Edit3,
  Eye,
  Columns2,
  Bold,
  Italic,
  Heading,
  List,
  ListTodo,
  Quote,
  Code,
  Minus
} from 'lucide-react';

// Configure marked with GitHub Flavored Markdown and breaks enabled
marked.setOptions({
  gfm: true,
  breaks: true,
});

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
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Helper to insert or wrap markdown formatting
  const applyFormatting = (prefix: string, suffix = '', defaultText = '') => {
    sfx.playClick();
    const textarea = textareaRef.current;
    if (!textarea) {
      const current = character.notes || '';
      handleNotesChange(current ? `${current}\n${prefix}${defaultText}${suffix}` : `${prefix}${defaultText}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = selected 
      ? `${prefix}${selected}${suffix}`
      : `${prefix}${defaultText}${suffix}`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    handleNotesChange(newText);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultText.length);
      }
    }, 10);
  };

  // Safe markdown parse & sanitize
  const renderedHtml = useMemo(() => {
    const raw = character.notes || '';
    if (!raw.trim()) return '';
    try {
      const html = marked.parse(raw) as string;
      return DOMPurify.sanitize(html);
    } catch (err) {
      console.error('Markdown parse error:', err);
      return DOMPurify.sanitize(raw);
    }
  }, [character.notes]);

  // Make checkboxes inside preview interactive
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const container = e.currentTarget;
      const allCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
      const index = allCheckboxes.indexOf(target as HTMLInputElement);
      if (index !== -1) {
        sfx.playClick();
        let currentIndex = 0;
        const updated = (character.notes || '').replace(/- \[( |x|X)\]/g, (match) => {
          if (currentIndex === index) {
            currentIndex++;
            return match.toLowerCase().includes('x') ? '- [ ]' : '- [x]';
          }
          currentIndex++;
          return match;
        });
        handleNotesChange(updated);
      }
    }
  };

  const wordCount = (character.notes || '').trim() ? (character.notes || '').trim().split(/\s+/).length : 0;
  const charCount = (character.notes || '').length;

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
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
                  ? 'Журнал приключений, контакты фиксеров, улики и добыча с поддержкой Markdown' 
                  : 'Adventure log, contacts, clues, contracts, and loot with Markdown formatting'}
              </span>
            </div>
          </div>

          {/* View Modes & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => {
                  sfx.playClick();
                  setViewMode('edit');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-semibold ${
                  viewMode === 'edit'
                    ? 'bg-yellow-500 text-black shadow-xs font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={lang === 'ru' ? 'Только редактор' : 'Editor only'}
              >
                <Edit3 size={12} />
                <span>{t.notesEditor || 'Редактор'}</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setViewMode('preview');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-semibold ${
                  viewMode === 'preview'
                    ? 'bg-yellow-500 text-black shadow-xs font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={lang === 'ru' ? 'Форматированный просмотр' : 'Formatted preview'}
              >
                <Eye size={12} />
                <span>{t.notesPreview || 'Просмотр'}</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setViewMode('split');
                }}
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-semibold ${
                  viewMode === 'split'
                    ? 'bg-yellow-500 text-black shadow-xs font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={lang === 'ru' ? 'Разделенный экран (Редактор + Просмотр)' : 'Split view (Editor + Preview)'}
              >
                <Columns2 size={12} />
                <span>{t.notesSplit || 'Сплит'}</span>
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-200 transition"
              title={lang === 'ru' ? 'Скопировать заметки в буфер обмена' : 'Copy notes to clipboard'}
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? (lang === 'ru' ? 'Скопировано!' : 'Copied!') : (lang === 'ru' ? 'Копировать' : 'Copy')}</span>
            </button>

            {/* Clear Button */}
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
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x scrollbar-none pt-2 border-t border-zinc-800/80 text-xs -mx-1 px-1">
          <span className="text-zinc-500 text-[11px] mr-1 flex items-center gap-1 shrink-0 font-medium">
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
                ? `### 📋 Задачи:\n- [ ] Разведка объекта\n- [ ] Связаться с фиксером\n- [ ] Купить патроны`
                : `### 📋 Action Plan:\n- [ ] Recon the target\n- [ ] Contact fixer\n- [ ] Buy ammunition`
            )}
            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[30px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 hover:text-white transition text-[11px] shrink-0"
          >
            <ListTodo size={12} className="text-teal-400" />
            <span>{lang === 'ru' ? '+ Чеклист' : '+ Checklist'}</span>
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

        {/* Markdown Quick Formatting Toolbar (when editing) */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="flex items-center gap-1 overflow-x-auto touch-pan-x scrollbar-none pt-2 border-t border-zinc-800/80 text-xs -mx-1 px-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0 mr-1">
              MD:
            </span>

            <button
              onClick={() => applyFormatting('### ', '', lang === 'ru' ? 'Заголовок' : 'Heading')}
              className="p-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-yellow-400 rounded border border-zinc-800 transition flex items-center gap-1 shrink-0 font-bold"
              title={`${t.notesFormattingHeading || 'Заголовок'} (### )`}
            >
              <Heading size={13} />
              <span className="text-[10px]">H3</span>
            </button>

            <button
              onClick={() => applyFormatting('**', '**', lang === 'ru' ? 'жирный' : 'bold')}
              className="p-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-yellow-400 rounded border border-zinc-800 transition flex items-center gap-1 shrink-0 font-bold"
              title={`${t.notesFormattingBold || 'Жирный'} (**)`}
            >
              <Bold size={13} />
            </button>

            <button
              onClick={() => applyFormatting('*', '*', lang === 'ru' ? 'курсив' : 'italic')}
              className="p-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-yellow-400 rounded border border-zinc-800 transition flex items-center gap-1 shrink-0 italic"
              title={`${t.notesFormattingItalic || 'Курсив'} (*)`}
            >
              <Italic size={13} />
            </button>

            <button
              onClick={() => applyFormatting('- ', '', lang === 'ru' ? 'пункт' : 'item')}
              className="p-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-yellow-400 rounded border border-zinc-800 transition flex items-center gap-1 shrink-0"
              title={`${t.notesFormattingList || 'Список'} (- )`}
            >
              <List size={13} />
            </button>

            <button
              onClick={() => applyFormatting('- [ ] ', '', lang === 'ru' ? 'задача' : 'task')}
              className="p-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-yellow-400 rounded border border-zinc-800 transition flex items-center gap-1 shrink-0"
              title={`${t.notesFormattingChecklist || 'Чеклист'} (- [ ] )`}
            >
              <ListTodo size={13} />
            </button>

            <button
              onClick={() => applyFormatting('> ', '', lang === 'ru' ? 'цитата' : 'quote')}
              className="p-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-yellow-400 rounded border border-zinc-800 transition flex items-center gap-1 shrink-0"
              title={`${t.notesFormattingQuote || 'Цитата'} (> )`}
            >
              <Quote size={13} />
            </button>

            <button
              onClick={() => applyFormatting('`', '`', 'code')}
              className="p-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-yellow-400 rounded border border-zinc-800 transition flex items-center gap-1 shrink-0 font-mono"
              title={`${t.notesFormattingCode || 'Код'} (\`\`)`}
            >
              <Code size={13} />
            </button>

            <button
              onClick={() => applyFormatting('\n---\n\n', '', '')}
              className="p-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-yellow-400 rounded border border-zinc-800 transition flex items-center gap-1 shrink-0"
              title={`${t.notesFormattingDivider || 'Разделитель'} (---)`}
            >
              <Minus size={13} />
              <span className="text-[10px]">HR</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area based on View Mode */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md space-y-3">
        {/* Split View Mode */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Left: Textarea Editor */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                <span className="flex items-center gap-1.5 text-yellow-500 font-bold uppercase tracking-wider">
                  <Edit3 size={12} />
                  {t.notesEditor || 'Редактор (Markdown)'}
                </span>
                <span className="text-zinc-500">{charCount} {lang === 'ru' ? 'симв.' : 'chars'}</span>
              </div>
              <textarea
                ref={textareaRef}
                value={character.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder={t.notesPlaceholder || 'Введите любые заметки...'}
                rows={16}
                className="w-full flex-1 min-h-[380px] bg-zinc-950 border border-zinc-800 focus:border-yellow-500 rounded-lg p-3 sm:p-3.5 text-xs sm:text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Right: Live Rendered Preview */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                <span className="flex items-center gap-1.5 text-yellow-500 font-bold uppercase tracking-wider">
                  <Eye size={12} />
                  {t.notesPreview || 'Просмотр (Рендер)'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {lang === 'ru' ? 'Кликабельные чекбоксы' : 'Interactive checkboxes'}
                </span>
              </div>
              <div 
                onClick={handlePreviewClick}
                className="w-full flex-1 min-h-[380px] max-h-[600px] overflow-y-auto bg-zinc-950/80 border border-zinc-800 rounded-lg p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed"
              >
                {renderedHtml ? (
                  <div 
                    className="cyber-markdown" 
                    dangerouslySetInnerHTML={{ __html: renderedHtml }} 
                  />
                ) : (
                  <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 text-zinc-600 space-y-2 select-none">
                    <FileText size={32} className="text-zinc-700" />
                    <p className="text-xs max-w-xs">{t.notesEmptyPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Editor Only Mode */}
        {viewMode === 'edit' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
              <span className="flex items-center gap-1.5 text-yellow-500 font-bold uppercase tracking-wider">
                <Edit3 size={12} />
                {t.notesEditor || 'Редактор'}
              </span>
              <span className="text-zinc-500">{charCount} {lang === 'ru' ? 'симв.' : 'chars'}</span>
            </div>
            <textarea
              ref={textareaRef}
              value={character.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={t.notesPlaceholder || 'Введите любые заметки...'}
              rows={16}
              className="w-full min-h-[380px] bg-zinc-950 border border-zinc-800 focus:border-yellow-500 rounded-lg p-3 sm:p-3.5 text-xs sm:text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-y leading-relaxed"
            />
          </div>
        )}

        {/* Preview Only Mode */}
        {viewMode === 'preview' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
              <span className="flex items-center gap-1.5 text-yellow-500 font-bold uppercase tracking-wider">
                <Eye size={12} />
                {t.notesPreview || 'Просмотр'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {lang === 'ru' ? 'Кликабельные чекбоксы' : 'Interactive checkboxes'}
              </span>
            </div>
            <div 
              onClick={handlePreviewClick}
              className="w-full min-h-[380px] max-h-[700px] overflow-y-auto bg-zinc-950/80 border border-zinc-800 rounded-lg p-4 sm:p-5 text-xs sm:text-sm leading-relaxed"
            >
              {renderedHtml ? (
                <div 
                  className="cyber-markdown" 
                  dangerouslySetInnerHTML={{ __html: renderedHtml }} 
                />
              ) : (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-8 text-zinc-600 space-y-2 select-none">
                  <FileText size={36} className="text-zinc-700" />
                  <p className="text-xs max-w-sm">{t.notesEmptyPrompt}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer info bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 px-1 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
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

          <span className="text-zinc-500 font-mono text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            {lang === 'ru' ? 'Markdown форматирование включено' : 'Markdown formatting active'}
          </span>
        </div>
      </div>
    </div>
  );
};
