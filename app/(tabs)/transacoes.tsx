import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Transaction, useTransactionStore } from '../../store/transactionStore';

// --- CORES DO TEMA E CATEGORIAS ---
const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  primary: '#8A2BE2', // Roxo
  danger: '#F44336',  // Vermelho
  success: '#4CAF50', // Verde
  border: '#333333',
};

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const categoryColors: Record<string, string> = {
  'Compras': '#8A2BE2',
  'Transporte': '#9E9E9E',
  'Educação': '#FFEB3B',
  'Saúde': '#4CAF50',
  'Alimentação': '#F44336',
  'Casa': '#2196F3',
  'Serviços': '#388E3C',
  'Renda extra': '#8A2BE2',
  'Salário': '#4CAF50',
  'Investimento': '#2196F3',
  'Moradia': '#8A2BE2',
};

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Alimentação': 'restaurant-outline',
  'Transporte': 'bus-outline',
  'Moradia': 'home-outline',
  'Saúde': 'medkit-outline',
  'Lazer': 'game-controller-outline',
  'Salário': 'cash-outline',
  'Freelance': 'laptop-outline',
  'Investimento': 'trending-up-outline',
  'Presente': 'gift-outline',
  'Outros': 'pricetag-outline',
};

// --- COMPONENTES ---

const Header = ({ onSearchToggle, isSearching, searchText, setSearchText }: any) => (
  <View style={styles.header}>
    {!isSearching ? (
      <>
        <Text style={styles.headerTitle}>Transações</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="calendar-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSearchToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="search-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="filter-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="dots-vertical" size={26} color={theme.text} />
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
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar transação..."
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
  <View style={styles.monthSelector}>
    <TouchableOpacity style={styles.monthArrow} onPress={onPrev}>
      <Ionicons name="chevron-back" size={20} color={theme.textMuted} />
    </TouchableOpacity>
    <Text style={styles.monthText}>{monthNames[currentMonth]} {currentYear}</Text>
    <TouchableOpacity style={styles.monthArrow} onPress={onNext}>
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
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
        <Text style={styles.summaryLabel}>Receitas</Text>
        <Text style={[styles.summaryValue, { color: theme.success }]}>
          R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Despesas</Text>
        <Text style={[styles.summaryValue, { color: theme.danger }]}>
          R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Balanço</Text>
        <Text style={[styles.summaryValue, { color: balance >= 0 ? theme.success : theme.danger }]}>
          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
};

const TransactionItem = ({ item, onDelete }: { item: Transaction, onDelete: (id: string) => void }) => {
  const color = categoryColors[item.category] || theme.textMuted;
  const icon = categoryIcons[item.category] || 'pricetag-outline';
  const isIncome = item.type === 'income';

  const handleEdit = () => {
    router.push({
      pathname: '/new-transaction',
      params: { id: item.id }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Transação",
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
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <View style={styles.transactionDetails}>
        <Text style={styles.transactionName}>{item.description}</Text>
        <Text style={styles.transactionSubtitle}>
          {item.category} {item.paymentMethod ? `• ${item.paymentMethod === 'credit' ? 'Cartão' : 'Débito'}` : ''}
        </Text>
      </View>

      <View style={styles.transactionTrailing}>
        <Text style={[
          styles.transactionValue,
          { color: isIncome ? theme.success : theme.danger }
        ]}>
          {isIncome ? '+' : '-'} R$ {item.value.toFixed(2).replace('.', ',')}
        </Text>
        <View style={[
          styles.statusDot,
          { backgroundColor: theme.success }
        ]} />
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
  const insets = useSafeAreaInsets();

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
  );
}

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  // Search
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    marginLeft: 8,
  },
  backSearch: {
    marginRight: 4,
  },
  // Month Selector
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  monthArrow: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginHorizontal: 16,
  },
  // List Content
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Aumentado para não cortar com a TabBar
  },
  // Summary Card
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 20,
    marginBottom: 24,
    marginTop: 8,
    // Sombra leve para destacar no tema escuro
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: theme.border,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textMuted,
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  // Transaction Item
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  transactionDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: theme.textMuted,
  },
  transactionTrailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  transactionValue: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // FAB (Floating Action Button)
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: theme.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});