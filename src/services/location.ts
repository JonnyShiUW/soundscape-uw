import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '../constants';

export interface LocationResult {
  phrase: string;
  intersection?: {
    primary: string;
    cross: string;
  };
  street?: string;
}

interface GoogleGeocodingResult {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    types: string[];
  }>;
  status: string;
}

/**
 * Request location permissions
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Get current location (foreground only)
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1000,
    });

    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Extract street name from address components
 */
function extractStreetName(addressComponents: Array<{
  long_name: string;
  short_name: string;
  types: string[];
}>): string | undefined {
  const routeComponent = addressComponents.find((component) =>
    component.types.includes('route')
  );
  return routeComponent?.long_name;
}

/**
 * Parse intersection from Google Geocoding API result
 */
function parseIntersection(result: GoogleGeocodingResult['results'][0]): LocationResult['intersection'] | undefined {
  // Check if this is an intersection type
  if (!result.types.includes('intersection')) {
    return undefined;
  }

  const routeComponents = result.address_components.filter((component) =>
    component.types.includes('route')
  );

  if (routeComponents.length >= 2) {
    return {
      primary: routeComponents[0].long_name,
      cross: routeComponents[1].long_name,
    };
  }

  return undefined;
}

/**
 * Reverse geocode coordinates to get intersection or street address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<LocationResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return { phrase: 'Location unknown.' };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=intersection|street_address&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data: GoogleGeocodingResult = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn('Geocoding failed:', data.status);
      return { phrase: 'Location unknown.' };
    }

    // Try to find an intersection first
    for (const result of data.results) {
      const intersection = parseIntersection(result);
      if (intersection) {
        return {
          phrase: `At ${intersection.primary} and ${intersection.cross}.`,
          intersection,
        };
      }
    }

    // If no intersection, try to get street name
    for (const result of data.results) {
      const streetName = extractStreetName(result.address_components);
      if (streetName) {
        return {
          phrase: `You are on ${streetName}.`,
          street: streetName,
        };
      }
    }

    // Fallback to unknown
    return { phrase: 'Location unknown.' };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return { phrase: 'Location unknown.' };
  }
}

/**
 * One-shot location announcement: get location, reverse geocode, and return phrase
 */
export async function getWhereAmI(): Promise<LocationResult> {
  console.log('📍 [LOCATION] Getting current location...');

  const location = await getCurrentLocation();
  if (!location) {
    console.warn('📍 [LOCATION] Failed to get current location');
    return { phrase: 'Location unknown.' };
  }

  console.log('📍 [LOCATION] Got location:', location.coords.latitude, location.coords.longitude);

  const result = await reverseGeocode(location.coords.latitude, location.coords.longitude);
  console.log('📍 [LOCATION] Reverse geocode result:', result);

  return result;
}
