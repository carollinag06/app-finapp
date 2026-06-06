import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importação da store de autenticação para gerenciar o login
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../src/constants/theme';
import { styles } from './styles';

/**
 * TELA DE LOGIN (LoginScreen)
 * Permite que usuários existentes acessem o aplicativo.
 */
export default function LoginScreen() {
  // Estados locais para controlar os campos de entrada e UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Alterna visibilidade da senha
  const [loading, setLoading] = useState(false); // Controla o indicador de carregamento

  const insets = useSafeAreaInsets(); // Ajuste de margens para notch/barras de sistema
  const { login } = useAuthStore(); // Função de login da store global

  /**
   * FUNÇÃO: Executar Login
   * Valida os campos e tenta autenticar o usuário através da store.
   */
  const handleLogin = async () => {
    // Validação simples de campos vazios
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      // Chama a função de login da store global
      await login(email.trim(), password);
      // Nota: O RootLayout redirecionará para /(tabs) automaticamente se o login for bem-sucedido
    } catch (error: any) {
      console.error("Erro no Login:", error);
      Alert.alert('Erro no Login', "Ocorreu um erro ao tentar entrar. Verifique seus dados.");
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.centeredWrapper}>
        {/* Ajusta a posição dos elementos quando o teclado é exibido */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* --- CABEÇALHO / IDENTIDADE VISUAL --- */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/images/logo.jpeg')}
              style={styles.logoImage}
            />
            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitle}>Faça login para gerenciar suas finanças</Text>
          </View>

          {/* --- FORMULÁRIO DE ACESSO --- */}
          <View style={styles.formContainer}>
            {/* CAMPO: E-mail */}
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

            {/* CAMPO: Senha */}
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

            {/* BOTÃO DE AÇÃO: Entrar */}
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
          </View>

          {/* --- RODAPÉ: Redirecionamento para Cadastro --- */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Ainda não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/cadastro')} disabled={loading}>
              <Text style={styles.registerText}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
