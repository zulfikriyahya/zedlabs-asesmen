import { useEffect, useRef, useState } from 'react';
import { AutoSaveManager } from '@/lib/exam/autoSave';

// Hook untuk React Components (jika menggunakan React Islands)
export function useAutoSave(attemptId: number, onSave: () => Promise<void>, interval: number = 30000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const managerRef = useRef<AutoSaveManager | null>(null);

  useEffect(() => {
    managerRef.current = new AutoSaveManager(attemptId);
    
    managerRef.current.start(interval, async () => {
      setIsSaving(true);
      try {
        await onSave();
        setLastSaved(new Date());
      } finally {
        setIsSaving(false);
      }
    });

    return () => {
      managerRef.current?.stop();
    };
  }, [attemptId, interval, onSave]);

  const saveNow = async () => {
    setIsSaving(true);
    try {
      await managerRef.current?.saveNow();
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, lastSaved, saveNow };
}