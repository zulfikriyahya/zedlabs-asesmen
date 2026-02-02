// src/stores/ui.ts
import { persistentAtom } from '@nanostores/persistent';
import type { Theme, FontSize } from '@/types/common';

interface UIState {
  theme: Theme;
  fontSize: FontSize;
  highContrast: boolean;
  sidebarOpen: boolean;
}

const initialState: UIState = {
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  sidebarOpen: true,
};

export const $uiStore = persistentAtom<UIState>('ui-settings', initialState, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function setTheme(theme: Theme): void {
  $uiStore.set({ ...$uiStore.get(), theme });
  
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function setFontSize(fontSize: FontSize): void {
  $uiStore.set({ ...$uiStore.get(), fontSize });
  
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    if (fontSize === 'small') document.documentElement.classList.add('text-sm');
    if (fontSize === 'large') document.documentElement.classList.add('text-lg');
  }
}

export function toggleHighContrast(): void {
  const current = $uiStore.get();
  const newValue = !current.highContrast;
  $uiStore.set({ ...current, highContrast: newValue });
  
  if (typeof document !== 'undefined') {
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }
}

export function toggleSidebar(): void {
  const current = $uiStore.get();
  $uiStore.set({ ...current, sidebarOpen: !current.sidebarOpen });
}

export function setSidebarOpen(isOpen: boolean): void {
  $uiStore.set({ ...$uiStore.get(), sidebarOpen: isOpen });
}