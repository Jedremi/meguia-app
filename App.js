import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';  // ✅ Importação adicionada
import i18n from './services/i18n';              // ✅ Importação adicionada

// Screens
import WelcomeScreen from './components/screens/WelcomeScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import HomeScreen from './components/screens/HomeScreen';
import TripsScreen from './components/screens/TripsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import TripDetailsScreen from './components/screens/TripDetailsScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import ResultsScreen from './components/screens/ResultsScreen';
import LoginScreen from './components/screens/LoginScreen';

// Context
import { TravelProvider } from './contexts/TravelContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Trips') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        unmountOnBlur: true,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Trips" component={TripsScreen} options={{ title: 'Minhas Viagens' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>  {/* ✅ Envolvendo com o Provider */}
      <TravelProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Onboarding"
            screenOptions={{
              headerTitleAlign: 'center',
              headerShadowVisible: false,
              headerBackTitleVisible: false,
              contentStyle: { backgroundColor: '#fff' },
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastro', headerBackTitle: '' }} />          
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
            <Stack.Screen 
              name="TripDetails" 
              component={TripDetailsScreen} 
              options={{ 
                title: 'Detalhes da Viagem', 
                headerBackTitle: '', 
                animation: 'slide_from_right' 
              }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TravelProvider>
    </I18nextProvider>
  );
}
