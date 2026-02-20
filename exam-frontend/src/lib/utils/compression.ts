/**
 * Kompresi gambar di browser sebelum upload (Canvas API).
 */
export async function compressImage(
  file: File,
  opts: { maxWidthPx?: number; quality?: number } = {},
): Promise<Blob> {
  const { maxWidthPx = 1280, quality = 0.8 } = opts;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidthPx / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D not supported'));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        quality,
      );
    };

    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = url;
  });
}
