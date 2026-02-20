'use client';
import { useState, useCallback } from 'react';
import { clsx } from 'clsx';

// Baris layout keyboard Arabic (layout standar)
const ROWS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
];

const DIACRITICS = [
  { label: 'فَ', value: '\u064E', title: 'Fathah' },
  { label: 'فِ', value: '\u0650', title: 'Kasrah' },
  { label: 'فُ', value: '\u064F', title: 'Dammah' },
  { label: 'فً', value: '\u064B', title: 'Tanwin Fathah' },
  { label: 'فٍ', value: '\u064D', title: 'Tanwin Kasrah' },
  { label: 'فٌ', value: '\u064C', title: 'Tanwin Dammah' },
  { label: 'فْ', value: '\u0652', title: 'Sukun' },
  { label: 'فّ', value: '\u0651', title: 'Syaddah' },
  { label: 'فَّ', value: '\u0651\u064E', title: 'Syaddah + Fathah' },
];

const SPECIAL = [
  { label: 'بِسْمِ', value: 'بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ', title: 'Basmalah' },
  { label: 'ﷲ', value: 'الله', title: 'Allah' },
  { label: 'صلى', value: 'ﷺ', title: 'Shalawat' },
  { label: 'وسلم', value: 'عليه السلام', title: 'Salam' },
];

interface ArabicKeyboardProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  showDiacritics?: boolean;
  showSpecial?: boolean;
}

export function ArabicKeyboard({
  value,
  onChange,
  disabled,
  placeholder = 'اكتب هنا...',
  rows = 4,
  showDiacritics = true,
  showSpecial = true,
}: ArabicKeyboardProps) {
  const [cursorPos, setCursorPos] = useState<number | null>(null);

  const insertAtCursor = useCallback(
    (char: string) => {
      const pos = cursorPos ?? value.length;
      const next = value.slice(0, pos) + char + value.slice(pos);
      onChange(next);
      setCursorPos(pos + char.length);
    },
    [cursorPos, value, onChange],
  );

  const handleBackspace = () => {
    if (value.length === 0) return;
    const pos = cursorPos ?? value.length;
    if (pos === 0) return;
    // Handle combined chars (diacritics attached to letter)
    const next = value.slice(0, pos - 1) + value.slice(pos);
    onChange(next);
    setCursorPos(Math.max(0, pos - 1));
  };

  const handleClear = () => {
    onChange('');
    setCursorPos(0);
  };

  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPos(e.currentTarget.selectionStart);
  };

  return (
    <div className="space-y-3 rounded-box border border-base-300 bg-base-100 p-3">
      {/* Text area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleTextareaSelect}
        onClick={handleTextareaSelect}
        onKeyUp={handleTextareaSelect}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        dir="rtl"
        className="arabic-text textarea textarea-bordered w-full resize-none text-right leading-loose"
        style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", fontSize: '1.2rem' }}
      />

      {/* Special phrases */}
      {showSpecial && (
        <div className="flex flex-wrap gap-1.5">
          {SPECIAL.map((s) => (
            <button
              key={s.value}
              type="button"
              title={s.title}
              onClick={() => insertAtCursor(s.value)}
              disabled={disabled}
              className="arabic-keyboard-key btn btn-outline btn-xs"
              dir="rtl"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Diacritics */}
      {showDiacritics && (
        <div className="flex flex-wrap gap-1">
          {DIACRITICS.map((d) => (
            <button
              key={d.value}
              type="button"
              title={d.title}
              onClick={() => insertAtCursor(d.value)}
              disabled={disabled}
              className="arabic-keyboard-key btn btn-ghost btn-xs border border-base-300 font-bold"
              dir="rtl"
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* Main keyboard rows */}
      <div className="space-y-1" dir="rtl">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex flex-wrap justify-center gap-0.5">
            {row.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => insertAtCursor(ch)}
                disabled={disabled}
                className="arabic-keyboard-key btn btn-ghost btn-xs min-w-[2.2rem] border border-base-200"
              >
                {ch}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => insertAtCursor(' ')}
            disabled={disabled}
            className="btn btn-ghost btn-xs border border-base-300 px-6"
          >
            مسافة
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleBackspace}
            disabled={disabled || value.length === 0}
            className="btn btn-ghost btn-xs border border-base-300"
            title="Hapus satu karakter"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || value.length === 0}
            className="btn btn-outline btn-error btn-xs"
            title="Hapus semua"
          >
            Hapus Semua
          </button>
        </div>
      </div>

      <p className="text-right text-xs text-base-content/40">{value.length} karakter</p>
    </div>
  );
}
