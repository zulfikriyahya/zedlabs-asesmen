// ── similarity.util.ts ───────────────────────────────────────────────────────
import stringSimilarity from 'string-similarity';

export function cosineSimilarity(a: string, b: string): number {
  return stringSimilarity.compareTwoStrings(a.toLowerCase().trim(), b.toLowerCase().trim());
}

export function isAboveThreshold(a: string, b: string, threshold = 0.8): boolean {
  return cosineSimilarity(a, b) >= threshold;
}
