import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TravelContext } from '../contexts/TravelContext';
import TripCard from '../components/TripCard';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase'; // ajuste conforme sua configuração

const FavoritesScreen = ({ navigation }) => {
  const { favorites } = useContext(TravelContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Favoritos</Text>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <TripCard 
              trip={item} 
              onPress={() => navigation.navigate('TripDetails', { trip: item })}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhum favorito salvo</Text>
      )}
    </View>
  );
};

export default FavoritesScreen;

// Lógica de salvar favorito
export async function salvarFavorito(userId, obj) {
  try {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, {
      favoritos: arrayUnion(obj)
    });
    console.log("Favorito salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar favorito: ", error);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666'
  }
});
