import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const PhotoUploader = ({ onPhotoUpload }) => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
      onPhotoUpload(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <MaterialIcons name="add-a-photo" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 15
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5
  }
});

export default PhotoUploader;