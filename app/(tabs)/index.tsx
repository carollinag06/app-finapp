import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { ComponentProps, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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

interface MockData {
  pendencias: { valor: number; qtd: number };
  contas: Conta[];
}

// Atualizamos as propriedades do CardSaldo para receber os valores dinâmicos
interface CardSaldoProps {
  mostrarSaldo: boolean;
  toggleSaldo: () => void;
  saldo: number;
  receitas: number;
  despesas: number;
}

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// --- MOCK DATA MANTIDO ---
const mockData: MockData = {
  pendencias: { valor: 450.00, qtd: 2 },
  contas: [
    { id: '1', nome: 'Carteira', saldo: 50.00, icone: 'wallet-outline' },
    { id: '2', nome: 'Conta Corrente', saldo: -401.91, icone: 'card-outline' }
  ]
};

// --- CORES DO TEMA DARK ---
const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  primary: '#8A2BE2', // Roxo
  success: '#4CAF50', // Verde
  danger: '#F44336',  // Vermelho
  border: '#333333'
};

// --- COMPONENTES ---

const Header = ({ currentMonth, currentYear, onPrev, onNext }: { currentMonth: number, currentYear: number, onPrev: () => void, onNext: () => void }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/login')}>
      <Ionicons name="person-circle-outline" size={32} color={theme.text} />
    </TouchableOpacity>

    <View style={styles.monthSelectorContainer}>
      <TouchableOpacity style={styles.monthArrow} onPress={onPrev}>
        <Ionicons name="chevron-back" size={20} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.monthSelector} onPress={() => router.push('/analytics')}>
        <Text style={styles.monthText}>{monthNames[currentMonth]} {currentYear}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.monthArrow} onPress={onNext}>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </TouchableOpacity>
    </View>

    <TouchableOpacity style={styles.iconButton}>
      <Ionicons name="notifications-outline" size={28} color={theme.text} />
    </TouchableOpacity>
  </View>
);

// --- CARD SALDO AGORA USA OS VALORES REAIS ---
const CardSaldo = ({ mostrarSaldo, toggleSaldo, saldo, receitas, despesas }: CardSaldoProps) => (
  <View style={styles.card}>
    <View style={styles.saldoHeader}>
      <Text style={styles.cardTitle}>Saldo do Mês</Text>
      <TouchableOpacity onPress={toggleSaldo}>
        <Ionicons name={mostrarSaldo ? "eye-outline" : "eye-off-outline"} size={22} color={theme.textMuted} />
      </TouchableOpacity>
    </View>
    <Text style={styles.saldoValue}>
      {mostrarSaldo ? `R$ ${saldo.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
    </Text>

    <View style={styles.indicadoresRow}>
      <View style={styles.indicador}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
          <Ionicons name="arrow-up" size={16} color={theme.success} />
        </View>
        <View>
          <Text style={styles.indicadorLabel}>Receitas</Text>
          <Text style={[styles.indicadorValue, { color: theme.success }]}>
            {mostrarSaldo ? `R$ ${receitas.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
          </Text>
        </View>
      </View>

      <View style={styles.indicador}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}>
          <Ionicons name="arrow-down" size={16} color={theme.danger} />
        </View>
        <View>
          <Text style={styles.indicadorLabel}>Despesas</Text>
          <Text style={[styles.indicadorValue, { color: theme.danger }]}>
            {mostrarSaldo ? `R$ ${despesas.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const GastosCartao = ({ valor, qtd }: { valor: number, qtd: number }) => (
  <TouchableOpacity style={[styles.card, styles.rowBetween]}>
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
        <Ionicons name="card-outline" size={20} color={theme.primary} />
      </View>
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.cardTitle}>Gastos no cartão</Text>
        <Text style={styles.saldoValueSmall}>R$ {valor.toFixed(2).replace('.', ',')}</Text>
      </View>
    </View>
    {qtd > 0 && (
      <View style={[styles.badge, { backgroundColor: theme.primary }]}>
        <Text style={styles.badgeText}>{qtd}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const ListaContas = () => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Minhas Contas</Text>
      <TouchableOpacity>
        <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
      </TouchableOpacity>
    </View>

    <View style={styles.card}>
      {mockData.contas.map((conta, index) => (
        <View key={conta.id}>
          <View style={styles.contaItem}>
            <View style={styles.row}>
              <Ionicons name={conta.icone} size={24} color={theme.textMuted} />
              <Text style={styles.contaNome}>{conta.nome}</Text>
            </View>
            <Text style={styles.contaSaldo}>
              R$ {conta.saldo.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          {index < mockData.contas.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  </View>
);

const TransacoesRecentes = ({ transactions }: { transactions: any[] }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Últimas Transações</Text>
      <TouchableOpacity onPress={() => router.push('/transacoes')}>
        <Text style={styles.seeAllText}>Ver tudo</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.card}>
      {transactions.length > 0 ? (
        transactions.slice(0, 3).map((t, index) => (
          <View key={t.id}>
            <View style={styles.transactionRow}>
              <View style={styles.row}>
                <View style={[styles.iconCircleSmall, { backgroundColor: t.type === 'income' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }]}>
                  <Ionicons
                    name={t.type === 'income' ? "arrow-up" : "arrow-down"}
                    size={14}
                    color={t.type === 'income' ? theme.success : theme.danger}
                  />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.transactionDesc} numberOfLines={1}>{t.description}</Text>
                  <Text style={styles.transactionDate}>{t.date}</Text>
                </View>
              </View>
              <Text style={[styles.transactionValue, { color: t.type === 'income' ? theme.success : theme.danger }]}>
                {t.type === 'income' ? '+' : '-'} R$ {t.value.toFixed(2).replace('.', ',')}
              </Text>
            </View>
            {index < Math.min(transactions.length, 3) - 1 && <View style={styles.divider} />}
          </View>
        ))
      ) : (
        <Text style={styles.emptyStateText}>Nenhuma transação recente</Text>
      )}
    </View>
  </View>
);

const DespesasCategoria = ({ categoriaDestaque, totalDespesas }: { categoriaDestaque: any, totalDespesas: number }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Despesa em Destaque</Text>
    <View style={styles.card}>
      {categoriaDestaque ? (
        <View style={styles.row}>
          <View style={[styles.fakeDonutChart, { borderColor: categoriaDestaque.cor || theme.primary }]}>
            <Text style={styles.fakeDonutText}>
              {Math.round((categoriaDestaque.valor / totalDespesas) * 100)}%
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.cardTitle}>{categoriaDestaque.nome}</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: categoriaDestaque.cor || theme.primary,
                    width: `${Math.round((categoriaDestaque.valor / totalDespesas) * 100)}%`
                  }
                ]}
              />
            </View>
            <Text style={styles.contaSaldo}>R$ {categoriaDestaque.valor.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyStateText}>Nenhuma despesa este mês</Text>
      )}
    </View>
  </View>
);

const PlanejamentoMensal = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Análise Rápida</Text>
    <TouchableOpacity style={[styles.card, styles.centerAll]} onPress={() => router.push('/analytics')}>
      <MaterialCommunityIcons name="finance" size={32} color={theme.primary} />
      <Text style={[styles.primaryButtonText, { marginTop: 8 }]}>
        Ver gráficos detalhados
      </Text>
    </TouchableOpacity>
  </View>
);

// --- TELA PRINCIPAL ---

export default function Dashboard() {
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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

  // Gastos no cartão de crédito
  const gastosCartao = useMemo(() => {
    const cartaoTransactions = monthlyTransactions.filter(t => t.type === 'expense' && t.paymentMethod === 'credit');
    const valor = cartaoTransactions.reduce((acc, t) => acc + t.value, 0);
    const qtd = cartaoTransactions.length;
    return { valor, qtd };
  }, [monthlyTransactions]);

  // Categoria em destaque (maior despesa)
  const categoriaDestaque = useMemo(() => {
    const categories: Record<string, number> = {};
    monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.value;
    });

    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;

    const colors: Record<string, string> = {
      'Moradia': '#8A2BE2',
      'Alimentação': '#F44336',
      'Transporte': '#FFEB3B',
      'Saúde': '#4CAF50',
    };

    return {
      nome: sorted[0][0],
      valor: sorted[0][1],
      cor: colors[sorted[0][0]] || theme.primary
    };
  }, [monthlyTransactions]);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <Header
        currentMonth={currentMonth}
        currentYear={currentYear}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CardSaldo
          mostrarSaldo={mostrarSaldo}
          toggleSaldo={() => setMostrarSaldo(!mostrarSaldo)}
          saldo={saldoAtual}
          receitas={receitasTotais}
          despesas={despesasTotais}
        />

        <GastosCartao
          valor={gastosCartao.valor}
          qtd={gastosCartao.qtd}
        />

        <ListaContas />

        <TransacoesRecentes transactions={monthlyTransactions} />

        <DespesasCategoria
          categoriaDestaque={categoriaDestaque}
          totalDespesas={despesasTotais}
        />

        <PlanejamentoMensal />

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Aumentado para não cortar com a TabBar
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconButton: {
    padding: 4,
  },
  monthSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  monthArrow: {
    padding: 4,
  },
  monthSelector: {
    marginHorizontal: 8,
  },
  monthText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerAll: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  saldoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saldoValue: {
    color: theme.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  saldoValueSmall: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  indicadoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  indicador: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  indicadorLabel: {
    color: theme.textMuted,
    fontSize: 12,
  },
  indicadorValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  badge: {
    backgroundColor: theme.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionDesc: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contaNome: {
    color: theme.text,
    fontSize: 16,
    marginLeft: 12,
  },
  contaSaldo: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 8,
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 32,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: theme.textMuted,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: 'rgba(138, 43, 226, 0.15)', // Roxo com opacidade
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  primaryButtonText: {
    color: theme.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  fakeDonutChart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 8,
    borderColor: theme.primary,
    borderTopColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeDonutText: {
    color: theme.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    marginVertical: 8,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 10,
  },
  manageButtonText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: 'bold',
  }
});