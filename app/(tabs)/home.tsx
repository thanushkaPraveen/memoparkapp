// app/(tabs)/home.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS } from '../../constants/colors';
import axiosClient from '../../lib/axios';

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Bottom sheet form states
  const [photo, setPhoto] = useState<string | null>(null);
  const [whereIsTheCar, setWhereIsTheCar] = useState<'outside' | 'inside'>('outside');
  const [insideLevel, setInsideLevel] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [address, setAddress] = useState<{ name: string; street: string } | null>(null);
  const [parkingSlot, setParkingSlot] = useState('');

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setSelectedLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get your location.');
      }
    })();
  }, []);

  // Center map on current location
  const centerOnUserLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    } catch (error) {
      console.error('Error centering map:', error);
    }
  };

  // Handle map press to select location
  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setSelectedLocation(coordinate);
  };

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocoded.length > 0) {
        const { name, street } = geocoded[0];
        setAddress({ name: name || '', street: street || '' });
      }
    } catch (error) {
      console.error('Failed to get address:', error);
      setAddress({ name: 'Unknown Location', street: '' });
    }
  };

  // Open bottom sheet
  const handleSaveLocationPress = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }
    await getAddressFromCoords(selectedLocation.latitude, selectedLocation.longitude);
    setShowBottomSheet(true);
  };

  // Pick image
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
    if (!selectedLocation || !address) return;

    setIsSaving(true);

    try {
      // Construct the initial parking data WITHOUT any photo details
      const parkingData = {
        parking_latitude: selectedLocation.latitude,
        parking_longitude: selectedLocation.longitude,
        parking_location_name: address.name,
        parking_address: address.street,
        notes: note,
        parking_type: whereIsTheCar === 'inside' ? 'inside_building' : 'outside',
        level_floor: whereIsTheCar === 'inside' ? insideLevel : parkingSlot,
        parking_slot: whereIsTheCar === 'inside' ? parkingSlot : null,
      };

      // Make the first API call to save the parking details and get the new event ID
      const response = await axiosClient.post('/parking', parkingData);
      const savedEvent = response.data;
      const parkingEventId = savedEvent.parking_events_id;

      // If a photo was selected, upload it using the new ID
      if (photo) {
        console.log('Uploading photo for event ID:', parkingEventId);
        
        const formData = new FormData();
        const filename = photo.split('/').pop() || 'photo.jpg';
        const fileType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

        formData.append('photo', {
          uri: photo,
          name: filename,
          type: fileType,
        } as any);

        // Make the second API call to the specific photo upload endpoint
        await axiosClient.post(`/parking/${parkingEventId}/photo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Reset the form and close the sheet on final success
      setPhoto(null);
      setInsideLevel('');
      setParkingSlot('');
      setNote('');
      setShowBottomSheet(false);

      Alert.alert('Success', 'Your parking location has been saved!');

    } catch (error: any) {
      console.error('Error saving parking:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to save parking location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    handleSave();
  };

  // Close bottom sheet
  const closeBottomSheet = () => {
    setShowBottomSheet(false);
  };

  // Safe region calculation to prevent NaN values
  const getSafeRegion = () => {
    if (!location?.coords) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const latitude = location.coords.latitude || 37.78825;
    const longitude = location.coords.longitude || -122.4324;
    
    return {
      latitude: isNaN(latitude) ? 37.78825 : latitude,
      longitude: isNaN(longitude) ? -122.4324 : longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getSafeRegion()}
        // mapType="satellite" 
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={true}
      >
        {/* Selected location marker */}
        {selectedLocation && !isNaN(selectedLocation.latitude) && !isNaN(selectedLocation.longitude) && (
          <Marker
            coordinate={selectedLocation}
            title="Parking Location"
            description="Your car will be parked here"
          >
            <View style={styles.markerContainer}>
              <Ionicons name="location" size={40} color={COLORS.primary} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Top right buttons */}
      <View style={styles.topRightButtons}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => Alert.alert('Map Type', 'Map type selector coming soon!')}
        >
          <Ionicons name="layers-outline" size={24} color={COLORS.dark} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="navigate-outline" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {/* Bottom recenter button */}
      <View style={styles.bottomRightButton}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="locate" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {/* Save button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveLocationPress}
        >
          <Text style={styles.saveButtonText}>Save my car here</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={closeBottomSheet}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeBottomSheet}
          />
          
          <View style={styles.bottomSheet}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            <ScrollView 
              style={styles.bottomSheetContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sheetTitle}>Optional Details</Text>

              {/* Photo */}
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
                      whereIsTheCar === 'outside' && styles.toggleButtonActive,
                    ]}
                    onPress={() => setWhereIsTheCar('outside')}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        whereIsTheCar === 'outside' && styles.toggleButtonTextActive,
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

              {/* Level/Floor */}
              <View style={styles.levelsRow}>
                {whereIsTheCar === 'outside' && (
                  <View style={styles.levelInput}>
                    <Text style={styles.label}>Street Level / Area</Text>
                    <TextInput
                      style={styles.input}
                      value={parkingSlot}
                      onChangeText={setParkingSlot}
                      placeholder="e.g., Near the red mailbox"
                    />
                  </View>
                )}
                {whereIsTheCar === 'inside' && (
                  <>
                    <View style={styles.levelInput}>
                      <Text style={styles.label}>Level / Floor</Text>
                      <TextInput style={styles.input} value={insideLevel} onChangeText={setInsideLevel} placeholder="e.g., 1" />
                    </View>
                    <View style={styles.levelInput}>
                      <Text style={styles.label}>Parking Slot</Text>
                      <TextInput
                        style={styles.input}
                        value={parkingSlot}
                        onChangeText={setParkingSlot}
                        placeholder="e.g., D-42"
                      />
                    </View>
                  </>
                )}
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
                  style={[styles.saveDetailsButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  <Text style={styles.saveDetailsButtonText}>
                    {isSaving ? 'Saving...' : 'Save details'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  map: {
    flex: 1,
    minHeight: 200, // Prevent zero height
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20, // Safe area adjustment
    right: 16,
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomRightButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  // Bottom Sheet Styles
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetContent: {
    padding: 20,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 8,
  },
  photoBox: {
    width: 80,
    height: 80,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.dark,
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  levelInput: {
    flex: 1,
  },
  input: {
    height: 44,
    backgroundColor: COLORS.white,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.dark,
  },
  noteInput: {
    height: 80,
    paddingTop: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  skipButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  saveDetailsButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveDetailsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});