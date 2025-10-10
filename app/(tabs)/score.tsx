// app/(tabs)/score.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ScoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Score Screen Will Go Here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});