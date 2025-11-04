// utils/emergencyCall.ts
import { Alert, Linking, Platform } from 'react-native';

interface EmergencyContact {
  emergency_id: number;
  name: string;
  relation: string;
  emergency_phone_number: string | null;
  emergency_email: string | null;
  is_allow_alerts: boolean;
}

/**
 * Handles emergency call functionality
 * @param emergencyContacts - Array of emergency contacts from user profile
 */
export const handleEmergencyCall = async (
  emergencyContacts?: EmergencyContact[]
) => {
  // Check if emergency contacts exist and have a phone number
  if (!emergencyContacts || emergencyContacts.length === 0) {
    Alert.alert(
      'No Emergency Contact',
      'Emergency contact has not been added. Please add an emergency contact in your profile.',
      [{ text: 'OK', style: 'default' }]
    );
    return;
  }

  // Get the first emergency contact with a phone number
  const primaryContact = emergencyContacts.find(
    (contact) => contact.emergency_phone_number
  );

  if (!primaryContact || !primaryContact.emergency_phone_number) {
    Alert.alert(
      'No Phone Number',
      'Emergency contact does not have a phone number. Please update your emergency contact.',
      [{ text: 'OK', style: 'default' }]
    );
    return;
  }

  // Format phone number (remove spaces, dashes, etc.)
  const phoneNumber = primaryContact.emergency_phone_number.replace(
    /[^0-9+]/g,
    ''
  );

  // Confirm before calling
  Alert.alert(
    'Emergency Call',
    `Call ${primaryContact.name} (${primaryContact.relation}) at ${primaryContact.emergency_phone_number}?`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Call',
        style: 'default',
        onPress: async () => {
          try {
            const url = Platform.select({
              ios: `telprompt:${phoneNumber}`,
              android: `tel:${phoneNumber}`,
            }) || `tel:${phoneNumber}`;

            const supported = await Linking.canOpenURL(url);

            if (supported) {
              await Linking.openURL(url);
            } else {
              Alert.alert(
                'Error',
                'Unable to make phone calls on this device.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            console.error('Error making emergency call:', error);
            Alert.alert(
              'Error',
              'Failed to initiate call. Please try again.',
              [{ text: 'OK' }]
            );
          }
        },
      },
    ]
  );
};

/**
 * Alternative version that calls directly without confirmation
 * Use this if you want instant calling without confirmation dialog
 */
export const handleEmergencyCallDirect = async (
  emergencyContacts?: EmergencyContact[]
) => {
  if (!emergencyContacts || emergencyContacts.length === 0) {
    Alert.alert(
      'No Emergency Contact',
      'Emergency contact has not been added. Please add an emergency contact in your profile.',
      [{ text: 'OK', style: 'default' }]
    );
    return;
  }

  const primaryContact = emergencyContacts.find(
    (contact) => contact.emergency_phone_number
  );

  if (!primaryContact || !primaryContact.emergency_phone_number) {
    Alert.alert(
      'No Phone Number',
      'Emergency contact does not have a phone number. Please update your emergency contact.',
      [{ text: 'OK', style: 'default' }]
    );
    return;
  }

  const phoneNumber = primaryContact.emergency_phone_number.replace(
    /[^0-9+]/g,
    ''
  );

  try {
    const url = Platform.select({
      ios: `telprompt:${phoneNumber}`,
      android: `tel:${phoneNumber}`,
    }) || `tel:${phoneNumber}`;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Error',
        'Unable to make phone calls on this device.',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Error making emergency call:', error);
    Alert.alert('Error', 'Failed to initiate call. Please try again.', [
      { text: 'OK' },
    ]);
  }
};