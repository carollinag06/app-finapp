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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importação das Stores (Zustand) para gerenciar estado global de autenticação e transações
import { useAuthStore } from '../../store/authStore';
import { Transaction, useTransactionStore } from '../../store/transactionStore';
// Importação de constantes de tema e helpers de formatação
import { theme, MAX_WIDTH } from '../../src/constants/theme';
import { formatCurrency, getMonthName } from '../../src/utils/format';
// Importação dos estilos específicos desta tela
import { styles } from './styles';

// --- TIPAGEM ---

// Mapeamento de ícones do Ionicons para cada categoria de transação
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

/**
 * Componente de Cabeçalho (Header)
 * Exibe a saudação ao usuário, avatar e seletor de mês/ano.
 */
const Header = ({ currentMonth, currentYear, onPrev, onNext, user }: {
  currentMonth: number,
  currentYear: number,
  onPrev: () => void,
  onNext: () => void,
  user: any
}) => {
  // Extrai o primeiro nome do usuário para a saudação
  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  const avatarUrl = user?.avatar_url;

  return (
    <View style={styles.header}>
      {/* Parte superior: Saudação e Perfil */}
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greetingText}>Olá, {firstName} 👋</Text>
          <Text style={styles.welcomeText}>Sua saúde financeira está ótima!</Text>
        </View>
        <View style={styles.headerIconsRow}>
          {/* Botão que leva para a tela de perfil */}
          <TouchableOpacity style={styles.iconCircleHeader} onPress={() => router.push('/profile')}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            ) : (
              <Ionicons name="person-outline" size={22} color={theme.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Parte inferior: Seletor de Mês (Navegação temporal) */}
      <View style={styles.monthSelectorRow}>
        <TouchableOpacity
          style={styles.monthArrowBtn}
          onPress={onPrev}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Exibe o nome do mês e ano atuais; leva para a tela de análise ao clicar */}
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
      <View style={styles.mainCardHeader}>
        <Text style={styles.mainCardLabel}>Saldo Disponível</Text>
        <TouchableOpacity onPress={toggleSaldo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={mostrarSaldo ? "eye-outline" : "eye-off-outline"} size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Exibição do Saldo (formatado ou mascarado) */}
      <Text style={styles.mainCardValue}>
        {mostrarSaldo ? formatCurrency(saldo) : 'R$ •••••'}
      </Text>

      {/* Linha de Estatísticas: Entradas e Saídas detalhadas */}
      <View style={styles.statsRow}>
        {/* Bloco de Entradas (Verde) */}
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

        {/* Divisor vertical entre os blocos */}
        <View style={styles.statDivider} />

        {/* Bloco de Saídas (Vermelho) */}
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
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
        </View>
        <Text style={styles.shortcutText}>Lançar</Text>
      </TouchableOpacity>

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
        <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 215, 64, 0.15)' }]}>
          <Ionicons name="options-outline" size={24} color={theme.warning} />
        </View>
        <Text style={styles.shortcutText}>Mais</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Componente de Transações Recentes
 * Lista as últimas 4 transações realizadas no mês selecionado.
 */
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
        // Mapeia as 4 transações mais recentes para componentes visuais
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
              {/* Ícone da Categoria (Verde para Receita, Vermelho para Despesa) */}
              <View style={[styles.transactionIconBg, { backgroundColor: isIncome ? 'rgba(0, 230, 118, 0.1)' : 
                'rgba(255, 82, 82, 0.1)' }]}>
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={isIncome ? theme.success : theme.danger}
                />
              </View>
              {/* Informações da Transação (Descrição, Categoria e Data) */}
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle} numberOfLines={1}>{t.description}</Text>
                <Text style={styles.transactionSubtitle}>
                  {t.category} • {(() => {
                    try {
                      // Converte a string de data para objeto Date e formata para exibição 
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
              {/* Valor da Transação */}
              <View style={styles.transactionValueContainer}>
                <Text style={[styles.transactionValueText, { color: isIncome ? theme.success : theme.text }]}>
                  {isIncome ? '+' : '-'} {formatCurrency(t.value)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        // Estado vazio (Empty State) caso não haja transações no mês
        <View style={styles.emptyState}>
          <Feather name="coffee" size={40} color={theme.border} />
          <Text style={styles.emptyStateText}>Nenhuma transação este mês.</Text>
        </View>
      )}
    </View>
  </View>
);

/**
 * Card de Saúde Financeira
 * Exibe um resumo motivacional baseado no desempenho da semana.
 */
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
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      const transactionDate = t.date.includes('/')
        ? (() => { const [d, m, y] = t.date.split('/').map(Number); return new Date(y, m - 1, d); })()
        : new Date(t.date);

      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  // Calcula a soma total de todas as receitas (entradas) do mês
  const receitasTotais = useMemo(() =>
    monthlyTransactions.filter((t: Transaction) => t.type === 'income').reduce((acc: number, t: Transaction) => acc + t.value, 0)
    , [monthlyTransactions]);

  // Calcula a soma total de todas as despesas (saídas) do mês
  const despesasTotais = useMemo(() =>
    monthlyTransactions.filter((t: Transaction) => t.type === 'expense').reduce((acc: number, t: Transaction) => acc + t.value, 0)
    , [monthlyTransactions]);

  // Calcula o valor total gasto especificamente no Cartão de Crédito
  const valorPendente = useMemo(() =>
    monthlyTransactions.filter((t: Transaction) => t.type === 'expense' && t.paymentMethod === 'credit').reduce((acc: number, t: Transaction) => acc + t.value, 0)
    , [monthlyTransactions]);

  // Calcula o saldo líquido (Receitas - Despesas)
  const saldoAtual = receitasTotais - despesasTotais;

  // Função para navegar para o mês anterior no seletor
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Função para navegar para o próximo mês no seletor
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
        {/* Renderiza o Cabeçalho */}
        <View>
          <Header
            currentMonth={currentMonth}
            currentYear={currentYear}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            user={user}
          />
        </View>

        {/* Área de rolagem principal da tela */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Card de Saldo */}
          <View>
            <CardSaldo
              mostrarSaldo={mostrarSaldo}
              toggleSaldo={() => setMostrarSaldo(!mostrarSaldo)}
              saldo={saldoAtual}
              receitas={receitasTotais}
              despesas={despesasTotais}
              valorPendente={valorPendente}
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

        </ScrollView>
      </View>
    </View>
  );
}
