import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
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
  Code2,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListTodo,
  Quote,
  Code,
  Minus,
  RotateCcw,
  RotateCw
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
  const [isRawSourceMode, setIsRawSourceMode] = useState(false);

  // Initialize TipTap with Markdown and TaskList extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
      }),
    ],
    content: character.notes || '',
    editorProps: {
      attributes: {
        class: 'tiptap p-3 sm:p-4 focus:outline-none min-h-[380px]',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const storage = ed.storage as unknown as { markdown?: { getMarkdown: () => string } };
      const md = storage.markdown ? storage.markdown.getMarkdown() : ed.getHTML();
      onUpdateCharacter({ ...character, notes: md });
    },
  });

  // Sync content when switching characters from the header dropdown
  useEffect(() => {
    if (!editor) return;
    const storage = editor.storage as unknown as { markdown?: { getMarkdown: () => string } };
    const currentMd = storage.markdown ? storage.markdown.getMarkdown() : '';
    const incomingMd = character.notes || '';
    if (incomingMd !== currentMd) {
      editor.commands.setContent(incomingMd);
    }
  }, [character.id, editor]);

  // Insert template directly into the editor
  const handleInsertTemplate = (templateMarkdown: string) => {
    sfx.playClick();
    if (!editor) return;

    const storage = editor.storage as unknown as { markdown?: { getMarkdown: () => string } };
    const currentMd = storage.markdown ? storage.markdown.getMarkdown() : '';

    if (!currentMd.trim()) {
      editor.commands.setContent(templateMarkdown);
    } else {
      editor.commands.insertContent(`\n\n${templateMarkdown}\n`);
    }
    editor.commands.focus('end');
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
      if (editor) {
        editor.commands.clearContent();
      }
      onUpdateCharacter({ ...character, notes: '' });
    }
  };

  const handleRawNotesChange = (newNotes: string) => {
    onUpdateCharacter({ ...character, notes: newNotes });
    if (editor) {
      editor.commands.setContent(newNotes);
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
                  ? 'Интерактивный журнал сессий с мгновенным форматированием Markdown' 
                  : 'Interactive session log with live in-place Markdown formatting'}
              </span>
            </div>
          </div>

          {/* Action Buttons & Source Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Switcher: Visual in-place vs Raw Markdown */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsRawSourceMode(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-semibold ${
                  !isRawSourceMode
                    ? 'bg-yellow-500 text-black shadow-xs font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={lang === 'ru' ? 'Визуальный редактор (разметка форматируется на лету)' : 'Visual in-place editor'}
              >
                <Edit3 size={12} />
                <span>{lang === 'ru' ? 'Визуальный' : 'Visual'}</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setIsRawSourceMode(true);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-semibold ${
                  isRawSourceMode
                    ? 'bg-yellow-500 text-black shadow-xs font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={lang === 'ru' ? 'Исходный Markdown код (#, **, -)' : 'Raw Markdown source code'}
              >
                <Code2 size={12} />
                <span>{lang === 'ru' ? 'Код MD' : 'Raw MD'}</span>
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

        {/* Quick Insert Templates (instantly formats in-place) */}
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
                ? `### 📋 Задачи:\n- [ ] Разведка объекта\n- [ ] Связаться с фиксером\n- [ ] Купить боеприпасы`
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
                ? `- **📦 Лут / Схрон:** \n  - Предметы: \n  - Локация / Код: `
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

        {/* Live Formatting Toolbar for Visual Editor */}
        {!isRawSourceMode && editor && (
          <div className="flex items-center gap-1 overflow-x-auto touch-pan-x scrollbar-none pt-2 border-t border-zinc-800/80 text-xs -mx-1 px-1">
            {/* Heading 1 */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }}
              className={`p-1.5 px-2 rounded border transition flex items-center gap-0.5 shrink-0 font-bold ${
                editor.isActive('heading', { level: 1 })
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-xs'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Заголовок 1 (#)"
            >
              <Heading1 size={13} />
            </button>

            {/* Heading 2 */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }}
              className={`p-1.5 px-2 rounded border transition flex items-center gap-0.5 shrink-0 font-bold ${
                editor.isActive('heading', { level: 2 })
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-xs'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Заголовок 2 (##)"
            >
              <Heading2 size={13} />
            </button>

            {/* Heading 3 */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              className={`p-1.5 px-2 rounded border transition flex items-center gap-0.5 shrink-0 font-bold ${
                editor.isActive('heading', { level: 3 })
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-xs'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Заголовок 3 (###)"
            >
              <Heading3 size={13} />
            </button>

            <div className="w-[1px] h-4 bg-zinc-800 mx-0.5 shrink-0" />

            {/* Bold */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().toggleBold().run();
              }}
              className={`p-1.5 px-2 rounded border transition flex items-center shrink-0 font-bold ${
                editor.isActive('bold')
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-xs'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Жирный (**)"
            >
              <Bold size={13} />
            </button>

            {/* Italic */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().toggleItalic().run();
              }}
              className={`p-1.5 px-2 rounded border transition flex items-center shrink-0 italic ${
                editor.isActive('italic')
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-xs'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Курсив (*)"
            >
              <Italic size={13} />
            </button>

            <div className="w-[1px] h-4 bg-zinc-800 mx-0.5 shrink-0" />

            {/* Bullet List */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().toggleBulletList().run();
              }}
              className={`p-1.5 px-2 rounded border transition flex items-center shrink-0 ${
                editor.isActive('bulletList')
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-xs'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Список (-)"
            >
              <List size={13} />
            </button>

            {/* Task List (Interactive Checkboxes) */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().toggleTaskList().run();
              }}
              className={`p-1.5 px-2 rounded border transition flex items-center shrink-0 ${
                editor.isActive('taskList')
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-xs'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Интерактивный чеклист (- [ ])"
            >
              <ListTodo size={13} />
            </button>

            {/* Blockquote */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().toggleBlockquote().run();
              }}
              className={`p-1.5 px-2 rounded border transition flex items-center shrink-0 ${
                editor.isActive('blockquote')
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-xs'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Цитата (>)"
            >
              <Quote size={13} />
            </button>

            {/* Code */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().toggleCode().run();
              }}
              className={`p-1.5 px-2 rounded border transition flex items-center shrink-0 ${
                editor.isActive('code')
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-xs'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Код (`)"
            >
              <Code size={13} />
            </button>

            {/* Divider */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().setHorizontalRule().run();
              }}
              className="p-1.5 px-2 rounded border transition flex items-center gap-0.5 shrink-0 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
              title="Разделитель (---)"
            >
              <Minus size={13} />
              <span className="text-[10px]">HR</span>
            </button>

            <div className="w-[1px] h-4 bg-zinc-800 mx-0.5 shrink-0" />

            {/* Undo */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().undo().run();
              }}
              disabled={!editor.can().undo()}
              className="p-1.5 px-2 rounded border transition flex items-center shrink-0 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 disabled:opacity-20 border-zinc-800"
              title="Отменить (Ctrl+Z)"
            >
              <RotateCcw size={13} />
            </button>

            {/* Redo */}
            <button
              onClick={() => {
                sfx.playClick();
                editor.chain().focus().redo().run();
              }}
              disabled={!editor.can().redo()}
              className="p-1.5 px-2 rounded border transition flex items-center shrink-0 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 disabled:opacity-20 border-zinc-800"
              title="Повторить (Ctrl+Y)"
            >
              <RotateCw size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Main Single Note Editor Field */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md space-y-2">
        {!isRawSourceMode ? (
          /* Single Unified Visual WYSIWYG Editor */
          <div className="bg-zinc-950 border border-zinc-800 focus-within:border-yellow-500 rounded-lg overflow-hidden transition">
            <EditorContent editor={editor} />
          </div>
        ) : (
          /* Raw Markdown Textarea fallback */
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block px-1">
              {lang === 'ru' ? 'Исходный Markdown текст:' : 'Raw Markdown Source:'}
            </span>
            <textarea
              value={character.notes || ''}
              onChange={(e) => handleRawNotesChange(e.target.value)}
              placeholder={t.notesPlaceholder || '...'}
              rows={16}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-y leading-relaxed min-h-[380px]"
            />
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

          <span className="text-zinc-500 font-mono text-[10px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
            {lang === 'ru' 
              ? 'Разметка форматируется сразу в поле (Напечатайте #, -, [ ] или выберите шаблон)' 
              : 'Markdown converts in-place (Type #, -, [ ] or click template)'}
          </span>
        </div>
      </div>
    </div>
  );
};
