import '@testing-library/jest-dom';

Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      generateKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      digest: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
    },
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    },
  },
});

vi.mock('dexie', () => ({
  default: vi.fn().mockImplementation(() => ({
    version: vi.fn().mockReturnThis(),
    stores: vi.fn().mockReturnThis(),
    open: vi.fn(),
  })),
}));

vi.mock('@powersync/react', () => ({
  usePowerSync: vi.fn(),
  PowerSyncContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}));
