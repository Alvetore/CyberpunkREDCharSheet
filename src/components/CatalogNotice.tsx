import React, { useState } from 'react';
import { Language } from '../locales/i18n';

/** Per-open-session receipt; adding never changes catalog selection or navigation. */
export function useCatalogNotice(lang: Language) {
  const [receipt, setReceipt] = useState<{ name: string; quantity: number; total: number } | null>(null);
  return {
    added: (name: string, quantity = 1) => setReceipt(previous => ({ name, quantity, total: (previous?.total ?? 0) + quantity })),
    reset: () => setReceipt(null),
    notice: receipt && <p role="status" aria-live="polite" className="rounded border border-emerald-800 bg-emerald-950/50 p-2 text-xs text-emerald-300">{lang === 'ru' ? 'Добавлено' : 'Added'}: {receipt.name}{receipt.quantity > 1 ? ` ×${receipt.quantity}` : ''} · {lang === 'ru' ? 'Всего за это открытие' : 'Total this session'}: {receipt.total}. {lang === 'ru' ? 'Можно выбрать следующий предмет.' : 'You can choose another item.'}</p>,
  };
}
