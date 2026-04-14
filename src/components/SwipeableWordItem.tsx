import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { WordEntry } from '../types';
import { deleteWord } from '../services/storage';
import { mediumTap } from '../services/haptics';
import WordListItem from './WordListItem';
import { Colors, Fonts, Typography } from '../theme';

const DELETE_BTN_WIDTH = 80;
const REVEAL_THRESHOLD = DELETE_BTN_WIDTH * 0.6;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  entry: WordEntry;
  onDelete: () => void;
  expanded?: boolean;
  onPress?: () => void;
}

export default function SwipeableWordItem({ entry, onDelete, expanded, onPress }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  const isDeleting = useRef(false);

  // Snap closed whenever the row expands so the delete button never shows behind content
  useEffect(() => {
    if (expanded) {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
      isOpen.current = false;
    }
  }, [expanded]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,

      onPanResponderMove: (_, gs) => {
        const clamped = Math.min(
          0,
          Math.max(gs.dx + (isOpen.current ? -DELETE_BTN_WIDTH : 0), -DELETE_BTN_WIDTH),
        );
        translateX.setValue(clamped);
      },

      onPanResponderRelease: (_, gs) => {
        const cur = isOpen.current ? gs.dx - DELETE_BTN_WIDTH : gs.dx;
        if (cur < -REVEAL_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -DELETE_BTN_WIDTH,
            useNativeDriver: true,
            friction: 8,
          }).start();
          isOpen.current = true;
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
          isOpen.current = false;
        }
      },
    }),
  ).current;

  async function handleDelete() {
    if (isDeleting.current) return;
    isDeleting.current = true;
    mediumTap();
    Animated.timing(translateX, {
      toValue: -SCREEN_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(async () => {
      await deleteWord(entry.id);
      onDelete();
    });
  }

  return (
    <View style={styles.container}>
      {/* Delete button — absolutely positioned behind the content */}
      <View style={styles.deleteAction}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/*
       * Explicit backgroundColor ensures the sliding panel is fully opaque and
       * physically covers the absolute delete button — no z-index tricks needed.
       */}
      <Animated.View
        style={[
          styles.content,
          { transform: [{ translateX }] },
          { backgroundColor: entry.archived ? Colors.bg : Colors.surface },
        ]}
        {...panResponder.panHandlers}
      >
        <WordListItem entry={entry} expanded={expanded} onPress={onPress} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BTN_WIDTH,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
  },
  deleteBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: Fonts.bold,
    fontSize: Typography.sm,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
