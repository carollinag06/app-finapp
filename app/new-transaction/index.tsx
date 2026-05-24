import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCardStore } from '../../store/cardStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useTransactionStore } from '../../store/transactionStore';
import { theme } from '../../src/constants/theme';
import { PillButton } from '../../src/components/PillButton';
import { CategoryItem } from '../../src/components/CategoryItem';
import { formatDate } from '../../src/utils/format';
import { styles } from './styles';

export default function NewTransactionScreen() {
  const params = useLocalSearchParams();
  const editId = params.id as string;
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  // --- ESTADOS DO FORMULÁRIO ---
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix'>('debit');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<'fixed' | 'variable' | 'installment'>('variable');
  const [installmentsCount, setInstallmentsCount] = useState('2');
  const [loading, setLoading] = useState(false);

  // --- OTIMIZAÇÃO ZUSTAND ---
  // Seletores específicos evitam re-renders quando outras partes do store mudam
  const transactions = useTransactionStore((state) => state.transactions);
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const addTransactions = useTransactionStore((state) => state.addTransactions);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const deleteTransactionsByGroupId = useTransactionStore((state) => state.deleteTransactionsByGroupId);

  const cards = useCardStore((state) => state.cards);

  const { categories } = useCategoryStore();

  // --- CÁLCULOS MEMOIZADOS (useMemo) ---
  // Recalcula apenas quando transactionType mudar
  const isExpense = useMemo(() => transactionType === 'expense', [transactionType]);
  const activeColor = useMemo(() => isExpense ? theme.danger : theme.success, [isExpense]);
  const currentCategories = useMemo(() => categories.filter(c => c.type === transactionType), [categories, transactionType]);

  // Garantir que a categoria selecionada seja válida para o tipo atual
  useEffect(() => {
    if (currentCategories.length > 0 && !currentCategories.find(c => c.id === selectedCategory)) {
      setSelectedCategory(currentCategories[0].id);
    }
  }, [currentCategories, selectedCategory]);

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
        setSelectedCardId(t.cardId || null);
        setRecurrence(t.recurrence || 'variable');

        const cat = categories.find(c => c.name === t.category && c.type === t.type);
        if (cat) setSelectedCategory(cat.id);
      }
    }
  }, [editId, transactions, categories]);

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

  const onDateChange = useCallback((_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate.toISOString());
    }
  }, []);

  const handleSave = useCallback(async () => {
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
      paymentMethod: paymentMethod,
      cardId: paymentMethod === 'credit' ? selectedCardId || undefined : undefined,
      recurrence,
    };

    setLoading(true);

    try {
      if (editId) {
        await updateTransaction(editId, transactionData);
      } else if (recurrence === 'installment' && isExpense) {
        const numInstallments = parseInt(installmentsCount);
        if (isNaN(numInstallments) || numInstallments <= 1) {
          Alert.alert("Aviso", "Por favor, digite um número de parcelas válido (mínimo 2).");
          return;
        }

        const installmentValue = Number((numericValue / numInstallments).toFixed(2));
        const transactionsToSave = [];
        const baseDate = new Date(date);
        const originalDay = baseDate.getDate();
        const installmentGroupId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        for (let i = 0; i < numInstallments; i++) {
          const installmentDate = new Date(baseDate);
          installmentDate.setMonth(baseDate.getMonth() + i);

          // Se o dia mudou (ex: 31 de Março -> 1 de Maio ao adicionar 1 mês), 
          // voltamos para o último dia do mês correto (30 de Abril)
          if (installmentDate.getDate() !== originalDay && i > 0) {
            installmentDate.setDate(0);
          }

          // Ajuste na última parcela para compensar arredondamentos
          let currentInstallmentValue = installmentValue;
          if (i === numInstallments - 1) {
            const totalSoFar = installmentValue * (numInstallments - 1);
            currentInstallmentValue = Number((numericValue - totalSoFar).toFixed(2));
          }

          transactionsToSave.push({
            ...transactionData,
            value: currentInstallmentValue,
            date: installmentDate.toISOString(),
            description: `${finalDescription} (${i + 1}/${numInstallments})`,
            installmentNumber: i + 1,
            installmentsCount: numInstallments,
            installmentGroupId,
          });
        }
        await addTransactions(transactionsToSave);
      } else {
        await addTransaction(transactionData);
      }

      router.back();
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro inesperado ao salvar a transação. Verifique sua conexão.";
      Alert.alert("Erro ao Salvar", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [value, description, transactionType, selectedCategory, date, paymentMethod, selectedCardId, recurrence, currentCategories, editId, updateTransaction, addTransaction, addTransactions, installmentsCount]);

  const handleDelete = useCallback(() => {
    const t = transactions.find(t => t.id === editId);
    const isInstallment = t?.recurrence === 'installment' && t?.installmentGroupId;

    if (isInstallment) {
      Alert.alert(
        "Excluir Parcelas",
        "Esta transação faz parte de um parcelamento. O que deseja excluir?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Apenas esta",
            onPress: async () => {
              setLoading(true);
              try {
                await deleteTransaction(editId);
                router.back();
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao excluir transação";
                Alert.alert("Erro", errorMessage);
              } finally {
                setLoading(false);
              }
            }
          },
          {
            text: "Todas as parcelas",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              try {
                await deleteTransactionsByGroupId(t.installmentGroupId!);
                router.back();
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao excluir parcelas";
                Alert.alert("Erro", errorMessage);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Excluir Transação",
        "Deseja realmente excluir esta transação?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir", style: "destructive", onPress: async () => {
              setLoading(true);
              try {
                await deleteTransaction(editId);
                router.back();
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao excluir transação";
                Alert.alert("Erro", errorMessage);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    }
  }, [editId, deleteTransaction, deleteTransactionsByGroupId, transactions]);

  const handleTypeChange = useCallback((type: 'expense' | 'income') => {
    setTransactionType(type);
    const typeCats = categories.filter(c => c.type === type);
    if (typeCats.length > 0) {
      setSelectedCategory(typeCats[0].id);
    }
  }, [categories]);

  return (
    <View style={containerStyle}>
      <View style={styles.centeredWrapper}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* --- HEADER --- */}
          <View style={styles.header}>
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
                    {formatDate(date, "dd 'de' MMMM 'de' yyyy")}
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
                      onPress={() => {
                        setPaymentMethod('debit');
                        if (recurrence === 'installment') setRecurrence('variable');
                      }}
                    />
                    <PillButton
                      label="Cartão de Crédito"
                      isActive={paymentMethod === 'credit'}
                      onPress={() => setPaymentMethod('credit')}
                    />
                  </View>
                </View>
              )}

              {/* Seleção de Cartão (Apenas se for crédito) */}
              {isExpense && paymentMethod === 'credit' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Selecionar Cartão</Text>
                  {cards.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.cardSelectorScroll}
                    >
                      {cards.map((card) => {
                        const isSelected = selectedCardId === card.id;
                        return (
                          <TouchableOpacity
                            key={card.id}
                            style={[
                              styles.cardSelectItem,
                              { borderColor: isSelected ? card.color : theme.border },
                              isSelected && { backgroundColor: `${card.color}15` }
                            ]}
                            onPress={() => setSelectedCardId(card.id)}
                          >
                            <MaterialCommunityIcons
                              name={isSelected ? "credit-card-check" : "credit-card-outline"}
                              size={20}
                              color={isSelected ? card.color : theme.textMuted}
                            />
                            <Text style={[
                              styles.cardSelectName,
                              { color: isSelected ? card.color : theme.textMuted }
                            ]}>
                              {card.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                      <TouchableOpacity
                        style={styles.addCardMiniButton}
                        onPress={() => router.push('/new-card')}
                      >
                        <Ionicons name="add" size={20} color={theme.primary} />
                        <Text style={styles.addCardMiniText}>Novo</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  ) : (
                    <TouchableOpacity
                      style={styles.noCardsContainer}
                      onPress={() => router.push('/new-card')}
                    >
                      <Ionicons name="card-outline" size={24} color={theme.textMuted} />
                      <Text style={styles.noCardsText}>Nenhum cartão cadastrado. Toque para adicionar.</Text>
                    </TouchableOpacity>
                  )}
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
                    {paymentMethod === 'credit' && (
                      <PillButton
                        label="Parcelada"
                        isActive={recurrence === 'installment'}
                        onPress={() => setRecurrence('installment')}
                      />
                    )}
                  </View>
                </View>
              )}

              {/* Parcelas (Apenas se for parcelado) */}
              {isExpense && recurrence === 'installment' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Número de Parcelas</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="numeric" size={20} color={theme.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      placeholder="Ex: 12"
                      placeholderTextColor={theme.textMuted}
                      value={installmentsCount}
                      onChangeText={setInstallmentsCount}
                    />
                  </View>
                </View>
              )}

              {/* Categorias (Lista Horizontal) */}
              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.label}>Categoria</Text>
                  <TouchableOpacity
                    style={styles.addCategoryLink}
                    onPress={() => router.push('/categories')}
                  >
                    <Ionicons name="add-circle-outline" size={16} color={theme.primary} />
                    <Text style={styles.addCategoryLinkText}>Nova Categoria</Text>
                  </TouchableOpacity>
                </View>
                {currentCategories.length > 0 ? (
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
                ) : (
                  <TouchableOpacity
                    style={styles.noCategoriesContainer}
                    onPress={() => router.push('/categories')}
                  >
                    <Ionicons name="pricetag-outline" size={24} color={theme.textMuted} />
                    <Text style={styles.noCategoriesText}>Nenhuma categoria de {isExpense ? 'despesa' : 'receita'} encontrada. Toque para criar.</Text>
                  </TouchableOpacity>
                )}
              </View>

            </View>

          </ScrollView>

          {/* --- BOTÃO SALVAR --- */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: activeColor }, loading && styles.buttonDisabled]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editId ? 'Salvar Alterações' : `Salvar ${isExpense ? 'Despesa' : 'Receita'}`}
                </Text>
              )}
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
