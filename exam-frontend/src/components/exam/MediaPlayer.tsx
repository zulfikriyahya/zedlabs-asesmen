'use client';
import { useEffect, useState } from 'react';
import { getMediaUrl } from '@/lib/media/player';
import { parseErrorMessage } from '@/lib/utils/error';
import { Loading } from '@/components/ui/Loading';

interface MediaPlayerProps {
  objectKey: string;
  type?: 'audio' | 'video' | 'image';
  className?: string;
  autoPlay?: boolean;
}

export function MediaPlayer({ objectKey, type = 'audio', className, autoPlay }: MediaPlayerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMediaUrl(objectKey)
      .then(setUrl)
      .catch((e) => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [objectKey]);

  if (loading) return <Loading size="xs" />;
  if (error) return <p className="text-xs text-error">Gagal memuat media: {error}</p>;
  if (!url) return null;

  if (type === 'image')
    return (
      <img
        src={url}
        alt="Media soal"
        className={className ?? 'max-h-64 rounded-box object-contain'}
      />
    );
  if (type === 'video')
    return (
      <video
        src={url}
        controls
        autoPlay={autoPlay}
        className={className ?? 'max-h-48 w-full rounded-box'}
      />
    );
  return <audio src={url} controls autoPlay={autoPlay} className={className ?? 'h-10 w-full'} />;
}
