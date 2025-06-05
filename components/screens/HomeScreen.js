import React, { useState } from 'react';
import { ActivityIndicator, TextInput, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY } from '../../utils/constants';

const HomeScreen = ({ navigation }) => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [travelers, setTravelers] = useState({ adults: 1, children: 0, childrenAges: [] });
  const [hasPets, setHasPets] = useState(false);
  const [travelType, setTravelType] = useState('car');
  const [isLoading, setIsLoading] = useState(false);
  const [petCount, setPetCount] = useState('');
  const [petWeight, setPetWeight] = useState('');

  const formatDate = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleDepartureDateChange = (event, selectedDate) => {
    setShowDeparturePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDepartureDate(selectedDate);
      if (selectedDate > returnDate) {
        const newReturnDate = new Date(selectedDate);
        newReturnDate.setDate(newReturnDate.getDate() + 1);
        setReturnDate(newReturnDate);
      }
    }
  };

  const handleReturnDateChange = (event, selectedDate) => {
    setShowReturnPicker(Platform.OS === 'ios');
    if (selectedDate && selectedDate >= departureDate) {
      setReturnDate(selectedDate);
    } else if (selectedDate) {
      Alert.alert('Data inválida', 'A data de retorno deve ser após a data de partida');
    }
  };

  const handleSearch = () => {
    if (!origin || !destination) {
      Alert.alert('Campos obrigatórios', 'Por favor, informe a origem e o destino');
      return;
    }

    if (hasPets && (!petCount || !petWeight)) {
      Alert.alert('Informações sobre pets', 'Por favor, informe a quantidade e peso dos pets');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Results', {
        origin,
        destination,
        departureDate: departureDate.toISOString(),
        returnDate: returnDate.toISOString(),
        travelers,
        hasPets,
        travelType,
        petCount,
        petWeight
      });
    }, 1500);
  };

  const handleChildrenChange = (value) => {
    const num = parseInt(value) || 0;
    let childrenAges = travelers.childrenAges;
    if (num > travelers.children) {
      for (let i = travelers.children; i < num; i++) childrenAges.push(0);
    } else {
      childrenAges = childrenAges.slice(0, num);
    }
    setTravelers({ ...travelers, children: num, childrenAges });
  };

  const handleChildAgeChange = (index, value) => {
    const newAges = [...travelers.childrenAges];
    newAges[index] = parseInt(value) || 0;
    setTravelers({ ...travelers, childrenAges: newAges });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Planeje sua viagem</Text>

      {/* Origem e Destino */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Origem</Text>
        <GooglePlacesAutocomplete
          placeholder="De onde você vai partir?"
         onPress={(data, details = null) => {
         if (!details) return;
         setOrigin({ 
          description: data.description, 
          placeId: data.place_id, 
          location: details.geometry.location, 
          structured_formatting: data.structured_formatting 
           });
          }}
          query={{ key: GOOGLE_MAPS_API_KEY, language: 'pt-BR', components: 'country:br' }}
          styles={{ 
            textInput: styles.googleInput, 
            listView: styles.listView, 
            row: styles.listRow, 
            poweredContainer: styles.poweredContainer 
          }}
          fetchDetails 
          enablePoweredByContainer={false} 
          debounce={300}
          renderLeftButton={() => (
            <MaterialIcons name="my-location" size={20} color="#666" style={styles.inputIcon} />
          )}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Destino</Text>
        <GooglePlacesAutocomplete
          placeholder="Para onde você vai?"
          onPress={(data, details = null) => { 
          if (!details) return;
          setDestination({            
            description: data.description, 
            placeId: data.place_id, 
            location: details.geometry.location, 
            structured_formatting: data.structured_formatting 
             });
          }}
          query={{ key: GOOGLE_MAPS_API_KEY, language: 'pt-BR', components: 'country:br' }}
          styles={{ 
            textInput: styles.googleInput, 
            listView: styles.listView, 
            row: styles.listRow, 
            poweredContainer: styles.poweredContainer 
          }}
          fetchDetails 
          enablePoweredByContainer={false} 
          debounce={300}
          renderLeftButton={() => (
            <MaterialIcons name="place" size={20} color="#666" style={styles.inputIcon} />
          )}
        />
      </View>

      {/* Datas */}
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

      {/* Viajantes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Viajantes</Text>

        <View style={styles.travelersContainer}>
          <View style={styles.travelerOption}>
            <Text style={styles.travelerLabel}>Adultos:</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setTravelers({ ...travelers, adults: Math.max(1, travelers.adults - 1) })}
              >
                <Text style={styles.counterText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{travelers.adults}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setTravelers({ ...travelers, adults: travelers.adults + 1 })}
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

        {/* Idade das crianças */}
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
                    maxLength={2}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Pets */}
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
              value={petCount}
              onChangeText={setPetCount}
              maxLength={2}
            />
            <TextInput
              style={styles.petInput}
              placeholder="Peso aproximado (kg)"
              keyboardType="numeric"
              value={petWeight}
              onChangeText={setPetWeight}
              maxLength={3}
            />
          </View>
        )}
      </View>

      {/* Forma de viagem */}
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
              <Text
                style={[
                  styles.travelTypeText,
                  travelType === type.id && styles.selectedTravelTypeText
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.searchButton, isLoading && styles.searchButtonDisabled]} 
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
    paddingBottom: 40 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 25, 
    color: '#2c3e50', 
    textAlign: 'center' 
  },
  inputContainer: { 
    marginBottom: 20 
  },
  inputLabel: { 
    marginBottom: 8, 
    fontWeight: '600', 
    color: '#2c3e50', 
    fontSize: 15 
  },
  googleInput: { 
    height: 50, 
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 10, 
    paddingHorizontal: 45, 
    fontSize: 16, 
    color: '#333' 
  },
  inputIcon: { 
    position: 'absolute', 
    left: 15, 
    top: 15, 
    zIndex: 1 
  },
  listView: { 
    position: 'absolute', 
    top: 50, 
    left: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    borderRadius: 5, 
    elevation: 3, 
    zIndex: 999 
  },
  listRow: { 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  poweredContainer: { 
    display: 'none' 
  },
  dateContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  dateInputContainer: { 
    width: '48%' 
  },
  dateInput: { 
    height: 50, 
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexDirection: 'row' 
  },
  dateText: { 
    fontSize: 16, 
    color: '#333' 
  },
  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15
  },
  travelersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  travelerOption: {
    width: '48%'
  },
  travelerLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 5
  },
  counterButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 5
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555'
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50'
  },
  childrenAgesContainer: {
    marginTop: 15
  },
  childrenAgesTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10
  },
  childrenAgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  ageInputContainer: {
    width: '30%',
    marginBottom: 10
  },
  ageLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5
  },
  ageInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
    backgroundColor: '#fff'
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkedBox: {
    backgroundColor: '#3498db',
    borderColor: '#3498db'
  },
  petText: {
    fontSize: 16,
    color: '#555'
  },
  petDetailsContainer: {
    marginTop: 10
  },
  petInput: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  travelTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  travelTypeButton: {
    width: '48%',
    height: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  selectedTravelType: {
    borderColor: '#3498db',
    backgroundColor: '#f0f8ff'
  },
  travelTypeText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666'
  },
  selectedTravelTypeText: {
    color: '#3498db',
    fontWeight: '600'
  },
  searchButton: { 
    backgroundColor: '#3498db', 
    padding: 16, 
    borderRadius: 10, 
    marginTop: 10, 
    marginBottom: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2 
  },
  searchButtonDisabled: { 
    backgroundColor: '#a0c4e4' 
  },
  searchButtonText: { 
    color: '#ffffff', 
    fontSize: 18, 
    fontWeight: '600' 
  }
});

export default HomeScreen;