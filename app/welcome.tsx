import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  primaryLight: '#A450FF',
  border: '#2C2C2E',
};

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
                source={require('../assets/images/logo.jpeg')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 30,
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    resizeMode: 'contain',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  emailButton: {
    backgroundColor: theme.surface,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  emailButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: theme.textMuted,
    fontSize: 15,
  },
  footerLink: {
    color: theme.primaryLight,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
