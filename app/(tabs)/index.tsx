import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { ComponentProps, useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- IMPORTAMOS O NOSSO STORE ---
import { useTransactionStore } from '../../store/transactionStore';

// --- TIPAGEM ---
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface Conta {
  id: string;
  nome: string;
  saldo: number;
  icone: IoniconsName;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// --- CORES DO TEMA DARK ---
const theme = {
  bg: '#0F0F0F', // Um preto mais profundo
  surface: '#1A1A1A',
  surfaceLight: '#262626',
  text: '#FFFFFF',
  textMuted: '#999999',
  primary: '#8A2BE2', // Roxo
  primaryLight: '#A450FF',
  success: '#00E676', // Verde vibrante
  danger: '#FF5252',  // Vermelho vibrante
  warning: '#FFD740', // Amarelo
  border: '#2A2A2A'
};

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

const Header = ({ currentMonth, currentYear, onPrev, onNext }: { currentMonth: number, currentYear: number, onPrev: () => void, onNext: () => void }) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <View>
        <Text style={styles.greetingText}>Olá, Carol 👋</Text>
        <Text style={styles.welcomeText}>Sua saúde financeira está ótima!</Text>
      </View>
      <View style={styles.headerIconsRow}>
        <TouchableOpacity style={styles.iconCircleHeader} onPress={() => router.push('/mais')}>
          <Ionicons name="notifications-outline" size={22} color={theme.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCircleHeader} onPress={() => router.push('/login')}>
          <Ionicons name="person-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.monthSelectorRow}>
      <TouchableOpacity
        style={styles.monthArrowBtn}
        onPress={onPrev}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={18} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.monthDisplay} onPress={() => router.push('/analytics')}>
        <Ionicons name="calendar-outline" size={16} color={theme.primary} style={{ marginRight: 8 }} />
        <Text style={styles.monthText}>{monthNames[currentMonth]} {currentYear}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.monthArrowBtn}
        onPress={onNext}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </TouchableOpacity>
    </View>
  </View>
);

const CardSaldo = ({ mostrarSaldo, toggleSaldo, saldo, receitas, despesas }: any) => {
  const percent = receitas > 0 ? Math.min((despesas / receitas) * 100, 100) : 0;

  return (
    <View style={styles.mainCard}>
      <View style={styles.mainCardHeader}>
        <Text style={styles.mainCardLabel}>Orçamento Total</Text>
        <TouchableOpacity onPress={toggleSaldo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={mostrarSaldo ? "eye-outline" : "eye-off-outline"} size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.mainCardValue}>
        {mostrarSaldo ? `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ •••••'}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Uso do Orçamento</Text>
          <Text style={styles.progressValue}>{Math.round(percent)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: percent > 90 ? theme.danger : theme.primary }]} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(0, 230, 118, 0.1)' }]}>
            <Ionicons name="trending-up" size={14} color={theme.success} />
          </View>
          <View>
            <Text style={styles.statLabel}>Entradas</Text>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {mostrarSaldo ? `R$ ${receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ •••'}
            </Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(255, 82, 82, 0.1)' }]}>
            <Ionicons name="trending-down" size={14} color={theme.danger} />
          </View>
          <View>
            <Text style={styles.statLabel}>Saídas</Text>
            <Text style={[styles.statValue, { color: theme.danger }]}>
              {mostrarSaldo ? `R$ ${despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ •••'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const AtalhosRapidos = () => (
  <View style={styles.shortcutsContainer}>
    <TouchableOpacity style={styles.shortcutItem} onPress={() => router.push('/new-transaction')}>
      <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
        <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
      </View>
      <Text style={styles.shortcutText}>Lançar</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.shortcutItem}>
      <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(0, 230, 118, 0.15)' }]}>
        <Ionicons name="pie-chart-outline" size={24} color={theme.success} />
      </View>
      <Text style={styles.shortcutText}>Orçamento</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.shortcutItem}>
      <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
        <Ionicons name="calendar-outline" size={24} color="#2196F3" />
      </View>
      <Text style={styles.shortcutText}>Metas</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.shortcutItem}>
      <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 215, 64, 0.15)' }]}>
        <Ionicons name="options-outline" size={24} color={theme.warning} />
      </View>
      <Text style={styles.shortcutText}>Categorias</Text>
    </TouchableOpacity>
  </View>
);

const TransacoesRecentes = ({ transactions }: { transactions: any[] }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Transações Recentes</Text>
      <TouchableOpacity onPress={() => router.push('/transacoes')}>
        <Text style={styles.seeAllText}>Ver tudo</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.transactionsList}>
      {transactions.length > 0 ? (
        transactions.slice(0, 4).map((t, index) => {
          const icon = categoryIcons[t.category] || 'pricetag';
          const isIncome = t.type === 'income';

          return (
            <TouchableOpacity key={t.id} style={styles.transactionItem}>
              <View style={[styles.transactionIconBg, { backgroundColor: isIncome ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)' }]}>
                <Ionicons
                  name={icon}
                  size={20}
                  color={isIncome ? theme.success : theme.danger}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle} numberOfLines={1}>{t.description}</Text>
                <Text style={styles.transactionSubtitle}>{t.category} • {t.date}</Text>
              </View>
              <View style={styles.transactionValueContainer}>
                <Text style={[styles.transactionValueText, { color: isIncome ? theme.success : theme.text }]}>
                  {isIncome ? '+' : '-'} R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          <Feather name="coffee" size={40} color={theme.border} />
          <Text style={styles.emptyStateText}>Nenhuma transação este mês.</Text>
        </View>
      )}
    </View>
  </View>
);

const HealthCard = () => (
  <TouchableOpacity style={styles.healthCard} activeOpacity={0.9}>
    <View style={styles.healthInfo}>
      <Text style={styles.healthTitle}>Resumo da Semana</Text>
      <Text style={styles.healthDesc}>Você economizou 12% a mais que na semana passada. Continue assim!</Text>
    </View>
    <View style={styles.healthIconCircle}>
      <Ionicons name="trending-up" size={24} color={theme.success} />
    </View>
  </TouchableOpacity>
);

// --- TELA PRINCIPAL ---

export default function Dashboard() {
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const insets = useSafeAreaInsets();

  const transactions = useTransactionStore((state) => state.transactions);

  // Filtro por mês
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const [day, month, year] = t.date.split('/').map(Number);
      return (month - 1) === currentMonth && year === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const receitasTotais = useMemo(() =>
    monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0)
    , [monthlyTransactions]);

  const despesasTotais = useMemo(() =>
    monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0)
    , [monthlyTransactions]);

  const saldoAtual = receitasTotais - despesasTotais;

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
        currentMonth={currentMonth}
        currentYear={currentYear}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <CardSaldo
          mostrarSaldo={mostrarSaldo}
          toggleSaldo={() => setMostrarSaldo(!mostrarSaldo)}
          saldo={saldoAtual}
          receitas={receitasTotais}
          despesas={despesasTotais}
        />

        <AtalhosRapidos />

        <HealthCard />

        <TransacoesRecentes transactions={monthlyTransactions} />

        {/* Card de Investimento Mock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investimentos</Text>
          <TouchableOpacity style={styles.investCard}>
            <View style={styles.investIconBg}>
              <MaterialCommunityIcons name="chart-areaspline" size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.investTitle}>Rendimento CDI</Text>
              <Text style={styles.investSubtitle}>Seu dinheiro rendeu R$ 12,40 hoje</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.border} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 24,
  },
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    color: theme.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: theme.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  headerIconsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircleHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.danger,
    borderWidth: 1.5,
    borderColor: theme.surface,
  },
  monthSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 6,
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
  // Main Card
  mainCard: {
    backgroundColor: theme.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainCardLabel: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  mainCardValue: {
    color: theme.text,
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  progressContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: theme.textMuted,
    fontSize: 12,
  },
  progressValue: {
    color: theme.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 11,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.border,
    marginHorizontal: 15,
  },
  // Shortcuts
  shortcutsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shortcutItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 40 - 48) / 4,
  },
  shortcutIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  shortcutText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '500',
  },
  // Health Card
  healthCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  healthInfo: {
    flex: 1,
  },
  healthTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  healthDesc: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  healthIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  // Sections
  section: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: theme.primaryLight,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
  },
  transactionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  transactionTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  transactionSubtitle: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  transactionValueContainer: {
    alignItems: 'flex-end',
  },
  transactionValueText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyStateText: {
    color: theme.textMuted,
    marginTop: 12,
    fontSize: 14,
  },
  // Invest Card
  investCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  investIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  investTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  investSubtitle: {
    color: theme.textMuted,
    fontSize: 13,
    marginTop: 2,
  }
});