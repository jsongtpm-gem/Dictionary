import * as Haptics from 'expo-haptics';

/** Subtle tap — card flip */
export function lightTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Satisfying tap — word saved */
export function mediumTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Strong confirmation — word mastered, session complete */
export function successBump() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
