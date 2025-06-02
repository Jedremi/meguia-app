import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Validação básica
    if (!name || !email || !phone || !password || !confirmPassword) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    
    // Navegar para a tela principal após cadastro
    navigation.navigate('Home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crie sua conta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirme sua senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#3498db',
  },
});

export default RegisterScreen;