import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  // This is where your map component will go
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map Will Go Here</Text>
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