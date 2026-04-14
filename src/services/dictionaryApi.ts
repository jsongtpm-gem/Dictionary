import { Definition } from '../types';

interface ApiResult {
  phonetic?: string;
  definitions: Definition[];
}

export async function fetchDefinitions(word: string): Promise<ApiResult> {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`
  );

  if (response.status === 404) {
    throw new Error(`No definition found for "${word}"`);
  }

  if (!response.ok) {
    throw new Error('Failed to fetch definition. Please try again.');
  }

  const data = await response.json();
  const entry = data[0];

  const phonetic: string | undefined =
    entry.phonetic ||
    entry.phonetics?.find((p: { text?: string }) => p.text)?.text;

  // Sort meanings by conventional frequency order
  const POS_ORDER: Record<string, number> = {
    noun: 0,
    verb: 1,
    adjective: 2,
    adverb: 3,
  };
  const sortedMeanings = [...(entry.meanings ?? [])].sort((a: { partOfSpeech: string }, b: { partOfSpeech: string }) => {
    const aRank = POS_ORDER[a.partOfSpeech] ?? 99;
    const bRank = POS_ORDER[b.partOfSpeech] ?? 99;
    return aRank - bRank;
  });

  // Take up to 2 definitions per part of speech, capped at 6 total
  const definitions: Definition[] = [];
  for (const meaning of sortedMeanings) {
    let taken = 0;
    for (const def of meaning.definitions ?? []) {
      if (taken >= 2 || definitions.length >= 6) break;
      definitions.push({
        partOfSpeech: meaning.partOfSpeech,
        definition: def.definition,
        example: def.example,
      });
      taken++;
    }
    if (definitions.length >= 6) break;
  }

  return { phonetic, definitions };
}
