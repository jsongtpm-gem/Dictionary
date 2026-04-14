import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadWords } from '../services/storage';
import { WordEntry } from '../types';
import WordListItem from '../components/WordListItem';
import SwipeableWordItem from '../components/SwipeableWordItem';
import AddWordModal from '../components/AddWordModal';
import { Colors, Fonts, Typography, Spacing, Radius, Shadow } from '../theme';

type Filter = 'learning' | 'mastered' | 'all';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'learning', label: 'Learning' },
  { key: 'mastered', label: 'Mastered' },
  { key: 'all', label: 'All words' },
];

export default function DictionaryScreen() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('learning');
  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = useCallback(() => {
    setExpandedId(null);
    refresh();
  }, [refresh]);

  // Empty-state icon animations
  const iconBounce = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Bounce in on mount
    Animated.spring(iconBounce, {
      toValue: 1,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
    // Looping pulse
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, { toValue: 1.07, duration: 700, useNativeDriver: true }),
        Animated.timing(iconPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const refresh = useCallback(async () => {
    const all = await loadWords();
    setWords([
      ...all.filter((w) => !w.archived),
      ...all.filter((w) => w.archived),
    ]);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const learningCount = words.filter((w) => !w.archived).length;
  const masteredCount = words.filter((w) => w.archived).length;

  function countFor(f: Filter) {
    if (f === 'learning') return learningCount;
    if (f === 'mastered') return masteredCount;
    return words.length;
  }

  const filtered = words
    .filter((w) => {
      if (filter === 'learning') return !w.archived;
      if (filter === 'mastered') return w.archived;
      return true;
    })
    .filter((w) => !query || w.word.includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = countFor(f.key);
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, active && styles.filterTabActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                {f.label}
              </Text>
              <View style={[styles.filterBadge, active && styles.filterBadgeActive]}>
                <Text style={[styles.filterCount, active && styles.filterCountActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search bar */}
      {words.length > 0 && (
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your words…"
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={(t) => setQuery(t.replace(/[^a-zA-Z\- ]/g, '').toLowerCase())}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.searchClear}>
              <Text style={styles.searchClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* List or empty state */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          {words.length === 0 ? (
            <>
              <Animated.View
                style={[
                  styles.emptyIconWrap,
                  {
                    opacity: iconBounce,
                    transform: [
                      {
                        scale: iconBounce.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1],
                        }),
                      },
                      {
                        translateY: iconBounce.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                      { scale: iconPulse },
                    ],
                  },
                ]}
              >
                <Text style={styles.emptyIcon}>Aa</Text>
              </Animated.View>
              <Text style={styles.emptyTitle}>Your dictionary awaits</Text>
              <Text style={styles.emptySubtitle}>
                Add words to build your personal vocabulary collection.
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.emptyBtnText}>Add your first word</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.emptyFilterIcon}>
                {filter === 'mastered' ? '🎓' : '📖'}
              </Text>
              <Text style={styles.emptyTitle}>
                {filter === 'mastered' ? 'Nothing mastered yet' : 'Nothing here'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'mastered'
                  ? 'Mark words as mastered during Practice sessions.'
                  : 'All your words have been mastered!'}
              </Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeableWordItem
              entry={item}
              onDelete={handleDelete}
              expanded={expandedId === item.id}
              onPress={() => toggleExpand(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddWordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onWordAdded={() => { setModalVisible(false); refresh(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // ── Filter tabs ──
  filterRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLabel: {
    fontFamily: Fonts.bold,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  filterLabelActive: {
    color: Colors.textInverse,
  },
  filterBadge: {
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterCount: {
    fontFamily: Fonts.extrabold,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  filterCountActive: {
    color: Colors.textInverse,
  },

  // ── Search bar ──
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: Spacing.sm,
  },
  searchIcon: {
    fontSize: 18,
    color: Colors.textTertiary,
    lineHeight: 22,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  searchClear: {
    padding: 4,
  },
  searchClearText: {
    fontFamily: Fonts.bold,
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },

  // ── Empty states ──
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  emptyIcon: {
    fontFamily: Fonts.black,
    fontSize: 28,
    color: Colors.textInverse,
    letterSpacing: -1,
  },
  emptyFilterIcon: { fontSize: 44, marginBottom: Spacing.md },
  emptyTitle: {
    fontFamily: Fonts.black,
    fontSize: Typography.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    maxWidth: 260,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    ...Shadow.md,
  },
  emptyBtnText: {
    fontFamily: Fonts.extrabold,
    color: Colors.textInverse,
    fontSize: Typography.base,
    letterSpacing: 0.2,
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.lg,
  },
  fabText: {
    fontFamily: Fonts.regular,
    fontSize: 28,
    color: Colors.textInverse,
    lineHeight: 32,
  },
});
