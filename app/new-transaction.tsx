import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router'; // Para fechar a tela
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importamos a nossa "Caixa Global" (Store)
import { useTransactionStore } from '../store/transactionStore';

// --- TEMA (Sincronizado com Analytics) ---
const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  primaryLight: 'rgba(138, 43, 226, 0.15)',
  border: '#2C2C2E',
  success: '#32D74B',
  successLight: 'rgba(50, 215, 75, 0.15)',
  danger: '#FF453A',
  dangerLight: 'rgba(255, 69, 58, 0.15)',
};

const MAX_WIDTH = 600;

// --- CATEGORIAS ATUALIZADAS (Sincronizado com Analytics) ---
const expenseCategories = [
  { id: '1', name: 'Alimentação', icon: 'fast-food-outline', color: '#FF453A' },
  { id: '2', name: 'Transporte', icon: 'car-outline', color: '#64D2FF' },
  { id: '3', name: 'Moradia', icon: 'home-outline', color: '#FF9F0A' },
  { id: '4', name: 'Saúde', icon: 'heart-outline', color: '#32D74B' },
  { id: '5', name: 'Lazer', icon: 'game-controller-outline', color: '#BF5AF2' },
  { id: '10', name: 'Educação', icon: 'book-outline', color: '#5E5CE6' },
  { id: '11', name: 'Outros', icon: 'ellipsis-horizontal-outline', color: '#8E8E93' },
];

const incomeCategories = [
  { id: '6', name: 'Salário', icon: 'cash-outline', color: '#30D158' },
  { id: '7', name: 'Freelance', icon: 'laptop-outline', color: '#FF375F' },
  { id: '8', name: 'Investimento', icon: 'trending-up-outline', color: '#0A84FF' },
  { id: '9', name: 'Presente', icon: 'gift-outline', color: '#FFD60A' },
];

export default function NewTransactionScreen() {
  const params = useLocalSearchParams();
  const editId = params.id as string;
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const contentWidth = Math.min(screenWidth, MAX_WIDTH);

  // Estados do formulário
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix'>('debit');
  const [recurrence, setRecurrence] = useState<'fixed' | 'variable' | 'installment'>('variable');

  // Puxa as funções do Zustand
  const transactions = useTransactionStore((state) => state.transactions);
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);

  // Carrega os dados se for edição
  useEffect(() => {
    if (editId) {
      const t = transactions.find(t => t.id === editId);
      if (t) {
        setTransactionType(t.type);
        setValue(t.value.toString().replace('.', ','));
        setDescription(t.description);
        setDate(t.date);
        setPaymentMethod(t.paymentMethod || 'debit');
        setRecurrence(t.recurrence || 'variable');

        const categories = t.type === 'expense' ? expenseCategories : incomeCategories;
        const cat = categories.find(c => c.name === t.category);
        if (cat) setSelectedCategory(cat.id);
      }
    }
  }, [editId, transactions]);

  // Define as cores e categorias baseadas no tipo selecionado
  const isExpense = transactionType === 'expense';
  const activeColor = isExpense ? theme.danger : theme.success;
  const currentCategories = isExpense ? expenseCategories : incomeCategories;

  // --- FUNÇÃO PARA SALVAR ---
  const handleSave = () => {
    // 1. Validação básica
    if (!value || !description) {
      Alert.alert("Aviso", "Por favor, preencha o valor e a descrição da transação.");
      return;
    }

    // 2. Converte "50,00" para 50.00 para podermos fazer contas matemáticas
    const numericValue = parseFloat(value.replace('.', '').replace(',', '.'));

    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Aviso", "Por favor, digite um valor válido maior que zero.");
      return;
    }

    // 3. Pega o nome da categoria baseada no ID selecionado
    const selectedCat = currentCategories.find(c => c.id === selectedCategory);
    const categoryName = selectedCat?.name || 'Outros';

    // 4. Se for edição, remove a antiga antes de adicionar a nova
    if (editId) {
      deleteTransaction(editId);
    }

    // 5. Salva no nosso Store (Zustand)
    addTransaction({
      description,
      value: numericValue,
      type: transactionType,
      category: categoryName,
      date,
      paymentMethod,
      recurrence,
    });

    // 6. Fecha o Modal e volta pra tela inicial
    router.back();
  };

  // Formata o valor conforme o usuário digita
  const formatValue = (text: string) => {
    // Remove tudo que não é número
    const cleanValue = text.replace(/\D/g, '');
    if (!cleanValue) {
      setValue('');
      return;
    }

    // Converte para centavos
    const amount = parseInt(cleanValue) / 100;
    const formatted = amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setValue(formatted);
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Transação",
      "Deseja realmente excluir esta transação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", style: "destructive", onPress: () => {
            deleteTransaction(editId);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.centeredWrapper}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* --- HEADER --- */}
          <View style={styles.header}>
            {/* Adicionado router.back() para o botão de fechar funcionar */}
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{editId ? 'Editar Transação' : 'Nova Transação'}</Text>
            {editId ? (
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color={theme.danger} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* --- SELETOR DE TIPO (Despesa / Receita) --- */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, isExpense && { backgroundColor: theme.danger }]}
                onPress={() => {
                  setTransactionType('expense');
                  setSelectedCategory(expenseCategories[0].id);
                }}
              >
                <Text style={[styles.typeText, isExpense && styles.typeTextActive]}>Despesa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, !isExpense && { backgroundColor: theme.success }]}
                onPress={() => {
                  setTransactionType('income');
                  setSelectedCategory(incomeCategories[0].id);
                }}
              >
                <Text style={[styles.typeText, !isExpense && styles.typeTextActive]}>Receita</Text>
              </TouchableOpacity>
            </View>

            {/* --- INPUT DE VALOR (Destacado) --- */}
            <View style={styles.valueContainer}>
              <Text style={styles.valueLabel}>Valor da {isExpense ? 'despesa' : 'receita'}</Text>
              <View style={styles.valueInputWrapper}>
                <Text style={[styles.currencySymbol, { color: activeColor }]}>R$</Text>
                <TextInput
                  style={[styles.valueInput, { color: activeColor }]}
                  placeholder="0,00"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={formatValue}
                  maxLength={13}
                />
              </View>
            </View>

            {/* --- FORMULÁRIO BÁSICO --- */}
            <View style={styles.formSection}>

              {/* Nome / Descrição */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="pricetag-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Almoço de domingo"
                    placeholderTextColor={theme.textMuted}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
              </View>

              {/* Data */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Data</Text>
                <TouchableOpacity style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <Text style={styles.inputText}>{date}</Text>
                  <Ionicons name="chevron-down" size={20} color={theme.textMuted} style={styles.dropdownIcon} />
                </TouchableOpacity>
              </View>

              {/* Meio de Pagamento (Apenas para despesas) */}
              {isExpense && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Meio de Pagamento</Text>
                  <View style={styles.pillsContainer}>
                    <TouchableOpacity
                      style={[styles.pill, paymentMethod === 'debit' && styles.pillActive]}
                      onPress={() => setPaymentMethod('debit')}
                    >
                      <Text style={[styles.pillText, paymentMethod === 'debit' && styles.pillTextActive]}>Débito / Pix</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pill, paymentMethod === 'credit' && styles.pillActive]}
                      onPress={() => setPaymentMethod('credit')}
                    >
                      <Text style={[styles.pillText, paymentMethod === 'credit' && styles.pillTextActive]}>Cartão de Crédito</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Recorrência (Apenas para despesas) */}
              {isExpense && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Recorrência</Text>
                  <View style={styles.pillsContainer}>
                    <TouchableOpacity
                      style={[styles.pill, recurrence === 'variable' && styles.pillActive]}
                      onPress={() => setRecurrence('variable')}
                    >
                      <Text style={[styles.pillText, recurrence === 'variable' && styles.pillTextActive]}>Variável</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pill, recurrence === 'fixed' && styles.pillActive]}
                      onPress={() => setRecurrence('fixed')}
                    >
                      <Text style={[styles.pillText, recurrence === 'fixed' && styles.pillTextActive]}>Fixa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pill, recurrence === 'installment' && styles.pillActive]}
                      onPress={() => setRecurrence('installment')}
                    >
                      <Text style={[styles.pillText, recurrence === 'installment' && styles.pillTextActive]}>Parcelada</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Categorias (Lista Horizontal) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryScroll}
                >
                  {currentCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const catColor = cat.color || theme.textMuted;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryCard,
                          isSelected && { backgroundColor: `${catColor}20`, borderColor: catColor }
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={28}
                          color={isSelected ? catColor : theme.textMuted}
                          style={styles.categoryIcon}
                        />
                        <Text style={[styles.categoryText, isSelected && { color: catColor }]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

            </View>

          </ScrollView>

          {/* --- BOTÃO SALVAR --- */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: activeColor }]}
              activeOpacity={0.8}
              onPress={handleSave} // Adicionada a função aqui
            >
              <Text style={styles.saveButtonText}>{editId ? 'Salvar Alterações' : `Salvar ${isExpense ? 'Despesa' : 'Receita'}`}</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

// --- ESTILOS ---
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
  keyboardView: {
    flex: 1,
  },
  // Header
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
    paddingBottom: 40,
  },

  // Seletor Receita/Despesa
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  typeText: {
    color: theme.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  typeTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  // Input de Valor Destacado
  valueContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    paddingVertical: 24,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 8,
  },
  valueInput: {
    fontSize: 44,
    fontWeight: 'bold',
    minWidth: 160,
    textAlign: 'center',
    letterSpacing: -1,
  },

  // Formulário
  formSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    height: '100%',
  },
  inputText: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
  },
  dropdownIcon: {
    marginLeft: 'auto',
  },

  // Pills (Recorrência e Meio de Pagamento)
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pillActive: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  pillText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: theme.primary,
  },

  // Categorias
  categoryScroll: {
    gap: 12,
    paddingVertical: 8,
  },
  categoryCard: {
    width: 90,
    height: 90,
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  // Rodapé e Botão Salvar
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingTop: 16,
    backgroundColor: theme.bg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  saveButton: {
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});