// TestAccessibility.tsx - Simple test to verify store works
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccessibilityStore, useScaledSizes } from './features/accessibility';

export default function TestAccessibility() {
  const textSize = useAccessibilityStore((state) => state.textSize);
  const setTextSize = useAccessibilityStore((state) => state.setTextSize);
  const { text } = useScaledSizes();

  console.log('TestAccessibility render - textSize:', textSize);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accessibility Test</Text>
      
      <Text style={{ fontSize: text(20), marginBottom: 20 }}>
        Current Size: {textSize}
      </Text>
      
      <Text style={{ fontSize: text(16), marginBottom: 20 }}>
        16px scaled to: {text(16)}px
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={() => {
            console.log('Small button clicked');
            setTextSize('small');
          }}
          style={[
            styles.button, 
            textSize === 'small' && styles.buttonSelected
          ]}
        >
          <Text style={styles.buttonText}>Small</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => {
            console.log('Medium button clicked');
            setTextSize('medium');
          }}
          style={[
            styles.button, 
            textSize === 'medium' && styles.buttonSelected
          ]}
        >
          <Text style={styles.buttonText}>Medium</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => {
            console.log('Large button clicked');
            setTextSize('large');
          }}
          style={[
            styles.button, 
            textSize === 'large' && styles.buttonSelected
          ]}
        >
          <Text style={styles.buttonText}>Large</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.exampleContainer}>
        <Text style={{ fontSize: text(24), fontWeight: 'bold' }}>
          Example Title (24px base)
        </Text>
        <Text style={{ fontSize: text(18), marginTop: 10 }}>
          Example subtitle (18px base)
        </Text>
        <Text style={{ fontSize: text(16), marginTop: 10 }}>
          Example body text (16px base)
        </Text>
        <Text style={{ fontSize: text(14), marginTop: 10 }}>
          Example small text (14px base)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  button: {
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: '#0051D5',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  exampleContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});