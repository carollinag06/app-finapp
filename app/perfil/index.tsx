import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importação das stores para gerenciar dados do usuário e resetar o app ao sair
import { useAuthStore } from '../../store/authStore';
import { useCardStore } from '../../store/cardStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useTransactionStore } from '../../store/transactionStore';
import { theme } from '../../src/constants/theme';
import { styles } from './styles';

/**
 * TELA: Perfil do Usuário (ProfileScreen)
 * Permite visualizar e editar dados pessoais, gerenciar categorias e deslogar.
 */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
  // Obtém dados e funções da store global de autenticação
  const { user, logout, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Funções para resetar o estado global de todas as stores (limpeza pós-logout)
  const resetTransactions = useTransactionStore(state => state.reset);
  const resetCards = useCardStore(state => state.reset);
  const resetCategories = useCategoryStore((state) => state.reset);

  // EFEITO: Sincroniza os campos locais com os dados do usuário na store
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Função simulada para troca de foto (Upload não implementado nesta versão)
  const pickImage = async () => {
    Alert.alert("Aviso", "Upload de avatar não disponível nesta versão.");
  };

  /**
   * FUNÇÃO: Atualizar Perfil
   * Valida o nome e chama a store para persistir a mudança.
   */
  const handleUpdateProfile = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome não pode estar vazio.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(name);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro ao Atualizar", "Não foi possível atualizar suas informações no momento.");
    } finally {
      setLoading(false);
    }
  }, [name, updateProfile]);

  /**
   * FUNÇÃO: Sair da Conta (Logout)
   * Confirma a ação e limpa todas as stores para garantir privacidade dos dados.
   */
  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            resetTransactions();
            resetCards();
            resetCategories();
          } catch (error) {
            console.error("Erro ao fazer logout:", error);
            Alert.alert("Erro ao Sair", "Ocorreu um problema ao tentar sair.");
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.centeredWrapper}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading || uploading}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* --- SEÇÃO DE AVATAR --- */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={pickImage}
              disabled={uploading}
            >
              <View style={styles.avatarCircle}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={60} color={theme.primary} />
                )}
                {uploading && (
                  <View style={styles.uploadingOverlay}><ActivityIndicator color="#FFF" /></View>
                )}
              </View>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.userEmail}>{email}</Text>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            
            {/* --- FORMULÁRIO DE EDIÇÃO --- */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome de Exibição</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome"
                    placeholderTextColor={theme.textMuted}
                    value={name}
                    onChangeText={setName}
                    editable={!loading && !uploading}
                  />
                </View>
              </View>

              {/* Botão para Salvar Alterações */}
              <TouchableOpacity
                style={[styles.saveButton, (loading || uploading) && styles.buttonDisabled]}
                onPress={handleUpdateProfile}
                disabled={loading || uploading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar Alterações</Text>}
              </TouchableOpacity>

              {/* Botão de Atalho para Categorias */}
              <TouchableOpacity
                style={[styles.logoutButton, { borderColor: theme.border, marginTop: 8 }]}
                onPress={() => router.push('/categorias/index' as any)}
                disabled={loading || uploading}
              >
                <Ionicons name="pricetags-outline" size={20} color={theme.textMuted} style={{ marginRight: 8 }} />
                <Text style={[styles.logoutButtonText, { color: theme.textMuted }]}>Gerenciar Categorias</Text>
              </TouchableOpacity>

              {/* Botão de Logout */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={loading || uploading}
              >
                <Ionicons name="log-out-outline" size={20} color={theme.danger} style={{ marginRight: 8 }} />
                <Text style={styles.logoutButtonText}>Sair da Conta</Text>
              </TouchableOpacity>
            </View>

          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    </View>
  );
}
