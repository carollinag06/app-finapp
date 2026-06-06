import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { router, Tabs } from 'expo-router';
import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../src/constants/theme';

/**
 * COMPONENTE DO BOTÃO CENTRAL (CustomTabBarButton)
 * Este é o botão de "+" estilizado que fica no centro da barra de abas.
 * Ele flutua um pouco acima da barra para destaque visual.
 */
const CustomTabBarButton = ({ onPress }: BottomTabBarButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.customButtonWrapper}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.customButton}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

/**
 * TAB LAYOUT (Barra de Navegação Inferior)
 * Define as abas principais do app que ficam visíveis após o login.
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets(); // Ajustes para o notch/área segura
  const { width: screenWidth } = useWindowDimensions();

  // Cálculos dinâmicos para garantir que a barra fique bem posicionada em qualquer celular
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 4 : (Platform.OS === 'android' ? 12 : 12);
  const barHeight = 60 + bottomPadding;

  const MAX_WIDTH = 600; // Limite para visualização em tablets ou desktop
  const isDesktop = screenWidth > MAX_WIDTH;

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Oculta o cabeçalho padrão do React Navigation
        tabBarActiveTintColor: theme.primary, // Cor do ícone quando selecionado
        tabBarInactiveTintColor: theme.textMuted, // Cor do ícone quando não selecionado
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: barHeight,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          borderTopWidth: 1,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          elevation: 0, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          
          // Lógica para centralizar a barra caso a tela seja muito larga (Desktop/Tablet)
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
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 4,
        },
        // Força o fundo da barra a ter a cor do tema, evitando transparências indesejadas
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: theme.surface }} />
        ),
      }}
    >
      {/* ABA 1: Dashboard (Início) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ABA 2: Extrato (Lista de Transações) */}
      <Tabs.Screen
        name="transacoes/index"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ABA CENTRAL: Botão de adicionar nova transação */}
      <Tabs.Screen
        name="aba-nova-transacao"
        options={{
          title: '',
          tabBarButton: (props: BottomTabBarButtonProps) => (
            <CustomTabBarButton {...props} onPress={() => router.push('/nova-transacao' as any)} />
          ),
        }}
      />

      {/* ABA 3: Análises (Gráficos) */}
      <Tabs.Screen
        name="analises/index"
        options={{
          title: 'Gráficos',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="pie-chart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ABA 4: Mais Opções (Menu de Configurações) */}
      <Tabs.Screen
        name="mais/index"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ABA OCULTA: Metas (Acessada via atalhos, não na barra) */}
      <Tabs.Screen
        name="metas/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

// --- ESTILOS DO BOTÃO FLUTUANTE ---
const styles = StyleSheet.create({
  customButtonWrapper: {
    top: -18, // Faz o botão "subir" para fora da barra
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
