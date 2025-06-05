import React, { useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  Share
} from 'react-native';
import { MapView, Marker, Polyline } from '../MapWrapper';
import { 
  MaterialIcons, 
  FontAwesome, 
  Ionicons, 
  Feather,
  AntDesign 
} from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { TravelContext } from '../../contexts/TravelContext';
import { db, rtdb } from '../../services/firebaseConfig';

const TripDetailsScreen = ({ route, navigation }) => {
  const { trip } = route.params;
  const { deleteTrip, saveReview } = useContext(TravelContext);
  const viewRef = useRef();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta viagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => {
          const success = await deleteTrip(trip.id);
          if (success) navigation.goBack();
          else Alert.alert('Erro', 'Não foi possível excluir a viagem');
        }}
      ]
    );
  };

  const shareItinerary = async () => {
    try {
      const uri = await captureRef(viewRef, { format: 'png', quality: 0.9 });
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Compartilhar Itinerário',
        mimeType: 'image/png',
        UTI: 'image/png'
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar o itinerário');
    }
  };

  const handleShare = async () => {
    try {
      const message = `Minha viagem para ${trip.destination.structured_formatting.main_text}:\n` +
        `🗓 ${new Date(trip.departureDate).toLocaleDateString('pt-BR')} - ${new Date(trip.returnDate).toLocaleDateString('pt-BR')}\n` +
        `📍 Origem: ${trip.origin.description}\n` +
        `🏁 Destino: ${trip.destination.description}\n` +
        `🚗 Distância: ${trip.routeInfo.distance}\n` +
        `⏱ Duração: ${trip.routeInfo.duration}`;
      await Share.share({ message });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar a viagem');
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      Alert.alert('Aviso', 'Por favor, selecione uma avaliação');
      return;
    }
    const success = await saveReview(trip.id, rating, comment);
    if (success) {
      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
      setRating(0);
      setComment('');
    } else {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação');
    }
  };

  const decodePolyline = (polyline) => {
    const points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < polyline.length) {
      let b, shift = 0, result = 0;
      do { b = polyline.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
      shift = 0; result = 0;
      do { b = polyline.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const renderMap = () => {
    const mapRegion = {
      latitude: (trip.origin.location.lat + trip.destination.location.lat) / 2,
      longitude: (trip.origin.location.lng + trip.destination.location.lng) / 2,
      latitudeDelta: Math.abs(trip.origin.location.lat - trip.destination.location.lat) * 1.5,
      longitudeDelta: Math.abs(trip.origin.location.lng - trip.destination.location.lng) * 1.5,
    };
    return (
      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={mapRegion} showsUserLocation={false}>
          <Marker coordinate={trip.origin.location} title="Origem" description={trip.origin.description}>
            <View style={styles.markerOrigin}>
              <MaterialIcons name="my-location" size={20} color="white" />
            </View>
          </Marker>
          <Marker coordinate={trip.destination.location} title="Destino" description={trip.destination.description}>
            <View style={styles.markerDestination}>
              <MaterialIcons name="place" size={20} color="white" />
            </View>
          </Marker>
          <Polyline coordinates={decodePolyline(trip.routeInfo.polyline)} strokeColor="#3498db" strokeWidth={4} />
        </MapView>
      </View>
    );
  };

  const renderHotelItem = (hotel, index) => (
    <TouchableOpacity key={index} style={styles.placeCard}
      onPress={() => Linking.openURL(`https://www.google.com/maps/place/?q=place_id:${hotel.place_id}`)}>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{hotel.name}</Text>
        <Text style={styles.placeRating}>
          <FontAwesome name="star" size={14} color="#f1c40f" /> {hotel.rating || 'N/A'}
        </Text>
        <Text style={styles.placeAddress}>{hotel.vicinity}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  const renderAttractionItem = (attraction, index) => (
    <TouchableOpacity key={index} style={styles.placeCard}
      onPress={() => Linking.openURL(`https://www.google.com/maps/place/?q=place_id:${attraction.place_id}`)}>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{attraction.name}</Text>
        <Text style={styles.placeRating}>
          <FontAwesome name="star" size={14} color="#f1c40f" /> {attraction.rating || 'N/A'}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View ref={viewRef} collapsable={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#3498db" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{trip.destination.structured_formatting.main_text}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} onPress={shareItinerary}>
                <Feather name="share-2" size={20} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                <AntDesign name="delete" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>

          {/* informações */}
          <View style={styles.infoContainer}>
            {/* Datas */}
            <View style={styles.infoItem}>
              <MaterialIcons name="date-range" size={20} color="#3498db" />
              <Text style={styles.infoText}>
                {new Date(trip.departureDate).toLocaleDateString('pt-BR')} - {new Date(trip.returnDate).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            {/* Passageiros */}
            <View style={styles.infoItem}>
              <MaterialIcons name="people" size={20} color="#3498db" />
              <Text style={styles.infoText}>
                {trip.travelers.adults} adulto{trip.travelers.adults > 1 ? 's' : ''}
                {trip.travelers.children > 0 ? `, ${trip.travelers.children} criança${trip.travelers.children > 1 ? 's' : ''}` : ''}
              </Text>
            </View>
            {/* Transporte */}
            <View style={styles.infoItem}>
              <MaterialIcons 
                name={trip.travelType === 'car' ? 'directions-car' : 
                     trip.travelType === 'moto' ? 'motorcycle' :
                     trip.travelType === 'airplane' ? 'flight' : 'rv-hookup'} 
                size={20} color="#3498db" 
              />
              <Text style={styles.infoText}>
                {trip.travelType === 'car' ? 'Carro' : 
                 trip.travelType === 'moto' ? 'Moto' :
                 trip.travelType === 'airplane' ? 'Avião' : 'Motorhome'}
              </Text>
            </View>
            {trip.hasPets && (
              <View style={styles.infoItem}>
                <MaterialIcons name="pets" size={20} color="#3498db" />
                <Text style={styles.infoText}>Viagem com pets</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rota da Viagem</Text>
            {renderMap()}
            <View style={styles.routeInfo}>
              <View style={styles.routeInfoItem}>
                <MaterialIcons name="directions-car" size={20} color="#3498db" />
                <Text style={styles.routeInfoText}>{trip.routeInfo.distance}</Text>
              </View>
              <View style={styles.routeInfoItem}>
                <MaterialIcons name="access-time" size={20} color="#3498db" />
                <Text style={styles.routeInfoText}>{trip.routeInfo.duration}</Text>
              </View>
            </View>
          </View>

          {trip.hotels?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opções de Hospedagem</Text>
              {trip.hotels.map(renderHotelItem)}
            </View>
          )}

          {trip.attractions?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Atrações Turísticas</Text>
              {trip.attractions.map(renderAttractionItem)}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avalie esta viagem</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <MaterialIcons name={star <= rating ? 'star' : 'star-border'} size={32} color="#f1c40f" />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Deixe um comentário..."
              placeholderTextColor="#95a5a6"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
              <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  actionButton: { marginLeft: 10 },
  infoContainer: { padding: 20, backgroundColor: '#fff', marginVertical: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { marginLeft: 10, fontSize: 16, color: '#555' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  placeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginVertical: 5, elevation: 2 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  placeRating: { flexDirection: 'row', alignItems: 'center', color: '#555', marginTop: 5 },
  placeAddress: { color: '#777', marginTop: 5 },
  mapContainer: { height: 200, marginVertical: 10 },
  map: { ...StyleSheet.absoluteFillObject },
  markerOrigin: { backgroundColor: '#3498db', padding: 5, borderRadius: 20 },
  markerDestination: { backgroundColor: '#e74c3c', padding: 5, borderRadius: 20 },
  routeInfo: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  routeInfoItem: { flexDirection: 'row', alignItems: 'center' },
  routeInfoText: { marginLeft: 5, fontSize: 14, color: '#555' },
  ratingContainer: { flexDirection: 'row', marginVertical: 10 },
  commentInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold' }
  
});

export default TripDetailsScreen;
