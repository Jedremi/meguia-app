import React, { createContext, useState, useEffect } from 'react';
import { 
  getSavedTrips, 
  saveFavorites, 
  saveTrip, 
  removeTrip 
} from '../services/storageService';
import { 
  saveFavoritesToCloud, 
  syncFavorites 
} from '../services/firebaseService';

export const TravelContext = createContext();

export const TravelProvider = ({ children }) => {
  const [savedTrips, setSavedTrips] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    travelType: 'car',
    petFriendly: false,
    budgetLevel: 'medium'
  });
  const [userId, setUserId] = useState(null);

  // Carrega dados ao iniciar
  const loadData = async () => {
    setIsLoading(true);
    try {
      const trips = await getSavedTrips();
      setSavedTrips(trips);
      
      // Só carrega favoritos locais se não tiver usuário logado
      if (!userId) {
        const favs = await getSavedTrips();
        setFavorites(favs.filter(item => item.isFavorite));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sincroniza favoritos com Firebase quando userId muda
  useEffect(() => {
    let unsubscribe;
    
    if (userId) {
      unsubscribe = syncFavorites(userId, (cloudFavorites) => {
        // Converte objeto do Firebase para array se necessário
        const favoritesArray = Array.isArray(cloudFavorites) 
          ? cloudFavorites 
          : Object.values(cloudFavorites || {});
        
        setFavorites(favoritesArray);
        
        // Atualiza savedTrips para refletir os favoritos
        setSavedTrips(prevTrips => 
          prevTrips.map(trip => ({
            ...trip,
            isFavorite: favoritesArray.some(fav => fav.id === trip.id)
          }))
        );
        
        // Salva localmente para offline
        saveFavorites(favoritesArray);
      });
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  // Toggle favorite com sincronização
  const toggleFavorite = async (tripId) => {
    const updatedTrips = savedTrips.map(trip => 
      trip.id === tripId ? { ...trip, isFavorite: !trip.isFavorite } : trip
    );
    
    const updatedFavorites = updatedTrips.filter(trip => trip.isFavorite);
    
    setSavedTrips(updatedTrips);
    setFavorites(updatedFavorites);
    
    // Salva localmente
    await saveFavorites(updatedFavorites);
    
    // Sincroniza com Firebase se tiver usuário
    if (userId) {
      await saveFavoritesToCloud(userId, updatedFavorites);
    }
  };

  const addTrip = async (trip) => {
    setIsLoading(true);
    try {
      const newTrip = { 
        ...trip, 
        id: Date.now().toString(),
        isFavorite: false // Novo trip começa como não-favorito
      };
      
      const success = await saveTrip(newTrip);
      if (success) {
        setSavedTrips([...savedTrips, newTrip]);
      }
      return success;
    } catch (error) {
      console.error('Error adding trip:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrip = async (tripId) => {
    setIsLoading(true);
    try {
      const success = await removeTrip(tripId);
      if (success) {
        setSavedTrips(savedTrips.filter(trip => trip.id !== tripId));
        setFavorites(favorites.filter(trip => trip.id !== tripId));
        
        // Remove dos favoritos no Firebase se tiver usuário
        if (userId) {
          await saveFavoritesToCloud(
            userId, 
            favorites.filter(trip => trip.id !== tripId)
          );
        }
      }
      return success;
    } catch (error) {
      console.error('Error deleting trip:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = (newPreferences) => {
    setUserPreferences({
      ...userPreferences,
      ...newPreferences
    });
  };

  const setUser = (id) => {
    setUserId(id);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <TravelContext.Provider
      value={{
        savedTrips,
        favorites,
        isLoading,
        userPreferences,
        userId,
        toggleFavorite,
        addTrip,
        deleteTrip,
        updatePreferences,
        loadData,
        setUser
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};