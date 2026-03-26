import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- TEMA ---
const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  primary: '#8A2BE2', // Roxo
  border: '#333333',
  danger: '#F44336',
};

// --- COMPONENTES ---

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Mais Opções</Text>
  </View>
);

const MenuItem = ({ icon, title, subtitle, onPress, color = theme.text, iconType = 'ionicons' }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      {iconType === 'ionicons' && <Ionicons name={icon} size={22} color={color} />}
      {iconType === 'feather' && <Feather name={icon} size={22} color={color} />}
      {iconType === 'material' && <MaterialCommunityIcons name={icon} size={22} color={color} />}
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

  const menuSections = [
    {
      title: 'Minha Conta',
      items: [
        { id: 'profile', title: 'Meu Perfil', subtitle: 'Dados pessoais e segurança', icon: 'person-outline', color: theme.primary },
        { id: 'accounts', title: 'Contas Bancárias', subtitle: 'Gerenciar conexões e saldos', icon: 'wallet-outline', color: '#4CAF50' },
        { id: 'cards', title: 'Cartões de Crédito', subtitle: 'Limites e faturas', icon: 'card-outline', color: '#2196F3' },
      ]
    },
    {
      title: 'Preferências',
      items: [
        { id: 'categories', title: 'Categorias', subtitle: 'Personalizar gastos e receitas', icon: 'pricetag-outline', color: '#FFEB3B' },
        { id: 'notifications', title: 'Notificações', subtitle: 'Alertas de vencimento e metas', icon: 'notifications-outline', color: '#FF9800' },
        { id: 'appearance', title: 'Aparência', subtitle: 'Tema escuro e personalização', icon: 'color-palette-outline', color: '#00BCD4' },
      ]
    },
    {
      title: 'Suporte',
      items: [
        { id: 'help', title: 'Central de Ajuda', icon: 'help-circle-outline', color: theme.textMuted },
        { id: 'about', title: 'Sobre o App', icon: 'information-circle-outline', color: theme.textMuted },
      ]
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Card do Perfil Rápido */}
        <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/login')}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={theme.text} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Carol Silva</Text>
            <Text style={styles.userEmail}>carol@exemplo.com</Text>
          </View>
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Editar</Text>
          </View>
        </TouchableOpacity>

        {/* Seções do Menu */}
        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuContainer}>
              {section.items.map((item, itemIdx) => (
                <View key={item.id}>
                  <MenuItem {...item} />
                  {itemIdx < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Botão Sair */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color={theme.danger} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Versão 1.0.0 (Build 26)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
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
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
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
