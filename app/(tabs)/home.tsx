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
  const [whereIsTheCar, setWhereIsTheCar] = useState<'roadside' | 'inside'>('roadside');
  const [roadsideLevel, setRoadsideLevel] = useState('');
  const [insideLevel, setInsideLevel] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  // Open bottom sheet
  const handleSaveLocationPress = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }
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
    if (!selectedLocation) return;

    setIsSaving(true);

    try {
      const parkingData = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
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

      // Reset form
      setPhoto(null);
      setRoadsideLevel('');
      setInsideLevel('');
      setNote('');
      setShowBottomSheet(false);

      Alert.alert('Success', 'Your parking location has been saved!');
    } catch (error) {
      console.error('Error saving parking:', error);
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

  return (
    <View style={styles.container}>
      {/* Map View */}
      {location && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          mapType="satellite" 
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={true}
        >
          {/* Selected location marker */}
          {selectedLocation && (
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
      )}

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

              {/* Level/Floor */}
              <View style={styles.levelsRow}>
                <View style={styles.levelInput}>
                  <Text style={styles.label}>Level / Floor</Text>
                  <TextInput
                    style={styles.input}
                    value={roadsideLevel}
                    onChangeText={setRoadsideLevel}
                    placeholder="e.g., Ground"
                    placeholderTextColor={COLORS.placeholderText}
                  />
                </View>
                <View style={styles.levelInput}>
                  <Text style={styles.label}>Level / Floor</Text>
                  <TextInput
                    style={styles.input}
                    value={insideLevel}
                    onChangeText={setInsideLevel}
                    placeholder="e.g., Level 2"
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
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightButtons: {
    position: 'absolute',
    top: 20,
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
  miniMapContainer: {
    height: 150,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  miniMap: {
    flex: 1,
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