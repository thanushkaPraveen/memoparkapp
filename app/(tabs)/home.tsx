// app/(tabs)/home.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router'; // Or '@react-navigation/native'
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  AppState,
  AppStateStatus,
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
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAPS_API_KEY_1 } from "../../constants/ appConstants";
import { COLORS } from '../../constants/colors';
import { useScaledSizes, useThemeColors } from '../../features/accessibility';
import { ParkingEvent, useParkingStore } from '../../features/parking/store';
import axiosClient from '../../lib/axios';

const GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY_1; 

export default function HomeScreen() {
  const { t } = useTranslation();
  const { text, icon } = useScaledSizes();

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

   const COLORS = useThemeColors();

  const MAX_LANDMARKS = 4;

   // --- New States & Refs for Screen Tracking ---
  const [isUserInHomeScreen, setIsInHomeScreen] = useState(false); // Tracks if this screen is focused
  const isUserInHomeScreenRef = useRef(isUserInHomeScreen); // Ref to track focus status in AppState listener
  const [navigationScreenTime, setNavigationScreenTime] = useState(0); // Total time screen is viewed during navigation (ms)
  const focusStartTimeRef = useRef<number | null>(null); // Timestamp when screen gained focus during navigation
  const [mapViewCount, setMapViewCount] = useState(0);

  // Get parking session from store
  const { activeParkingSession, isLoading, fetchActiveParkingSession } = useParkingStore();

   // Scaled sizes
  const scaledSizes = useMemo(() => ({
    // Icons
    mapIcon: icon(24),
    carMarker: icon(40),
    landmarkMarker: icon(36),
    landmarkInnerIcon: icon(20),
    walkIcon: icon(24),
    starIcon: icon(20),
    stopIcon: icon(20),
    cameraIcon: icon(40),
    trophyIcon: icon(60),
    photoPlaceholderIcon: icon(60),
    
    // Text
    timeText: text(18),
    timeSubText: text(12),
    saveButtonText: text(18),
    landmarkBannerText: text(14),
    doneButtonText: text(14),
    endSessionText: text(15),
    sheetTitle: text(24),
    label: text(14),
    inputText: text(14),
    toggleButtonText: text(13),
    buttonText: text(15),
    detailsLabel: text(18),
    detailsText: text(14),
    findCarText: text(16),
    scoreTitle: text(24),
    scoreMetricLabel: text(14),
    scoreMetricValue: text(16),
    scoreTotalLabel: text(14),
    scoreValue: text(56),
    scoreButtonText: text(16),
    landmarkNumber: text(14),
    
    // Spacing
    topButtonTop: Platform.OS === 'ios' ? 60 : 20,
    timeBannerTop: Platform.OS === 'ios' ? 120 : 80,
    buttonPadding: text(20),
    buttonPaddingVertical: text(12),
    modalPadding: text(24),
    sectionMargin: text(20),
    buttonHeight: text(56),
    inputHeight: text(44),
    iconButtonSize: icon(44),
    photoBoxSize: text(80),
    
    // Handle bar and modal elements
    handleBarWidth: text(40),
    handleBarHeight: text(5),
    handleBarMarginTop: text(12),
    handleBarMarginBottom: text(8),
    photoBoxBorderRadius: text(12),
    toggleButtonPaddingVertical: text(10),
    toggleButtonPaddingHorizontal: text(12),
    borderRadius: text(8),
    photoContainerHeight: text(200),
    photoContainerBorderRadius: text(16),
    photoContainerMargin: text(20),
    detailsButtonHeight: text(44),
    findCarButtonHeight: text(50),
    
  }), [text, icon]);

// --- Keep Ref updated with State ---
  useEffect(() => {
    isUserInHomeScreenRef.current = isUserInHomeScreen;
  }, [isUserInHomeScreen]);

  // --- Track Screen Focus/Blur ---
  useFocusEffect(
    React.useCallback(() => {
      // Screen came into focus
      setIsInHomeScreen(true);
      console.log('Home screen focused');

      if (isNavigating) {

        // --- Increment Map View Count ---
        setMapViewCount((prevCount) => {
          const newCount = prevCount + 1;
          console.log(`Map viewed during navigation. Count: ${newCount}`);
          return newCount;
        });
        
        focusStartTimeRef.current = Date.now();
        console.log('Navigation Focus Start:', new Date().toLocaleTimeString());
      }

      // Screen lost focus (cleanup function)
      return () => {
        setIsInHomeScreen(false);
        console.log('Home screen blurred');

        if (focusStartTimeRef.current !== null) {
          const duration = Date.now() - focusStartTimeRef.current;
          setNavigationScreenTime((prevTime) => {
            const newTotal = prevTime + duration;
            console.log(`Navigation Focus End. Duration added: ${duration}ms. Total: ${newTotal}ms`);
            return newTotal;
          });
          focusStartTimeRef.current = null; // Reset start time
        }
      };
    }, [isNavigating]) // Re-run effect setup if isNavigating changes while focused
  );

  // --- Track App Foreground/Background ---
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('AppState changed to:', nextAppState);
      // Use the ref here to get the current focus state
      if (nextAppState === 'active' && isUserInHomeScreenRef.current) {
        console.log('App resumed to foreground while Home screen is focused.');
        // If resuming during navigation, restart timer
        if (isNavigating && focusStartTimeRef.current === null) {

            setMapViewCount((prevCount) => {
              const newCount = prevCount + 1;
              console.log(`Map viewed during navigation Restarted. Count: ${newCount}`);
              return newCount;
            });
            
            focusStartTimeRef.current = Date.now();
            console.log('Navigation Focus Timer Restarted:', new Date().toLocaleTimeString());
        }
      } else if (nextAppState.match(/inactive|background/) && isUserInHomeScreenRef.current) {
        console.log('App went to background/inactive while Home screen was focused.');
        // If the app going to background during navigation, stop timer and add duration
        if (focusStartTimeRef.current !== null) {
          const duration = Date.now() - focusStartTimeRef.current;
          setNavigationScreenTime((prevTime) => {
             const newTotal = prevTime + duration;
             console.log(`App Backgrounded. Duration added: ${duration}ms. Total: ${newTotal}ms`);
             return newTotal;
          });
          focusStartTimeRef.current = null; // Pause timer
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isNavigating]); //  isNavigating here to correctly handle timer restart

  // --- Capture Final Screen Time if Navigation Ends While Focused ---
  useEffect(() => {
    if (!isNavigating && focusStartTimeRef.current !== null) {
      const duration = Date.now() - focusStartTimeRef.current;
      setNavigationScreenTime((prevTime) => {
        const newTotal = prevTime + duration;
        console.log(`Navigation Ended While Focused. Duration added: ${duration}ms. Final Total: ${newTotal}ms`);
        // later: might want to send the final 'newTotal' to  backend here
        return newTotal;
      });
      focusStartTimeRef.current = null;
    }
  }, [isNavigating]);

  // Track location updates during navigation
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      if (isNavigating && !isAddingLandmark) {
        try {

          // Ensure to have location permission before watching
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.error('Location permission not granted for tracking');
            return;
          }

          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000, // Update every 5 seconds
              distanceInterval: 10, // Update every 10 meters
            },
            async (newLocation) => {
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

                // Check landmarks achievement (within 20 meters of landmark)
                if (session.landmarks && session.landmarks.length > 0) {
                  for (const landmark of session.landmarks) {
                    if (!landmark.is_achieved && landmark.landmark_latitude && landmark.landmark_longitude) {
                      const distanceToLandmark = calculateDistance(
                        newLocation.coords.latitude,
                        newLocation.coords.longitude,
                        landmark.landmark_latitude,
                        landmark.landmark_longitude
                      );

                      // If within 20 meters of landmark, mark as achieved
                      if (distanceToLandmark < 20) {
                        console.log(`Achieved landmark: ${landmark.location_name}`);
                        await handleAchieveLandmark(session.parking_events_id, landmark.landmarks_id);
                      }
                    }
                  }
                }

                // If within 10 meters of car
                if (distance < 10 && session.status === 'retrieving') {
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
  }, [isNavigating, isAddingLandmark, activeParkingSession]);

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
        if (session.landmarks && session.landmarks.length === 0 && session.status == 'active') {
          console.log('No landmarks - show parking details');
          setShowParkingDetailsModal(true);
        } else {
          // Has landmarks - show navigation mode
          console.log('Has landmarks - show navigation with landmarks');
          // handleFindMyCar();
          setIsNavigating(true)
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

  const handleCompletedParking = async (status?: 'retrieving' | 'retrieved' | 'expired' | 'score_watched', estimatedTimeSeconds?: number) => {
  if (!activeParkingSession) {
    console.error("No active parking session to complete.");
    return;
  }

  try {
    const session = activeParkingSession as ParkingEvent;
    
    // Don't update if already in final state
    if (session.status === 'retrieved' || session.status === 'expired') {
      console.log('Session already completed');
      return;
    }

    const parkingData : any = {
      status: status || 'expired', // Default to expired if no status provided
    };

    // estimated_time only when status is 'retrieving' and time is available
    // Add estimated_time only when needed
    if (status === 'retrieving' && estimatedTimeSeconds && estimatedTimeSeconds > 0) {
      parkingData.estimated_time = estimatedTimeSeconds;
    }

    if (status === 'retrieved' || status === 'expired') {
      let finalScreenTime = navigationScreenTime;
      let finalMapViewCount = mapViewCount;
        // Check if screen was focused when session ended
        if (focusStartTimeRef.current !== null) {
            const finalDuration = Date.now() - focusStartTimeRef.current;
            finalScreenTime += finalDuration;
            focusStartTimeRef.current = null; // Clear ref
        }
        console.log(`Session Ended. Final Navigation Screen Time: ${finalScreenTime}ms`);
        console.log(`Session Ended. Final final Map View Count: ${finalMapViewCount}ms`);

        parkingData.finalScreenTime = finalScreenTime;
        parkingData.finalMapViewCount = finalMapViewCount;
    }

    const response = await axiosClient.put(`/parking/${session.parking_events_id}`, parkingData);
    const updatedEvent = response.data;

    console.log('Parking event updated:', updatedEvent);

    // Show appropriate alerts based on status
    if (status === 'retrieved') {
      // Alert.alert('Success', 'Parking session completed!');
    } else if (status === 'expired') {
      Alert.alert('Note', 'Parking session cleared!');
    } else if (status === 'retrieving') {
      console.log('Navigation started - status updated to retrieving');
    }

  } catch (error: any) {
    console.error('Error updating parking event:', error.response?.data || error.message);
    
    // Only show error for user-initiated actions (not retrieving status)
    if (status !== 'retrieving') {
      Alert.alert('Error', 'Failed to update parking session.');
    }
    throw error; // Re-throw for handleFindMyCar to catch
  } finally {
    await fetchActiveParkingSession();
  }
};


  const validateCoordinates = (lat: number, lon: number): boolean => {
    return (
      !isNaN(lat) && 
      !isNaN(lon) && 
      lat >= -90 && 
      lat <= 90 && 
      lon >= -180 && 
      lon <= 180
    );
  };

  const handleSaveParking = async () => {
    if (!selectedLocation || !address) return;

    // Validate coordinates before saving
    if (!validateCoordinates(selectedLocation.latitude, selectedLocation.longitude)) {
      Alert.alert('Error', 'Invalid location coordinates. Please try selecting again.');
      return;
    }

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


      console.log('Success Your parking location has been saved!')
      await fetchActiveParkingSession();

    } catch (error: any) {
      console.error('Error saving parking:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to save parking location.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFindMyCar = async () => {

    if (!location || !hasActiveSession()) {
      Alert.alert('Error', 'Unable to start navigation. Location not available.');
      return;
    }
    
    const session = activeParkingSession as ParkingEvent;
    
    // Log coordinates for debugging
    console.log('Navigation Start Debug:', {
      userLat: location.coords.latitude,
      userLon: location.coords.longitude,
      carLat: session.parking_latitude,
      carLon: session.parking_longitude,
    });
    
    // Validate coordinates
    if (!validateCoordinates(session.parking_latitude, session.parking_longitude)) {
      Alert.alert('Error', 'Invalid parking location coordinates.');
      return;
    }

    // Calculate estimated time before starting navigation
    const straightDistance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      session.parking_latitude,
      session.parking_longitude
    );

    // Calculate estimated time in seconds (average walking speed: 1.4 m/s)
    let estimatedTimeInSeconds = 0;
    if (straightDistance > 0 && straightDistance < 100000) { // Less than 100km
      estimatedTimeInSeconds = Math.ceil(straightDistance / 1.4); // Convert to seconds
      const estimatedMinutes = Math.ceil(estimatedTimeInSeconds / 60);
      setEstimatedTime(estimatedMinutes); // Still set minutes for display
      setWalkingDistance(straightDistance / 1000); // Convert to km
    }   

    setNavigationScreenTime(0); // Reset screen time for the new session
    focusStartTimeRef.current = null; // Ensure start time is reset
    setMapViewCount(0); // <-- Reset map view count

    setIsNavigating(true);
    setShowParkingDetailsModal(false);


    if (mapRef.current && location) {
      // Fit map to show route with padding
      mapRef.current.fitToCoordinates([
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        { latitude: session.parking_latitude, longitude: session.parking_longitude },
      ], {
        edgePadding: { top: 200, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }

  //  status to 'retrieving' when navigation starts
  try {
    await handleCompletedParking('retrieving', estimatedTimeInSeconds);
    
    // Different message based on estimated time
    const message = estimatedTimeInSeconds > 0
      ? `Follow the walking path to reach your car. The route shows the estimated walking time.`
      : 'Follow the walking path to reach your car.';
    
    Alert.alert('Navigation Started', message, [{ text: 'Got it' }]);
  } catch (error) {
    console.error('Failed to update retrieving status:', error);
    // Still start navigation even if status update fails
    Alert.alert(
      'Navigation Started',
      'Follow the walking path to reach your car.',
      [{ text: 'Got it' }]
    );
  }
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

  // Handle landmark achievement
  const handleAchieveLandmark = async (parkingEventId: number, landmarkId: number) => {
    try {
      console.log(`Marking landmark ${landmarkId} as achieved...`);
      
      const response = await axiosClient.patch(
        `/parking/${parkingEventId}/landmarks/${landmarkId}`,
        { is_achieved: true }
      );

      console.log('Landmark achieved:', response.data);

      // Refresh the session to update UI
      await fetchActiveParkingSession();

      // Optional: Show a brief success message
      // Alert.alert('Landmark Reached!', `You passed ${response.data.location_name || 'landmark'}!`);

    } catch (error: any) {
      console.error('Error achieving landmark:', error);
      console.error('Error response:', error.response?.data);
      // Don't show error alert to user - this is a background operation
    }
  };

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180; // Convert to radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = 
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * 
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    
    // Add validation to ensure reasonable distance
    if (isNaN(distance) || distance < 0 || distance > 20000000) {
      console.warn('Invalid distance calculated:', { lat1, lon1, lat2, lon2, distance });
      return 0;
    }
    
    return distance;
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
            await handleCompletedParking('expired');
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
    setShowScoreModal(false);
    handleCompletedParking('score_watched');
  };

  const handleEndNavigation = async (): Promise<void> => {
    Alert.alert(
      'End Navigation',
      'Are you sure you want to end this navigation session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsNavigating(false);
              await handleCompletedParking('expired');
            } catch (error) {
              console.error('Error ending navigation:', error);
              Alert.alert('Error', 'Failed to end navigation session.');
            }
          },
        },
      ],
    );
  };


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
          <Marker coordinate={selectedLocation} title={t('home.markers.parkingLocation')}>
            <Ionicons name="location" size={scaledSizes.carMarker} color={COLORS.primary} />
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
            <Ionicons name="car" size={scaledSizes.carMarker} color="#FF5252" />
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
              { backgroundColor: landmark.is_achieved ? '#4CAF50' : '#FFC107', 
                width: scaledSizes.landmarkMarker,
                height: scaledSizes.landmarkMarker,
                borderRadius: scaledSizes.landmarkMarker / 2
               }
            ]}>
              <Ionicons
                name={landmark.is_achieved ? 'checkmark' : 'star'}
                size={scaledSizes.landmarkInnerIcon}
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
  <>
    {/* First try with WALKING mode */}
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
        console.log('Directions API error, using fallback:', errorMessage);
        
        // Use fallback calculation with corrected distance function
        if (location && session) {
          const straightDistance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            session.parking_latitude,
            session.parking_longitude
          );
          
          // Only use fallback if distance is reasonable (< 100km)
          if (straightDistance > 0 && straightDistance < 100000) {
            // Average walking speed: 1.4 m/s or 5 km/h
            const estimatedMinutes = Math.ceil(straightDistance / 1.4 / 60);
            setEstimatedTime(estimatedMinutes);
            setWalkingDistance(straightDistance / 1000); // Convert to km
            
            console.log(`Fallback - Distance: ${(straightDistance/1000).toFixed(2)}km, Time: ${estimatedMinutes} min`);
          } else {
            console.error('Invalid coordinates or unreasonable distance');
            setEstimatedTime(null);
            setWalkingDistance(null);
          }
        }
      }}
      // Add these props to help with iOS compatibility
      resetOnChange={false}
      optimizeWaypoints={false}
      splitWaypoints={false}
      timePrecision="now"
      precision="high"
    />
    
    {/* Fallback: Draw a straight line if no route is available */}
    {!estimatedTime && (
      <Polyline
        coordinates={[
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          {
            latitude: session.parking_latitude,
            longitude: session.parking_longitude,
          },
        ]}
        strokeColor={COLORS.primary}
        strokeWidth={3}
        lineDashPattern={[10, 10]} // Dashed line to indicate it's not a real route
      />
    )}
  </>
)}
      </MapView>

      {/* Top right buttons */}
      <View style={styles.topRightButtons}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => Alert.alert('Map Type', 'Map type selector coming soon!')}
        >
          <Ionicons name="layers-outline" size={scaledSizes.mapIcon} color={COLORS.dark} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={centerOnUserLocation}>
          <Ionicons name="navigate-outline" size={scaledSizes.mapIcon} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {/* Bottom recenter button */}
      <View style={styles.bottomRightButton}>
        <TouchableOpacity style={styles.iconButton} onPress={centerOnUserLocation}>
          <Ionicons name="locate" size={scaledSizes.mapIcon} color={COLORS.dark} />
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
          <TouchableOpacity 
            style={[styles.saveButton, { height: scaledSizes.buttonHeight, backgroundColor: COLORS.primary }]} 
            onPress={handleSaveLocationPress}
          >
            <Text style={[styles.saveButtonText, { fontSize: scaledSizes.saveButtonText }]}>
              {t('home.save.button')}
            </Text>
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

      {/* End Session Button during navigation */}
      {isNavigating && !isAddingLandmark && (
        <View style={styles.endSessionButtonContainer}>
          <TouchableOpacity 
            style={styles.endSessionButton} 
            onPress={handleEndNavigation}
          >
            <Ionicons name="stop-circle" size={20} color={COLORS.white} />
            <Text style={styles.endSessionButtonText}>End Session</Text>
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
              <Text style={styles.sheetTitle}>{t('home.save.optionalDetails')}</Text>

              <View style={styles.section}>
                <Text style={styles.label}>{t('home.save.photo')}</Text>
                <TouchableOpacity style={styles.photoBox} onPress={() => pickImage(false)}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                  ) : (
                    <Ionicons name="camera-outline" size={40} color={COLORS.gray} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>{t('home.save.whereIsCar')}</Text>
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
                      {t('home.save.roadside')}
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
                      {t('home.save.insideBuilding')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {whereIsTheCar === 'outside' ? (
                <View style={styles.section}>
                  <Text style={styles.label}>{t('home.save.streetLevel')}</Text>
                  <TextInput
                    style={styles.input}
                    value={parkingSlot}
                    onChangeText={setParkingSlot}
                    placeholder={t('home.save.streetLevelPlaceholder')}
                    placeholderTextColor={COLORS.placeholderText}
                  />
                </View>
              ) : (
                <View style={styles.levelsRow}>
                  <View style={styles.levelInput}>
                    <Text style={styles.label}>{t('home.save.levelFloor')}</Text>
                    <TextInput
                      style={styles.input}
                      value={insideLevel}
                      onChangeText={setInsideLevel}
                      placeholder={t('home.save.levelPlaceholder')}
                      placeholderTextColor={COLORS.placeholderText}
                    />
                  </View>
                  <View style={styles.levelInput}>
                    <Text style={styles.label}>{t('home.save.parkingSlot')}</Text>
                    <TextInput
                      style={styles.input}
                      value={parkingSlot}
                      onChangeText={setParkingSlot}
                      placeholder={t('home.save.slotPlaceholder')}
                      placeholderTextColor={COLORS.placeholderText}
                    />
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.label}>{t('home.save.note')}</Text>
                <TextInput
                  style={[styles.input, styles.noteInput]}
                  value={note}
                  onChangeText={setNote}
                  placeholder={t('home.save.notePlaceholder')}
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
                  <Text style={styles.skipButtonText}>{t('home.save.skip')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveDetailsButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSaveParking}
                  disabled={isSaving}
                >
                  <Text style={styles.saveDetailsButtonText}>
                    {isSaving ? t('home.save.saving') : t('home.save.saveDetails')}
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
                    <Text style={styles.detailsButtonText}>{t('home.details.update')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={handleClearParking}
                  >
                    <Text style={styles.detailsButtonText}>{t('home.details.clear')}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.findCarButton} onPress={handleFindMyCar}>
                  <Text style={styles.findCarButtonText}>{t('home.details.findMyCar')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.findCarButton, styles.addLandmarkButton]}
                  onPress={handleAddLandmark}
                >
                  <Text style={styles.findCarButtonText}>{t('home.details.addLandmark')}</Text>
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
          <Text style={styles.scoreTitle}>Session Complete!</Text>
          
          {/* Score Metrics */}
          <View style={styles.scoreMetricsContainer}>
            <View style={styles.scoreMetricRow}>
              <Text style={styles.scoreMetricLabel}>Time Factor:</Text>
              <Text style={styles.scoreMetricValue}>
                {Math.round(session.score.time_factor)}%
              </Text>
            </View>
            
            <View style={styles.scoreMetricRow}>
              <Text style={styles.scoreMetricLabel}>Landmark Factor:</Text>
              <Text style={styles.scoreMetricValue}>
                {Math.round(session.score.landmark_factor)}%
              </Text>
            </View>
            
            <View style={styles.scoreMetricRow}>
              <Text style={styles.scoreMetricLabel}>Landmarks:</Text>
              <Text style={styles.scoreMetricValue}>
                {session.score.landmarks_recalled}/{session.score.no_of_landmarks}
              </Text>
            </View>
            
            {session.score.assistance_points !== undefined && (
              <View style={styles.scoreMetricRow}>
                <Text style={styles.scoreMetricLabel}>Map Views:</Text>
                <Text style={styles.scorePenaltyValue}>
                  {session.score.assistance_points}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.scoreDivider} />
          
          {/* Total Score */}
          <Text style={styles.scoreTotalLabel}>Total Score</Text>
          <Text style={styles.scoreValue}>{Math.round(session.score.task_score)}</Text>
          
          <TouchableOpacity
            style={styles.scoreCloseButton}
            onPress={taponScoreBtnClose}
          >
            <Text style={styles.scoreCloseButtonText}>Done</Text>
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
    // width: 36,
    // height: 36,
    // borderRadius: 18,
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
    padding: 28,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 12,
    marginBottom: 20,
  },
  scoreMetricsContainer: {
    width: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  scoreMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreMetricLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  scoreMetricValue: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '600',
  },
  scorePenaltyValue: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  scoreDivider: {
    width: '80%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  scoreTotalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 24,
  },
  scoreCloseButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
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
  endSessionButtonContainer: {
  position: 'absolute',
  bottom: 30,
  alignSelf: 'center',
  zIndex: 10,
},
  endSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5252',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  endSessionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});