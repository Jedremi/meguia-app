import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Alert 
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY } from '../../utils/constants';

const HomeScreen = ({ navigation }) => {
  // Estados para locais
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  
  // Estados para datas
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  
  // Estados para viajantes
  const [travelers, setTravelers] = useState({
    adults: 1,
    children: 0,
    childrenAges: [],
  });
  
  const [hasPets, setHasPets] = useState(false);
  const [travelType, setTravelType] = useState('car');
  const [isLoading, setIsLoading] = useState(false);

  // Formatador de data
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Manipulador de data de partida
  const handleDepartureDateChange = (event, selectedDate) => {
    setShowDeparturePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDepartureDate(selectedDate);
      // Se a data de retorno for anterior à nova data de partida, atualize-a também
      if (selectedDate > returnDate) {
        const newReturnDate = new Date(selectedDate);
        newReturnDate.setDate(newReturnDate.getDate() + 1);
        setReturnDate(newReturnDate);
      }
    }
  };

  // Manipulador de data de retorno
  const handleReturnDateChange = (event, selectedDate) => {
    setShowReturnPicker(Platform.OS === 'ios');
    if (selectedDate && selectedDate >= departureDate) {
      setReturnDate(selectedDate);
    } else if (selectedDate) {
      Alert.alert('Data inválida', 'A data de retorno deve ser após a data de partida');
    }
  };

  // Manipulador de busca
  const handleSearch = () => {
    if (!origin || !destination) {
      Alert.alert('Campos obrigatórios', 'Por favor, informe a origem e o destino');
      return;
    }

    setIsLoading(true);
    
    // Simulando uma requisição assíncrona
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Results', {
        origin,
        destination,
        departureDate: departureDate.toISOString(),
        returnDate: returnDate.toISOString(),
        travelers,
        hasPets,
        travelType
      });
    }, 1500);
  };

  // Adicionar/remover crianças
  const handleChildrenChange = (value) => {
    const num = parseInt(value) || 0;
    let childrenAges = travelers.childrenAges;
    
    if (num > travelers.children) {
      // Adicionando novas crianças com idade padrão 10
      for (let i = travelers.children; i < num; i++) {
        childrenAges.push(10);
      }
    } else {
      // Removendo crianças do final
      childrenAges = childrenAges.slice(0, num);
    }
    
    setTravelers({
      ...travelers,
      children: num,
      childrenAges
    });
  };

  // Atualizar idade de uma criança específica
  const handleChildAgeChange = (index, value) => {
    const newAges = [...travelers.childrenAges];
    newAges[index] = parseInt(value) || 0;
    setTravelers({
      ...travelers,
      childrenAges: newAges
    });
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Planeje sua viagem</Text>
      
      {/* Campo de Origem com Autocomplete */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Origem</Text>
        <GooglePlacesAutocomplete
          placeholder="De onde você vai partir?"
          onPress={(data, details = null) => {
            setOrigin({
              description: data.description,
              placeId: data.place_id,
              location: details.geometry.location,
              structured_formatting: data.structured_formatting,
            });
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'pt-BR',
            components: 'country:br',
          }}
          styles={{
            textInput: styles.googleInput,
            listView: styles.listView,
            row: styles.listRow,
            poweredContainer: styles.poweredContainer,
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          debounce={300}
          renderLeftButton={() => (
            <MaterialIcons 
              name="my-location" 
              size={20} 
              color="#666" 
              style={styles.inputIcon} 
            />
          )}
        />
      </View>
      
      {/* Campo de Destino com Autocomplete */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Destino</Text>
        <GooglePlacesAutocomplete
          placeholder="Para onde você vai?"
          onPress={(data, details = null) => {
            setDestination({
              description: data.description,
              placeId: data.place_id,
              location: details.geometry.location,
              structured_formatting: data.structured_formatting,
            });
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'pt-BR',
            components: 'country:br',
          }}
          styles={{
            textInput: styles.googleInput,
            listView: styles.listView,
            row: styles.listRow,
            poweredContainer: styles.poweredContainer,
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          debounce={300}
          renderLeftButton={() => (
            <MaterialIcons 
              name="place" 
              size={20} 
              color="#666" 
              style={styles.inputIcon} 
            />
          )}
        />
      </View>
      
      {/* Seleção de Datas */}
      <View style={styles.dateContainer}>
        <View style={styles.dateInputContainer}>
          <Text style={styles.inputLabel}>Data de ida</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDeparturePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(departureDate)}</Text>
            <MaterialIcons name="date-range" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateInputContainer}>
          <Text style={styles.inputLabel}>Data de volta</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowReturnPicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(returnDate)}</Text>
            <MaterialIcons name="date-range" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Date Pickers */}
      {showDeparturePicker && (
        <DateTimePicker
          value={departureDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDepartureDateChange}
        />
      )}
      
      {showReturnPicker && (
        <DateTimePicker
          value={returnDate}
          mode="date"
          display="default"
          minimumDate={departureDate}
          onChange={handleReturnDateChange}
        />
      )}
      
      {/* Seção de Viajantes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Viajantes</Text>
        <View style={styles.travelersContainer}>
          <View style={styles.travelerOption}>
            <Text style={styles.travelerLabel}>Adultos:</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => setTravelers({
                  ...travelers,
                  adults: Math.max(1, travelers.adults - 1)
                })}
              >
                <Text style={styles.counterText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{travelers.adults}</Text>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => setTravelers({
                  ...travelers,
                  adults: travelers.adults + 1
                })}
              >
                <Text style={styles.counterText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.travelerOption}>
            <Text style={styles.travelerLabel}>Crianças:</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => handleChildrenChange(Math.max(0, travelers.children - 1))}
              >
                <Text style={styles.counterText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{travelers.children}</Text>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => handleChildrenChange(travelers.children + 1)}
              >
                <Text style={styles.counterText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Idades das crianças */}
        {travelers.children > 0 && (
          <View style={styles.childrenAgesContainer}>
            <Text style={styles.childrenAgesTitle}>Idades das crianças:</Text>
            <View style={styles.childrenAgesRow}>
              {travelers.childrenAges.map((age, index) => (
                <View key={index} style={styles.ageInputContainer}>
                  <Text style={styles.ageLabel}>Criança {index + 1}</Text>
                  <TextInput
                    style={styles.ageInput}
                    keyboardType="numeric"
                    value={age.toString()}
                    onChangeText={(text) => handleChildAgeChange(index, text)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      
      {/* Seção de Pets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Animais de estimação</Text>
        <TouchableOpacity 
          style={styles.petOption}
          onPress={() => setHasPets(!hasPets)}
        >
          <View style={[styles.checkbox, hasPets && styles.checkedBox]}>
            {hasPets && <MaterialIcons name="check" size={16} color="white" />}
          </View>
          <Text style={styles.petText}>Estou viajando com pets</Text>
        </TouchableOpacity>
        
        {hasPets && (
          <View style={styles.petDetailsContainer}>
            <TextInput
              style={styles.petInput}
              placeholder="Quantidade de pets"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.petInput}
              placeholder="Peso aproximado (kg)"
              keyboardType="numeric"
            />
          </View>
        )}
      </View>
      
      {/* Seção de Tipo de Viagem */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Forma de viagem</Text>
        <View style={styles.travelTypeContainer}>
          {[
            { id: 'car', icon: 'directions-car', label: 'Carro' },
            { id: 'moto', icon: 'motorcycle', label: 'Moto' },
            { id: 'airplane', icon: 'flight', label: 'Avião' },
            { id: 'motorhome', icon: 'rv-hookup', label: 'Motorhome' }
          ].map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.travelTypeButton, 
                travelType === type.id && styles.selectedTravelType
              ]}
              onPress={() => setTravelType(type.id)}
            >
              <MaterialIcons 
                name={type.icon} 
                size={24} 
                color={travelType === type.id ? '#3498db' : '#666'} 
              />
              <Text style={[
                styles.travelTypeText,
                travelType === type.id && styles.selectedTravelTypeText
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Botão de Busca */}
      <TouchableOpacity 
        style={[
          styles.searchButton,
          isLoading && styles.searchButtonDisabled
        ]}
        onPress={handleSearch}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.searchButtonText}>Buscar Itinerários</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#2c3e50',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 15,
  },
  googleInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 45,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  listView: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 3,
    zIndex: 999,
  },
  listRow: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  poweredContainer: {
    display: 'none',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInputContainer: {
    width: '48%',
  },
  dateInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
  },
  travelersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  travelerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '48%',
  },
  travelerLabel: {
    fontSize: 16,
    color: '#555',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  counterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  counterValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  childrenAgesContainer: {
    marginTop: 15,
  },
  childrenAgesTitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
  },
  childrenAgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ageInputContainer: {
    width: '48%',
    marginBottom: 10,
  },
  ageLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 5,
  },
  ageInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  petText: {
    fontSize: 16,
    color: '#555',
  },
  petDetailsContainer: {
    marginTop: 15,
  },
  petInput: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 15,
  },
  travelTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  travelTypeButton: {
    width: '48%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectedTravelType: {
    borderColor: '#3498db',
    backgroundColor: '#e8f4fc',
  },
  travelTypeText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#666',
  },
  selectedTravelTypeText: {
    color: '#3498db',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  searchButtonDisabled: {
    backgroundColor: '#a0c4e4',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;