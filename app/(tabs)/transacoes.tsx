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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCategoryStore } from '../../store/categoryStore';
import { Transaction, useTransactionStore } from '../../store/transactionStore';

// --- CORES DO TEMA E CATEGORIAS ---
const theme = {
  bg: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceLight: '#262626',
  text: '#FFFFFF',
  textMuted: '#999999',
  primary: '#8A2BE2', // Roxo
  primaryLight: '#A450FF',
  danger: '#FF5252',  // Vermelho
  success: '#00E676', // Verde
  border: '#2A2A2A',
};

const MAX_WIDTH = 600; // Largura máxima para desktop

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

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

const Header = ({ onSearchToggle, isSearching, searchText, setSearchText, onFilterOpen, hasActiveFilters }: HeaderProps) => (
  <View style={styles.header}>
    {!isSearching ? (
      <>
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
      <Text style={styles.monthText}>{monthNames[currentMonth]} {currentYear}</Text>
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
        onPress={() => router.push({ pathname: '/analytics', params: { tab: 'receitas' } })}
        activeOpacity={0.7}
      >
        <Text style={styles.summaryLabel}>Entradas</Text>
        <Text style={[styles.summaryValue, { color: theme.success }]}>
          + R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </TouchableOpacity>
      <View style={styles.summaryDivider} />
      <TouchableOpacity
        style={styles.summaryItem}
        onPress={() => router.push({ pathname: '/analytics', params: { tab: 'despesas' } })}
        activeOpacity={0.7}
      >
        <Text style={styles.summaryLabel}>Saídas</Text>
        <Text style={[styles.summaryValue, { color: theme.danger }]}>
          - R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </TouchableOpacity>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Balanço</Text>
        <Text style={[styles.summaryValue, { color: theme.text }]}>
          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
};

const TransactionItem = ({ item, onDelete }: { item: Transaction, onDelete: (id: string) => void }) => {
  const icon = categoryIcons[item.category] || 'pricetag';
  const isIncome = item.type === 'income';

  const handleEdit = () => {
    router.push({
      pathname: '/new-transaction',
      params: { id: item.id }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Lançamento",
      `Deseja realmente excluir "${item.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => onDelete(item.id) }
      ]
    );
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
          {isIncome ? '+' : '-'} R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- TELA PRINCIPAL ---

export default function TransactionsScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Filtros
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<'all' | 'credit' | 'debit'>('all');

  const insets = useSafeAreaInsets();

  const transactions = useTransactionStore((state) => state.transactions);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const categories = useCategoryStore((state) => state.categories);

  const hasActiveFilters = filterType !== 'all' || filterCategory !== null || filterPaymentMethod !== 'all';

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      const transactionDate = t.date.includes('/')
        ? parse(t.date, 'dd/MM/yyyy', new Date())
        : parseISO(t.date);

      const isMonthMatch = transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      const isSearchMatch = t.description.toLowerCase().includes(searchText.toLowerCase()) ||
        t.category.toLowerCase().includes(searchText.toLowerCase());

      // Filtros adicionais
      const isTypeMatch = filterType === 'all' || t.type === filterType;
      const isCategoryMatch = !filterCategory || t.category === filterCategory;
      const isPaymentMatch = filterPaymentMethod === 'all' || t.paymentMethod === filterPaymentMethod;

      return isMonthMatch && isSearchMatch && isTypeMatch && isCategoryMatch && isPaymentMatch;
    });
  }, [transactions, currentMonth, currentYear, searchText, filterType, filterCategory, filterPaymentMethod]);

  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory(null);
    setFilterPaymentMethod('all');
  };

  const sections = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    filteredTransactions.forEach((t: Transaction) => {
      // Usamos a data ISO para agrupar de forma consistente
      const dateObj = t.date.includes('/')
        ? parse(t.date, 'dd/MM/yyyy', new Date())
        : parseISO(t.date);
      const groupKey = format(dateObj, 'yyyy-MM-dd');

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(t);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(groupKey => {
        const dateObj = parseISO(groupKey);

        let title = '';
        if (isToday(dateObj)) {
          title = 'Hoje';
        } else if (isYesterday(dateObj)) {
          title = 'Ontem';
        } else {
          const dayName = format(dateObj, 'EEEE', { locale: ptBR });
          const dayNumber = format(dateObj, 'dd');
          title = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayNumber}`;
        }

        return {
          title,
          data: groups[groupKey]
        };
      });
  }, [filteredTransactions]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.centeredWrapper}>
        <Animated.View entering={FadeInUp.duration(800)}>
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
        </Animated.View>

        {!isSearching && (
          <Animated.View entering={FadeInDown.delay(200).duration(800)}>
            <MonthSelector
              currentMonth={currentMonth}
              currentYear={currentYear}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />
          </Animated.View>
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}

          ListHeaderComponent={<SummaryCard transactions={filteredTransactions} />}

          renderSectionHeader={({ section: { title } }) => (
            <Animated.View entering={FadeIn.delay(400).duration(800)}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </Animated.View>
          )}

          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(600 + index * 50).duration(800)}>
              <TransactionItem item={item} onDelete={deleteTransaction} />
            </Animated.View>
          )}

          ListEmptyComponent={
            <Animated.View entering={FadeIn.delay(400)} style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons name="search-outline" size={48} color={theme.border} style={{ marginBottom: 16 }} />
              <Text style={{ color: theme.textMuted }}>Nenhuma transação encontrada.</Text>
            </Animated.View>
          }
        />
      </View>

      {/* Modal de Filtros */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Tipo de Transação */}
              <Text style={styles.filterSectionTitle}>Tipo</Text>
              <View style={styles.filterOptionsRow}>
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'income', label: 'Entradas' },
                  { id: 'expense', label: 'Saídas' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterChip,
                      filterType === option.id && styles.filterChipActive
                    ]}
                    onPress={() => setFilterType(option.id as 'all' | 'income' | 'expense')}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filterType === option.id && styles.filterChipTextActive
                    ]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Método de Pagamento */}
              <Text style={styles.filterSectionTitle}>Pagamento</Text>
              <View style={styles.filterOptionsRow}>
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'credit', label: 'Crédito' },
                  { id: 'debit', label: 'Débito' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterChip,
                      filterPaymentMethod === option.id && styles.filterChipActive
                    ]}
                    onPress={() => setFilterPaymentMethod(option.id as 'all' | 'credit' | 'debit')}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filterPaymentMethod === option.id && styles.filterChipTextActive
                    ]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Categorias */}
              <Text style={styles.filterSectionTitle}>Categorias</Text>
              <View style={styles.filterOptionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filterCategory === null && styles.filterChipActive
                  ]}
                  onPress={() => setFilterCategory(null)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterCategory === null && styles.filterChipTextActive
                  ]}>Todas</Text>
                </TouchableOpacity>
                {categories
                  .filter((c) => filterType === 'all' || c.type === filterType)
                  .map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.filterChip,
                        filterCategory === cat.name && styles.filterChipActive
                      ]}
                      onPress={() => setFilterCategory(cat.name)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        filterCategory === cat.name && styles.filterChipTextActive
                      ]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setIsFilterVisible(false)}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  // Search
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
    marginLeft: 8,
  },
  backSearch: {
    marginRight: 4,
  },
  // Month Selector
  monthSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  monthArrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  // List Content
  listContent: {
    paddingHorizontal: 20,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    flexDirection: 'row',
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.border,
    alignSelf: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Section Title
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.textMuted,
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  // Transaction Item
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: theme.textMuted,
  },
  transactionTrailing: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Modal & Filters
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    borderWidth: 1.5,
    borderColor: theme.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 12,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterChipText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: theme.text,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingBottom: 8,
  },
  resetButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  resetButtonText: {
    color: theme.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
});