import { mediaApi } from '@/lib/api/media.api'

export async function uploadInChunks(
  blob: Blob,
  opts: { questionId: string; attemptId: string; onProgress?: (pct: number) => void },
): Promise<string> {
  const CHUNK = 512 * 1024   // 512 KB
  const total = Math.ceil(blob.size / CHUNK)
  let objectKey: string | null = null

  for (let i = 0; i < total; i++) {
    const chunk = blob.slice(i * CHUNK, (i + 1) * CHUNK)
    const fd = new FormData()
    fd.append('file', chunk)
    fd.append('questionId', opts.questionId)
    fd.append('attemptId', opts.attemptId)
    fd.append('chunkIndex', String(i))
    fd.append('totalChunks', String(total))
    fd.append('mimeType', blob.type)

    const res = await mediaApi.uploadChunk(fd) as { objectKey?: string }
    if (res.objectKey) objectKey = res.objectKey
    opts.onProgress?.(Math.round(((i + 1) / total) * 100))
  }

  if (!objectKey) throw new Error('Upload gagal: objectKey tidak diterima')
  return objectKey
}
