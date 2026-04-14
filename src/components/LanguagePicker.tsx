import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Language } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Fonts, Typography, Spacing, Radius, Shadow } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const OPTIONS: { lang: Language; label: string; sublabel: string; badge: string }[] = [
  { lang: 'off',   label: 'English only',  sublabel: 'No mother tongue pairing',  badge: '—'  },
  { lang: 'es',    label: 'Español',        sublabel: 'Spanish',                   badge: 'ES' },
  { lang: 'zh-CN', label: '中文简体',        sublabel: 'Simplified Chinese',        badge: '中' },
  { lang: 'pt',    label: 'Português',      sublabel: 'Portuguese',                badge: 'PT' },
];

export default function LanguagePicker({ visible, onClose }: Props) {
  const { language, setLanguage } = useLanguage();

  function handleSelect(lang: Language) {
    setLanguage(lang);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>Mother Tongue</Text>
        <Text style={styles.subtitle}>
          Pair English words with your native language to understand them better
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((opt) => {
            const active = language === opt.lang;
            return (
              <TouchableOpacity
                key={opt.lang}
                style={[styles.row, active && styles.rowActive]}
                onPress={() => handleSelect(opt.lang)}
                activeOpacity={0.75}
              >
                <View style={[styles.badge, active && styles.badgeActive]}>
                  <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                    {opt.badge}
                  </Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.rowSub, active && styles.rowSubActive]}>
                    {opt.sublabel}
                  </Text>
                </View>
                {active && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    paddingTop: Spacing.md,
    ...Shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.black,
    fontSize: Typography.lg,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  options: { gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rowActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  badgeText: {
    fontFamily: Fonts.black,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  badgeTextActive: {
    color: Colors.surface,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: Fonts.bold,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  rowLabelActive: {
    color: Colors.accent,
  },
  rowSub: {
    fontFamily: Fonts.regular,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  rowSubActive: {
    color: Colors.accent,
  },
  check: {
    fontFamily: Fonts.bold,
    fontSize: Typography.base,
    color: Colors.accent,
  },
});
