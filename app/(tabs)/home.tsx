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
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAPS_API_KEY_1 } from "../../constants/ appConstants";
import { COLORS } from '../../constants/colors';
import { ParkingEvent, useParkingStore } from '../../features/parking/store';
import axiosClient from '../../lib/axios';

const GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY_1; 

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  // Modals
  const [showSaveBottomSheet, setShowSaveBottomSheet] = useState(false);
  const [showParkingDetailsModal, setShowParkingDetailsModal] = useState(false);
  const [showAddLandmarkModal, setShowAddLandmarkModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Save parking form states
  const [photo, setPhoto] = useState<string | null>(null);
  const [whereIsTheCar, setWhereIsTheCar] = useState<'outside' | 'inside'>('outside');
  const [insideLevel, setInsideLevel] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [address, setAddress] = useState<{ name: string; street: string } | null>(null);
  const [parkingSlot, setParkingSlot] = useState('');

  // Navigation & Landmarks
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAddingLandmark, setIsAddingLandmark] = useState(false);
  const [selectedLandmarkLocation, setSelectedLandmarkLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [landmarkPhoto, setLandmarkPhoto] = useState<string | null>(null);
  const [landmarkName, setLandmarkName] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [walkingDistance, setWalkingDistance] = useState<number | null>(null);
  const [tempLandmarks, setTempLandmarks] = useState<Array<{
    latitude: number;
    longitude: number;
    location_name: string;
    distance_from_parking: number;
  }>>([]);

  const MAX_LANDMARKS = 4;

  // Get parking session from store
  const { activeParkingSession, isLoading, fetchActiveParkingSession } = useParkingStore();

  // Track location updates during navigation
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      if (isNavigating && !isAddingLandmark) {
        try {
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000, // Update every 5 seconds
              distanceInterval: 10, // Update every 10 meters
            },
            (newLocation) => {
              setLocation(newLocation);
              
              // Check if user reached the car
              if (hasActiveSession()) {
                const session = activeParkingSession as ParkingEvent;
                const distance = calculateDistance(
                  newLocation.coords.latitude,
                  newLocation.coords.longitude,
                  session.parking_latitude,
                  session.parking_longitude
                );

                // If within 10 meters of car
                if (distance < 10) {
                  Alert.alert(
                    'Arrived!',
                    'You have reached your car!',
                    [
                      {
                        text: 'End Session',
                        onPress: () => handleCompletedParking('retrieved'),
                      },
                    ]
                  );
                  locationSubscription?.remove();
                }
              }
            }
          );
        } catch (error) {
          console.error('Error tracking location:', error);
        }
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isNavigating, isAddingLandmark]);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required.');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setSelectedLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        // Center map on current location
        centerOnUserLocation();
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get your location.');
      }
    })();
  }, []);

  // Handle active parking session states
  useEffect(() => {
    if (isLoading) {
      console.log('Fetching active parking session...');
      return;
    }

    if (activeParkingSession) {
      // Empty object - no active session
      if (Object.keys(activeParkingSession).length === 0) {
        console.log('No active session - show map to save location');
        setShowParkingDetailsModal(false);
        setIsNavigating(false);
      } else {
        const session = activeParkingSession as ParkingEvent;
        console.log('Active session:', session);

        // Has score - show score modal
        if (session.score !== null) {
          console.log('Session has score - show score modal');
          setShowScoreModal(true);
          return;
        }

        // No landmarks yet - show parking details
        if (session.landmarks && session.landmarks.length === 0) {
          console.log('No landmarks - show parking details');
          setShowParkingDetailsModal(true);
        } else {
          // Has landmarks - show navigation mode
          console.log('Has landmarks - show navigation with landmarks');
          handleFindMyCar();
        }
      }
    }
  }, [activeParkingSession, isLoading]);

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

  const handleMapPress = (event: any) => {
    if (isAddingLandmark && hasActiveSession()) {
      // Adding landmark mode - save immediately
      const coordinate = event.nativeEvent.coordinate;
      setSelectedLandmarkLocation(coordinate);
      
      // Save landmark after a brief moment to show the marker
      setTimeout(() => {
        handleSaveLandmark();
      }, 100);
    } else if (!hasActiveSession() && !isNavigating) {
      // Normal mode - select parking location
      const coordinate = event.nativeEvent.coordinate;
      setSelectedLocation(coordinate);
    }
  };

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocoded.length > 0) {
        const { name, street } = geocoded[0];
        return { name: name || '', street: street || '' };
      }
    } catch (error) {
      console.error('Failed to get address:', error);
    }
    return { name: 'Unknown Location', street: '' };
  };


  const handleSaveLocationPress = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }
    try {
      const addr = await getAddressFromCoords(selectedLocation.latitude, selectedLocation.longitude);
      setAddress(addr);
      setShowSaveBottomSheet(true);
    } catch (error) {
      console.error('Error getting address:', error);
      setShowSaveBottomSheet(true); 
    }
  };


  const pickImage = async (isLandmark: boolean = false) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required.');
      return;
    }

    Alert.alert('Add Photo', 'Choose an option', [
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
            if (isLandmark) {
              setLandmarkPhoto(result.assets[0].uri);
            } else {
              setPhoto(result.assets[0].uri);
            }
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
            if (isLandmark) {
              setLandmarkPhoto(result.assets[0].uri);
            } else {
              setPhoto(result.assets[0].uri);
            }
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  

  const handleCompletedParking = async (status?: 'retrieved' | 'expired') => {
    
    if (!activeParkingSession) {
      console.error("No active parking session to complete.");
      return;
    }

    try {
      const session = activeParkingSession as ParkingEvent;

      const parkingData = {
        status: status == 'retrieved' ? 'retrieved' : 'expired' ,
      };

      // Corrected URL: Use backticks and the event's ID
      const response = await axiosClient.put(`/parking/${session.parking_events_id}`, parkingData);
      const updatedEvent = response.data;

      // You can add logic here to handle the successful update
      console.log('Parking event updated:', updatedEvent);

      if (status == 'retrieved') {
        Alert.alert('Success', 'Parking session completed!');
      }
      else {
        Alert.alert('Note', 'Parking session cleared!');
      }

    } catch (error: any) {
      console.error('Error updating parking event:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update parking session.');
    } finally {
      // You may want to reset saving state or clear the active session here
      // setIsSaving(false); 
      await fetchActiveParkingSession();
    }
  };

  const handleSaveParking = async () => {
    if (!selectedLocation || !address) return;

    setIsSaving(true);

    try {
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

      const response = await axiosClient.post('/parking', parkingData);
      const savedEvent = response.data;
      const parkingEventId = savedEvent.parking_events_id;

      if (photo) {
        const formData = new FormData();
        const filename = photo.split('/').pop() || 'photo.jpg';
        const fileType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

        formData.append('photo', {
          uri: photo,
          name: filename,
          type: fileType,
        } as any);

        await axiosClient.post(`/parking/${parkingEventId}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Reset form
      setPhoto(null);
      setInsideLevel('');
      setParkingSlot('');
      setNote('');
      setShowSaveBottomSheet(false);

      Alert.alert('Success', 'Your parking location has been saved!');
      await fetchActiveParkingSession();

    } catch (error: any) {
      console.error('Error saving parking:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to save parking location.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFindMyCar = () => {
    setIsNavigating(true);
    setShowParkingDetailsModal(false);
    setEstimatedTime(null); // Reset time
    
    if (mapRef.current && location && hasActiveSession()) {
      const session = activeParkingSession as ParkingEvent;
      
      // Fit map to show route with padding
      mapRef.current.fitToCoordinates([
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        { latitude: session.parking_latitude, longitude: session.parking_longitude },
      ], {
        edgePadding: { top: 200, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }

    Alert.alert(
      'Navigation Started',
      'Follow the walking path to reach your car. The route shows the estimated walking time.',
      [{ text: 'Got it' }]
    );
  };

  const handleAddLandmark = () => {
    setIsAddingLandmark(true);
    setIsNavigating(true);
    setTempLandmarks([]); // Reset temp landmarks
    setShowParkingDetailsModal(false);
    
    if (mapRef.current && location && hasActiveSession()) {
      const session = activeParkingSession as ParkingEvent;
      mapRef.current.fitToCoordinates([
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        { latitude: session.parking_latitude, longitude: session.parking_longitude },
      ], {
        edgePadding: { top: 150, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
    
    Alert.alert(
      'Add Landmarks',
      `Mark up to ${MAX_LANDMARKS} landmarks along your route to help you remember the way to your car.`,
      [{ text: 'Got it' }]
    );
  };

  const handleSaveLandmark = () => {
    if (!selectedLandmarkLocation || !hasActiveSession()) {
      return;
    }

    // Check if max landmarks reached
    if (tempLandmarks.length >= MAX_LANDMARKS) {
      Alert.alert('Limit Reached', `You can only add up to ${MAX_LANDMARKS} landmarks.`);
      setSelectedLandmarkLocation(null);
      return;
    }

    try {
      const session = activeParkingSession as ParkingEvent;
      
      const distance = calculateDistance(
        selectedLandmarkLocation.latitude,
        selectedLandmarkLocation.longitude,
        session.parking_latitude,
        session.parking_longitude
      );

      const newLandmark = {
        latitude: selectedLandmarkLocation.latitude,
        longitude: selectedLandmarkLocation.longitude,
        location_name: `Landmark ${tempLandmarks.length + 1}`,
        distance_from_parking: Math.round(distance),
      };

      setTempLandmarks([...tempLandmarks, newLandmark]);
      setSelectedLandmarkLocation(null);

    } catch (error) {
      console.error('Error adding landmark:', error);
    }
  };

  const handleSaveAllLandmarks = async () => {
    if (tempLandmarks.length === 0) {
      Alert.alert('No Landmarks', 'Please add at least one landmark before saving.');
      return;
    }

    if (!hasActiveSession()) return;

    // Prevent double-calling
    if (isSaving) {
      console.log('Already saving landmarks, please wait...');
      return;
    }

    setIsSaving(true);

    try {
      const session = activeParkingSession as ParkingEvent;
      
      const landmarksData = {
        landmarks: tempLandmarks.map(landmark => ({
          location_name: landmark.location_name,
          landmark_latitude: landmark.latitude,
          landmark_longitude: landmark.longitude,
          distance_from_parking: landmark.distance_from_parking,
        })),
      };

      console.log('Saving all landmarks:', landmarksData);

      await axiosClient.post(
        `/parking/${session.parking_events_id}/landmarks`,
        landmarksData
      );

      // Clearing the temp landmarks immediately after successful save
      setTempLandmarks([]);
      setIsAddingLandmark(false);
      setIsNavigating(false);

      Alert.alert(
        'Success',
        `${landmarksData.landmarks.length} landmark${landmarksData.landmarks.length > 1 ? 's' : ''} saved successfully!`,
        [
          {
            text: 'OK',
            onPress: async () => {
              await fetchActiveParkingSession();
              setShowParkingDetailsModal(true);
            },
          },
        ]
      );

    } catch (error: any) {
      console.error('Error saving landmarks:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save landmarks.');
    }
    finally {
      setIsSaving(false);
    }
  };

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleUpdateParking = () => {
    // TODO: Implement update logic
    Alert.alert('Update', 'Update parking details feature coming soon!');
  };

  const handleClearParking = async () => {
    Alert.alert(
      'Clear Parking',
      'Are you sure you want to end this parking session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              if (hasActiveSession()) {
                // const session = activeParkingSession as ParkingEvent;
                // await axiosClient.put(`/parking/${session.parking_events_id}/end`);
                // await fetchActiveParkingSession();
                // Alert.alert('Success', 'Parking session ended.');
                handleCompletedParking('expired');
              }
            } catch (error) {
              console.error('Error ending session:', error);
              Alert.alert('Error', 'Failed to end parking session.');
            }
          },
        },
      ]
    );
  };

  const hasActiveSession = () => {
    return activeParkingSession && Object.keys(activeParkingSession).length > 0;
  };

  const getActiveSession = (): ParkingEvent | null => {
    if (hasActiveSession()) {
      return activeParkingSession as ParkingEvent;
    }
    return null;
  };

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

  const taponScoreBtnClose = () => {
    setShowScoreModal(false)
    // console.log('No active session - show map to save location');
    // setShowParkingDetailsModal(false);
    // setIsNavigating(false);
    handleCompletedParking('retrieved');
  }

  const session = getActiveSession();

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType="satellite" 
        style={styles.map}
        initialRegion={getSafeRegion()}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={true}
      >
        {/* Selected parking location marker (when saving new) */}
        {!hasActiveSession() && selectedLocation && (
          <Marker coordinate={selectedLocation} title="Parking Location">
            <Ionicons name="location" size={40} color={COLORS.primary} />
          </Marker>
        )}

        {/* Active parking session marker */}
        {session && (
          <Marker
            coordinate={{
              latitude: session.parking_latitude,
              longitude: session.parking_longitude,
            }}
            title="Your Parked Car"
          >
            <Ionicons name="car" size={40} color="#FF5252" />
          </Marker>
        )}

        {/* Landmarks */}
        {session?.landmarks.map((landmark) => (
          <Marker
            key={landmark.landmarks_id}
            coordinate={{
              latitude: landmark.landmark_latitude!,
              longitude: landmark.landmark_longitude!,
            }}
            title={landmark.location_name}
            pinColor={landmark.is_achieved ? '#4CAF50' : '#FFC107'}
          >
            <View style={[
              styles.landmarkMarker,
              { backgroundColor: landmark.is_achieved ? '#4CAF50' : '#FFC107' }
            ]}>
              <Ionicons
                name={landmark.is_achieved ? 'checkmark' : 'star'}
                size={20}
                color="white"
              />
            </View>
          </Marker>
        ))}

        {/* Temporary landmarks (being added) */}
        {tempLandmarks.map((landmark, index) => (
          <Marker
            key={`temp-${index}`}
            coordinate={{
              latitude: landmark.latitude,
              longitude: landmark.longitude,
            }}
            title={landmark.location_name}
          >
            <View style={styles.tempLandmarkMarker}>
              <Text style={styles.landmarkNumber}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        {/* Navigation route - Walking mode */}
        {isNavigating && location && session && (
          <MapViewDirections
            origin={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            destination={{
              latitude: session.parking_latitude,
              longitude: session.parking_longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={5}
            strokeColor={COLORS.primary}
            mode="WALKING"
            onReady={(result) => {
              setEstimatedTime(Math.ceil(result.duration));
              setWalkingDistance(result.distance);
              console.log(`Walking distance: ${result.distance.toFixed(2)} km`);
              console.log(`Walking time: ${Math.ceil(result.duration)} minutes`);
            }}
            onError={(errorMessage) => {
              console.error('Directions error:', errorMessage);
            }}
          />
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

        <TouchableOpacity style={styles.iconButton} onPress={centerOnUserLocation}>
          <Ionicons name="navigate-outline" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {/* Bottom recenter button */}
      <View style={styles.bottomRightButton}>
        <TouchableOpacity style={styles.iconButton} onPress={centerOnUserLocation}>
          <Ionicons name="locate" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {/* Estimated walking time banner */}
      {isNavigating && estimatedTime && !isAddingLandmark && (
        <View style={styles.timeBanner}>
          <Ionicons name="walk" size={24} color={COLORS.white} />
          <View style={styles.timeTextContainer}>
            <Text style={styles.timeText}>{estimatedTime} min walk</Text>
            <Text style={styles.timeSubText}>
              {walkingDistance ? `${(walkingDistance * 1000).toFixed(0)}m to your car` : 'to your car'}
            </Text>
          </View>
        </View>
      )}

      {/* Save button (no active session) */}
      {!hasActiveSession() && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveLocationPress}>
            <Text style={styles.saveButtonText}>Save my car here</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Landmark adding banner */}
      {isAddingLandmark && (
        <View style={styles.landmarkBanner}>
          <View style={styles.landmarkBannerContent}>
            <Ionicons name="star" size={20} color={COLORS.white} />
            <Text style={styles.landmarkBannerText}>
              Add landmarks ({tempLandmarks.length}/{MAX_LANDMARKS})
            </Text>
          </View>
          <TouchableOpacity
            style={styles.doneLandmarkButton}
            onPress={handleSaveAllLandmarks}
            disabled={tempLandmarks.length === 0}
          >
            <Text style={styles.doneLandmarkButtonText}>
              {tempLandmarks.length === 0 ? 'Add Some' : 'Save All'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Save Parking Bottom Sheet Modal */}
      <Modal
        visible={showSaveBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveBottomSheet(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSaveBottomSheet(false)}
          />
          
          <View style={styles.bottomSheet}>
            <View style={styles.handleBar} />

            <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>Optional Details</Text>

              <View style={styles.section}>
                <Text style={styles.label}>Photo</Text>
                <TouchableOpacity style={styles.photoBox} onPress={() => pickImage(false)}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                  ) : (
                    <Ionicons name="camera-outline" size={40} color={COLORS.gray} />
                  )}
                </TouchableOpacity>
              </View>

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

              {whereIsTheCar === 'outside' ? (
                <View style={styles.section}>
                  <Text style={styles.label}>Street Level / Area</Text>
                  <TextInput
                    style={styles.input}
                    value={parkingSlot}
                    onChangeText={setParkingSlot}
                    placeholder="e.g., Near the red mailbox"
                    placeholderTextColor={COLORS.placeholderText}
                  />
                </View>
              ) : (
                <View style={styles.levelsRow}>
                  <View style={styles.levelInput}>
                    <Text style={styles.label}>Level / Floor</Text>
                    <TextInput
                      style={styles.input}
                      value={insideLevel}
                      onChangeText={setInsideLevel}
                      placeholder="e.g., 1"
                      placeholderTextColor={COLORS.placeholderText}
                    />
                  </View>
                  <View style={styles.levelInput}>
                    <Text style={styles.label}>Parking Slot</Text>
                    <TextInput
                      style={styles.input}
                      value={parkingSlot}
                      onChangeText={setParkingSlot}
                      placeholder="e.g., D-42"
                      placeholderTextColor={COLORS.placeholderText}
                    />
                  </View>
                </View>
              )}

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

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSaveParking}
                  disabled={isSaving}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveDetailsButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSaveParking}
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

      {/* Parking Details Modal */}
      <Modal
        visible={showParkingDetailsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowParkingDetailsModal(false)}
      >
        <View style={styles.detailsModalContainer}>
          <View style={styles.detailsModalContent}>
            {session && (
              <>
                {/* Photo */}
                <View style={styles.detailsPhotoContainer}>
                  {session.photo_url ? (
                    <Image
                      source={{ uri: session.photo_url }}
                      style={styles.detailsPhoto}
                    />
                  ) : (
                    <View style={styles.detailsPhotoPlaceholder}>
                      <Ionicons name="image-outline" size={60} color={COLORS.gray} />
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.detailsInfo}>
                  <Text style={styles.detailsLabel}>
                    {session.parking_type === 'inside_building' ? 'Inside building' : 'Roadside'}
                  </Text>
                  <Text style={styles.detailsText}>
                    <Text style={styles.detailsBold}>Level/Floor:</Text> {session.level_floor || 'N/A'}
                  </Text>
                  {session.notes && (
                    <Text style={styles.detailsText}>
                      <Text style={styles.detailsBold}>Note:</Text> {session.notes}
                    </Text>
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.detailsButtons}>
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={handleUpdateParking}
                  >
                    <Text style={styles.detailsButtonText}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={handleClearParking}
                  >
                    <Text style={styles.detailsButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.findCarButton} onPress={handleFindMyCar}>
                  <Text style={styles.findCarButtonText}>Find my car</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.findCarButton, styles.addLandmarkButton]}
                  onPress={handleAddLandmark}
                >
                  <Text style={styles.findCarButtonText}>Add Landmark</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Landmark Modal */}
      {/* Removed - No longer needed */}

      {/* Score Modal */}
      <Modal
        visible={showScoreModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowScoreModal(false)}
      >
        <View style={styles.scoreModalContainer}>
          <View style={styles.scoreModalContent}>
            {session?.score && (
              <>
                <Ionicons name="trophy" size={60} color="#FFD700" />
                <Text style={styles.scoreTitle}>Your Score</Text>
                <Text style={styles.scoreValue}>{session.score.task_score}</Text>
                
                <View style={styles.scoreDetails}>
                  <Text style={styles.scoreDetailText}>
                    Time Factor: {session.score.time_factor}
                  </Text>
                  <Text style={styles.scoreDetailText}>
                    Landmarks: {session.score.landmarks_recalled}/{session.score.no_of_landmarks}
                  </Text>
                  <Text style={styles.scoreDetailText}>
                    Path Performance: {session.score.path_performance}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.scoreCloseButton}
                  onPress={taponScoreBtnClose}
                >
                  <Text style={styles.scoreCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
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
    minHeight: 200,
  },
  topRightButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
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
  timeBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 80,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
    minWidth: 180,
  },
  timeTextContainer: {
    flexDirection: 'column',
  },
  timeText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  timeSubText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.9,
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
  landmarkMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  addingLandmarkMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  tempLandmarkMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  landmarkNumber: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  landmarkBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 80,
    left: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  landmarkBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  landmarkBannerText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  doneLandmarkButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneLandmarkButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
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
  // Parking Details Modal
  detailsModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  detailsPhotoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: COLORS.lightGray,
  },
  detailsPhoto: {
    width: '100%',
    height: '100%',
  },
  detailsPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsInfo: {
    marginBottom: 20,
  },
  detailsLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 4,
  },
  detailsBold: {
    fontWeight: '600',
  },
  detailsButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailsButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  findCarButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addLandmarkButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 0,
  },
  findCarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Landmark Modal
  landmarkModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  landmarkModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  // Score Modal
  scoreModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scoreModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 24,
  },
  scoreDetails: {
    width: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  scoreDetailText: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 8,
    fontWeight: '500',
  },
  scoreCloseButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});