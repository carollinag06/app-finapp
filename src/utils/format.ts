import { format as formatDateFns, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * FUNÇÃO: formatCurrency
 * Converte um número (ex: 1250.5) para uma string de moeda brasileira (R$ 1.250,50).
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * FUNÇÃO: formatDate
 * Converte uma data no formato ISO (2023-10-27T...) para um formato legível (27 de Outubro).
 * Utiliza o locale ptBR para os nomes dos meses em português.
 */
export const formatDate = (dateISO: string, pattern: string = "dd 'de' MMMM"): string => {
  try {
    return formatDateFns(parseISO(dateISO), pattern, { locale: ptBR });
  } catch (error) {
    return dateISO; // Caso falhe, retorna a string original
  }
};

/**
 * FUNÇÃO: getMonthName
 * Retorna o nome por extenso do mês baseado no seu índice numérico (0 = Janeiro, 11 = Dezembro).
 */
export const getMonthName = (monthIndex: number): string => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[monthIndex];
};
