import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../src/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  primaryLight: '#A450FF',
  border: '#2C2C2E',
  google: '#FFFFFF',
};

export default function WelcomeScreen() {
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // Na Web, se voltarmos de um redirect com tokens na URL, o Supabase irá detectar.
    // Ativamos o loading para manter o feedback visual enquanto o RootLayout redireciona.
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token') || hash.includes('error'))) {
        setLoading(true);
        // O RootLayout irá detectar a sessão e redirecionar automaticamente.
        // Se houver erro, o loading irá parar após o timeout de 15s que definimos no handle.
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const isWeb = Platform.OS === 'web';

      const redirectUri = makeRedirectUri({
        scheme: 'myficancasapp',
        path: 'auth/callback',
      });

      console.log(`OAuth: Ambiente=${Platform.OS}, Redirect=${redirectUri}`);

      if (isWeb) {
        // --- FLUXO WEB ---
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUri,
          },
        });

        if (error) throw error;
        // O navegador irá redirecionar, o carregamento para aqui
      } else {
        // --- FLUXO NATIVE (Android/iOS) ---
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUri,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;

        if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

          if (result.type === 'success' && result.url) {
            const parsed = Linking.parse(result.url);
            const access_token = parsed.queryParams?.access_token as string;
            const refresh_token = parsed.queryParams?.refresh_token as string;

            if (access_token) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token: refresh_token || '',
              });

              if (sessionError) throw sessionError;

              // Redireciona para a página principal após o login
              router.replace('/(tabs)');
            } else {
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Erro detalhado no login com Google:', error);

      let errorMessage = 'Não foi possível entrar com Google agora.';
      if (error.message?.includes('provider is not enabled')) {
        errorMessage = 'O login com Google ainda não foi habilitado no painel do Supabase.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erro no Login', errorMessage);
      setLoading(false);
    }
  };

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
              <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
                style={styles.logoCircle}
              >
                <MaterialCommunityIcons name="finance" size={60} color="#FFF" />
              </LinearGradient>
              <View style={styles.logoDecoration} />
            </View>
            <Text style={styles.welcomeTitle}>Bem-vindo ao FinançasApp</Text>
            <Text style={styles.welcomeSubtitle}>
              Sua jornada para a liberdade financeira começa aqui.
            </Text>
          </View>

          {/* --- BOTÕES DE AÇÃO --- */}
          <View style={styles.actionsContainer}>
            {/* Botão Google */}
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Image
                    source={{ uri: 'https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png' }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>Continuar com Google</Text>
                </>
              )}
            </TouchableOpacity>

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
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  logoDecoration: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    zIndex: -1,
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
  googleButton: {
    backgroundColor: '#FFF',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
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
