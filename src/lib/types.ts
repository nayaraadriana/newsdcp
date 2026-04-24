// ─── Seções disponíveis ──────────────────────────────────────────

export type SectionType =
  | 'intro'
  | 'hero'
  | 'highlight'
  | 'fique_de_olho'
  | 'button';

// ─── Estilos de botão ────────────────────────────────────────────

export type ButtonStyle = 'large' | 'link';

// ─── Interfaces por tipo de seção ────────────────────────────────

export interface IntroSection {
  type: 'intro';
  title: string;
  text: string;
}

export interface HeroSection {
  type: 'hero';
  title: string;
  text: string;
  imageUrl: string;
}

export interface HighlightSection {
  type: 'highlight';
  title: string;
  text: string;
}

export interface FiqueDeOlhoSection {
  type: 'fique_de_olho';
  title: string;
  text: string;
}

export interface ButtonSection {
  type: 'button';
  buttonStyle: ButtonStyle;
  text: string;
  url: string;
}

// ─── União de todas as seções ────────────────────────────────────

export type Section =
  | IntroSection
  | HeroSection
  | HighlightSection
  | FiqueDeOlhoSection
  | ButtonSection;
