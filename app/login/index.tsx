import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Simulação de login (substitua por sua lógica real)
    console.log('Tentando login com:', email, password);

    // Após login bem-sucedido, navegar para a tela principal
    router.replace('/(tabs)'); // Ou para onde quiser após login
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entrar na Conta</Text>
        <View style={styles.placeholder} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
        <Text style={styles.subtitleText}>
          Faça login para acessar sua conta financeira.
        </Text>

        {/* EMAIL INPUT */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* PASSWORD INPUT */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* FORGOT PASSWORD */}
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Esqueceu a senha?</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <LinearGradient
            colors={['#00E5FF', '#0099B3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loginBtnGradient}
          >
            <Text style={styles.loginBtnText}>ENTRAR</Text>
            <Ionicons name="log-in-outline" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupBtn}>
          <Text style={styles.signupText}>Não tem conta? <Text style={styles.signupLink}>Criar conta</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  placeholder: { width: 40 },

  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  welcomeText: { color: '#FFF', fontSize: 28, fontWeight: '900', marginBottom: 8 },
  subtitleText: { color: '#666', fontSize: 16, marginBottom: 40, lineHeight: 24 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 40 },
  forgotText: { color: '#00E5FF', fontSize: 14, fontWeight: '600' },

  footer: { paddingHorizontal: 24, paddingBottom: 40 },
  loginBtn: { marginBottom: 20 },
  loginBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 8,
  },
  loginBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  signupBtn: { alignSelf: 'center' },
  signupText: { color: '#AAA', fontSize: 14 },
  signupLink: { color: '#00E5FF', fontWeight: '600' },
});