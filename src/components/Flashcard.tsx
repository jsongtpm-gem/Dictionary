import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Language, WordEntry } from '../types';
import { Colors, Fonts, Typography, Spacing, Radius } from '../theme';
import { CheckboxIcon } from './SketchIcons';
import { lightTap, successBump } from '../services/haptics';

const LANG_LABEL: Partial<Record<Language, string>> = {
  es: 'Español',
  'zh-CN': '中文',
  pt: 'Português',
};

interface Props {
  entry: WordEntry;
  onArchive: () => void;
}

export default function Flashcard({ entry, onArchive }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [checked, setChecked] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;

  // Synchronous reset before paint — prevents a one-frame flash of the previous card's state
  useLayoutEffect(() => {
    setFlipped(false);
    setChecked(false);
    anim.setValue(0);
    entranceAnim.setValue(0);
  }, [entry.id]);

  // Entrance animation after reset is committed
  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [entry.id]);

  const frontInterpolate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const entranceScale = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const entranceTranslateY = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  function flip() {
    lightTap();
    Animated.spring(anim, {
      toValue: flipped ? 0 : 1,
      friction: 9,
      tension: 12,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  }

  function handleMaster() {
    if (checked) return;
    setChecked(true);
    successBump();
    setTimeout(() => onArchive(), 400);
  }

  return (
    <TouchableWithoutFeedback onPress={flip}>
      <Animated.View
        style={[
          styles.wrapper,
          {
            transform: [{ scale: entranceScale }, { translateY: entranceTranslateY }],
          },
        ]}
      >
        {/* Front — word */}
        <Animated.View
          style={[styles.card, styles.front, { transform: [{ rotateY: frontInterpolate }] }]}
        >
          <Text style={styles.tapHint}>tap to reveal</Text>
          <View style={styles.frontContent}>
            <Text
              style={styles.frontWord}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {entry.word}
            </Text>
            {entry.phonetic ? (
              <Text style={styles.frontPhonetic}>{entry.phonetic}</Text>
            ) : null}
          </View>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </Animated.View>

        {/* Back — definitions */}
        <Animated.View
          style={[styles.card, styles.back, { transform: [{ rotateY: backInterpolate }] }]}
        >
          <View style={styles.backHeader}>
            <Text style={styles.backWord}>{entry.word}</Text>
          </View>
          <ScrollView
            style={styles.defScroll}
            showsVerticalScrollIndicator
            indicatorStyle="black"
            nestedScrollEnabled
            contentContainerStyle={styles.defScrollContent}
          >
            {entry.definitions.map((d, i) => (
              <View key={`en-${i}`} style={styles.defItem}>
                <Text style={styles.pos}>{d.partOfSpeech}</Text>
                <Text style={styles.defText}>{d.definition}</Text>
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
                  <View key={`tr-${i}`} style={styles.defItem}>
                    <Text style={styles.posTr}>{d.partOfSpeech}</Text>
                    <Text style={styles.defTextTr}>{d.definition}</Text>
                    {d.example ? (
                      <Text style={styles.exampleTr}>"{d.example}"</Text>
                    ) : null}
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          {/* Mastered badge — bottom right, thumb-friendly */}
          <TouchableOpacity
            style={[styles.masterBadge, checked && styles.masterBadgeChecked]}
            onPress={handleMaster}
            disabled={checked}
          >
            <CheckboxIcon size={17} color={checked ? Colors.surface : Colors.accent} checked={checked} />
            <Text style={[styles.masterBadgeText, checked && styles.masterBadgeTextChecked]}>
              {checked ? 'mastered!' : 'mastered'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const CORNER = 14;

const styles = StyleSheet.create({
  wrapper: { width: '100%', aspectRatio: 0.72 },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: Radius.xl,
    backfaceVisibility: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },

  // ── Front ──
  front: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  frontContent: { alignItems: 'center', paddingHorizontal: Spacing.xl },
  tapHint: {
    position: 'absolute',
    top: Spacing.lg,
    fontFamily: Fonts.regular,
    fontSize: Typography.xs,
    color: 'rgba(168,218,220,0.45)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  frontWord: {
    fontFamily: Fonts.black,
    fontSize: 52,
    color: Colors.textInverse,
    textAlign: 'center',
    letterSpacing: -1.5,
    lineHeight: 58,
  },
  frontPhonetic: {
    fontFamily: Fonts.regular,
    fontSize: Typography.base,
    color: Colors.accentLight,
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: 'rgba(168,218,220,0.22)',
  },
  cornerTL: { top: 18, left: 18, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  cornerTR: { top: 18, right: 18, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  cornerBL: { bottom: 18, left: 18, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  cornerBR: { bottom: 18, right: 18, borderBottomWidth: 1.5, borderRightWidth: 1.5 },

  // ── Back ──
  back: {
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backHeader: {
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backWord: {
    fontFamily: Fonts.black,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  masterBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentSoft,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  masterBadgeChecked: {
    backgroundColor: Colors.accent,
  },
  masterBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 0.3,
  },
  masterBadgeTextChecked: {
    color: Colors.surface,
  },
  defScroll: { flex: 1 },
  defScrollContent: { paddingBottom: 64 },
  defItem: { marginBottom: Spacing.md },
  pos: {
    fontFamily: Fonts.extrabold,
    fontSize: Typography.xs,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
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

  // ── Language divider ──
  langDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ── Translated defs ──
  posTr: {
    fontFamily: Fonts.extrabold,
    fontSize: Typography.xs,
    color: Colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
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
});
