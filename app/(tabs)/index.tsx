<<<<<<< HEAD
import { Ionicons } from '@expo/vector-icons';
=======
import { Feather, Ionicons } from '@expo/vector-icons';
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
import { format, isToday, isYesterday, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
<<<<<<< HEAD
  Alert,
=======
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
<<<<<<< HEAD
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../store/authStore';
import { BudgetGoal, useBudgetStore } from '../../store/budgetStore';
import { CreditCard, useCardStore } from '../../store/cardStore';
import { Transaction, useTransactionStore } from '../../store/transactionStore';
import { theme, MAX_WIDTH } from '../../src/constants/theme';
import { formatCurrency, getMonthName } from '../../src/utils/format';
=======
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importação das Stores (Zustand) para gerenciar estado global de autenticação e transações
import { useAuthStore } from '../../store/authStore';
import { Transaction, useTransactionStore } from '../../store/transactionStore';
// Importação de constantes de tema e helpers de formatação
import { theme, MAX_WIDTH } from '../../src/constants/theme';
import { formatCurrency, getMonthName } from '../../src/utils/format';
// Importação dos estilos específicos desta tela
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
import { styles } from './styles';

// --- TIPAGEM ---

<<<<<<< HEAD
interface InvoiceAlert {
  cardId: string;
  cardName: string;
  value: number;
  daysRemaining: number;
  month: number;
  year: number;
  type: 'closing' | 'due';
}

=======
// Mapeamento de ícones do Ionicons para cada categoria de transação
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
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

<<<<<<< HEAD
=======
/**
 * Componente de Cabeçalho (Header)
 * Exibe a saudação ao usuário, avatar e seletor de mês/ano.
 */
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
const Header = ({ currentMonth, currentYear, onPrev, onNext, user }: {
  currentMonth: number,
  currentYear: number,
  onPrev: () => void,
  onNext: () => void,
  user: any
}) => {
<<<<<<< HEAD
=======
  // Extrai o primeiro nome do usuário para a saudação
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  const avatarUrl = user?.avatar_url;

  return (
    <View style={styles.header}>
<<<<<<< HEAD
=======
      {/* Parte superior: Saudação e Perfil */}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greetingText}>Olá, {firstName} 👋</Text>
          <Text style={styles.welcomeText}>Sua saúde financeira está ótima!</Text>
        </View>
        <View style={styles.headerIconsRow}>
<<<<<<< HEAD
          <TouchableOpacity style={styles.iconCircleHeader} onPress={() => router.push('/perfil/index' as any)}>
=======
          {/* Botão que leva para a tela de perfil */}
          <TouchableOpacity style={styles.iconCircleHeader} onPress={() => router.push('/profile')}>
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            ) : (
              <Ionicons name="person-outline" size={22} color={theme.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

<<<<<<< HEAD
=======
      {/* Parte inferior: Seletor de Mês (Navegação temporal) */}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
      <View style={styles.monthSelectorRow}>
        <TouchableOpacity
          style={styles.monthArrowBtn}
          onPress={onPrev}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={18} color={theme.textMuted} />
        </TouchableOpacity>

<<<<<<< HEAD
        <TouchableOpacity style={styles.monthDisplay} onPress={() => router.push('/analises' as any)}>
=======
        {/* Exibe o nome do mês e ano atuais; leva para a tela de análise ao clicar */}
        <TouchableOpacity style={styles.monthDisplay} onPress={() => router.push('/analytics')}>
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
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

<<<<<<< HEAD
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
=======
// Definição das propriedades que o card de saldo recebe
interface CardSaldoProps {
  mostrarSaldo: boolean;    // Controla se o valor está visível ou oculto (olhinho)
  toggleSaldo: () => void;  // Função para alternar a visibilidade
  saldo: number;            // Valor líquido calculado
  receitas: number;         // Soma das entradas do mês
  despesas: number;         // Soma das saídas do mês
  valorPendente: number;    // Soma de gastos no cartão de crédito
}

/**
 * Componente do Card de Saldo Principal
 * Mostra o resumo financeiro do mês (Saldo, Entradas e Saídas).
 */
const CardSaldo = ({ mostrarSaldo, toggleSaldo, saldo, receitas, despesas, valorPendente }: CardSaldoProps) => {
  return (
    <View style={styles.mainCard}>
      {/* Cabeçalho do Card: Label e botão de ocultar/mostrar */}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
      <View style={styles.mainCardHeader}>
        <Text style={styles.mainCardLabel}>Saldo Disponível</Text>
        <TouchableOpacity onPress={toggleSaldo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={mostrarSaldo ? "eye-outline" : "eye-off-outline"} size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

<<<<<<< HEAD
=======
      {/* Exibição do Saldo (formatado ou mascarado) */}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
      <Text style={styles.mainCardValue}>
        {mostrarSaldo ? formatCurrency(saldo) : 'R$ •••••'}
      </Text>

<<<<<<< HEAD
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
=======
      {/* Linha de Estatísticas: Entradas e Saídas detalhadas */}
      <View style={styles.statsRow}>
        {/* Bloco de Entradas (Verde) */}
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => router.push({ pathname: '/analytics', params: { tab: 'receitas' } })}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
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

<<<<<<< HEAD
        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => router.push({ pathname: '/analises' as any, params: { tab: 'despesas' } })}
=======
        {/* Divisor vertical entre os blocos */}
        <View style={styles.statDivider} />

        {/* Bloco de Saídas (Vermelho) */}
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => router.push({ pathname: '/analytics', params: { tab: 'despesas' } })}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
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

<<<<<<< HEAD
const AtalhosRapidos = () => {
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth, MAX_WIDTH);
  const shortcutWidth = (contentWidth - 40 - 48) / 4;

  return (
    <View style={styles.shortcutsContainer}>
      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/nova-transacao/index' as any)}>
=======
/**
 * Componente de Atalhos Rápidos
 * Botões circulares para navegação rápida para as principais funcionalidades.
 */
const AtalhosRapidos = () => {
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth, MAX_WIDTH);
  const shortcutWidth = (contentWidth - 40 - 48) / 4; // Cálculo dinâmico de largura para alinhar 4 botões

  return (
    <View style={styles.shortcutsContainer}>
      {/* Atalho: Lançar Nova Transação */}
      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/new-transaction')}>
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
        </View>
        <Text style={styles.shortcutText}>Lançar</Text>
      </TouchableOpacity>

<<<<<<< HEAD
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
=======
      {/* Atalho: Ver Extrato completo */}
      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/transacoes')}>
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(0, 230, 118, 0.15)' }]}>
          <Ionicons name="receipt-outline" size={24} color={theme.success} />
        </View>
        <Text style={styles.shortcutText}>Extrato</Text>
      </TouchableOpacity>

      {/* Atalho: Ver Gráficos e Análises */}
      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/analytics')}>
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
          <Ionicons name="pie-chart-outline" size={24} color="#2196F3" />
        </View>
        <Text style={styles.shortcutText}>Gráficos</Text>
      </TouchableOpacity>

      {/* Atalho: Abrir menu de mais opções */}
      <TouchableOpacity style={[styles.shortcutItem, { width: shortcutWidth }]} onPress={() => router.push('/mais')}>
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 215, 64, 0.15)' }]}>
          <Ionicons name="options-outline" size={24} color={theme.warning} />
        </View>
        <Text style={styles.shortcutText}>Mais</Text>
      </TouchableOpacity>
    </View>
  );
};

<<<<<<< HEAD
=======
/**
 * Componente de Transações Recentes
 * Lista as últimas 4 transações realizadas no mês selecionado.
 */
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
const TransacoesRecentes = ({ transactions }: { transactions: Transaction[] }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Transações Recentes</Text>
<<<<<<< HEAD
      <TouchableOpacity onPress={() => router.push('/transacoes/index' as any)}>
=======
      <TouchableOpacity onPress={() => router.push('/transacoes')}>
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
        <Text style={styles.seeAllText}>Ver tudo</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.transactionsList}>
      {transactions.length > 0 ? (
<<<<<<< HEAD
=======
        // Mapeia as 4 transações mais recentes para componentes visuais
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
        transactions.slice(0, 4).map((t) => {
          const icon = categoryIcons[t.category] || 'pricetag';
          const isIncome = t.type === 'income';

          return (
            <TouchableOpacity
              key={t.id}
              style={styles.transactionItem}
<<<<<<< HEAD
              onPress={() => router.push({ pathname: '/nova-transacao/index' as any, params: { id: t.id } })}
              activeOpacity={0.7}
            >
              <View style={[styles.transactionIconBg, { backgroundColor: isIncome ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)' }]}>
=======
              onPress={() => router.push({ pathname: '/new-transaction', params: { id: t.id } })}
              activeOpacity={0.7}
            >
              {/* Ícone da Categoria (Verde para Receita, Vermelho para Despesa) */}
              <View style={[styles.transactionIconBg, { backgroundColor: isIncome ? 'rgba(0, 230, 118, 0.1)' : 
                'rgba(255, 82, 82, 0.1)' }]}>
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={isIncome ? theme.success : theme.danger}
                />
              </View>
<<<<<<< HEAD
=======
              {/* Informações da Transação (Descrição, Categoria e Data) */}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle} numberOfLines={1}>{t.description}</Text>
                <Text style={styles.transactionSubtitle}>
                  {t.category} • {(() => {
                    try {
<<<<<<< HEAD
=======
                      // Converte a string de data para objeto Date e formata para exibição 
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
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
<<<<<<< HEAD
=======
              {/* Valor da Transação */}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
              <View style={styles.transactionValueContainer}>
                <Text style={[styles.transactionValueText, { color: isIncome ? theme.success : theme.text }]}>
                  {isIncome ? '+' : '-'} {formatCurrency(t.value)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
<<<<<<< HEAD
        <View style={styles.emptyState}>
          <Ionicons name="cafe-outline" size={40} color={theme.border} />
=======
        // Estado vazio (Empty State) caso não haja transações no mês
        <View style={styles.emptyState}>
          <Feather name="coffee" size={40} color={theme.border} />
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
          <Text style={styles.emptyStateText}>Nenhuma transação este mês.</Text>
        </View>
      )}
    </View>
  </View>
);

<<<<<<< HEAD
=======
/**
 * Card de Saúde Financeira
 * Exibe um resumo motivacional baseado no desempenho da semana.
 */
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
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

<<<<<<< HEAD
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
=======
// --- TELA PRINCIPAL (DASHBOARD) ---

export default function Dashboard() {
  // Estados globais e locais
  const { user } = useAuthStore(); // Dados do usuário logado
  const [mostrarSaldo, setMostrarSaldo] = useState(true); // Controle de visibilidade do saldo
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // Mês exibido atualmente
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Ano exibido atualmente
  const insets = useSafeAreaInsets(); // Ajuste de margens para telas com notch (iPhone/Android)

  // Obtém todas as transações da store global
  const transactions = useTransactionStore((state) => state.transactions);

  // Filtra as transações para exibir apenas as que pertencem ao mês e ano selecionados
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      const transactionDate = t.date.includes('/')
        ? (() => { const [d, m, y] = t.date.split('/').map(Number); return new Date(y, m - 1, d); })()
        : new Date(t.date);

      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

<<<<<<< HEAD
=======
  // Calcula a soma total de todas as receitas (entradas) do mês
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
  const receitasTotais = useMemo(() =>
    monthlyTransactions.filter((t: Transaction) => t.type === 'income').reduce((acc: number, t: Transaction) => acc + t.value, 0)
    , [monthlyTransactions]);

<<<<<<< HEAD
=======
  // Calcula a soma total de todas as despesas (saídas) do mês
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
  const despesasTotais = useMemo(() =>
    monthlyTransactions.filter((t: Transaction) => t.type === 'expense').reduce((acc: number, t: Transaction) => acc + t.value, 0)
    , [monthlyTransactions]);

<<<<<<< HEAD
=======
  // Calcula o valor total gasto especificamente no Cartão de Crédito
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
  const valorPendente = useMemo(() =>
    monthlyTransactions.filter((t: Transaction) => t.type === 'expense' && t.paymentMethod === 'credit').reduce((acc: number, t: Transaction) => acc + t.value, 0)
    , [monthlyTransactions]);

<<<<<<< HEAD
  const totalOrcado = useMemo(() =>
    budgets.reduce((acc: number, b: BudgetGoal) => acc + b.amount, 0)
    , [budgets]);

  const saldoAtual = receitasTotais - despesasTotais; // Saldo líquido (Receitas - Todas as Despesas, incluindo crédito)

=======
  // Calcula o saldo líquido (Receitas - Despesas)
  const saldoAtual = receitasTotais - despesasTotais;

  // Função para navegar para o mês anterior no seletor
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

<<<<<<< HEAD
=======
  // Função para navegar para o próximo mês no seletor
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
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
<<<<<<< HEAD
=======
        {/* Renderiza o Cabeçalho */}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
        <View>
          <Header
            currentMonth={currentMonth}
            currentYear={currentYear}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            user={user}
          />
        </View>

<<<<<<< HEAD
=======
        {/* Área de rolagem principal da tela */}
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
<<<<<<< HEAD
          <Animated.View entering={FadeInDown.delay(200).duration(720)}>
=======
          {/* Card de Saldo */}
          <View>
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
            <CardSaldo
              mostrarSaldo={mostrarSaldo}
              toggleSaldo={() => setMostrarSaldo(!mostrarSaldo)}
              saldo={saldoAtual}
              receitas={receitasTotais}
              despesas={despesasTotais}
              valorPendente={valorPendente}
<<<<<<< HEAD
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
=======
            />
          </View>

          {/* Seção de Atalhos */}
          <View>
            <AtalhosRapidos />
          </View>

          {/* Card de Saúde Financeira */}
          <View>
            <HealthCard />
          </View>

          {/* Lista de Transações Recentes */}
          <View>
            <TransacoesRecentes transactions={monthlyTransactions} />
          </View>
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412

        </ScrollView>
      </View>
    </View>
  );
}
