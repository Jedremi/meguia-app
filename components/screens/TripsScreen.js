import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { TravelContext } from "../../contexts/TravelContext";
import { db, rtdb } from '../../services/firebaseConfig';


const TripsScreen = ({ navigation, route }) => {
  const { 
    savedTrips, 
    favorites,
    isLoading, 
    deleteTrip, 
    toggleFavorite,
    loadData
  } = useContext(TravelContext);

  // Verifica se está na tab de favoritos
  const isFavoritesTab = route.name === 'Favorites';
  const displayedTrips = isFavoritesTab ? favorites : savedTrips;

  const handleDeleteTrip = async (tripId) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta viagem?',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTrip(tripId);
            if (success) {
              loadData();
            } else {
              Alert.alert('Erro', 'Não foi possível excluir a viagem');
            }
          }
        }
      ]
    );
  };

  const handleToggleFavorite = async (tripId, e) => {
    e.stopPropagation();
    await toggleFavorite(tripId);
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => navigation.navigate('TripDetails', { trip: item })}
      activeOpacity={0.8}
    >
      <View style={styles.tripInfo}>
        <Text style={styles.tripTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.destination.structured_formatting.main_text}
        </Text>
        <Text style={styles.tripDates}>
          {new Date(item.departureDate).toLocaleDateString('pt-BR')} - {new Date(item.returnDate).toLocaleDateString('pt-BR')}
        </Text>
        <Text style={styles.tripTravelers}>
          {item.travelers.adults} adulto{item.travelers.adults > 1 ? 's' : ''}
          {item.travelers.children > 0 ? `, ${item.travelers.children} criança${item.travelers.children > 1 ? 's' : ''}` : ''}
          {item.hasPets ? ' · 🐾' : ''}
        </Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => handleToggleFavorite(item.id, e)}
        >
          <Ionicons 
            name={item.isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={item.isFavorite ? "#e74c3c" : "#95a5a6"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteTrip(item.id);
          }}
        >
          <MaterialIcons name="delete" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading && displayedTrips.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : displayedTrips.length > 0 ? (
        <FlatList
          data={displayedTrips}
          renderItem={renderTripItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={loadData}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={isFavoritesTab ? "heart-dislike-outline" : "travel-explore"} 
            size={60} 
            color="#bdc3c7" 
          />
          <Text style={styles.emptyText}>
            {isFavoritesTab ? 'Nenhum favorito adicionado' : 'Nenhuma viagem salva'}
          </Text>
          <Text style={styles.emptySubtext}>
            {isFavoritesTab 
              ? 'Marque viagens como favoritas e elas aparecerão aqui' 
              : 'Planeje sua primeira viagem e ela aparecerá aqui'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripInfo: {
    flex: 1,
    marginRight: 10,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  tripDates: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  tripTravelers: {
    fontSize: 13,
    color: '#95a5a6',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TripsScreen;