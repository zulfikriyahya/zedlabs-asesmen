'use client';
import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/media/upload';
import { parseErrorMessage } from '@/lib/utils/error';
import { formatBytes } from '@/lib/utils/format';
import { Alert } from '@/components/ui/Alert';

interface MediaUploadProps {
  value?: string[]; // object keys MinIO
  onChange: (keys: string[]) => void;
  accept?: string;
  maxFiles?: number;
  label?: string;
}

export function MediaUpload({
  value = [],
  onChange,
  accept = 'image/*',
  maxFiles = 3,
  label = 'Upload Gambar',
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      const newPreviews: string[] = [];
      for (const file of Array.from(files).slice(0, maxFiles - value.length)) {
        const key = await uploadImage(file);
        uploaded.push(key);
        newPreviews.push(URL.createObjectURL(file));
      }
      onChange([...value, ...uploaded]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    } catch (e) {
      setError(parseErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
        <span className="label-text-alt text-base-content/40">
          {value.length}/{maxFiles} file
        </span>
      </label>

      {error && (
        <Alert variant="error" className="text-xs">
          {error}
        </Alert>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt=""
                className="h-20 w-20 rounded-box border border-base-300 object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="btn btn-circle btn-error btn-xs absolute -right-1 -top-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {value.length < maxFiles && (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-box border-2 border-dashed border-base-300 p-4 transition-colors hover:border-primary/50 hover:bg-base-200/50"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFiles(e.dataTransfer.files);
          }}
        >
          {uploading ? (
            <>
              <span className="loading loading-spinner loading-sm text-primary" />
              <p className="mt-2 text-xs text-base-content/60">Mengupload...</p>
            </>
          ) : (
            <>
              <span className="text-2xl">📁</span>
              <p className="mt-1 text-xs text-base-content/60">Klik atau drop file di sini</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
