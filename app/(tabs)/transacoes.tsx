import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const categoryColors: Record<string, string> = {
  'Alimentação': '#FF5252',
  'Transporte': '#FFD740',
  'Moradia': '#8A2BE2',
  'Saúde': '#00E676',
  'Lazer': '#FF4081',
  'Salário': '#00E676',
  'Freelance': '#2196F3',
  'Investimento': '#00BCD4',
  'Presente': '#FF9800',
  'Outros': '#9E9E9E',
};

// --- COMPONENTES ---

const Header = ({ onSearchToggle, isSearching, searchText, setSearchText }: any) => (
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
            style={styles.iconCircleHeader}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="filter-outline" size={20} color={theme.text} />
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

const MonthSelector = ({ currentMonth, currentYear, onPrev, onNext }: any) => (
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
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Entradas</Text>
        <Text style={[styles.summaryValue, { color: theme.success }]}>
          + R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Saídas</Text>
        <Text style={[styles.summaryValue, { color: theme.danger }]}>
          - R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
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
  const color = categoryColors[item.category] || theme.textMuted;
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
  const { width: screenWidth } = useWindowDimensions();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const insets = useSafeAreaInsets();

  const contentWidth = Math.min(screenWidth, MAX_WIDTH);

  const transactions = useTransactionStore((state) => state.transactions);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const [day, month, year] = t.date.split('/').map(Number);
      const isMonthMatch = (month - 1) === currentMonth && year === currentYear;
      const isSearchMatch = t.description.toLowerCase().includes(searchText.toLowerCase()) ||
        t.category.toLowerCase().includes(searchText.toLowerCase());

      return isMonthMatch && isSearchMatch;
    });
  }, [transactions, currentMonth, currentYear, searchText]);

  const sections = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    filteredTransactions.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });

    return Object.keys(groups)
      .sort((a, b) => {
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime();
      })
      .map(date => {
        const [d, m, y] = date.split('/').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        let title = date;
        if (dateObj.toDateString() === today.toDateString()) title = "Hoje";
        else if (dateObj.toDateString() === yesterday.toDateString()) title = "Ontem";
        else {
          const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
          title = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${d}`;
        }

        return {
          title,
          data: groups[date]
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
        <Header
          isSearching={isSearching}
          onSearchToggle={() => {
            setIsSearching(!isSearching);
            if (isSearching) setSearchText('');
          }}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        {!isSearching && (
          <MonthSelector
            currentMonth={currentMonth}
            currentYear={currentYear}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}

          ListHeaderComponent={<SummaryCard transactions={filteredTransactions} />}

          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}

          renderItem={({ item }) => <TransactionItem item={item} onDelete={deleteTransaction} />}

          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons name="search-outline" size={48} color={theme.border} style={{ marginBottom: 16 }} />
              <Text style={{ color: theme.textMuted }}>Nenhuma transação encontrada.</Text>
            </View>
          }
        />
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
});