import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadWords, archiveWord } from '../services/storage';
import { successBump } from '../services/haptics';
import { WordEntry } from '../types';
import Flashcard from '../components/Flashcard';
import { Colors, Fonts, Typography, Spacing, Radius, Shadow } from '../theme';

const SESSION_SIZE = 10;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.12;
const SWIPE_VELOCITY = 0.3; // fast flick always triggers regardless of distance

type Phase = 'idle' | 'session' | 'celebrating' | 'done';

export default function PracticeScreen() {
  const [availableCount, setAvailableCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [deck, setDeck] = useState<WordEntry[]>([]);
  const [index, setIndex] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;

  // Celebration overlay animations
  const celebOpacity = useRef(new Animated.Value(0)).current;
  const celebScale = useRef(new Animated.Value(0.6)).current;

  // Lobby icon animations
  const lobbyBounce = useRef(new Animated.Value(0)).current;
  const lobbyFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(lobbyBounce, {
      toValue: 1,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lobbyFloat, { toValue: -8, duration: 800, useNativeDriver: true }),
        Animated.timing(lobbyFloat, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Refs so PanResponder (created once) always sees current values
  const indexRef = useRef(0);
  const deckRef = useRef<WordEntry[]>([]);
  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { deckRef.current = deck; }, [deck]);

  const triggerCelebrationRef = useRef<() => void>(() => {});

  const loadAvailable = useCallback(async () => {
    const all = await loadWords();
    setAvailableCount(all.filter((w) => !w.archived).length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAvailable();
      setPhase('idle');
      setDeck([]);
      setIndex(0);
    }, [loadAvailable])
  );

  const panResponder = useRef(
    PanResponder.create({
      // Only capture clearly horizontal gestures so card flip still works
      onMoveShouldSetPanResponderCapture: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,

      onPanResponderMove: (_, gs) => {
        translateX.setValue(gs.dx);
      },

      onPanResponderRelease: (_, gs) => {
        const cur = indexRef.current;
        const len = deckRef.current.length;

        const goNext = gs.dx < -SWIPE_THRESHOLD || gs.vx < -SWIPE_VELOCITY;
        const goPrev = gs.dx > SWIPE_THRESHOLD || gs.vx > SWIPE_VELOCITY;

        if (goNext && cur < len - 1) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            setIndex(cur + 1);
          });
        } else if (goNext && cur === len - 1) {
          // Swipe past the last card → end of session
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            triggerCelebrationRef.current();
          });
        } else if (goPrev && cur > 0) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            setIndex(cur - 1);
          });
        } else {
          // Not far enough — bounce back
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  function triggerCelebration() {
    celebOpacity.setValue(0);
    celebScale.setValue(0.6);
    setPhase('celebrating');
    Animated.sequence([
      Animated.parallel([
        Animated.spring(celebScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(celebOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.delay(1400),
      Animated.timing(celebOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => setPhase('idle'));
  }

  // Keep ref in sync so PanResponder can call it without stale closure
  triggerCelebrationRef.current = triggerCelebration;

  async function startSession() {
    const all = await loadWords();
    const active = all.filter((w) => !w.archived);
    const shuffled = [...active].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, SESSION_SIZE);
    setDeck(drawn);
    setIndex(0);
    translateX.setValue(0);
    setPhase('session');
  }

  async function handleArchive() {
    const card = deckRef.current[indexRef.current];
    await archiveWord(card.id);
    const newDeck = deckRef.current.filter((_, i) => i !== indexRef.current);
    if (newDeck.length === 0) {
      // All cards mastered — go straight to celebration
      successBump();
      triggerCelebrationRef.current();
    } else {
      setDeck(newDeck);
      setIndex(Math.min(indexRef.current, newDeck.length - 1));
    }
    loadAvailable();
  }

  // ── Lobby ──
  if (phase === 'idle') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lobby}>
          {availableCount === 0 ? (
            <>
              <Animated.View
                style={[
                  styles.lobbyIcon,
                  styles.lobbyIconSuccess,
                  {
                    opacity: lobbyBounce,
                    transform: [
                      { scale: lobbyBounce.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                      { translateY: lobbyFloat },
                    ],
                  },
                ]}
              >
                <Text style={styles.lobbyIconText}>✓</Text>
              </Animated.View>
              <Text style={styles.lobbyTitle}>All caught up!</Text>
              <Text style={styles.lobbySubtitle}>
                Add more words in the Words tab to keep practicing.
              </Text>
            </>
          ) : (
            <>
              <Animated.View
                style={[
                  styles.lobbyIcon,
                  {
                    opacity: lobbyBounce,
                    transform: [
                      { scale: lobbyBounce.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                      { translateY: lobbyFloat },
                    ],
                  },
                ]}
              >
                <Text style={styles.lobbyIconText}>
                  {Math.min(availableCount, SESSION_SIZE)}
                </Text>
              </Animated.View>
              <Text style={styles.lobbyTitle}>Ready to practice?</Text>
              <Text style={styles.lobbySubtitle}>
                {availableCount <= SESSION_SIZE
                  ? `${availableCount} word${availableCount !== 1 ? 's' : ''} in this session`
                  : `${SESSION_SIZE} cards drawn from ${availableCount} words`}
              </Text>
              <TouchableOpacity style={styles.startBtn} onPress={startSession}>
                <Text style={styles.startBtnText}>Begin Session</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── Done ──
  if (phase === 'done') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lobby}>
          <Animated.View
            style={[
              styles.lobbyIcon,
              styles.lobbyIconSuccess,
              {
                opacity: lobbyBounce,
                transform: [
                  { scale: lobbyBounce.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                  { translateY: lobbyFloat },
                ],
              },
            ]}
          >
            <Text style={styles.lobbyIconText}>✓</Text>
          </Animated.View>
          <Text style={styles.lobbyTitle}>Session complete!</Text>
          <Text style={styles.lobbySubtitle}>All cards mastered this session.</Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => setPhase('idle')}>
            <Text style={styles.startBtnText}>Back to Lobby</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Session / Celebrating ──
  const cardOpacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Session header */}
      <View style={styles.sessionHeader}>
        <View style={styles.sessionProgress}>
          <Text style={styles.sessionCount}>
            {index + 1}
            <Text style={styles.sessionTotal}> / {deck.length}</Text>
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((index + 1) / deck.length) * 100}%` },
              ]}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.endBtn} onPress={() => setPhase('idle')}>
          <Text style={styles.endBtnText}>End session</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable card area — hidden during celebration */}
      {phase === 'session' && (
        <View style={styles.cardArea} {...panResponder.panHandlers}>
          <Animated.View style={{ opacity: cardOpacity, transform: [{ translateX }] }}>
            <Flashcard entry={deck[index]} onArchive={handleArchive} />
          </Animated.View>
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>← swipe to navigate →</Text>
          </View>
        </View>
      )}

      {/* Pagination dots */}
      {phase === 'session' && (
        <View style={styles.dots}>
          {deck.length <= 10
            ? deck.map((_, i) => (
                <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
              ))
            : null}
        </View>
      )}

      {/* Celebration overlay — springs up then fades out, then returns to lobby */}
      {phase === 'celebrating' && (
        <Animated.View
          style={[styles.celebOverlay, { opacity: celebOpacity }]}
          pointerEvents="none"
        >
          <Animated.View style={{ transform: [{ scale: celebScale }], alignItems: 'center' }}>
            <View style={styles.celebIcon}>
              <Text style={styles.celebEmoji}>🎉</Text>
            </View>
            <Text style={styles.celebTitle}>All done!</Text>
            <Text style={styles.celebSub}>You've gone through all the cards this session.</Text>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // ── Lobby ──
  lobby: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  lobbyIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.lg,
  },
  lobbyIconSuccess: { backgroundColor: Colors.success },
  lobbyIconText: {
    fontFamily: Fonts.black,
    fontSize: 36,
    color: Colors.textInverse,
    letterSpacing: -1,
  },
  lobbyTitle: {
    fontFamily: Fonts.black,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  lobbySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    maxWidth: 260,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    ...Shadow.md,
  },
  startBtnText: {
    fontFamily: Fonts.extrabold,
    color: Colors.textInverse,
    fontSize: Typography.base,
    letterSpacing: 0.3,
  },

  // ── Session header ──
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  sessionProgress: { flex: 1, gap: 6 },
  sessionCount: {
    fontFamily: Fonts.extrabold,
    fontSize: Typography.md,
    color: Colors.textPrimary,
  },
  sessionTotal: {
    fontFamily: Fonts.regular,
    color: Colors.textTertiary,
    fontSize: Typography.sm,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },
  endBtn: {
    backgroundColor: Colors.errorSoft,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  endBtnText: {
    fontFamily: Fonts.bold,
    fontSize: Typography.sm,
    color: Colors.error,
    letterSpacing: 0.2,
  },

  // ── Card area ──
  cardArea: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    justifyContent: 'center',
  },
  swipeHint: { alignItems: 'center', marginTop: Spacing.md },
  swipeHintText: {
    fontFamily: Fonts.regular,
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },

  // ── Celebration overlay ──
  celebOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,35,50,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  celebIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.lg,
  },
  celebEmoji: { fontSize: 48 },
  celebTitle: {
    fontFamily: Fonts.black,
    fontSize: 32,
    color: Colors.textInverse,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  celebSub: {
    fontFamily: Fonts.regular,
    fontSize: Typography.base,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Dots ──
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 18, backgroundColor: Colors.accent, borderRadius: 3 },
});
