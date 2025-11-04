// components/EmergencyCallButton.tsx
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../features/auth/store';
import { handleEmergencyCall } from '../utils/emergencyCall';

interface EmergencyCallButtonProps {
  size?: number;
  color?: string;
  style?: any;
}

const EmergencyCallButton: React.FC<EmergencyCallButtonProps> = ({
  size = 28,
  color = COLORS.primary,
  style,
}) => {
  const user = useAuthStore((state) => state.user);

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
        style={[styles.icon, { width: size, height: size, tintColor: color }]}
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
    width: 28,
    height: 28,
  },
});

export default EmergencyCallButton;