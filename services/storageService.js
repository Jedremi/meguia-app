import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIPS_KEY = '@meguia_savedTrips';
const FAVORITES_KEY = '@meguia_favorites';

// Operações com viagens
export const saveTrip = async (tripData) => {
  try {
    const savedTrips = await getSavedTrips();
    const newTrips = [...savedTrips, tripData];
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(newTrips));
    return true;
  } catch (error) {
    console.error('Error saving trip:', error);
    return false;
  }
};

export const getSavedTrips = async () => {
  try {
    const trips = await AsyncStorage.getItem(TRIPS_KEY);
    return trips ? JSON.parse(trips) : [];
  } catch (error) {
    console.error('Error getting trips:', error);
    return [];
  }
};

export const removeTrip = async (tripId) => {
  try {
    const savedTrips = await getSavedTrips();
    const updatedTrips = savedTrips.filter(trip => trip.id !== tripId);
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(updatedTrips));
    
    // Remove também dos favoritos se existir
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== tripId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    
    return true;
  } catch (error) {
    console.error('Error removing trip:', error);
    return false;
  }
};

// Operações com favoritos
export const saveFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error saving favorites:', error);
    return false;
  }
};

export const getFavorites = async () => {
  try {
    const favs = await AsyncStorage.getItem(FAVORITES_KEY);
    return favs ? JSON.parse(favs) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

// Operação combinada para atualizar favoritos nas viagens
export const toggleFavoriteInStorage = async (tripId) => {
  try {
    const trips = await getSavedTrips();
    const updatedTrips = trips.map(trip => 
      trip.id === tripId ? { ...trip, isFavorite: !trip.isFavorite } : trip
    );
    
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(updatedTrips));
    
    const updatedFavorites = updatedTrips.filter(trip => trip.isFavorite);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    
    return true;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};