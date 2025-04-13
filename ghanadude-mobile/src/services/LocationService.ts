import * as Location from 'expo-location';

export interface LocationDetails {
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

export const fetchAndPrefillLocation = async (): Promise<LocationDetails | null> => {
  try {
    console.log('📍 Requesting location permissions...');
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.warn('Permission to access location was denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    console.log('📍 Got location:', location);

    const [geo] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (geo) {
      console.log('🌍 Reverse geocoded:', geo);

      return {
        address: `${geo.streetNumber || geo.name || ''} ${geo.street || ''}`.trim(),
        city: geo.city || '',
        postal_code: geo.postalCode || '',
        country: geo.country || '',
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to get location:', error);
    return null;
  }
};
