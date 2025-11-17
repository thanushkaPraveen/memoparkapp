// components/EmergencyCallButton.tsx - WITH ACCESSIBILITY SCALING AND THEME SUPPORT
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useScaledSizes, useThemeColors } from '../features/accessibility';
import { useAuthStore } from '../features/auth/store';
import { handleEmergencyCall } from '../utils/emergencyCall';

interface EmergencyCallButtonProps {
  size?: number;
  color?: string;
  style?: any;
}

const EmergencyCallButton: React.FC<EmergencyCallButtonProps> = ({
  size = 24,
  color,
  style,
}) => {
  const user = useAuthStore((state) => state.user);
  const themedColors = useThemeColors(); // Get themed colors
  
  const { icon } = useScaledSizes();
  
  const scaledSize = icon(size);
  
  // Use provided color or fall back to themed primary color
  const buttonColor = color || themedColors.primary;

  const onPress = () => {
    handleEmergencyCall(user?.emergency_contacts);
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={require('../assets/icons/phone.png')}
        style={[
          styles.icon, 
          { 
            width: scaledSize,   
            height: scaledSize, 
            tintColor: buttonColor 
          }
        ]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 4,
    marginRight: 15,
  },
  icon: {
    // Icon styles are applied inline
  },
});

export default EmergencyCallButton;