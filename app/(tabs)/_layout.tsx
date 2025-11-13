// app/(tabs)/_layout.tsx 
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import EmergencyCallButton from '../../components/EmergencyCallButton';
import { COLORS } from '../../constants/colors';
import { FONT_SIZES, ICON_SIZES } from '../../constants/typography';
import { useScaledSizes } from '../../features/accessibility';

const IconImage = ({ source, color, size = 28 }: { source: any; color: string; size?: number }) => (
  <Image
    source={source}
    style={{ width: size, height: size, tintColor: color }}
    resizeMode="contain"
  />
);

export default function TabLayout() {
  const { t } = useTranslation();
  const { icon, text } = useScaledSizes();

  const tabIconSize = icon(ICON_SIZES.ml);
  const headerIconSize = icon(ICON_SIZES.md);
  const labelSize = text(FONT_SIZES.caption);
  const headerTitleSize = text(FONT_SIZES.h5);

  const scaledSpacing = useMemo(() => ({
    tabBarHeight: 70 + (icon(1) - 1) * 15,
    tabBarPaddingBottom: 10 + (icon(1) - 1) * 5,
    headerButtonPadding: icon(4),
    labelMarginTop: text(6),                     
    headerButtonMargin: icon(15),
  }), [icon, text]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: scaledSpacing.tabBarHeight,
          paddingBottom: scaledSpacing.tabBarPaddingBottom,
        },
        headerStyle: {
          backgroundColor: COLORS.lightGray,
        },
        headerTintColor: COLORS.dark,
        headerTitleAlign: 'center',
        
        tabBarLabelStyle: {
          fontSize: labelSize,
          marginTop: scaledSpacing.labelMarginTop, 
        },
        headerTitleStyle: {
          fontSize: headerTitleSize,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home.title'),
          tabBarLabel: t('common.home'),
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
          title: t('exercises.title'),
          tabBarLabel: t('common.exercises'),
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
          title: t('score.title'),
          tabBarLabel: t('common.score'),
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
          title: t('profile.title'),
          tabBarLabel: t('common.profile'),
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