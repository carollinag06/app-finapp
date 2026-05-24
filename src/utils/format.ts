import { format as formatDateFns, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata um valor numérico para moeda (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata uma data ISO para string legível
 */
export const formatDate = (dateISO: string, pattern: string = "dd 'de' MMMM"): string => {
  try {
    return formatDateFns(parseISO(dateISO), pattern, { locale: ptBR });
  } catch (error) {
    return dateISO;
  }
};

/**
 * Retorna o nome do mês a partir de um índice (0-11)
 */
export const getMonthName = (monthIndex: number): string => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[monthIndex];
};
