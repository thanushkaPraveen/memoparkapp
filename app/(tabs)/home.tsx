// app/(tabs)/home.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS } from '../../constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);

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

  // Navigate to save details screen
  const handleSaveLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }

    // Navigate to save details screen with location data
    router.push({
      pathname: '/save-parking-details',
      params: {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      },
    });
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
          onPress={handleMapPress}
          onMapReady={() => setMapReady(true)}
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
        {/* Layers/Satellite button */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            // Toggle map type in future implementation
            Alert.alert('Map Type', 'Map type selector coming soon!');
          }}
        >
          <Ionicons name="layers-outline" size={24} color={COLORS.dark} />
        </TouchableOpacity>

        {/* Compass/North button */}
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
          onPress={handleSaveLocation}
        >
          <Text style={styles.saveButtonText}>Save my car here</Text>
        </TouchableOpacity>
      </View>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});