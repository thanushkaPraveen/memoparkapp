// app/(tabs)/_layout.tsx - 
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import EmergencyCallButton from '../../components/EmergencyCallButton';
import { COLORS } from '../../constants/colors';
import { FONT_SIZES, ICON_SIZES } from '../../constants/typography';
import { useScaledSizes } from '../../features/accessibility';

// Temporary icon component wrapper 
const IconImage = ({ source, color, size = 28 }: { source: any; color: string; size?: number }) => (
  <Image
    source={source}
    style={[styles.icon, { width: size, height: size, tintColor: color }]}
    resizeMode="contain"
  />
);

export default function TabLayout() {

  const { icon, text } = useScaledSizes();

  const tabIconSize = icon(ICON_SIZES.ml);       // Main tab icons (scales with icon size setting)
  const headerIconSize = icon(ICON_SIZES.md);    // Header icons
  const labelSize = text(FONT_SIZES.caption);         // Tab bar label text (scales with text size setting)
  const headerTitleSize = text(FONT_SIZES.h5);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: 70,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: COLORS.lightGray,
        },
        headerTintColor: COLORS.dark,
        headerTitleAlign: 'center',
        
        tabBarLabelStyle: {
          fontSize: labelSize,
        },
        // Scale header title text
        headerTitleStyle: {
          fontSize: headerTitleSize,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'MemoParkApp',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <IconImage
              source={require('../../assets/icons/home.png')}
              color={focused ? COLORS.primary : COLORS.gray}
              size={tabIconSize} 
            />
          ),
          headerRight: () => <EmergencyCallButton />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarLabel: 'Exercises',
          tabBarIcon: ({ focused }) => (
            <IconImage
              source={require('../../assets/icons/exercises.png')}
              color={focused ? COLORS.primary : COLORS.gray}
              size={tabIconSize} 
            />
          ),
          headerRight: () => <EmergencyCallButton />,
        }}
      />
      <Tabs.Screen
        name="score"
        options={{
          title: 'Score',
          tabBarLabel: 'score',
          tabBarIcon: ({ focused }) => (
            <IconImage
              source={require('../../assets/icons/score.png')}
              color={focused ? COLORS.primary : COLORS.gray}
              size={tabIconSize} 
            />
          ),
          headerRight: () => <EmergencyCallButton />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <IconImage
              source={require('../../assets/icons/profile.png')}
              color={focused ? COLORS.primary : COLORS.gray}
              size={tabIconSize} 
            />
          ),
          headerRight: () => (
            <View style={styles.headerButtonGroup}>
              <TouchableOpacity
                style={[styles.headerButton, { marginRight: 2 }]}
                onPress={() => console.log('Edit icon pressed!')}
              >
                <IconImage
                  source={require('../../assets/icons/edit.png')}
                  color={COLORS.primary}
                  size={headerIconSize} 
                />
              </TouchableOpacity>
              <EmergencyCallButton style={{ marginRight: 15 }} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 32,
    height: 32,
  },
  headerButton: {
    padding: 4,
    marginRight: 15,
  },
  headerButtonGroup: {
    flexDirection: 'row',
    marginRight: 0,
  },
});