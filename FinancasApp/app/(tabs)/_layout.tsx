import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Cores do seu tema para manter o padrão
const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  primary: '#8A2BE2', // Roxo
  textMuted: '#A0A0A0',
  border: '#333333'
};

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{
        headerShown: false, // Esconde o cabeçalho feio padrão do topo
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 60, // Altura da barra
          paddingBottom: 8, // Dá um respiro para os textos
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary, // Cor do ícone selecionado
        tabBarInactiveTintColor: theme.textMuted, // Cor do ícone inativo
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      {/* PRIMEIRA ABA: Tela Inicial (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* SEGUNDA ABA: Transações */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transações',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      
      {/* TERCEIRA ABA (Exemplo: Estatísticas) */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Estatísticas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}