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

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[theme.bg, '#1A1A1F', theme.bg]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.content}>
          {/* --- ILUSTRAÇÃO / LOGO --- */}
          <View style={styles.headerContainer}>
            <View style={styles.logoWrapper}>
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

          {/* --- BOTÕES DE AÇÃO --- */}
          <View style={styles.actionsContainer}>
            {/* Botão E-mail */}
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={22} color="#FFF" />
              <Text style={styles.emailButtonText}>Entrar com E-mail</Text>
            </TouchableOpacity>

            {/* Link de Cadastro */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/cadastro')}>
                <Text style={styles.footerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
