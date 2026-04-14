import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { fetchDefinitions } from '../services/dictionaryApi';
import { translateDefinitions } from '../services/translationApi';
import { addWord, wordExists } from '../services/storage';
import { mediumTap } from '../services/haptics';
import { useLanguage } from '../contexts/LanguageContext';
import { Definition, TranslatedDefinition, WordEntry } from '../types';
import { Colors, Fonts, Typography, Spacing, Radius, Shadow } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onWordAdded: () => void;
}

const LANG_LABEL: Record<string, string> = {
  es: 'Español',
  'zh-CN': '中文',
  pt: 'Português',
};

export default function AddWordModal({ visible, onClose, onWordAdded }: Props) {
  const { language } = useLanguage();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ phonetic?: string; definitions: Definition[] } | null>(null);
  const [previewTranslated, setPreviewTranslated] = useState<TranslatedDefinition[] | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setInput('');
    setError('');
    setPreview(null);
    setPreviewTranslated(null);
    setLoading(false);
    setSaving(false);
  }

  async function handleSearch() {
    const word = input.trim();
    if (!word) return;
    setError('');
    setPreview(null);
    setPreviewTranslated(null);
    setLoading(true);
    try {
      if (await wordExists(word)) {
        setError(`"${word}" is already in your dictionary.`);
        setLoading(false);
        Keyboard.dismiss();
        return;
      }
      const result = await fetchDefinitions(word);
      setPreview(result);

      if (language !== 'off') {
        const translated = await translateDefinitions(result.definitions, language);
        setPreviewTranslated(translated);
      }

      Keyboard.dismiss();
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
      Keyboard.dismiss();
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!preview) return;
    setSaving(true);
    const entry: WordEntry = {
      id: Date.now().toString(),
      word: input.trim().toLowerCase(),
      phonetic: preview.phonetic,
      definitions: preview.definitions,
      ...(previewTranslated && language !== 'off'
        ? { translatedDefinitions: previewTranslated, secondaryLanguage: language }
        : {}),
      addedAt: new Date().toISOString(),
      archived: false,
    };
    await addWord(entry);
    mediumTap();
    setSaving(false);
    reset();
    onWordAdded();
  }

  const langLabel = language !== 'off' ? LANG_LABEL[language] : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => { reset(); onClose(); }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add a Word</Text>
              {langLabel && (
                <Text style={styles.langHint}>+ {langLabel} mother tongue</Text>
              )}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => { reset(); onClose(); }}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. ephemeral"
              placeholderTextColor={Colors.textTertiary}
              value={input}
              onChangeText={(t) => {
                const clean = t.replace(/[^a-zA-Z\- ]/g, '').toLowerCase();
                setInput(clean); setPreview(null); setPreviewTranslated(null); setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={[styles.searchBtn, (loading || !input.trim()) && styles.searchBtnDisabled]}
              onPress={handleSearch}
              disabled={loading || !input.trim()}
            >
              {loading
                ? <ActivityIndicator color={Colors.textInverse} size="small" />
                : <Text style={styles.searchBtnText}>Look up</Text>}
            </TouchableOpacity>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {preview && (
            <>
              <View style={styles.previewHeader}>
                <Text style={styles.previewWord}>{input.trim().toLowerCase()}</Text>
                {preview.phonetic ? (
                  <Text style={styles.previewPhonetic}>{preview.phonetic}</Text>
                ) : null}
              </View>

              <ScrollView style={styles.definitionList} showsVerticalScrollIndicator={false}>
                {/* English definitions */}
                {preview.definitions.map((d, i) => (
                  <View key={`en-${i}`} style={styles.defItem}>
                    <Text style={styles.pos}>{d.partOfSpeech}</Text>
                    <Text style={styles.defText}>{d.definition}</Text>
                    {d.example ? <Text style={styles.example}>"{d.example}"</Text> : null}
                  </View>
                ))}

                {/* Translated definitions */}
                {previewTranslated && previewTranslated.length > 0 && (
                  <>
                    <View style={styles.langDivider}>
                      <View style={styles.langDividerLine} />
                      <Text style={styles.langDividerLabel}>{langLabel}</Text>
                      <View style={styles.langDividerLine} />
                    </View>
                    {previewTranslated.map((d, i) => (
                      <View key={`tr-${i}`} style={styles.defItem}>
                        <Text style={styles.posTr}>{d.partOfSpeech}</Text>
                        <Text style={styles.defTextTr}>{d.definition}</Text>
                        {d.example ? <Text style={styles.exampleTr}>"{d.example}"</Text> : null}
                      </View>
                    ))}
                  </>
                )}

                <View style={{ height: Spacing.sm }} />
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnLoading]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color={Colors.textInverse} />
                  : <Text style={styles.saveBtnText}>Save to Dictionary</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,20,30,0.55)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '88%',
    ...Shadow.lg,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMid,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.black,
    fontSize: Typography.lg,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  langHint: {
    fontFamily: Fonts.regular,
    fontSize: Typography.xs,
    color: Colors.accent,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: Fonts.bold,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  searchRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchBtnDisabled: { opacity: 0.45 },
  searchBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.textInverse,
    fontSize: Typography.sm,
    letterSpacing: 0.2,
  },
  errorBox: {
    backgroundColor: Colors.errorSoft,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontFamily: Fonts.regular,
    color: Colors.error,
    fontSize: Typography.sm,
  },
  previewHeader: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  previewWord: {
    fontFamily: Fonts.black,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  previewPhonetic: {
    fontFamily: Fonts.regular,
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  definitionList: { maxHeight: 320 },

  // English defs
  defItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pos: {
    fontFamily: Fonts.extrabold,
    fontSize: Typography.xs,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  defText: {
    fontFamily: Fonts.regular,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  example: {
    fontFamily: Fonts.regular,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },

  // Language divider
  langDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  langDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.accentSoft,
  },
  langDividerLabel: {
    fontFamily: Fonts.bold,
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Translated defs
  posTr: {
    fontFamily: Fonts.extrabold,
    fontSize: Typography.xs,
    color: Colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  defTextTr: {
    fontFamily: Fonts.regular,
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  exampleTr: {
    fontFamily: Fonts.regular,
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },

  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveBtnLoading: { opacity: 0.7 },
  saveBtnText: {
    fontFamily: Fonts.extrabold,
    color: Colors.textInverse,
    fontSize: Typography.base,
    letterSpacing: 0.2,
  },
});
