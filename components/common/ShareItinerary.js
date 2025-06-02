import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Linking from 'expo-linking';

const ShareItinerary = ({ trip }) => {
  const viewRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);

  // Verificação inicial dos dados da viagem
  if (!trip || !trip.destination || !trip.origin) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Dados da viagem não disponíveis</Text>
      </View>
    );
  }

  // Gera a imagem do itinerário
  const generateItineraryImage = async () => {
    try {
      setIsGenerating(true);
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.9,
        result: 'tmpfile',
      });
      return uri;
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Erro', 'Não foi possível gerar a imagem do itinerário');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Compartilha via apps nativos
  const shareViaNative = async () => {
    try {
      const uri = await generateItineraryImage();
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Aviso', 'Compartilhamento não disponível no seu dispositivo');
        return;
      }
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Compartilhar Itinerário',
        mimeType: 'image/png',
        UTI: 'image/png'
      });
    } catch (error) {
      console.error('Sharing failed:', error);
      Alert.alert('Erro', 'Falha ao compartilhar: ' + error.message);
    }
  };

  // Compartilha diretamente no WhatsApp
  const shareOnWhatsApp = async () => {
    try {
      const uri = await generateItineraryImage();
      const message = `Confira meu itinerário para ${trip.destination.structured_formatting.main_text}`;
      const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Aviso', 'WhatsApp não está instalado');
        await shareViaNative();
      }
    } catch (error) {
      console.error('WhatsApp sharing failed:', error);
      Alert.alert('Erro', 'Erro ao compartilhar no WhatsApp');
      await shareViaNative();
    }
  };

  // Compartilha diretamente no Instagram
  const shareOnInstagram = async () => {
    try {
      const uri = await generateItineraryImage();
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Compartilhar no Instagram',
        mimeType: 'image/png',
        UTI: 'image/png',
        social: Sharing.Social.INSTAGRAM
      });
    } catch (error) {
      console.error('Instagram sharing failed:', error);
      Alert.alert('Erro', 'Erro ao compartilhar no Instagram');
      await shareViaNative();
    }
  };

  // Componente da imagem que será capturada
  const ItineraryPreview = React.forwardRef((props, ref) => (
    <View ref={ref} style={styles.previewContainer}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Meu Itinerário</Text>
        <Text style={styles.subtitle}>{trip.destination.structured_formatting.main_text}</Text>
        <Text style={styles.dates}>
          {new Date(trip.departureDate).toLocaleDateString('pt-BR')} - {new Date(trip.returnDate).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      
      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: trip.origin.location.lat,
            longitude: trip.origin.location.lng,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          liteMode
          cacheEnabled
        >
          <Marker
            coordinate={{
              latitude: trip.origin.location.lat,
              longitude: trip.origin.location.lng,
            }}
            title="Origem"
          />
          <Marker
            coordinate={{
              latitude: trip.destination.location.lat,
              longitude: trip.destination.location.lng,
            }}
            title="Destino"
            pinColor="#3498db"
          />
          <Polyline
            coordinates={[
              {
                latitude: trip.origin.location.lat,
                longitude: trip.origin.location.lng,
              },
              {
                latitude: trip.destination.location.lat,
                longitude: trip.destination.location.lng,
              },
            ]}
            strokeColor="#3498db"
            strokeWidth={3}
          />
        </MapView>
      </View>
      
      {/* Detalhes */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MaterialIcons name="directions-car" size={20} color="#3498db" />
          <Text style={styles.detailText}>{trip.routeInfo.distance}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="access-time" size={20} color="#3498db" />
          <Text style={styles.detailText}>{trip.routeInfo.duration}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="people" size={20} color="#3498db" />
          <Text style={styles.detailText}>
            {trip.travelers.adults} adulto{trip.travelers.adults > 1 ? 's' : ''}
            {trip.travelers.children > 0 ? `, ${trip.travelers.children} criança${trip.travelers.children > 1 ? 's' : ''}` : ''}
          </Text>
        </View>
      </View>
      
      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Gerado por MeGuia App</Text>
      </View>
    </View>
  ));

  return (
    <View style={styles.container}>
      {/* Preview (invisível na tela) */}
      <View style={styles.hiddenPreview}>
        <ItineraryPreview ref={viewRef} />
      </View>
      
      {/* Botões de compartilhamento */}
      {isGenerating ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={shareViaNative}>
            <MaterialIcons name="share" size={24} color="#fff" />
            <Text style={styles.buttonText}>Compartilhar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.whatsappButton]} onPress={shareOnWhatsApp}>
            <MaterialIcons name="whatsapp" size={24} color="#fff" />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.instagramButton]} onPress={shareOnInstagram}>
            <MaterialIcons name="instagram" size={24} color="#fff" />
            <Text style={styles.buttonText}>Instagram</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
  },
  hiddenPreview: {
    position: 'absolute',
    left: -1000,
  },
  previewContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#3498db',
    marginVertical: 5,
  },
  dates: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  mapContainer: {
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    marginHorizontal: 5,
  },
  instagramButton: {
    backgroundColor: '#E1306C',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
});

export default ShareItinerary;