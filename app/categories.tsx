import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Category, useCategoryStore } from '../store/categoryStore';

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  danger: '#FF3B30',
  success: '#34C759',
  border: '#2C2C2E',
};

const AVAILABLE_ICONS = [
  'cart', 'home', 'restaurant', 'medkit', 'school', 'airplane',
  'game-controller', 'shirt', 'gift', 'cash', 'card', 'wallet',
  'briefcase', 'business', 'cafe', 'car', 'desktop', 'fitness',
  'football', 'hammer', 'headset', 'laptop', 'musical-notes', 'paw'
];

const AVAILABLE_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF',
  '#5856D6', '#FF2D55', '#8A2BE2', '#A2845E', '#8E8E93', '#E5E5EA'
];

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { categories, addCategory, deleteCategory, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');
  const [newIcon, setNewIcon] = useState(AVAILABLE_ICONS[0]);
  const [newColor, setNewColor] = useState(AVAILABLE_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!newName.trim()) {
      Alert.alert('Aviso', 'Por favor, insira um nome para a categoria.');
      return;
    }

    setLoading(true);
    try {
      await addCategory({
        name: newName.trim(),
        type: newType,
        icon: newIcon,
        color: newColor,
      });

      // Reset form
      setNewName('');
      setIsAdding(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível salvar a categoria.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert('Aviso', 'Categorias padrão não podem ser excluídas.');
      return;
    }

    Alert.alert(
      'Excluir Categoria',
      'Tem certeza que deseja excluir esta categoria? As transações existentes não serão afetadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Não foi possível excluir a categoria.';
              Alert.alert('Erro', errorMessage);
            }
          }
        }
      ]
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={24} color={item.color} />
        </View>
        <View>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryType}>
            {item.type === 'expense' ? 'Despesa' : 'Receita'} {item.is_default ? '• Padrão' : ''}
          </Text>
        </View>
      </View>

      {!item.is_default && (
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.is_default)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorias</Text>
        <TouchableOpacity
          onPress={() => setIsAdding(!isAdding)}
          style={styles.addButton}
        >
          <Ionicons name={isAdding ? "close" : "add"} size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {isAdding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Nova Categoria</Text>

            {/* Tipo */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, newType === 'expense' && styles.typeButtonActiveExpense]}
                onPress={() => setNewType('expense')}
              >
                <Text style={[styles.typeButtonText, newType === 'expense' && styles.typeButtonTextActive]}>Despesa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, newType === 'income' && styles.typeButtonActiveIncome]}
                onPress={() => setNewType('income')}
              >
                <Text style={[styles.typeButtonText, newType === 'income' && styles.typeButtonTextActive]}>Receita</Text>
              </TouchableOpacity>
            </View>

            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Categoria</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Supermercado"
                placeholderTextColor={theme.textMuted}
                value={newName}
                onChangeText={setNewName}
                autoFocus
              />
            </View>

            {/* Ícone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ícone</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                {AVAILABLE_ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.selectorItem, newIcon === icon && styles.selectorItemActive]}
                    onPress={() => setNewIcon(icon)}
                  >
                    <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={24} color={newIcon === icon ? theme.primary : theme.textMuted} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Cor */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cor</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                {AVAILABLE_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorItem,
                      { backgroundColor: color },
                      newColor === color && styles.colorItemActive
                    ]}
                    onPress={() => setNewColor(color)}
                  />
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Salvando...' : 'Salvar Categoria'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="pricetags-outline" size={48} color={theme.textMuted} />
              <Text style={styles.emptyStateText}>Nenhuma categoria encontrada.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  addButton: {
    padding: 4,
  },
  listContainer: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  categoryType: {
    fontSize: 13,
    color: theme.textMuted,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    color: theme.textMuted,
    fontSize: 16,
    marginTop: 16,
  },
  // Form Styles
  formContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActiveExpense: {
    backgroundColor: theme.danger,
  },
  typeButtonActiveIncome: {
    backgroundColor: theme.success,
  },
  typeButtonText: {
    color: theme.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: theme.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    color: theme.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  selectorScroll: {
    flexDirection: 'row',
  },
  selectorItem: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectorItemActive: {
    borderColor: theme.primary,
    backgroundColor: `${theme.primary}20`,
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorItemActive: {
    borderColor: '#FFF',
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});