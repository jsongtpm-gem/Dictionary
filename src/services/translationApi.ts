import { Definition, TranslatedDefinition } from '../types';

/**
 * Uses the Google Translate public endpoint — no API key required, no daily
 * character cap, and significantly better quality than MyMemory's free tier.
 *
 * Response shape: [[[translatedChunk, originalChunk, ...], ...], sourceLang, ...]
 * Long strings are sometimes split into multiple chunks; joining them gives the
 * full translation.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = await response.json();
    // data[0] is an array of [translatedChunk, originalChunk, ...] pairs
    const translated: string = data[0]
      ?.map((chunk: unknown[]) => chunk[0] ?? '')
      .join('') ?? '';
    return translated.trim() || text;
  } catch {
    return text; // silently fall back to original on any network error
  }
}

export async function translateDefinitions(
  definitions: Definition[],
  targetLang: string,
): Promise<TranslatedDefinition[]> {
  return Promise.all(
    definitions.map(async (d) => ({
      partOfSpeech: d.partOfSpeech,
      definition: await translateText(d.definition, targetLang),
      example: d.example ? await translateText(d.example, targetLang) : undefined,
    })),
  );
}
