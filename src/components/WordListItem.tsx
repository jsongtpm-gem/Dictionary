import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Language, WordEntry } from '../types';
import { Colors, Fonts, Typography, Spacing, Radius } from '../theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LANG_BADGE: Partial<Record<Language, string>> = {
  es: 'ES',
  'zh-CN': '中',
  pt: 'PT',
};

const LANG_LABEL: Partial<Record<Language, string>> = {
  es: 'Español',
  'zh-CN': '中文',
  pt: 'Português',
};

interface Props {
  entry: WordEntry;
  expanded?: boolean;
  onPress?: () => void;
}

export default function WordListItem({ entry, expanded = false, onPress }: Props) {
  const firstDef = entry.definitions[0];

  function handlePress() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPress?.();
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={[styles.container, entry.archived && styles.archivedContainer]}
    >
      {/* ── Header row ── */}
      <View style={styles.top}>
        <Text style={[styles.word, entry.archived && styles.wordArchived]}>
          {entry.word}
        </Text>
        {entry.secondaryLanguage && !entry.archived && (
          <View style={styles.langBadge}>
            <Text style={styles.langBadgeText}>
              {LANG_BADGE[entry.secondaryLanguage]}
            </Text>
          </View>
        )}
        {entry.archived && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>mastered</Text>
          </View>
        )}
        <Text style={[styles.chevron, entry.archived && styles.chevronArchived]}>
          {expanded ? '⌃' : '⌄'}
        </Text>
      </View>

      {entry.phonetic ? (
        <Text style={styles.phonetic}>{entry.phonetic}</Text>
      ) : null}

      {/* ── Collapsed: first definition preview ── */}
      {!expanded && firstDef && (
        <Text
          style={[styles.def, entry.archived && styles.defArchived]}
          numberOfLines={2}
        >
          <Text style={styles.pos}>{firstDef.partOfSpeech}  </Text>
          {firstDef.definition}
        </Text>
      )}

      {/* ── Expanded: all definitions ── */}
      {expanded && (
        <View style={styles.expandedBody}>
          {entry.definitions.map((d, i) => (
            <View key={`en-${i}`} style={styles.defBlock}>
              <Text style={styles.pos}>{d.partOfSpeech}</Text>
              <Text style={styles.defFull}>{d.definition}</Text>
              {d.example ? (
                <Text style={styles.example}>"{d.example}"</Text>
              ) : null}
            </View>
          ))}

          {entry.translatedDefinitions && entry.translatedDefinitions.length > 0 && (
            <>
              <View style={styles.langDivider}>
                <View style={styles.langDividerLine} />
                <Text style={styles.langDividerLabel}>
                  {entry.secondaryLanguage ? LANG_LABEL[entry.secondaryLanguage] : ''}
                </Text>
                <View style={styles.langDividerLine} />
              </View>
              {entry.translatedDefinitions.map((d, i) => (
                <View key={`tr-${i}`} style={styles.defBlock}>
                  <Text style={styles.posTr}>{d.partOfSpeech}</Text>
                  <Text style={styles.defTr}>{d.definition}</Text>
                  {d.example ? (
                    <Text style={styles.exampleTr}>"{d.example}"</Text>
                  ) : null}
                </View>
              ))}
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    width: '100%',   // ensure the TouchableOpacity fills the full row width
  },
  archivedContainer: { backgroundColor: Colors.bg },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 3,
  },
  word: {
    fontFamily: Fonts.extrabold,
    fontSize: Typography.md,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    flex: 1,
  },
  wordArchived: { color: Colors.textTertiary },
  chevron: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  chevronArchived: { color: Colors.border },
  phonetic: {
    fontFamily: Fonts.regular,
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },

  // ── Collapsed preview ──
  def: {
    fontFamily: Fonts.regular,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  defArchived: { color: Colors.textTertiary },
  pos: {
    fontFamily: Fonts.extrabold,
    fontSize: Typography.sm,
    color: Colors.accent,
  },

  // ── Expanded body ──
  expandedBody: {
    marginTop: Spacing.sm,
    gap: 0,
  },
  defBlock: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  defFull: {
    fontFamily: Fonts.regular,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginTop: 2,
  },
  example: {
    fontFamily: Fonts.regular,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },

  // ── Language divider ──
  langDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: 0,
  },
  langDividerLine: { flex: 1, height: 1, backgroundColor: Colors.accentSoft },
  langDividerLabel: {
    fontFamily: Fonts.bold,
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Translated defs ──
  posTr: {
    fontFamily: Fonts.extrabold,
    fontSize: Typography.xs,
    color: Colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  defTr: {
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

  // ── Badges ──
  badge: {
    backgroundColor: Colors.successSoft,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: Fonts.extrabold,
    fontSize: Typography.xs,
    color: Colors.success,
    letterSpacing: 0.4,
  },
  langBadge: {
    backgroundColor: Colors.accentSoft,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  langBadgeText: {
    fontFamily: Fonts.black,
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 0.3,
  },
});
