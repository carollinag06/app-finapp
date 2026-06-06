/**
 * TEMA GLOBAL (Design System)
 * Centraliza todas as cores e constantes visuais para garantir consistência em todo o app.
 */
export const theme = {
  // Cores de Fundo e Superfície (Dark Mode)
  bg: '#0F0F0F',           // Fundo principal da tela
  surface: '#1A1A1A',      // Fundo de cards e modais
  surfaceLight: '#262626', // Variação mais clara para destaque
  
  // Cores de Texto
  text: '#FFFFFF',         // Texto principal
  textMuted: '#999999',    // Texto secundário/desativado
  
  // Cores Temáticas
  primary: '#8A2BE2',      // Roxo (Cor principal da marca)
  primaryLight: '#A450FF', // Roxo claro
  success: '#00E676',      // Verde (Receitas, Sucesso)
  successLight: 'rgba(0, 230, 118, 0.15)',
  danger: '#FF5252',       // Vermelho (Despesas, Erros)
  dangerLight: 'rgba(255, 82, 82, 0.15)',
  warning: '#FFD740',      // Amarelo (Alertas, Pendências)
  warningLight: 'rgba(255, 214, 10, 0.15)',
  info: '#2196F3',         // Azul (Informação)
  infoLight: 'rgba(33, 150, 243, 0.15)',
  
  // Bordas e Divisores
  border: '#2A2A2A',
  
  // Cores com Opacidade (Usadas em fundos de ícones e badges)
  primaryOpacity: 'rgba(138, 43, 226, 0.15)',
  successOpacity: 'rgba(0, 230, 118, 0.15)',
  dangerOpacity: 'rgba(255, 82, 82, 0.15)',
};

/**
 * Largura máxima para visualização em telas grandes (Tablets/Web)
 */
export const MAX_WIDTH = 600;
