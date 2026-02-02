import { useState, useEffect } from 'react';
import { checkStorageSpace } from '@/lib/utils/storage';
import { getBatteryStatus } from '@/lib/utils/device';
import { appConfig } from '@/lib/config/app';

export function useDeviceWarnings() {
  const [warnings, setWarnings] = useState<string[]>([]);

  const checkStatus = async () => {
    const newWarnings: string[] = [];

    // Cek Storage
    const storage = await checkStorageSpace();
    if (storage.available < appConfig.exam.warningThresholds.storage) {
      newWarnings.push('Ruang penyimpanan hampir penuh. Mohon hapus beberapa data.');
    }

    // Cek Baterai
    const battery = await getBatteryStatus();
    if (battery && !battery.charging && battery.level < appConfig.exam.warningThresholds.battery) {
      newWarnings.push('Baterai lemah. Mohon hubungkan charger.');
    }

    setWarnings(newWarnings);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Cek setiap menit
    return () => clearInterval(interval);
  }, []);

  return { warnings };
}