import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router'; // Para fechar a tela
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Importamos a nossa "Caixa Global" (Store)
import { useTransactionStore } from '../store/transactionStore';

// --- TEMA ---
const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  primary: '#8A2BE2', // Roxo
  border: '#333333',
  success: '#4CAF50', // Verde (Receita)
  danger: '#F44336',  // Vermelho (Despesa)
};

// --- CATEGORIAS MOCKADAS ---
const expenseCategories = [
  { id: '1', name: 'Alimentação', icon: 'restaurant-outline' },
  { id: '2', name: 'Transporte', icon: 'bus-outline' },
  { id: '3', name: 'Moradia', icon: 'home-outline' },
  { id: '4', name: 'Saúde', icon: 'medkit-outline' },
  { id: '5', name: 'Lazer', icon: 'game-controller-outline' },
];

const incomeCategories = [
  { id: '6', name: 'Salário', icon: 'cash-outline' },
  { id: '7', name: 'Freelance', icon: 'laptop-outline' },
  { id: '8', name: 'Investimento', icon: 'trending-up-outline' },
  { id: '9', name: 'Presente', icon: 'gift-outline' },
];

export default function NewTransactionScreen() {
  const params = useLocalSearchParams();
  const editId = params.id as string;

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
    const numericValue = parseFloat(value.replace(',', '.'));

    if (isNaN(numericValue)) {
      Alert.alert("Aviso", "Por favor, digite um valor numérico válido.");
      return;
    }

    // 3. Pega o nome da categoria baseada no ID selecionado
    const categoryName = currentCategories.find(c => c.id === selectedCategory)?.name || 'Outros';

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />

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
                onChangeText={setValue}
                maxLength={10}
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
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryCard,
                        isSelected && { backgroundColor: activeColor, borderColor: activeColor }
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={24}
                        color={isSelected ? '#FFF' : theme.textMuted}
                        style={styles.categoryIcon}
                      />
                      <Text style={[styles.categoryText, isSelected && { color: '#FFF' }]}>
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
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Seletor Receita/Despesa
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
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
    marginBottom: 40,
  },
  valueLabel: {
    color: theme.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  valueInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 8,
  },
  valueInput: {
    fontSize: 48,
    fontWeight: 'bold',
    minWidth: 120,
    textAlign: 'center',
  },

  // Formulário
  formSection: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    height: 56,
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
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 8,
  },
  pillActive: {
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
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
    paddingVertical: 4,
  },
  categoryCard: {
    width: 90,
    height: 90,
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '500',
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
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});