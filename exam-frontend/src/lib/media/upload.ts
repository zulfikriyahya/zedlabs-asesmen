import { mediaApi } from '@/lib/api/media.api'
import { compressImage } from '@/lib/utils/compression'

export async function uploadImage(file: File, compress = true): Promise<string> {
  const blob = compress ? await compressImage(file) : file
  const fd = new FormData()
  fd.append('file', blob, file.name)
  const res = await mediaApi.upload(fd)
  return res.objectKey
}
