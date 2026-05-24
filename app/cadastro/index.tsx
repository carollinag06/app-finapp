import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../src/constants/theme';
import { styles } from './styles';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const insets = useSafeAreaInsets();
  const { register } = useAuthStore();

  // Refs para navegação entre inputs
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleRegister = useCallback(async () => {
    // Validações básicas
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      // O RootLayout redirecionará para /(tabs) automaticamente
    } catch (error: any) {
      console.error("Erro no Cadastro:", error);
      Alert.alert("Erro no Cadastro", "Não foi possível realizar o cadastro no momento.");
      setLoading(false);
    }
  }, [name, email, password, confirmPassword]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.centeredWrapper}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* --- HEADER --- */}
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>

              <View style={styles.titleWrapper}>
                <Text style={styles.title}>Criar Conta</Text>
                <Text style={styles.subtitle}>Comece a organizar sua vida financeira agora mesmo.</Text>
              </View>
            </View>

            {/* --- FORMULÁRIO --- */}
            <View style={styles.formContainer}>

              {/* Input de Nome */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome completo</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome"
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Input de E-mail */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    ref={emailRef}
                    style={styles.input}
                    placeholder="exemplo@email.com"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Input de Senha */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Crie uma senha forte"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                    blurOnSubmit={false}
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={loading}>
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={theme.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Input de Confirmar Senha */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Senha</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.input}
                    placeholder="Repita sua senha"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon} disabled={loading}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={theme.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botão Cadastrar */}
              <TouchableOpacity
                style={[styles.registerButton, loading && styles.buttonDisabled]}
                activeOpacity={0.8}
                onPress={handleRegister}
                disabled={loading}
              >{loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.registerButtonText}>Criar minha conta</Text>
              )}
              </TouchableOpacity>
            </View>

            {/* --- RODAPÉ / LOGIN --- */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Já tem uma conta?{' '}
                <Text
                  style={styles.loginText}
                  onPress={() => router.push('/login')}
                >
                  Entrar
                </Text>
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
