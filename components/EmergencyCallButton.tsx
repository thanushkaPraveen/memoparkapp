// components/EmergencyCallButton.tsx - WITH ACCESSIBILITY SCALING
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { useScaledSizes } from '../features/accessibility';
import { useAuthStore } from '../features/auth/store';
import { handleEmergencyCall } from '../utils/emergencyCall';

interface EmergencyCallButtonProps {
  size?: number;
  color?: string;
  style?: any;
}

const EmergencyCallButton: React.FC<EmergencyCallButtonProps> = ({
  size = 24,
  color = COLORS.primary,
  style,
}) => {
  const user = useAuthStore((state) => state.user);
  
  const { icon } = useScaledSizes();
  
  const scaledSize = icon(size);

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
            tintColor: color 
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
    
  },
});

export default EmergencyCallButton;