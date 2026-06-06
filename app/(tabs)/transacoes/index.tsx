import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importação das stores para gerenciar transações e categorias
import { useCategoryStore } from '../../../store/categoryStore';
import { Transaction, useTransactionStore } from '../../../store/transactionStore';
import { theme } from '../../../src/constants/theme';
import { formatCurrency, formatDate, getMonthName } from '../../../src/utils/format';
import { styles } from './styles';

// --- MAPEAMENTO DE ÍCONES ---
const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Alimentação': 'restaurant',
  'Transporte': 'bus',
  'Moradia': 'home',
  'Saúde': 'medkit',
  'Lazer': 'game-controller',
  'Salário': 'cash',
  'Freelance': 'laptop',
  'Investimento': 'trending-up',
  'Presente': 'gift',
  'Outros': 'pricetag',
};

// --- COMPONENTES ---

interface HeaderProps {
  onSearchToggle: () => void;
  isSearching: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
  onFilterOpen: () => void;
  hasActiveFilters: boolean;
}

/**
 * Cabeçalho da Tela de Extrato
 * Suporta dois estados: Título padrão ou Barra de Busca ativa.
 */
const Header = ({ onSearchToggle, isSearching, searchText, setSearchText, onFilterOpen, hasActiveFilters }: HeaderProps) => (
  <View style={styles.header}>
    {!isSearching ? (
      <>
        {/* Estado 1: Título e ícones de Busca/Filtro */}
        <View>
          <Text style={styles.headerTitle}>Extrato</Text>
          <Text style={styles.headerSubtitle}>Histórico de lançamentos</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconCircleHeader}
            onPress={onSearchToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="search-outline" size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconCircleHeader, hasActiveFilters && { borderColor: theme.primary, backgroundColor: 'rgba(138, 43, 226, 0.1)' }]}
            onPress={onFilterOpen}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={hasActiveFilters ? "filter" : "filter-outline"} size={20} color={hasActiveFilters ? theme.primary : theme.text} />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>
      </>
    ) : (
      /* Estado 2: Campo de entrada para busca textual */
      <View style={styles.searchContainer}>
        <TouchableOpacity
          onPress={onSearchToggle}
          style={styles.backSearch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar descrição ou categoria..."
          placeholderTextColor={theme.textMuted}
          autoFocus
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);

interface MonthSelectorProps {
  currentMonth: number;
  currentYear: number;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Seletor de Mês e Ano para filtrar o extrato
 */
const MonthSelector = ({ currentMonth, currentYear, onPrev, onNext }: MonthSelectorProps) => (
  <View style={styles.monthSelectorRow}>
    <TouchableOpacity
      style={styles.monthArrowBtn}
      onPress={onPrev}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={18} color={theme.textMuted} />
    </TouchableOpacity>

    <View style={styles.monthDisplay}>
      <Ionicons name="calendar-outline" size={16} color={theme.primary} style={{ marginRight: 8 }} />
      <Text style={styles.monthText}>{getMonthName(currentMonth)} {currentYear}</Text>
    </View>

    <TouchableOpacity
      style={styles.monthArrowBtn}
      onPress={onNext}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  </View>
);

/**
 * Card de Resumo Financeiro
 * Exibe o total de Entradas, Saídas e o Balanço do período filtrado.
 */
const SummaryCard = ({ transactions }: { transactions: Transaction[] }) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.value, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.value, 0);

  const balance = totalIncome - totalExpense;

  return (
    <View style={styles.summaryCard}>
      <TouchableOpacity
        style={styles.summaryItem}
        onPress={() => router.push({ pathname: '/analises' as any, params: { tab: 'receitas' } })}
        activeOpacity={0.7}
      >
        <Text style={styles.summaryLabel}>Entradas</Text>
        <Text style={[styles.summaryValue, { color: theme.success }]}>
          + {formatCurrency(totalIncome)}
        </Text>
      </TouchableOpacity>
      <View style={styles.summaryDivider} />
      <TouchableOpacity
        style={styles.summaryItem}
        onPress={() => router.push({ pathname: '/analises' as any, params: { tab: 'despesas' } })}
        activeOpacity={0.7}
      >
        <Text style={styles.summaryLabel}>Saídas</Text>
        <Text style={[styles.summaryValue, { color: theme.danger }]}>
          - {formatCurrency(totalExpense)}
        </Text>
      </TouchableOpacity>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Balanço</Text>
        <Text style={[styles.summaryValue, { color: theme.text }]}>
          {formatCurrency(balance)}
        </Text>
      </View>
    </View>
  );
};

/**
 * Item Individual de Transação
 * Ao clicar, abre a edição. Ao manter pressionado, abre a exclusão.
 */
const TransactionItem = ({ item, onDelete }: { item: Transaction, onDelete: (item: Transaction) => void }) => {
  const icon = categoryIcons[item.category] || 'pricetag';
  const isIncome = item.type === 'income';

  const handleEdit = () => {
    router.push({
      pathname: '/nova-transacao/index' as any,
      params: { id: item.id }
    });
  };

  const handleDelete = () => {
    onDelete(item);
  };

  return (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={handleEdit}
      onLongPress={handleDelete}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: isIncome ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)' }]}>
        <Ionicons name={icon} size={20} color={isIncome ? theme.success : theme.danger} />
      </View>

      <View style={styles.transactionDetails}>
        <Text style={styles.transactionName} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.transactionSubtitle}>
          {item.category} {item.paymentMethod ? `• ${item.paymentMethod === 'credit' ? 'Crédito' : 'Débito'}` : ''}
        </Text>
      </View>

      <View style={styles.transactionTrailing}>
        <Text style={[
          styles.transactionValue,
          { color: isIncome ? theme.success : theme.text }
        ]}>
          {isIncome ? '+' : '-'} {formatCurrency(item.value)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- TELA PRINCIPAL (EXTRATO) ---

export default function TransactionsScreen() {
  // Estados para navegação temporal e busca
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Estados para o Modal de Filtros Avançados
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<'all' | 'credit' | 'debit'>('all');

  const insets = useSafeAreaInsets();

  // Dados da Store global
  const transactions = useTransactionStore((state) => state.transactions);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const deleteTransactionsByGroupId = useTransactionStore((state) => state.deleteTransactionsByGroupId);
  const categories = useCategoryStore((state) => state.categories);

  // Verifica se há qualquer filtro ativo para destacar o ícone de funil
  const hasActiveFilters = filterType !== 'all' || filterCategory !== null || filterPaymentMethod !== 'all';

  // LÓGICA: Aplica todos os filtros (Mês, Busca, Tipo, Categoria, Pagamento) nas transações
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      const transactionDate = t.date.includes('/')
        ? parse(t.date, 'dd/MM/yyyy', new Date())
        : parseISO(t.date);

      const isMonthMatch = transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      const isSearchMatch = t.description.toLowerCase().includes(searchText.toLowerCase()) ||
        t.category.toLowerCase().includes(searchText.toLowerCase());

      const isTypeMatch = filterType === 'all' || t.type === filterType;
      const isCategoryMatch = !filterCategory || t.category === filterCategory;
      const isPaymentMatch = filterPaymentMethod === 'all' || t.paymentMethod === filterPaymentMethod;

      return isMonthMatch && isSearchMatch && isTypeMatch && isCategoryMatch && isPaymentMatch;
    });
  }, [transactions, currentMonth, currentYear, searchText, filterType, filterCategory, filterPaymentMethod]);

  /**
   * FUNÇÃO: Lógica de exclusão com suporte a parcelamentos
   * Se for uma transação parcelada, pergunta se deve excluir apenas uma ou todas as parcelas do grupo.
   */
  const handleDelete = (item: Transaction) => {
    if (item.recurrence === 'installment' && item.installmentGroupId) {
      Alert.alert(
        "Excluir Parcelas",
        "Esta transação faz parte de um parcelamento. O que deseja excluir?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Apenas esta", onPress: () => deleteTransaction(item.id) },
          { text: "Todas as parcelas", style: "destructive", onPress: () => deleteTransactionsByGroupId(item.installmentGroupId!) }
        ]
      );
    } else {
      Alert.alert(
        "Excluir Lançamento",
        `Deseja realmente excluir "${item.description}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: () => deleteTransaction(item.id) }
        ]
      );
    }
  };

  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory(null);
    setFilterPaymentMethod('all');
  };

  // LÓGICA: Agrupa transações filtradas por data para exibir no SectionList
  const sections = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    filteredTransactions.forEach((t: Transaction) => {
      const dateObj = t.date.includes('/') ? parse(t.date, 'dd/MM/yyyy', new Date()) : parseISO(t.date);
      const groupKey = format(dateObj, 'yyyy-MM-dd');

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(t);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a)) // Ordena do dia mais recente para o mais antigo
      .map(groupKey => {
        return { title: groupKey, data: groups[groupKey] };
      });
  }, [filteredTransactions]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.centeredWrapper}>
        {/* Renderiza o Header (Busca ou Título) */}
        <View>
          <Header
            isSearching={isSearching}
            onSearchToggle={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchText('');
            }}
            searchText={searchText}
            setSearchText={setSearchText}
            onFilterOpen={() => setIsFilterVisible(true)}
            hasActiveFilters={hasActiveFilters}
          />
        </View>

        {/* Seletor de Mês (oculto durante a busca) */}
        {!isSearching && (
          <View>
            <MonthSelector
              currentMonth={currentMonth}
              currentYear={currentYear}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />
          </View>
        )}

        {/* SectionList: Lista otimizada para grandes volumes de dados com cabeçalhos de data */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}

          // Cabeçalho da Lista: Exibe o card de resumo financeiro
          ListHeaderComponent={<SummaryCard transactions={filteredTransactions} />}

          // Cabeçalho de cada Seção (Datas: Hoje, Ontem, etc)
          renderSectionHeader={({ section: { title } }) => (
            <View>
              <Text style={styles.sectionTitle}>
                {isToday(parseISO(title)) ? 'Hoje' : 
                 isYesterday(parseISO(title)) ? 'Ontem' : 
                 formatDate(title, "dd 'de' MMMM")}
              </Text>
            </View>
          )}

          // Renderização de cada transação individual
          renderItem={({ item, index }) => (
            <View>
              <TransactionItem item={item} onDelete={handleDelete} />
            </View>
          )}

          // Estado Vazio: Exibido quando nenhum resultado é encontrado nos filtros/busca
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons name="search-outline" size={48} color={theme.border} style={{ marginBottom: 16 }} />
              <Text style={{ color: theme.textMuted }}>Nenhuma transação encontrada.</Text>
            </View>
          }
        />
      </View>

      {/* MODAL DE FILTROS AVANÇADOS */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Topo do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Opções de Filtro: Tipo (Entrada/Saída) */}
              <Text style={styles.filterSectionTitle}>Tipo</Text>
              <View style={styles.filterOptionsRow}>
                {[{ id: 'all', label: 'Todos' }, { id: 'income', label: 'Entradas' }, { id: 'expense', label: 'Saídas' }].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.filterChip, filterType === option.id && styles.filterChipActive]}
                    onPress={() => setFilterType(option.id as 'all' | 'income' | 'expense')}
                  >
                    <Text style={[styles.filterChipText, filterType === option.id && styles.filterChipTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Opções de Filtro: Método de Pagamento */}
              <Text style={styles.filterSectionTitle}>Pagamento</Text>
              <View style={styles.filterOptionsRow}>
                {[{ id: 'all', label: 'Todos' }, { id: 'credit', label: 'Crédito' }, { id: 'debit', label: 'Débito' }].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.filterChip, filterPaymentMethod === option.id && styles.filterChipActive]}
                    onPress={() => setFilterPaymentMethod(option.id as 'all' | 'credit' | 'debit')}
                  >
                    <Text style={[styles.filterChipText, filterPaymentMethod === option.id && styles.filterChipTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Opções de Filtro: Categorias (Filtradas dinamicamente pelo tipo selecionado) */}
              <Text style={styles.filterSectionTitle}>Categorias</Text>
              <View style={styles.filterOptionsGrid}>
                <TouchableOpacity
                  style={[styles.filterChip, filterCategory === null && styles.filterChipActive]}
                  onPress={() => setFilterCategory(null)}
                >
                  <Text style={[styles.filterChipText, filterCategory === null && styles.filterChipTextActive]}>Todas</Text>
                </TouchableOpacity>
                {categories
                  .filter((c) => filterType === 'all' || c.type === filterType)
                  .map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.filterChip, filterCategory === cat.name && styles.filterChipActive]}
                      onPress={() => setFilterCategory(cat.name)}
                    >
                      <Text style={[styles.filterChipText, filterCategory === cat.name && styles.filterChipTextActive]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>

            {/* Rodapé do Modal: Ações de Limpar e Aplicar */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={() => setIsFilterVisible(false)}>
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
