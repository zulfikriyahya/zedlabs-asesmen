// ── interfaces/question-options.interface.ts ─────────────
export interface McOption {
  key: string; // a, b, c, d, e
  text: string;
  imageUrl?: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface QuestionContent {
  text: string;
  images?: string[];
  audio?: string;
  video?: string;
}
