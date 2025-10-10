// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';

// Temporary icon component wrapper - you can replace with actual SVG later
const IconImage = ({ source, color, size = 28 }: { source: any; color: string; size?: number }) => (
  <Image
    source={source}
    style={[styles.icon, { width: size, height: size, tintColor: color }]}
    resizeMode="contain"
  />
);

export default function TabLayout() {
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
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => console.log('Home phone icon pressed!')}
            >
              <IconImage
                source={require('../../assets/icons/phone.png')}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
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
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => console.log('Exercises phone icon pressed!')}
            >
              <IconImage
                source={require('../../assets/icons/phone.png')}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
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
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => console.log('Score phone icon pressed!')}
            >
              <IconImage
                source={require('../../assets/icons/phone.png')}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
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
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => console.log('Profile phone icon pressed!')}
              >
                <IconImage
                  source={require('../../assets/icons/phone.png')}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
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