import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, WordEntry } from '../types';

const STORAGE_KEY = '@dictionary_words';
const LANGUAGE_KEY = '@dictionary_language';

export async function loadWords(): Promise<WordEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as WordEntry[];
}

async function saveWords(words: WordEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export async function addWord(entry: WordEntry): Promise<void> {
  const words = await loadWords();
  words.unshift(entry);
  await saveWords(words);
}

export async function archiveWord(id: string): Promise<void> {
  const words = await loadWords();
  const updated = words.map((w) => (w.id === id ? { ...w, archived: true } : w));
  await saveWords(updated);
}

export async function wordExists(word: string): Promise<boolean> {
  const words = await loadWords();
  return words.some((w) => w.word.toLowerCase() === word.toLowerCase());
}

export async function deleteWord(id: string): Promise<void> {
  const words = await loadWords();
  await saveWords(words.filter((w) => w.id !== id));
}

export async function loadLanguage(): Promise<Language> {
  const raw = await AsyncStorage.getItem(LANGUAGE_KEY);
  return (raw as Language) ?? 'off';
}

export async function saveLanguage(lang: Language): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}
