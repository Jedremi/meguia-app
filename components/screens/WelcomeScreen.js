import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomeScreen = ({ navigation }) => {

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const isFirstLaunch = await AsyncStorage.getItem('@viewedOnboarding');
        if (isFirstLaunch === null) {
          navigation.replace('Onboarding');
          await AsyncStorage.setItem('@viewedOnboarding', 'true');
        }
      } catch (error) {
        console.error('Erro ao verificar o onboarding:', error);
      }
    };
    checkFirstLaunch();
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/logomeguia.png')} 
        style={styles.logo}
      />
      <Text style={styles.title}>Bem-vindo ao MeGuia</Text>
      <Text style={styles.subtitle}>Seu guia de viagem personalizado</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: '#7f8c8d',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
