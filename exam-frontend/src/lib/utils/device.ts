// src/lib/utils/device.ts
import CryptoJS from 'crypto-js';

/**
 * Generate unique device fingerprint
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 3. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. Language
  components.push(navigator.language);

  // 5. Platform
  components.push(navigator.platform);

  // 6. Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency?.toString() || '0');

  // 7. Canvas fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('ExamApp', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('ExamApp', 4, 17);
    components.push(canvas.toDataURL());
  }

  // 8. WebGL fingerprint
  try {
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {
    // WebGL not supported
  }

  // Combine and hash
  const fingerprint = components.join('|||');
  return CryptoJS.SHA256(fingerprint).toString();
}

/**
 * Get device information
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cpuCores: navigator.hardwareConcurrency || 0,
  };
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  return /iPad|Android/i.test(navigator.userAgent) && !isMobile();
}

/**
 * Get battery status
 */
export async function getBatteryStatus(): Promise<{
  level: number;
  charging: boolean;
} | null> {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
      };
    } catch (error) {
      console.error('Failed to get battery status:', error);
      return null;
    }
  }
  return null;
}