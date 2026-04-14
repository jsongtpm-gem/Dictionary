export interface Definition {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

export interface TranslatedDefinition {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

export type Language = 'off' | 'es' | 'zh-CN' | 'pt';

export interface WordEntry {
  id: string;
  word: string;
  phonetic?: string;
  definitions: Definition[];
  translatedDefinitions?: TranslatedDefinition[];
  secondaryLanguage?: Language;
  addedAt: string;
  archived: boolean;
}
