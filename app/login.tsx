import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';

// --- TEMA ---
const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2', // Roxo
  border: '#2C2C2E',
  danger: '#FF453A',
};

const MAX_WIDTH = 600; // Largura máxima para desktop

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.error("Erro no Login:", error);
      let errorMessage = "Ocorreu um erro ao tentar entrar. Verifique sua conexão.";

      // Mapeamento de erros específicos do Supabase
      const errorMsg = error.message.toLowerCase();

      if (errorMsg.includes("invalid login credentials")) {
        errorMessage = "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
      } else if (errorMsg.includes("email not confirmed")) {
        errorMessage = "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada para ativar a conta.";
      } else if (errorMsg.includes("rate limit exceeded")) {
        errorMessage = "Muitas tentativas seguidas. Por favor, aguarde alguns minutos.";
      } else if (errorMsg.includes("user not found")) {
        errorMessage = "Não encontramos uma conta com este e-mail. Verifique se digitou corretamente ou crie uma nova conta.";
      } else if (errorMsg.includes("invalid email")) {
        errorMessage = "O formato do e-mail digitado é inválido.";
      }

      Alert.alert('Erro no Login', errorMessage);
      setLoading(false);
    } else {
      // O RootLayout irá detectar a sessão e redirecionar automaticamente para /(tabs)
      // Não chamamos router.replace aqui para evitar conflitos de navegação inicial
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Aviso', 'Por favor, insira seu e-mail para recuperar a senha.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

    if (error) {
      console.error("Erro ao recuperar senha:", error);
      Alert.alert('Erro na Recuperação', error.message || "Não foi possível enviar o e-mail de recuperação no momento.");
    } else {
      Alert.alert('Sucesso', 'Um e-mail de recuperação foi enviado para o seu endereço. Verifique também sua caixa de spam.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.centeredWrapper}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* --- HEADER / LOGO --- */}
          <Animated.View
            entering={FadeInUp.duration(720)}
            style={styles.headerContainer}
          >
            <Image
              source={require('../assets/images/logo.jpeg')}
              style={styles.logoImage}
            />
            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitle}>Faça login para gerenciar suas finanças</Text>
          </Animated.View>

          {/* --- FORMULÁRIO --- */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(720)}
            style={styles.formContainer}
          >
            {/* Input de E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="exemplo@email.com"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  style={styles.input}
                  placeholder="Sua senha secreta"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Esqueceu a senha */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {/* Botão Entrar */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* --- RODAPÉ / CADASTRAR --- */}
          <Animated.View entering={FadeInDown.delay(400).duration(720)} style={styles.footerContainer}>
            <Text style={styles.footerText}>Ainda não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/cadastro')} disabled={loading}>
              <Text style={styles.registerText}>Cadastre-se</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  centeredWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textMuted,
    textAlign: 'center',
  },
  // Form
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  // Ações
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: theme.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  // Footer
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: theme.textMuted,
    fontSize: 15,
  },
  registerText: {
    color: theme.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
});