// src/types/common.ts
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface DeviceWarning {
  type: 'storage' | 'battery' | 'network' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';