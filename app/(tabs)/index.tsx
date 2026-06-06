import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../store/authStore';
import { BudgetGoal, useBudgetStore } from '../../store/budgetStore';
import { CreditCard, useCardStore } from '../../store/cardStore';
import { Transaction, useTransactionStore } from '../../store/transactionStore';
import { theme, MAX_WIDTH } from '../../src/constants/theme';
import { formatCurrency, getMonthName } from '../../src/utils/format';
import { styles } from './styles';

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
          <TouchableOpacity style={styles.iconCircleHeader} onPress={() => router.push('/perfil/index' as any)}>
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

        <TouchableOpacity style={styles.monthDisplay} onPress={() => router.push('/analises' as any)}>
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
          onPress={() => router.push({ pathname: '/analises' as any, params: { tab: 'receitas' } })}
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
          onPress={() => router.push({ pathname: '/analises' as any, params: { tab: 'despesas' } })}
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

const AtalhosRapidos = () => {
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth, MAX_WIDTH);
  const shortcutWidth = (contentWidth - 40 - 48) / 4;

  return (
    <View style={styles.shortcutsContainer}>
      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/nova-transacao/index' as any)}>
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
        </View>
        <Text style={styles.shortcutText}>Lançar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/metas/index' as any)}>
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(0, 230, 118, 0.15)' }]}>
          <Ionicons name="pie-chart-outline" size={24} color={theme.success} />
        </View>
        <Text style={styles.shortcutText}>Orçamento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/metas/index' as any)}>
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
          <Ionicons name="flag-outline" size={24} color="#2196F3" />
        </View>
        <Text style={styles.shortcutText}>Metas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/mais/index' as any)}>
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
      <TouchableOpacity onPress={() => router.push('/transacoes/index' as any)}>
        <Text style={styles.seeAllText}>Ver tudo</Text>
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
              onPress={() => router.push({ pathname: '/nova-transacao/index' as any, params: { id: t.id } })}
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
          <Ionicons name="cafe-outline" size={40} color={theme.border} />
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
              onPress={() => router.push('/cartoes/index' as any)}
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
                {formatCurrency(alert.value)}
              </Text>
            </View>

            <View style={styles.alertFooterCompact}>
              <TouchableOpacity
                style={styles.alertActionLink}
                onPress={() => router.push('/cartoes/index' as any)}
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
  const { user } = useAuthStore();
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const insets = useSafeAreaInsets();

  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const { cards, markInvoiceAsPaid, isInvoicePaid } = useCardStore();

  // Alertas de Fatura
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
  }, [cards, transactions, isInvoicePaid]);

  const handleMarkAsPaid = (cardId: string) => {
    const today = new Date();
    markInvoiceAsPaid(cardId, today.getMonth(), today.getFullYear());
    Alert.alert("Sucesso", "Fatura marcada como paga com sucesso!");
  };

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
            <InvoiceAlerts alerts={invoiceAlerts} onMarkAsPaid={handleMarkAsPaid} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1000).duration(720)}>
            <TransacoesRecentes transactions={monthlyTransactions} />
          </Animated.View>

        </ScrollView>
      </View>
    </View>
  );
}
