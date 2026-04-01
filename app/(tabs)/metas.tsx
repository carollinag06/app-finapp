import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BudgetGoal, useBudgetStore } from '../../store/budgetStore';
import { useTransactionStore } from '../../store/transactionStore';

const MAX_WIDTH = 600;

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  primaryLight: 'rgba(138, 43, 226, 0.15)',
  success: '#32D74B',
  warning: '#FFD60A',
  danger: '#FF453A',
  border: '#2C2C2E',
};

const Header = () => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerSubtitle}>Minhas</Text>
      <Text style={styles.headerTitle}>Metas</Text>
    </View>
    <TouchableOpacity style={styles.addGoalButton} onPress={() => router.push('/new-budget')}>
      <Ionicons name="add" size={24} color="#FFF" />
    </TouchableOpacity>
  </View>
);

const BudgetCard = ({ goal, spent }: { goal: BudgetGoal; spent: number }) => {
  const percentage = Math.min((spent / goal.amount) * 100, 100);
  const isOverBudget = spent > goal.amount;
  const isNearLimit = spent >= goal.amount * 0.8 && !isOverBudget;
  const remaining = goal.amount - spent;

  const getBarColor = () => {
    if (isOverBudget) return theme.danger;
    if (isNearLimit) return theme.warning;
    return goal.color;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.iconBg, { backgroundColor: `${goal.color}20` }]}>
          <Ionicons name={(goal.icon as keyof typeof Ionicons.glyphMap) || 'wallet-outline'} size={22} color={goal.color} />
        </View>
        <View style={styles.cardTitleContainer}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardCategory}>{goal.category}</Text>
            {isOverBudget && (
              <View style={[styles.alertBadge, { backgroundColor: `${theme.danger}20` }]}>
                <Text style={[styles.alertBadgeText, { color: theme.danger }]}>Estourou</Text>
              </View>
            )}
            {isNearLimit && (
              <View style={[styles.alertBadge, { backgroundColor: `${theme.warning}20` }]}>
                <Text style={[styles.alertBadgeText, { color: theme.warning }]}>Atenção</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardAmount}>R$ {spent.toLocaleString('pt-BR')} / R$ {goal.amount.toLocaleString('pt-BR')}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/new-budget', params: { id: goal.id } })}>
          <Feather name="edit-2" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: getBarColor() }
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressPercent, (isOverBudget || isNearLimit) && { color: getBarColor(), fontWeight: 'bold' }]}>
            {percentage.toFixed(0)}% utilizado
          </Text>
          <Text style={[styles.remainingText, isOverBudget && { color: theme.danger }, isNearLimit && { color: theme.warning }]}>
            {isOverBudget ? `Excedeu R$ ${Math.abs(remaining).toLocaleString('pt-BR')}` : `Resta R$ ${remaining.toLocaleString('pt-BR')}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function MetasScreen() {
  const insets = useSafeAreaInsets();
  const budgets = useBudgetStore((state) => state.budgets);
  const transactions = useTransactionStore((state) => state.transactions);

  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

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

  const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' });

  // Calcular dias restantes no mês selecionado
  const daysRemaining = useMemo(() => {
    const today = new Date();
    if (currentMonth !== today.getMonth() || currentYear !== today.getFullYear()) {
      return 0; // Se não for o mês atual, não faz sentido calcular gasto diário
    }
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    return Math.max(lastDayOfMonth - today.getDate() + 1, 1);
  }, [currentMonth, currentYear]);

  // Filtrar gastos do mês selecionado por categoria
  const monthlyExpenses = useMemo(() => {
    const expenses: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const transactionDate = t.date.includes('/')
          ? (() => { const [d, m, y] = t.date.split('/').map(Number); return new Date(y, m - 1, d); })()
          : new Date(t.date);

        if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
          expenses[t.category] = (expenses[t.category] || 0) + t.value;
        }
      }
    });
    return expenses;
  }, [transactions, currentMonth, currentYear]);

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpentInBudgets = budgets.reduce((acc, b) => acc + (monthlyExpenses[b.category] || 0), 0);
  const overallPercentage = Math.min((totalSpentInBudgets / totalBudgeted) * 100, 100);

  const dailyAllowance = useMemo(() => {
    if (daysRemaining <= 0 || totalBudgeted <= 0) return 0;
    const remainingBudget = totalBudgeted - totalSpentInBudgets;
    return Math.max(remainingBudget / daysRemaining, 0);
  }, [totalBudgeted, totalSpentInBudgets, daysRemaining]);

  // Sugestões de metas (categorias com gastos mas sem metas)
  const goalSuggestions = useMemo(() => {
    const budgetedCategories = new Set(budgets.map(b => b.category));
    const suggestions: { category: string; spent: number }[] = [];

    Object.entries(monthlyExpenses).forEach(([category, spent]) => {
      if (!budgetedCategories.has(category) && spent > 0) {
        suggestions.push({ category, spent });
      }
    });

    return suggestions.sort((a, b) => b.spent - a.spent).slice(0, 3);
  }, [budgets, monthlyExpenses]);

  // Ordenação das metas: Estouradas primeiro, depois por proximidade do limite
  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => {
      const percA = (monthlyExpenses[a.category] || 0) / a.amount;
      const percB = (monthlyExpenses[b.category] || 0) / b.amount;
      return percB - percA;
    });
  }, [budgets, monthlyExpenses]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.centeredWrapper}>
        <Animated.View entering={FadeInUp.duration(650)}>
          <Header />
        </Animated.View>

        <FlatList
          data={sortedBudgets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          ListHeaderComponent={() => (
            <Animated.View key={`header-${currentMonth}-${currentYear}`} entering={FadeIn.duration(320)}>
              {/* Seletor de Mês */}
              <View style={styles.monthSelector}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
                  <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.monthTitleContainer}>
                  <Text style={styles.monthName}>{monthName}</Text>
                  <Text style={styles.yearName}>{currentYear}</Text>
                </View>
                <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
                  <Ionicons name="chevron-forward" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Resumo Geral */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryInfo}>
                  <View>
                    <Text style={styles.summaryLabel}>Total Orçado</Text>
                    <Text style={styles.summaryValue}>R$ {totalBudgeted.toLocaleString('pt-BR')}</Text>
                  </View>
                  <View style={styles.summaryBadge}>
                    <Text style={styles.summaryBadgeText}>Meta Mensal</Text>
                  </View>
                </View>

                <View style={styles.overallProgress}>
                  <View style={styles.progressBarBgLarge}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${overallPercentage}%`, backgroundColor: theme.primary }
                      ]}
                    />
                  </View>
                  <View style={styles.summaryFooter}>
                    <Text style={styles.summarySpent}>Gasto R$ {totalSpentInBudgets.toLocaleString('pt-BR')}</Text>
                    <Text style={styles.summaryRemaining}>Resta R$ {(totalBudgeted - totalSpentInBudgets).toLocaleString('pt-BR')}</Text>
                  </View>
                </View>

                {dailyAllowance > 0 && (
                  <View style={styles.dailyAdvice}>
                    <MaterialCommunityIcons name="information-outline" size={16} color={theme.primary} />
                    <Text style={styles.dailyAdviceText}>
                      Para não estourar, você pode gastar até <Text style={{ fontWeight: 'bold', color: theme.text }}>R$ {dailyAllowance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text> por dia.
                    </Text>
                  </View>
                )}
              </View>

              {goalSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.sectionTitle}>Sugestões de Metas</Text>
                  {goalSuggestions.map((s, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.suggestionCard}
                      onPress={() => router.push({ pathname: '/new-budget', params: { category: s.category } })}
                    >
                      <View style={styles.suggestionInfo}>
                        <Ionicons name="bulb-outline" size={20} color={theme.warning} />
                        <Text style={styles.suggestionText}>
                          Você gastou <Text style={{ fontWeight: 'bold' }}>R$ {s.spent.toLocaleString('pt-BR')}</Text> com <Text style={{ fontWeight: 'bold' }}>{s.category}</Text>. Deseja criar uma meta?
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.sectionTitle}>Minhas Metas</Text>
            </Animated.View>
          )}
          renderItem={({ item }) => (
            <Animated.View key={`item-${item.id}-${currentMonth}`} entering={FadeIn.duration(320)}>
              <BudgetCard goal={item} spent={monthlyExpenses[item.category] || 0} />
            </Animated.View>
          )}
          ListEmptyComponent={() => (
            <Animated.View entering={FadeIn.duration(320)} style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color={theme.textMuted} />
              <Text style={styles.emptyTitle}>Nenhuma meta definida</Text>
              <Text style={styles.emptySubtitle}>Defina orçamentos para controlar seus gastos por categoria.</Text>
            </Animated.View>
          )}
        />
      </View>
    </View>
  );
}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    letterSpacing: -0.5,
  },
  addGoalButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 20,
  },
  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  monthTitleContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    textTransform: 'capitalize',
  },
  yearName: {
    fontSize: 12,
    color: theme.textMuted,
  },
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  summaryLabel: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    color: theme.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryBadge: {
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  summaryBadgeText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  overallProgress: {
    gap: 12,
  },
  progressBarBgLarge: {
    height: 12,
    backgroundColor: theme.surfaceLight,
    borderRadius: 6,
    width: '100%',
    overflow: 'hidden',
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summarySpent: {
    color: theme.textMuted,
    fontSize: 12,
  },
  summaryRemaining: {
    color: theme.success,
    fontSize: 12,
    fontWeight: '600',
  },
  dailyAdvice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  dailyAdviceText: {
    color: theme.textMuted,
    fontSize: 12,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  suggestionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  suggestionText: {
    color: theme.text,
    fontSize: 13,
    flex: 1,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  cardAmount: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  progressContainer: {
    gap: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.surfaceLight,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercent: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 11,
    color: theme.success,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
