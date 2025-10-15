// app/save-parking-details.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

export default function SaveParkingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get location from params
  const latitude = parseFloat(params.latitude as string);
  const longitude = parseFloat(params.longitude as string);

  // State
  const [photo, setPhoto] = useState<string | null>(null);
  const [whereIsTheCar, setWhereIsTheCar] = useState<'roadside' | 'inside'>('roadside');
  const [roadsideLevel, setRoadsideLevel] = useState('');
  const [insideLevel, setInsideLevel] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Pick image from camera or gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required.');
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus.status !== 'granted') {
              Alert.alert('Permission Denied', 'Camera permission is required.');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              setPhoto(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              setPhoto(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const parkingData = {
        latitude,
        longitude,
        photo,
        location_type: whereIsTheCar,
        roadside_level: whereIsTheCar === 'roadside' ? roadsideLevel : null,
        inside_level: whereIsTheCar === 'inside' ? insideLevel : null,
        note,
        saved_at: new Date().toISOString(),
      };

      console.log('Saving parking data:', parkingData);

      // TODO: Send to API
      // await axiosClient.post('/parking/save', parkingData);

      Alert.alert('Success', 'Your parking location has been saved!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/home'),
        },
      ]);
    } catch (error) {
      console.error('Error saving parking:', error);
      Alert.alert('Error', 'Failed to save parking location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    Alert.alert(
      'Skip Optional Details',
      'Are you sure you want to save without adding details?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: handleSave,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Mini Map Preview */}
        <View style={styles.mapPreview}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker coordinate={{ latitude, longitude }}>
              <Ionicons name="location" size={40} color={COLORS.primary} />
            </Marker>
          </MapView>
        </View>

        {/* Optional Details Section */}
        <ScrollView 
          style={styles.detailsContainer}
          contentContainerStyle={styles.detailsContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Optional Details</Text>

          {/* Photo Upload */}
          <View style={styles.section}>
            <Text style={styles.label}>Photo</Text>
            <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoImage} />
              ) : (
                <Ionicons name="camera-outline" size={40} color={COLORS.gray} />
              )}
            </TouchableOpacity>
          </View>

          {/* Where is the car */}
          <View style={styles.section}>
            <Text style={styles.label}>Where is the car?</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  whereIsTheCar === 'roadside' && styles.toggleButtonActive,
                ]}
                onPress={() => setWhereIsTheCar('roadside')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    whereIsTheCar === 'roadside' && styles.toggleButtonTextActive,
                  ]}
                >
                  Roadside
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  whereIsTheCar === 'inside' && styles.toggleButtonActive,
                ]}
                onPress={() => setWhereIsTheCar('inside')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    whereIsTheCar === 'inside' && styles.toggleButtonTextActive,
                  ]}
                >
                  Inside building
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Level/Floor Inputs */}
          <View style={styles.levelsRow}>
            <View style={styles.levelInput}>
              <Text style={styles.label}>Level / Floor</Text>
              <TextInput
                style={styles.input}
                value={roadsideLevel}
                onChangeText={setRoadsideLevel}
                placeholder={whereIsTheCar === 'roadside' ? 'e.g., Ground' : ''}
                placeholderTextColor={COLORS.placeholderText}
              />
            </View>
            <View style={styles.levelInput}>
              <Text style={styles.label}>Level / Floor</Text>
              <TextInput
                style={styles.input}
                value={insideLevel}
                onChangeText={setInsideLevel}
                placeholder={whereIsTheCar === 'inside' ? 'e.g., Level 2' : ''}
                placeholderTextColor={COLORS.placeholderText}
              />
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.label}>Note</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Add any additional notes..."
              placeholderTextColor={COLORS.placeholderText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isSaving}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save details'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  mapPreview: {
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  detailsContent: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 12,
  },
  photoBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  levelInput: {
    flex: 1,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.white,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.dark,
  },
  noteInput: {
    height: 100,
    paddingTop: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  skipButton: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  saveButton: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});