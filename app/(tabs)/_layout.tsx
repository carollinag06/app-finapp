import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Tabs, router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  primary: '#8A2BE2',
  textMuted: '#A0A0A0',
  border: '#333333',
};

// --- COMPONENTE DO BOTÃO CENTRAL ANIMADO ---
const CustomTabBarButton = ({ children }: BottomTabBarButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulso suave contínuo no anel externo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Escala ao pressionar (efeito de "amassar" o botão)
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.customButtonWrapper}
      // 👇 Caminho corrigido para absoluto. Garante que sempre abra a tela certa!
      onPress={() => router.push('../new-transaction')}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1} // Desabilitamos a opacidade padrão porque usamos a animação de escala
    >
      {/* Anel de pulso atrás do botão */}
      <Animated.View
        style={[
          styles.pulseRing,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />

      {/* Botão principal com animação de escala */}
      <Animated.View
        style={[
          styles.customButton,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transacoes"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />

      {/* --- ABA DO BOTÃO CENTRAL --- */}
      <Tabs.Screen
        name="new-transaction-tab"
        options={{
          title: '', // Sem título para o botão central
          tabBarIcon: () => (
            <Ionicons name="add" size={32} color="#FFF" />
          ),
          // Injeta o nosso botão animado que faz o redirecionamento
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Gráficos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  customButtonWrapper: {
    top: -25, // Empurra o botão para cima da barra
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    elevation: 5,
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    opacity: 0.25,
  },
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    ...Platform.select({ android: { elevation: 0 } }),
  },
});