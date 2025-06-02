import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TravelContext } from '../contexts/TravelContext';


const TripCard = ({ trip, onPress }) => {
  const { toggleFavorite } = useContext(TravelContext);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{trip.destination}</Text>
        <Text style={styles.dates}>{trip.departureDate} - {trip.returnDate}</Text>
      </View>
      
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(trip.id);
        }}
        style={styles.favoriteButton}
      >
        <MaterialIcons 
          name={trip.isFavorite ? 'favorite' : 'favorite-border'} 
          size={24} 
          color={trip.isFavorite ? '#e74c3c' : '#ccc'} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  dates: {
    color: '#666'
  },
  favoriteButton: {
    padding: 5
  }
});

export default TripCard;