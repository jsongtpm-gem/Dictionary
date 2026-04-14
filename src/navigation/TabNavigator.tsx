import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import DictionaryScreen from '../screens/DictionaryScreen';
import PracticeScreen from '../screens/PracticeScreen';
import { BookIcon, CardsIcon } from '../components/SketchIcons';
import LanguagePicker from '../components/LanguagePicker';
import { Colors, Fonts, Typography, Spacing } from '../theme';

const Tab = createBottomTabNavigator();

function GearIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function TabNavigator() {
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: Colors.textTertiary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: { marginBottom: -2 },
          headerStyle: styles.header,
          headerTintColor: Colors.textInverse,
          headerTitleStyle: styles.headerTitle,
        }}
      >
        <Tab.Screen
          name="Dictionary"
          component={DictionaryScreen}
          options={{
            headerTitle: 'My Dictionary',
            tabBarLabel: 'Words',
            tabBarIcon: ({ color }) => <BookIcon size={22} color={color} />,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => setPickerVisible(true)}
                style={styles.gearBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <GearIcon color="rgba(255,255,255,0.75)" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Practice"
          component={PracticeScreen}
          options={{
            headerTitle: 'Practice',
            tabBarLabel: 'Practice',
            tabBarIcon: ({ color }) => <CardsIcon size={22} color={color} />,
          }}
        />
      </Tab.Navigator>

      <LanguagePicker visible={pickerVisible} onClose={() => setPickerVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  headerTitle: {
    fontFamily: Fonts.black,
    fontSize: Typography.md,
    letterSpacing: 0.2,
    color: Colors.textInverse,
  },
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  gearBtn: {
    marginRight: Spacing.md,
    padding: 4,
  },
});
