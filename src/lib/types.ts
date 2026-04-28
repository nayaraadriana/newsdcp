// ─── Seções disponíveis ──────────────────────────────────────────

export type SectionType =
  | 'intro'
  | 'hero'
  | 'highlight'
  | 'content'
  | 'fique_de_olho';

// ─── Estilos de botão ────────────────────────────────────────────

export type ButtonStyle = 'large' | 'link';

// ─── Campos opcionais de botão (presentes em todos os partials) ──

export interface ButtonFields {
  buttonEnabled?: boolean;
  buttonStyle?: ButtonStyle;
  buttonText?: string;
  buttonUrl?: string;
}

// ─── Interfaces por tipo de seção ────────────────────────────────

export interface IntroSection extends ButtonFields {
  type: 'intro';
  title: string;
  text: string;
}

export interface HeroSection extends ButtonFields {
  type: 'hero';
  title: string;
  text: string;
  imageUrl: string;
}

export interface HighlightSection extends ButtonFields {
  type: 'highlight';
  title: string;
  text: string;
}

export interface ContentSection extends ButtonFields {
  type: 'content';
  title: string;
  text: string;
  imageUrl?: string;
}

export interface FiqueDeOlhoSection extends ButtonFields {
  type: 'fique_de_olho';
  title: string;
  text: string;
}

// ─── União de todas as seções ────────────────────────────────────

export type Section =
  | IntroSection
  | HeroSection
  | HighlightSection
  | ContentSection
  | FiqueDeOlhoSection;
