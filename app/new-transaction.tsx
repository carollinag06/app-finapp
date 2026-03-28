import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
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

// --- COMPONENTES MEMOIZADOS PARA PERFORMANCE ---
// React.memo evita re-renders se as props não mudarem

const CategoryItem = memo(({ cat, isSelected, onPress }: any) => {
  const catColor = cat.color || theme.textMuted;
  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        isSelected && { backgroundColor: `${catColor}20`, borderColor: catColor }
      ]}
      onPress={() => onPress(cat.id)}
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
});

const PillButton = memo(({ label, isActive, onPress }: any) => (
  <TouchableOpacity
    style={[styles.pill, isActive && styles.pillActive]}
    onPress={onPress}
  >
    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{label}</Text>
  </TouchableOpacity>
));

export default function NewTransactionScreen() {
  const params = useLocalSearchParams();
  const editId = params.id as string;
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);

  // --- ESTADOS DO FORMULÁRIO ---
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix'>('debit');
  const [recurrence, setRecurrence] = useState<'fixed' | 'variable' | 'installment'>('variable');

  // --- OTIMIZAÇÃO ZUSTAND ---
  // Seletores específicos evitam re-renders quando outras partes do store mudam
  const transactions = useTransactionStore((state) => state.transactions);
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);

  // --- CÁLCULOS MEMOIZADOS (useMemo) ---
  // Recalcula apenas quando transactionType mudar
  const isExpense = useMemo(() => transactionType === 'expense', [transactionType]);
  const activeColor = useMemo(() => isExpense ? theme.danger : theme.success, [isExpense]);
  const currentCategories = useMemo(() => isExpense ? expenseCategories : incomeCategories, [isExpense]);

  // Estilos dinâmicos memoizados
  const containerStyle = useMemo(() => [
    styles.container,
    { paddingTop: insets.top, paddingBottom: insets.bottom }
  ], [insets.top, insets.bottom]);

  // --- CARREGAR DADOS PARA EDIÇÃO ---
  useEffect(() => {
    if (editId) {
      const t = transactions.find(t => t.id === editId);
      if (t) {
        setTransactionType(t.type);
        // Converte o valor numérico (ex: 15.5) para string de centavos (ex: "1550")
        setValue((t.value * 100).toFixed(0));
        setDescription(t.description);

        // Se a data já estiver em ISO, usamos direto. Se for o formato antigo DD/MM/YYYY, convertemos.
        let dateValue = t.date;
        if (t.date.includes('/')) {
          const [d, m, y] = t.date.split('/').map(Number);
          dateValue = new Date(y, m - 1, d).toISOString();
        }
        setDate(dateValue);

        setPaymentMethod(t.paymentMethod || 'debit');
        setRecurrence(t.recurrence || 'variable');

        const categories = t.type === 'expense' ? expenseCategories : incomeCategories;
        const cat = categories.find(c => c.name === t.category);
        if (cat) setSelectedCategory(cat.id);
      }
    }
  }, [editId, transactions]);

  // --- HANDLERS MEMOIZADOS (useCallback) ---
  // useCallback evita que a função seja recriada em cada render

  // Formata o valor apenas para exibição, mantendo o input limpo
  const displayValue = useMemo(() => {
    if (!value) return '0,00';
    const numberValue = Number(value) / 100;
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [value]);

  const formatValue = useCallback((text: string) => {
    // Pegamos apenas os números
    const cleanText = text.replace(/\D/g, '');

    if (!cleanText || cleanText === '0') {
      setValue('');
      return;
    }

    setValue(cleanText);
  }, []);

  const onDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate.toISOString());
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!value) {
      Alert.alert("Aviso", "Por favor, preencha o valor da transação.");
      return;
    }

    // O valor agora é armazenado como centavos inteiros (ex: "1500")
    const numericValue = Number(value) / 100;

    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Aviso", "Por favor, digite um valor válido maior que zero.");
      return;
    }

    const selectedCat = currentCategories.find(c => c.id === selectedCategory);
    const categoryName = selectedCat?.name || 'Outros';
    const finalDescription = description.trim() || categoryName;

    const transactionData = {
      description: finalDescription,
      value: numericValue,
      type: transactionType,
      category: categoryName,
      date,
      paymentMethod,
      recurrence,
    };

    if (editId) {
      updateTransaction(editId, transactionData);
    } else {
      addTransaction(transactionData);
    }

    router.back();
  }, [value, description, transactionType, selectedCategory, date, paymentMethod, recurrence, currentCategories, editId, updateTransaction, addTransaction]);

  const handleDelete = useCallback(() => {
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
  }, [editId, deleteTransaction]);

  const handleTypeChange = useCallback((type: 'expense' | 'income') => {
    setTransactionType(type);
    setSelectedCategory(type === 'expense' ? expenseCategories[0].id : incomeCategories[0].id);
  }, []);

  return (
    <View style={containerStyle}>
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
                onPress={() => handleTypeChange('expense')}
              >
                <Text style={[styles.typeText, isExpense && styles.typeTextActive]}>Despesa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, !isExpense && { backgroundColor: theme.success }]}
                onPress={() => handleTypeChange('income')}
              >
                <Text style={[styles.typeText, !isExpense && styles.typeTextActive]}>Receita</Text>
              </TouchableOpacity>
            </View>

            {/* --- INPUT DE VALOR (Destacado) --- */}
            <TouchableOpacity
              style={styles.valueContainer}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              <Text style={styles.valueLabel}>Valor da {isExpense ? 'despesa' : 'receita'}</Text>

              <View style={styles.valueDisplayRow}>
                <Text style={[styles.currencySymbol, { color: activeColor }]}>R$</Text>
                <Text style={[styles.displayValueText, { color: activeColor }]}>
                  {displayValue}
                </Text>
              </View>

              <View style={styles.valueInputWrapper}>
                <TextInput
                  ref={inputRef}
                  style={styles.hiddenInput}
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={formatValue}
                  maxLength={11}
                  autoFocus={!editId}
                  placeholder="0"
                  placeholderTextColor="transparent"
                  selectionColor={activeColor}
                  caretHidden={true}
                />
                <Text style={styles.helperText}>Toque para digitar o valor</Text>
              </View>
            </TouchableOpacity>

            {/* --- FORMULÁRIO BÁSICO --- */}
            <View style={styles.formSection}>

              {/* Nome / Descrição */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição (Opcional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="pricetag-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={`Ex: ${currentCategories.find(c => c.id === selectedCategory)?.name || 'Gasto'}`}
                    placeholderTextColor={theme.textMuted}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
              </View>

              {/* Data */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Data</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <Text style={styles.inputText}>
                    {new Date(date).toLocaleDateString('pt-BR')}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.textMuted} style={styles.dropdownIcon} />
                </TouchableOpacity>

                {showDatePicker && (
                  <View style={Platform.OS === 'ios' ? styles.datePickerContainer : null}>
                    <DateTimePicker
                      value={new Date(date)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      maximumDate={new Date()}
                      themeVariant="dark"
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.doneButtonText}>Concluído</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Meio de Pagamento (Apenas para despesas) */}
              {isExpense && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Meio de Pagamento</Text>
                  <View style={styles.pillsContainer}>
                    <PillButton
                      label="Débito / Pix"
                      isActive={paymentMethod === 'debit'}
                      onPress={() => setPaymentMethod('debit')}
                    />
                    <PillButton
                      label="Cartão de Crédito"
                      isActive={paymentMethod === 'credit'}
                      onPress={() => setPaymentMethod('credit')}
                    />
                  </View>
                </View>
              )}

              {/* Recorrência (Apenas para despesas) */}
              {isExpense && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Recorrência</Text>
                  <View style={styles.pillsContainer}>
                    <PillButton
                      label="Variável"
                      isActive={recurrence === 'variable'}
                      onPress={() => setRecurrence('variable')}
                    />
                    <PillButton
                      label="Fixa"
                      isActive={recurrence === 'fixed'}
                      onPress={() => setRecurrence('fixed')}
                    />
                    <PillButton
                      label="Parcelada"
                      isActive={recurrence === 'installment'}
                      onPress={() => setRecurrence('installment')}
                    />
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
                  {currentCategories.map((cat) => (
                    <CategoryItem
                      key={cat.id}
                      cat={cat}
                      isSelected={selectedCategory === cat.id}
                      onPress={setSelectedCategory}
                    />
                  ))}
                </ScrollView>
              </View>

            </View>

          </ScrollView>

          {/* --- BOTÃO SALVAR --- */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: activeColor }]}
              activeOpacity={0.8}
              onPress={handleSave}
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
  valueDisplayRow: {
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
  valueInputWrapper: {
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
  // Date Picker iOS
  datePickerContainer: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  doneButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    borderRadius: 12,
    marginTop: 8,
  },
  doneButtonText: {
    color: theme.primary,
    fontWeight: 'bold',
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