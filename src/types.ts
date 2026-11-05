export type ApologyTone =
  | 'warm_humorous'
  | 'victorian'
  | 'corporate_pr'
  | 'passive_aggressive'
  | 'legal_brief'
  | 'drama_queen'
  | 'earnest_buffoon'
  | 'existential';

export interface ApologyLetter {
  id?: string;
  timestamp?: number;
  title: string;
  salutation: string;
  content: string;
  valediction: string;
  signOff: string;
  postScript: string;
  absurdityQuote?: string;
  recipient?: string;
  sender?: string;
  transgression?: string;
  tone?: ApologyTone;
  dramaLevel?: number;
}

export interface ExcuseItem {
  title: string;
  description: string;
}

export interface PeaceOfferingItem {
  offering: string;
  terms: string;
}

export interface ApologyPreset {
  id: string;
  name: string;
  tagline: string;
  recipient: string;
  relationship: string;
  transgression: string;
  tone: ApologyTone;
  dramaLevel: number;
  sampleLetter: ApologyLetter;
}

export interface GhostwriterConsultResponse {
  success: boolean;
  assistantCommentary: string;
  clarifyingQuestions: string[];
  letterDraft: ApologyLetter;
  confirmationPrompt: string;
  preservedExpressions?: string[];
  error?: string;
}
