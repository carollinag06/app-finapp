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

// Importação das stores para gerenciar logout e dados do usuário
import { useAuthStore } from '../../../store/authStore';
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

/**
 * Cabeçalho da tela de Opções
 */
const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Mais Opções</Text>
  </View>
);

/**
 * Item de Menu Individual
 * Renderiza um ícone, título, subtítulo e uma seta de navegação.
 */
const MenuItem = ({ icon, title, subtitle, onPress, color = theme.text, iconType = 'ionicons' }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      {/* Suporte dinâmico para diferentes famílias de ícones */}
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

/**
 * TELA "MAIS" (Menu de Configurações e Perfil)
 * Centraliza atalhos para perfil, cartões, categorias e exportação de dados.
 */
export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const [isDarkMode, setIsDarkMode] = useState(true); // Controle local do tema (simulado)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { user: authUser, logout } = useAuthStore();
  const transactions = useTransactionStore(state => state.transactions);

  /**
   * FUNÇÃO: Sair da conta
   * Exibe alerta de confirmação e limpa o estado global de autenticação.
   */
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

  /**
   * FUNÇÃO: Exportar Dados (CSV)
   * Simula a geração de um relatório com todas as transações cadastradas.
   */
  const handleExportData = () => {
    if (transactions.length === 0) {
      Alert.alert("Aviso", "Não há transações para exportar.");
      return;
    }

    Alert.alert(
      "Dados Exportados",
      `Foram processadas ${transactions.length} transações para o formato CSV.\n\nSimulação de exportação concluída com sucesso!`,
      [{ text: "OK" }]
    );
  };

  /**
   * FUNÇÃO: Sobre o App
   * Exibe informações de versão e créditos.
   */
  const handleAbout = () => {
    Alert.alert(
      "Sobre o FinApp",
      "Versão 1.0.0 (Build 26)\n\nDesenvolvido com React Native & Expo.\n\nSua liberdade financeira começa com o controle total dos seus gastos.",
      [{ text: "Fechar" }]
    );
  };

  // Definição da estrutura do menu por seções
  const menuSections: { title: string, items: MenuItemProps[] }[] = [
    {
      title: 'Minha Conta',
      items: [
        { id: 'profile', title: 'Meu Perfil', subtitle: 'Dados pessoais e segurança', icon: 'person-outline', color: theme.primary, onPress: () => router.push('/profile') },
        { id: 'cards', title: 'Cartões de Crédito', subtitle: 'Limites e faturas', icon: 'card-outline', color: '#2196F3', onPress: () => router.push('/cards') },
      ]
    },
    {
      title: 'Planejamento',
      items: [
        { id: 'categories', title: 'Categorias', subtitle: 'Personalizar gastos e receitas', icon: 'pricetag-outline', color: '#FFEB3B', onPress: () => router.push('/categories') },
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
        { id: 'about', title: 'Sobre o App', icon: 'information-circle-outline', color: theme.textMuted, onPress: handleAbout },
      ]
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.centeredWrapper}>
        <View>
          <Header />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Card do Perfil Rápido: Exibe nome e email no topo do menu */}
          <View>
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
          </View>

          {/* Renderização Dinâmica das Seções do Menu */}
          {menuSections.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuContainer}>
                {section.items.map((item, itemIdx) => (
                  <View key={item.id}>
                    <MenuItem
                      {...item}
                      onPress={item.onPress ? item.onPress : () => Alert.alert("Em breve", `A funcionalidade ${item.title} estará disponível em breve.`)}
                    />
                    {/* Linha divisória entre itens (exceto no último da seção) */}
                    {itemIdx < section.items.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Botão de Logout no final da lista */}
          <View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={theme.danger} />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Versão 1.0.0 (Build 26)</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
