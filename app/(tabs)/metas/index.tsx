import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BudgetGoal, useBudgetStore } from '../../../store/budgetStore';
import { useTransactionStore } from '../../../store/transactionStore';
import { theme } from '../../../src/constants/theme';
import { styles } from './styles';

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
