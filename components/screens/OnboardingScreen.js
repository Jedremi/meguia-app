import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Planeje suas viagens',
      description: 'Encontre os melhores roteiros personalizados para seu estilo de viagem',
      iimage: require('../../assets/images/onboarding1.png')
,
    },
    {
      id: 2,
      title: 'Descubra lugares incríveis',
      description: 'Acesse recomendações exclusivas de hospedagem e atrações',
      image: require('../../assets/images/onboarding2.png'),
    },
    {
      id: 3,
      title: 'Compartilhe suas experiências',
      description: 'Salve e compartilhe seus roteiros com outros viajantes',
      image: require('../../assets/images/onboarding3.png'),
    },
  ];

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('Welcome'); // Ou a tela inicial do seu app
    }
  };

  const skipOnboarding = () => {
    navigation.replace('Welcome');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlide(slideIndex);
        }}
        ref={(ref) => (scrollViewRef = ref)}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Image source={slide.image} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {/* Indicadores de paginação */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentSlide === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Botões de navegação */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goToNextSlide} style={styles.nextButton}>
            <MaterialIcons
              name={currentSlide === slides.length - 1 ? 'check' : 'arrow-forward'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#3498db',
    width: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});

export default OnboardingScreen;