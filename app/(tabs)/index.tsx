import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format, isToday, isYesterday, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { User } from '@supabase/supabase-js';
import { supabase } from '../../src/lib/supabase';
import { BudgetGoal, useBudgetStore } from '../../store/budgetStore';
import { CreditCard, useCardStore } from '../../store/cardStore';
import { calculateLiveBalance, useInvestmentStore } from '../../store/investmentStore';
import { Transaction, useTransactionStore } from '../../store/transactionStore';

// --- TIPAGEM ---

interface InvoiceAlert {
  cardId: string;
  cardName: string;
  value: number;
  daysRemaining: number;
  month: number;
  year: number;
  type: 'closing' | 'due';
}

const MAX_WIDTH = 600; // Largura máxima para desktop

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

const Header = ({ currentMonth, currentYear, onPrev, onNext, user }: {
  currentMonth: number,
  currentYear: number,
  onPrev: () => void,
  onNext: () => void,
  user: User | null
}) => {
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';
  const avatarUrl = user?.user_metadata?.avatar_url;

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
        {mostrarSaldo ? `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ •••••'}
      </Text>

      {valorPendente > 0 && (
        <View style={styles.pendingContainer}>
          <Ionicons name="card-outline" size={14} color={theme.warning} />
          <Text style={styles.pendingText}>
            Fatura Pendente: <Text style={{ fontWeight: 'bold' }}>R$ {valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Uso do Orçamento (R$ {totalOrcado.toLocaleString('pt-BR')})</Text>
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
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(0, 230, 118, 0.1)' }]}>
            <Ionicons name="trending-up" size={14} color={theme.success} />
          </View>
          <View>
            <Text style={styles.statLabel}>Entradas</Text>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {mostrarSaldo ? `R$ ${receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ •••'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => router.push({ pathname: '/analytics', params: { tab: 'despesas' } })}
        >
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(255, 82, 82, 0.1)' }]}>
            <Ionicons name="trending-down" size={14} color={theme.danger} />
          </View>
          <View>
            <Text style={styles.statLabel}>Saídas</Text>
            <Text style={[styles.statValue, { color: theme.danger }]}>
              {mostrarSaldo ? `R$ ${despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ •••'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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

const TransacoesRecentes = ({ transactions }: { transactions: Transaction[] }) => (
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

const InvoiceAlerts = ({ alerts, onMarkAsPaid }: { alerts: InvoiceAlert[], onMarkAsPaid: (cardId: string) => void }) => {
  if (alerts.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Alertas de Cartão</Text>
      </View>
      {alerts.map((alert, idx) => {
        const isClosing = alert.type === 'closing';
        // Fechamento: Azul/Ciano, Vencimento: Laranja/Vermelho
        let alertColor = isClosing ? '#00B0FF' : theme.warning;
        if (!isClosing) {
          if (alert.daysRemaining <= 1) alertColor = theme.danger;
          else if (alert.daysRemaining <= 3) alertColor = '#FF9800';
        }

        if (isClosing) {
          return (
            <TouchableOpacity
              key={`${alert.cardId}-${alert.type}-${idx}`}
              style={[styles.alertCardMini, { borderColor: `${alertColor}30`, backgroundColor: `${alertColor}05` }]}
              onPress={() => router.push('/cards')}
              activeOpacity={0.7}
            >
              <View style={[styles.alertIconCircleSmall, { backgroundColor: `${alertColor}20` }]}>
                <Ionicons name="lock-open-outline" size={14} color={alertColor} />
              </View>
              <Text style={styles.alertTitleMini}>Fatura {alert.cardName} fecha <Text style={{ color: alertColor, fontWeight: 'bold' }}>hoje</Text></Text>
              <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
            </TouchableOpacity>
          );
        }

        return (
          <View key={`${alert.cardId}-${alert.type}-${idx}`} style={[styles.alertCard, { borderColor: `${alertColor}50`, backgroundColor: `${alertColor}08` }]}>
            <View style={styles.alertHeader}>
              <View style={[styles.alertIconCircle, { backgroundColor: `${alertColor}20` }]}>
                <Ionicons name="alert-circle" size={18} color={alertColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: theme.text }]}>Vencimento Próximo</Text>
                <Text style={styles.alertCardName}>{alert.cardName}</Text>
              </View>
              <View style={[styles.alertTimeTag, { backgroundColor: `${alertColor}15` }]}>
                <Text style={[styles.alertTimeText, { color: alertColor }]}>
                  {alert.daysRemaining === 0 ? 'Vence HOJE' : `Em ${alert.daysRemaining} ${alert.daysRemaining === 1 ? 'dia' : 'dias'}`}
                </Text>
              </View>
            </View>

            <View style={styles.alertValueRow}>
              <Text style={styles.alertValueLabel}>Valor da Fatura:</Text>
              <Text style={[styles.alertValueMain, { color: alertColor }]}>
                R$ {alert.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.alertFooterCompact}>
              <TouchableOpacity
                style={styles.alertActionLink}
                onPress={() => router.push('/cards')}
              >
                <Text style={styles.alertActionLinkText}>Ver detalhes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertPayButtonAction, { backgroundColor: alertColor }]}
                onPress={() => onMarkAsPaid(alert.cardId)}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#000" style={{ marginRight: 6 }} />
                <Text style={styles.alertActionBtnText}>Marcar como Paga</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// --- TELA PRINCIPAL ---

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const insets = useSafeAreaInsets();

  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const { cards, markInvoiceAsPaid, isInvoicePaid, paidInvoices } = useCardStore();
  const { investments, fetchInvestments } = useInvestmentStore();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
    fetchInvestments();
  }, [fetchInvestments]);

  // Alertas de Fatura
  // Alertas de Fatura - Versão Corrigida para "Hoje"
  const invoiceAlerts = useMemo(() => {
    const now = new Date();
    // Zera ABSOLUTAMENTE horas, minutos, segundos e ms para comparação pura de dias
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const realMonth = today.getMonth();
    const realYear = today.getFullYear();

    const alerts: InvoiceAlert[] = [];

    cards.forEach((card: CreditCard) => {
      // 1. Soma o valor de CRÉDITO deste cartão (independente do mês selecionado)
      const invoiceValue = transactions
        .filter((t: Transaction) =>
          String(t.cardId) === String(card.id) &&
          t.paymentMethod === 'credit'
        )
        .reduce((acc: number, t: Transaction) => acc + t.value, 0);

      // Se não tem gasto, não tem alerta
      if (invoiceValue <= 0) return;

      // --- LÓGICA DE FECHAMENTO ---
      let closingDate = new Date(realYear, realMonth, Number(card.closing_day), 0, 0, 0, 0);
      if (today > closingDate) closingDate.setMonth(closingDate.getMonth() + 1);

      const diffClosing = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffClosing >= 0 && diffClosing <= 1) {
        alerts.push({
          cardId: card.id, cardName: card.name, value: invoiceValue,
          daysRemaining: diffClosing, month: closingDate.getMonth(), year: closingDate.getFullYear(),
          type: 'closing'
        });
      }

      // --- LÓGICA DE VENCIMENTO (FOCO EM "HOJE") ---
      const paga = isInvoicePaid(card.id, realMonth, realYear);

      if (!paga) {
        // Criamos a data de vencimento também zerada
        const dueDate = new Date(realYear, realMonth, Number(card.due_day), 0, 0, 0, 0);

        // Cálculo preciso de dias
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDue = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // CONDIÇÃO: Se faltar 7 dias, se for HOJE (0) ou se estiver atrasada (negativo)
        if (diffDue <= 7) {
          alerts.push({
            cardId: card.id,
            cardName: card.name,
            value: invoiceValue,
            daysRemaining: diffDue,
            month: realMonth,
            year: realYear,
            type: 'due'
          });
        }
      }
    });

    // Ordenação: Atrasadas e "Hoje" primeiro
    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [cards, transactions, isInvoicePaid, paidInvoices]);

  const handleMarkAsPaid = (cardId: string) => {
    const today = new Date();
    markInvoiceAsPaid(cardId, today.getMonth(), today.getFullYear());
    Alert.alert("Sucesso", "Fatura marcada como paga com sucesso!");
  };

  // Investimentos reais com rendimento acumulado automático
  const totalInvestido = useMemo(() =>
    investments.reduce((acc, inv) => acc + calculateLiveBalance(inv), 0)
    , [investments]);

  const rendimentoEstimado = useMemo(() => {
    // Cálculo do rendimento que será ganho HOJE (taxa diária sobre o saldo atual)
    const ANNUAL_CDI = 0.1125;
    const DAILY_RATE = Math.pow(1 + ANNUAL_CDI, 1 / 252) - 1;

    return investments.reduce((acc, inv) => {
      if (inv.cdi_percentage) {
        const saldoAtualInv = calculateLiveBalance(inv);
        const cdiFactor = inv.cdi_percentage / 100;
        const rendimentoHoje = saldoAtualInv * DAILY_RATE * cdiFactor;
        return acc + rendimentoHoje;
      }
      return acc;
    }, 0);
  }, [investments]);

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

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('transactions').select('*').limit(1);
      if (error) {
        console.log("❌ Erro de conexão:", error.message);
      } else {
        console.log("✅ Conexão com Postgres estabelecida!", data);
      }
    }
    testConnection();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.centeredWrapper}>
        <Animated.View entering={FadeInUp.duration(720)}>
          <Header
            currentMonth={currentMonth}
            currentYear={currentYear}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            user={user}
          />
        </Animated.View>

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
            <InvoiceAlerts alerts={invoiceAlerts} onMarkAsPaid={handleMarkAsPaid} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1000).duration(720)}>
            <TransacoesRecentes transactions={monthlyTransactions} />
          </Animated.View>

          {/* Card de Investimento Real */}
          <Animated.View entering={FadeInDown.delay(1200).duration(720)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Investimentos</Text>
              <TouchableOpacity onPress={() => router.push('/investimentos')}>
                <Text style={styles.seeAllText}>Ver tudo</Text>
              </TouchableOpacity>
            </View>

            {investments.length > 0 ? (
              <TouchableOpacity
                style={styles.investCard}
                onPress={() => router.push('/investimentos')}
              >
                <View style={styles.investIconBg}>
                  <MaterialCommunityIcons name="chart-areaspline" size={24} color={theme.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.investTitle}>
                    {mostrarSaldo
                      ? `R$ ${totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : 'R$ •••••'}
                  </Text>
                  <Text style={styles.investSubtitle}>
                    {rendimentoEstimado > 0
                      ? `Rendendo aprox. R$ ${rendimentoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / dia`
                      : 'Acompanhe seus rendimentos'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.border} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.emptyState}
                onPress={() => router.push('/new-investment')}
              >
                <MaterialCommunityIcons name="cash-plus" size={40} color={theme.border} />
                <Text style={styles.emptyStateText}>Nenhum investimento cadastrado.</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

        </ScrollView>
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
    overflow: 'hidden',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
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
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 64, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  pendingText: {
    color: theme.warning,
    fontSize: 13,
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
  },
  // Alertas de Fatura
  alertCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  alertCardMini: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconCircleSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertTitleMini: {
    flex: 1,
    fontSize: 13,
    color: theme.text,
  },
  alertCardName: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 1,
  },
  alertSubtitle: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  alertValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  alertValueLabel: {
    fontSize: 12,
    color: theme.textMuted,
  },
  alertValueMain: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertTimeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  alertTimeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertFooterCompact: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 15,
  },
  alertActionLink: {
    paddingVertical: 4,
  },
  alertActionLinkText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  alertActionBtnCompact: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  alertPayButtonAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  alertActionBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});