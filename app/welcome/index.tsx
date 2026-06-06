import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/constants/theme';
import { styles } from './styles';

/**
 * TELA DE BOAS-VINDAS (WelcomeScreen)
 * A primeira tela exibida para usuários não autenticados.
 * Apresenta o app e oferece opções para entrar ou se cadastrar.
 */
export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Define a cor dos ícones da barra de status (hora, bateria) como branco */}
      <StatusBar barStyle="light-content" />
      
      {/* Gradiente de fundo para um visual moderno e profundo */}
      <LinearGradient
        colors={[theme.bg, '#1A1A1F', theme.bg]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.content}>
          {/* --- SEÇÃO SUPERIOR: ILUSTRAÇÃO / LOGO --- */}
          <View style={styles.headerContainer}>
            <View style={styles.logoWrapper}>
              {/* Logo do aplicativo centralizada */}
              <Image
                source={require('../../assets/images/logo.jpeg')}
                style={styles.logoImage}
              />
            </View>
            <Text style={styles.welcomeTitle}>
              Bem-vindo ao FinançasApp
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Sua jornada para a liberdade financeira começa aqui.
            </Text>
          </View>

          {/* --- SEÇÃO INFERIOR: BOTÕES DE AÇÃO --- */}
          <View style={styles.actionsContainer}>
            {/* Botão principal de login via e-mail */}
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => router.push('/login/index' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={22} color="#FFF" />
              <Text style={styles.emailButtonText}>Entrar com E-mail</Text>
            </TouchableOpacity>

            {/* Link secundário para quem ainda não tem conta */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/cadastro/index' as any)}>
                <Text style={styles.footerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
