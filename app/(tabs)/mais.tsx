import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { useBudgetStore } from '../../store/budgetStore';
import { useCardStore } from '../../store/cardStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useTransactionStore } from '../../store/transactionStore';

// --- TEMA ---
const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2', // Roxo
  border: '#2C2C2E',
  danger: '#FF453A',
};

interface MenuItemProps {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
  iconType?: 'ionicons' | 'feather' | 'material';
}

const MAX_WIDTH = 600; // Largura máxima para desktop

// --- COMPONENTES ---

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Mais Opções</Text>
  </View>
);

const MenuItem = ({ icon, title, subtitle, onPress, color = theme.text, iconType = 'ionicons' }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      {iconType === 'ionicons' && <Ionicons name={icon as any} size={22} color={color} />}
      {iconType === 'feather' && <Feather name={icon as any} size={22} color={color} />}
      {iconType === 'material' && <MaterialCommunityIcons name={icon as any} size={22} color={color} />}
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
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const transactions = useTransactionStore(state => state.transactions);
  const resetTransactions = useTransactionStore(state => state.reset);
  const resetBudgets = useBudgetStore(state => state.reset);
  const resetCards = useCardStore(state => state.reset);
  const resetCategories = useCategoryStore(state => state.resetCategories);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          resetTransactions();
          resetBudgets();
          resetCards();
          resetCategories();
          router.replace('/login');
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
        { id: 'budget', title: 'Metas e Orçamentos', subtitle: 'Definir limites de gastos', icon: 'flag-outline', color: '#FFD60A', onPress: () => router.push('/budget') },
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
        <Animated.View entering={FadeInUp.duration(800)}>
          <Header />
        </Animated.View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Card do Perfil Rápido */}
          <Animated.View entering={FadeInDown.delay(200).duration(800)}>
            <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/profile')}>
              <View style={styles.avatar}>
                {user?.user_metadata?.avatar_url ? (
                  <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={32} color={theme.text} />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.user_metadata?.full_name || 'Usuário FinApp'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'carregando...'}</Text>
              </View>
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>Editar</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Seções do Menu */}
          {menuSections.map((section, idx) => (
            <Animated.View key={idx} entering={FadeInDown.delay(400 + idx * 100).duration(800)} style={styles.section}>
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
          <Animated.View entering={FadeInDown.delay(800).duration(800)}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  centeredWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  userEmail: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 2,
  },
  editBadge: {
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editBadgeText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textMuted,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuContainer: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 72,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  logoutText: {
    color: theme.danger,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 24,
  }
});
