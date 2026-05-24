import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useBudgetStore } from '../../../store/budgetStore';
import { useCardStore } from '../../../store/cardStore';
import { useCategoryStore } from '../../../store/categoryStore';
import { useTransactionStore } from '../../../store/transactionStore';
import { theme } from '../../../src/constants/theme';
import { styles } from './styles';

interface MenuItemProps {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
  iconType?: 'ionicons' | 'feather' | 'material';
}

// --- COMPONENTES ---

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Mais Opções</Text>
  </View>
);

const MenuItem = ({ icon, title, subtitle, onPress, color = theme.text, iconType = 'ionicons' }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      {iconType === 'ionicons' && <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color={color} />}
      {iconType === 'feather' && <Feather name={icon as keyof typeof Feather.glyphMap} size={22} color={color} />}
      {iconType === 'material' && <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={22} color={color} />}
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuTitle, { color }]}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color={theme.border} />
  </TouchableOpacity>
);

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { user: authUser, logout } = useAuthStore();
  const transactions = useTransactionStore(state => state.transactions);

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
        }
      }
    ]);
  };

  const handleExportData = () => {
    if (transactions.length === 0) {
      Alert.alert("Aviso", "Não há transações para exportar.");
      return;
    }

    // Em um app real usaríamos expo-sharing ou expo-file-system
    // Por enquanto vamos simular o sucesso
    Alert.alert(
      "Dados Exportados",
      `Foram processadas ${transactions.length} transações para o formato CSV.\n\nSimulação de exportação concluída com sucesso!`,
      [{ text: "OK" }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "Sobre o FinApp",
      "Versão 1.0.0 (Build 26)\n\nDesenvolvido com React Native & Expo.\n\nSua liberdade financeira começa com o controle total dos seus gastos.",
      [{ text: "Fechar" }]
    );
  };

  const menuSections: { title: string, items: MenuItemProps[] }[] = [
    {
      title: 'Minha Conta',
      items: [
        { id: 'profile', title: 'Meu Perfil', subtitle: 'Dados pessoais e segurança', icon: 'person-outline', color: theme.primary, onPress: () => router.push('/profile') },
        { id: 'accounts', title: 'Contas Bancárias', subtitle: 'Gerenciar conexões e saldos', icon: 'wallet-outline', color: '#4CAF50' },
        { id: 'cards', title: 'Cartões de Crédito', subtitle: 'Limites e faturas', icon: 'card-outline', color: '#2196F3', onPress: () => router.push('/cards') },
      ]
    },
    {
      title: 'Planejamento',
      items: [
        { id: 'metas', title: 'Metas e Orçamentos', subtitle: 'Definir limites de gastos', icon: 'flag-outline', color: '#FFD60A', onPress: () => router.push('/metas') },
        { id: 'categories', title: 'Categorias', subtitle: 'Personalizar gastos e receitas', icon: 'pricetag-outline', color: '#FFEB3B', onPress: () => router.push('/categories') },
        {
          id: 'notifications', title: 'Notificações', subtitle: notificationsEnabled ? 'Ativadas' : 'Desativadas', icon: notificationsEnabled ? 'notifications-outline' : 'notifications-off-outline', color: '#FF9800', onPress: () => {
            setNotificationsEnabled(!notificationsEnabled);
            Alert.alert("Notificações", `As notificações foram ${!notificationsEnabled ? 'ativadas' : 'desativadas'}.`);
          }
        },
      ]
    },
    {
      title: 'Preferências',
      items: [
        { id: 'appearance', title: 'Tema Escuro', subtitle: isDarkMode ? 'Ativado' : 'Desativado', icon: isDarkMode ? 'moon-outline' : 'sunny-outline', color: '#9C27B0', onPress: () => setIsDarkMode(!isDarkMode) },
        { id: 'export', title: 'Exportar Dados', subtitle: 'Baixar relatório em CSV', icon: 'download-outline', color: '#00BCD4', onPress: handleExportData },
      ]
    },
    {
      title: 'Suporte',
      items: [
        { id: 'help', title: 'Central de Ajuda', icon: 'help-circle-outline', color: theme.textMuted },
        { id: 'about', title: 'Sobre o App', icon: 'information-circle-outline', color: theme.textMuted, onPress: handleAbout },
      ]
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.centeredWrapper}>
        <Animated.View entering={FadeInUp.duration(650)}>
          <Header />
        </Animated.View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Card do Perfil Rápido */}
          <Animated.View entering={FadeInDown.delay(200).duration(650)}>
            <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/profile')}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color={theme.text} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{authUser?.name || 'Usuário FinApp'}</Text>
                <Text style={styles.userEmail}>{authUser?.email || 'carregando...'}</Text>
              </View>
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>Editar</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Seções do Menu */}
          {menuSections.map((section, idx) => (
            <Animated.View key={idx} entering={FadeInDown.delay(400 + idx * 100).duration(650)} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuContainer}>
                {section.items.map((item, itemIdx) => (
                  <View key={item.id}>
                    <MenuItem
                      {...item}
                      onPress={item.onPress ? item.onPress : () => Alert.alert("Em breve", `A funcionalidade ${item.title} estará disponível em breve.`)}
                    />
                    {itemIdx < section.items.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </Animated.View>
          ))}

          {/* Botão Sair */}
          <Animated.View entering={FadeInDown.delay(800).duration(650)}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={theme.danger} />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Versão 1.0.0 (Build 26)</Text>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}
