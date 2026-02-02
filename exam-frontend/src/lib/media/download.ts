// Utility untuk mendownload media dari URL dan menyimpannya sebagai Blob
export async function fetchMediaAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch media: ${url}`);
  return await response.blob();
}

export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}