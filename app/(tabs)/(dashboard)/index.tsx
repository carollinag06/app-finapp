import { Feather, Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../../store/authStore';
import { BudgetGoal, useBudgetStore } from '../../../store/budgetStore';
import { Transaction, useTransactionStore } from '../../../store/transactionStore';
import { theme, MAX_WIDTH } from '../../../src/constants/theme';
import { formatCurrency, getMonthName } from '../../../src/utils/format';
import { styles } from './styles';

// Mapeamento de categorias para ícones do Ionicons.
const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Alimentação': 'restaurant',
  'Transporte': 'bus',
  'Moradia': 'home',
  'Saúde': 'medkit',
  'Lazer': 'game-controller',
  'Salário': 'cash',
  'Freelance': 'laptop',
  'Presente': 'gift',
  'Outros': 'pricetag',
};

// --- COMPONENTES ---

// Componente de cabeçalho do dashboard, mostrando saudação, avatar e controle de meses.
const Header = ({ currentMonth, currentYear, onPrev, onNext, user }: {
  currentMonth: number,
  currentYear: number,
  onPrev: () => void,
  onNext: () => void,
  user: any
}) => {
  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  const avatarUrl = user?.avatar_url;

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greetingText}>Olá, {firstName} 👋</Text>
          <Text style={styles.welcomeText}>Sua saúde financeira está ótima!</Text>
        </View>
        <View style={styles.headerIconsRow}>
          <TouchableOpacity style={styles.iconCircleHeader} onPress={() => router.push('/profile')}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            ) : (
              <Ionicons name="person-outline" size={22} color={theme.text} />
            )}
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
          <Text style={styles.monthText}>{getMonthName(currentMonth)} {currentYear}</Text>
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
};

interface CardSaldoProps {
  mostrarSaldo: boolean;
  toggleSaldo: () => void;
  saldo: number;
  receitas: number;
  despesas: number;
  valorPendente: number;
  totalOrcado: number;
}

// Cartão de resumo financeiro que mostra saldo, receitas, despesas e progresso de orçamento.
const CardSaldo = ({ mostrarSaldo, toggleSaldo, saldo, receitas, despesas, valorPendente, totalOrcado }: CardSaldoProps) => {
  const percent = totalOrcado > 0 ? Math.min((despesas / totalOrcado) * 100, 100) : 0;

  return (
    <View style={styles.mainCard}>
      <View style={styles.mainCardHeader}>
        <Text style={styles.mainCardLabel}>Saldo Disponível</Text>
        <TouchableOpacity onPress={toggleSaldo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={mostrarSaldo ? "eye-outline" : "eye-off-outline"} size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.mainCardValue}>
        {mostrarSaldo ? formatCurrency(saldo) : 'R$ •••••'}
      </Text>

      {valorPendente > 0 && (
        <View style={styles.pendingContainer}>
          <Ionicons name="card-outline" size={14} color={theme.warning} />
          <Text style={styles.pendingText}>
            Fatura Pendente: <Text style={{ fontWeight: 'bold' }}>{formatCurrency(valorPendente)}</Text>
          </Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Uso do Orçamento ({formatCurrency(totalOrcado)})</Text>
          <Text style={styles.progressValue}>{Math.round(percent)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: percent > 90 ? theme.danger : theme.primary }]} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => router.push({ pathname: '/analytics', params: { tab: 'receitas' } })}
        >
          <View style={[styles.statIconCircle, { backgroundColor: theme.successOpacity }]}> 
            <Ionicons name="trending-up" size={14} color={theme.success} />
          </View>
          <View>
            <Text style={styles.statLabel}>Entradas</Text>
            <Text style={[styles.statValue, { color: theme.success }]}> 
              {mostrarSaldo ? formatCurrency(receitas) : 'R$ •••'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => router.push({ pathname: '/analytics', params: { tab: 'despesas' } })}
        >
          <View style={[styles.statIconCircle, { backgroundColor: theme.dangerOpacity }]}> 
            <Ionicons name="trending-down" size={14} color={theme.danger} />
          </View>
          <View>
            <Text style={styles.statLabel}>Saídas</Text>
            <Text style={[styles.statValue, { color: theme.danger }]}> 
              {mostrarSaldo ? formatCurrency(despesas) : 'R$ •••'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Grupo de atalhos rápidos na tela, mostrando ações de navegação direto do dashboard.
const AtalhosRapidos = () => {
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth, MAX_WIDTH);
  const shortcutWidth = (contentWidth - 40 - 48) / 4;

  return (
    <View style={styles.shortcutsContainer}>
      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/new-transaction')}>
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}> 
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
        </View>
        <Text style={styles.shortcutText}>Lançar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/metas')}>
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(0, 230, 118, 0.15)' }]}> 
          <Ionicons name="pie-chart-outline" size={24} color={theme.success} />
        </View>
        <Text style={styles.shortcutText}>Orçamento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/metas')}>
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}> 
          <Ionicons name="flag-outline" size={24} color="#2196F3" />
        </View>
        <Text style={styles.shortcutText}>Metas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/mais')}>
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 215, 64, 0.15)' }]}> 
          <Ionicons name="options-outline" size={24} color={theme.warning} />
        </View>
        <Text style={styles.shortcutText}>Mais</Text>
      </TouchableOpacity>
    </View>
  );
};

// Componente que renderiza uma lista com as transações mais recentes do mês.
const TransacoesRecentes = ({ transactions }: { transactions: Transaction[] }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Últimas Transações</Text>
      <TouchableOpacity onPress={() => router.push('/transacoes')}>
        <Text style={styles.seeAllText}>Ver todas</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.transactionsList}>
      {transactions.length > 0 ? (
        transactions.slice(0, 4).map((t) => {
          const icon = categoryIcons[t.category] || 'pricetag';
          const isIncome = t.type === 'income';

          return (
            <TouchableOpacity
              key={t.id}
              style={styles.transactionItem}
              onPress={() => router.push({ pathname: '/new-transaction', params: { id: t.id } })}
              activeOpacity={0.7}
            >
              <View style={[styles.transactionIconBg, { backgroundColor: isIncome ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)' }]}>
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={isIncome ? theme.success : theme.danger}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle} numberOfLines={1}>{t.description}</Text>
                <Text style={styles.transactionSubtitle}>
                  {t.category} • {(() => {
                    try {
                      const date = t.date.includes('/')
                        ? parse(t.date, 'dd/MM/yyyy', new Date())
                        : parseISO(t.date);

                      if (isToday(date)) return 'Hoje';
                      if (isYesterday(date)) return 'Ontem';

                      return format(date, "dd 'de' MMMM", { locale: ptBR });
                    } catch {
                      return t.date;
                    }
                  })()}
                </Text>
              </View>
              <View style={styles.transactionValueContainer}>
                <Text style={[styles.transactionValueText, { color: isIncome ? theme.success : theme.text }]}>
                  {isIncome ? '+' : '-'} {formatCurrency(t.value)}
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

// Cartão de resumo rápido da semana. Pode ser atualizado com métricas reais no futuro.
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
  const { user } = useAuthStore();
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const insets = useSafeAreaInsets();

  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);

  // Filtro por mês
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      const transactionDate = t.date.includes('/')
        ? (() => { const [d, m, y] = t.date.split('/').map(Number); return new Date(y, m - 1, d); })()
        : new Date(t.date);

      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const receitasTotais = useMemo(() =>
    monthlyTransactions.filter((t: Transaction) => t.type === 'income').reduce((acc: number, t: Transaction) => acc + t.value, 0)
    , [monthlyTransactions]);

  const despesasTotais = useMemo(() =>
    monthlyTransactions.filter((t: Transaction) => t.type === 'expense').reduce((acc: number, t: Transaction) => acc + t.value, 0)
    , [monthlyTransactions]);

  const valorPendente = useMemo(() =>
    monthlyTransactions.filter((t: Transaction) => t.type === 'expense' && t.paymentMethod === 'credit').reduce((acc: number, t: Transaction) => acc + t.value, 0)
    , [monthlyTransactions]);

  const totalOrcado = useMemo(() =>
    budgets.reduce((acc: number, b: BudgetGoal) => acc + b.amount, 0)
    , [budgets]);

  const saldoAtual = receitasTotais - despesasTotais; // Saldo líquido (Receitas - Todas as Despesas, incluindo crédito)

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
        <View>
          <Header
            currentMonth={currentMonth}
            currentYear={currentYear}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            user={user}
          />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(200).duration(720)}>
            <CardSaldo
              mostrarSaldo={mostrarSaldo}
              toggleSaldo={() => setMostrarSaldo(!mostrarSaldo)}
              saldo={saldoAtual}
              receitas={receitasTotais}
              despesas={despesasTotais}
              valorPendente={valorPendente}
              totalOrcado={totalOrcado}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(720)}>
            <AtalhosRapidos />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(720)}>
            <HealthCard />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(720)}>
            <TransacoesRecentes transactions={monthlyTransactions} />
          </Animated.View>

        </ScrollView>
      </View>
    </View>
  );
}
