import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBudgetStore } from '../store/budgetStore';
import { useCategoryStore } from '../store/categoryStore';

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  primaryLight: 'rgba(138, 43, 226, 0.15)',
  border: '#2C2C2E',
  danger: '#FF453A',
};

export default function NewBudgetScreen() {
  const params = useLocalSearchParams();
  const editId = params.id as string;
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const { categories, fetchCategories } = useCategoryStore();
  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(''); // Raw numbers string
  const [icon, setIcon] = useState('wallet-outline');
  const [color, setColor] = useState(theme.primary);
  const [loading, setLoading] = useState(false);

  // Inicializar com a primeira categoria se disponível
  useEffect(() => {
    if (!category && expenseCategories.length > 0) {
      setCategory(expenseCategories[0].name);
      setIcon(expenseCategories[0].icon);
      setColor(expenseCategories[0].color);
    }
  }, [expenseCategories, category]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const budgets = useBudgetStore((state) => state.budgets);
  const addBudget = useBudgetStore((state) => state.addBudget);
  const updateBudget = useBudgetStore((state) => state.updateBudget);
  const deleteBudget = useBudgetStore((state) => state.deleteBudget);

  const displayValue = useMemo(() => {
    if (!amount) return '0,00';
    const numberValue = Number(amount) / 100;
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [amount]);

  useEffect(() => {
    if (editId) {
      const b = budgets.find(b => b.id === editId);
      if (b) {
        setCategory(b.category);
        setAmount((b.amount * 100).toFixed(0));
        setIcon(b.icon || 'wallet-outline');
        setColor(b.color || theme.primary);
      }
    }
  }, [editId, budgets]);

  const handleSave = useCallback(async () => {
    const numericAmount = Number(amount) / 100;

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Aviso", "Por favor, digite um valor válido.");
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        await updateBudget(editId, { category, amount: numericAmount, icon, color });
      } else {
        await addBudget({ category, amount: numericAmount, icon, color, period: 'monthly' });
      }
      router.back();
    } catch (err) {
      console.error("Erro ao salvar meta:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro inesperado ao salvar sua meta.";
      Alert.alert("Erro ao Salvar", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [amount, category, icon, color, editId, addBudget, updateBudget]);

  const formatValue = (text: string) => {
    const cleanValue = text.replace(/\D/g, '');
    if (!cleanValue || cleanValue === '0') {
      setAmount('');
      return;
    }
    setAmount(cleanValue);
  };

  const handleDelete = () => {
    Alert.alert("Excluir Meta", "Deseja realmente excluir esta meta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive", onPress: async () => {
          setLoading(true);
          try {
            await deleteBudget(editId);
            router.back();
          } catch (err) {
            console.error("Erro ao excluir meta:", err);
            const errorMessage = err instanceof Error ? err.message : "Não foi possível excluir a meta no momento.";
            Alert.alert("Erro ao Excluir", errorMessage);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} disabled={loading}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editId ? 'Editar Meta' : 'Nova Meta'}</Text>
          {editId ? (
            <TouchableOpacity onPress={handleDelete} disabled={loading}>
              <Ionicons name="trash-outline" size={24} color={theme.danger} />
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.valueContainer}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
            disabled={loading}
          >
            <Text style={styles.valueLabel}>Valor do Orçamento Mensal</Text>
            <View style={styles.valueInputWrapper}>
              <Text style={[styles.currencySymbol, { color: theme.primary }]}>R$</Text>
              <Text style={[styles.displayValueText, { color: theme.primary }]}>
                {displayValue}
              </Text>
            </View>
            <View style={styles.hiddenInputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                value={amount}
                onChangeText={formatValue}
                maxLength={11}
                autoFocus={!editId}
                placeholder="0"
                placeholderTextColor="transparent"
                caretHidden={true}
                editable={!loading}
              />
              <Text style={styles.helperText}>Toque para digitar o valor</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.label}>Selecione a Categoria</Text>
            <View style={styles.categoryGrid}>
              {expenseCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryCard,
                      isSelected && { backgroundColor: `${cat.color}20`, borderColor: cat.color }
                    ]}
                    onPress={() => {
                      setCategory(cat.name);
                      setIcon(cat.icon);
                      setColor(cat.color);
                    }}
                    disabled={loading}
                  >
                    <Ionicons
                      name={cat.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={isSelected ? cat.color : theme.textMuted}
                    />
                    <Text style={[styles.categoryText, isSelected && { color: cat.color }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Orçamento</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: theme.surface,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  valueLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueInputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
    opacity: 0.8,
  },
  displayValueText: {
    fontSize: 54,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  hiddenInputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  helperText: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryText: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  saveButton: {
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  danger: {
    color: '#FF453A',
  }
});

