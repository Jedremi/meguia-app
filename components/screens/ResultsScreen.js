import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '../../utils/constants';
import { TravelContext } from '../../contexts/TravelContext';

const ResultsScreen = ({ route, navigation }) => {
  const { 
    origin, 
    destination, 
    departureDate, 
    returnDate, 
    travelers,
    hasPets,
    travelType
  } = route.params;

  const [routeInfo, setRouteInfo] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('route');
  const [mapRegion, setMapRegion] = useState(null);
  const [saving, setSaving] = useState(false);

  const { addTrip } = useContext(TravelContext);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.location.lat},${origin.location.lng}&destination=${destination.location.lat},${destination.location.lng}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`;
        const directionsResponse = await axios.get(directionsUrl);

        if (!directionsResponse.data.routes.length) {
          throw new Error('Nenhuma rota encontrada');
        }

        const hotelsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${destination.location.lat},${destination.location.lng}&radius=1500&type=lodging&key=${GOOGLE_MAPS_API_KEY}`;
        const hotelsResponse = await axios.get(hotelsUrl);

        const attractionsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${destination.location.lat},${destination.location.lng}&radius=2000&type=tourist_attraction&key=${GOOGLE_MAPS_API_KEY}`;
        const attractionsResponse = await axios.get(attractionsUrl);

        const routeData = directionsResponse.data.routes[0];
        setRouteInfo({
          distance: routeData.legs[0].distance.text,
          duration: routeData.legs[0].duration.text,
          steps: routeData.legs[0].steps,
          polyline: routeData.overview_polyline.points
        });

        setHotels(hotelsResponse.data.results.slice(0, 5));
        setAttractions(attractionsResponse.data.results.slice(0, 5));

        setMapRegion({
          latitude: (origin.location.lat + destination.location.lat) / 2,
          longitude: (origin.location.lng + destination.location.lng) / 2,
          latitudeDelta: Math.abs(origin.location.lat - destination.location.lat) * 1.5,
          longitudeDelta: Math.abs(origin.location.lng - destination.location.lng) * 1.5,
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados da viagem');
      } finally {
        setLoading(false);
      }
    };

    fetchRouteData();
  }, []);

  const handleSaveTrip = async () => {
    if (!routeInfo) return;

    setSaving(true);
    try {
      const tripData = {
        origin,
        destination,
        departureDate,
        returnDate,
        travelers,
        hasPets,
        travelType,
        routeInfo,
        hotels,
        attractions,
        createdAt: new Date().toISOString()
      };

      const success = await addTrip(tripData);

      if (success) {
        Alert.alert(
          'Viagem salva!',
          'Seu itinerário foi salvo em "Minhas Viagens"',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('Trips')
            }
          ]
        );
      } else {
        throw new Error('Falha ao salvar viagem');
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      Alert.alert('Erro', 'Não foi possível salvar a viagem');
    } finally {
      setSaving(false);
    }
  };

  const decodePolyline = (polyline) => {
    const points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < polyline.length) {
      let b, shift = 0, result = 0;
      do {
        b = polyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = polyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5
      });
    }

    return points;
  };

  const renderRouteTab = () => {
    if (!routeInfo) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.errorText}>Não foi possível carregar as informações da rota</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.routeSummary}>
          <View style={styles.summaryItem}>
            <MaterialIcons name="directions-car" size={24} color="#3498db" />
            <Text style={styles.summaryText}>{routeInfo.distance}</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialIcons name="access-time" size={24} color="#3498db" />
            <Text style={styles.summaryText}>{routeInfo.duration}</Text>
          </View>
        </View>

        <View style={styles.mapContainer}>
          {mapRegion && (
            <MapView
              style={styles.map}
              region={mapRegion}
              showsUserLocation={false}
            >
              <Marker
                coordinate={{
                  latitude: origin.location.lat,
                  longitude: origin.location.lng
                }}
                title="Origem"
                description={origin.description}
              >
                <View style={styles.markerOrigin}>
                  <MaterialIcons name="my-location" size={20} color="white" />
                </View>
              </Marker>

              <Marker
                coordinate={{
                  latitude: destination.location.lat,
                  longitude: destination.location.lng
                }}
                title="Destino"
                description={destination.description}
              >
                <View style={styles.markerDestination}>
                  <MaterialIcons name="place" size={20} color="white" />
                </View>
              </Marker>

              <Polyline
                coordinates={decodePolyline(routeInfo.polyline)}
                strokeColor="#3498db"
                strokeWidth={4}
              />
            </MapView>
          )}
        </View>

        <View style={styles.routeSteps}>
          <Text style={styles.sectionTitle}>Passo a passo da rota:</Text>
          {routeInfo.steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <Text style={styles.stepText}>
                {step.html_instructions.replace(/<[^>]*>/g, '')}
              </Text>
              <Text style={styles.stepDistance}>{step.distance.text}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderHotelsTab = () => (
    <View style={styles.tabContent}>
      {hotels.length === 0 ? (
        <Text style={styles.errorText}>Nenhum hotel encontrado</Text>
      ) : (
        hotels.map((hotel, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.placeCard}
            onPress={() => Linking.openURL(`https://www.google.com/maps/place/?q=place_id:${hotel.place_id}`)}
          >
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{hotel.name}</Text>
              <Text style={styles.placeRating}>
                <FontAwesome name="star" size={14} color="#f1c40f" /> {hotel.rating || 'N/A'}
              </Text>
              <Text style={styles.placeAddress}>{hotel.vicinity}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderAttractionsTab = () => (
    <View style={styles.tabContent}>
      {attractions.length === 0 ? (
        <Text style={styles.errorText}>Nenhuma atração encontrada</Text>
      ) : (
        attractions.map((attraction, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.placeCard}
            onPress={() => Linking.openURL(`https://www.google.com/maps/place/?q=place_id:${attraction.place_id}`)}
          >
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{attraction.name}</Text>
              <Text style={styles.placeRating}>
                <FontAwesome name="star" size={14} color="#f1c40f" /> {attraction.rating || 'N/A'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Buscando melhores rotas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sua Viagem para {destination.structured_formatting.main_text}</Text>
        <Text style={styles.headerSubtitle}>
          {new Date(departureDate).toLocaleDateString('pt-BR')} - {new Date(returnDate).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'route' && styles.activeTab]}
          onPress={() => setActiveTab('route')}
        >
          <Ionicons 
            name="route" 
            size={20} 
            color={activeTab === 'route' ? '#3498db' : '#777'} 
          />
          <Text style={[styles.tabText, activeTab === 'route' && styles.activeTabText]}>Rota</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'hotels' && styles.activeTab]}
          onPress={() => setActiveTab('hotels')}
        >
          <Ionicons 
            name="bed" 
            size={20} 
            color={activeTab === 'hotels' ? '#3498db' : '#777'} 
          />
          <Text style={[styles.tabText, activeTab === 'hotels' && styles.activeTabText]}>Hospedagem</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'attractions' && styles.activeTab]}
          onPress={() => setActiveTab('attractions')}
        >
          <Ionicons 
            name="map" 
            size={20} 
            color={activeTab === 'attractions' ? '#3498db' : '#777'} 
          />
          <Text style={[styles.tabText, activeTab === 'attractions' && styles.activeTabText]}>Atrações</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'route' && renderRouteTab()}
        {activeTab === 'hotels' && renderHotelsTab()}
        {activeTab === 'attractions' && renderAttractionsTab()}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSaveTrip}
        disabled={saving || !routeInfo}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Itinerário</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    textAlign: 'center',
    color: '#e74c3c',
    fontSize: 16,
    marginTop: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#777',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
  },
  routeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
  mapContainer: {
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerOrigin: {
    backgroundColor: '#3498db',
    padding: 5,
    borderRadius: 20,
  },
  markerDestination: {
    backgroundColor: '#e74c3c',
    padding: 5,
    borderRadius: 20,
  },
  routeSteps: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  stepItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stepText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
  },
  stepDistance: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  placeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  placeRating: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  placeAddress: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 16,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#a0c4e4',
  }
});

export default ResultsScreen;