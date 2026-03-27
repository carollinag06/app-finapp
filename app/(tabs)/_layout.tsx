import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Tabs, router } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  primary: '#8A2BE2',
  textMuted: '#A0A0A0',
  border: '#333333',
};

// --- COMPONENTE DO BOTÃO CENTRAL ---
const CustomTabBarButton = ({ children, onPress }: BottomTabBarButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.customButtonWrapper}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.customButton,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  // Aumentamos o padding inferior de forma equilibrada para Android e iOS
  // No Android com botões de navegação (insets.bottom === 0), usamos 12px de segurança.
  // No modo gestos (insets.bottom > 0), usamos o valor do sistema + 4px de respiro.
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 4 : (Platform.OS === 'android' ? 12 : 12);
  const barHeight = 60 + bottomPadding;

  const MAX_WIDTH = 600;
  const isDesktop = screenWidth > MAX_WIDTH;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: barHeight,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          borderTopWidth: 1,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          // Ajustes para desktop
          alignSelf: 'center',
          width: isDesktop ? MAX_WIDTH : '100%',
          position: isDesktop ? 'absolute' : 'relative',
          bottom: isDesktop ? 30 : 0,
          left: isDesktop ? (screenWidth - MAX_WIDTH) / 2 : 0,
          borderRadius: isDesktop ? 30 : 0,
          zIndex: 100,
          borderWidth: isDesktop ? 1 : 0,
          borderColor: theme.border,
        },
        tabBarLabelStyle: {
          fontSize: 11, // Um pouco menor para ficar mais elegante
          fontWeight: '500',
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transacoes"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="new-transaction-tab"
        options={{
          title: '',
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} onPress={() => router.push('/new-transaction')} />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Gráficos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mais"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  customButtonWrapper: {
    top: -18, // Reajustado para a nova altura da barra
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
  },
  customButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});