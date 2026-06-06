import { StyleSheet, Platform } from 'react-native';
import { theme, MAX_WIDTH } from '../../src/constants/theme';

export const styles = StyleSheet.create({
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
  keyboardView: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    letterSpacing: -0.5,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.2)',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Seletor Receita/Despesa
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  typeText: {
    color: theme.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  typeTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  // Input de Valor Destacado
  valueContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    paddingVertical: 40,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  valueLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  valueDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 10,
    marginTop: 8,
  },
  displayValueText: {
    fontSize: 64,
    fontWeight: 'bold',
    letterSpacing: -2,
  },
  valueInputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  helperText: {
    color: theme.textMuted,
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
    opacity: 0.7,
  },

  // Formulário
  formSection: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCategoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.primaryOpacity,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addCategoryLinkText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    height: 64,
    paddingHorizontal: 18,
  },
  inputIcon: {
    marginRight: 14,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    height: '100%',
    fontWeight: '500',
  },
  inputText: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownIcon: {
    marginLeft: 'auto',
    opacity: 0.5,
  },
  // Date Picker iOS
  datePickerContainer: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  doneButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: theme.primaryOpacity,
    borderRadius: 12,
    marginTop: 8,
  },
  doneButtonText: {
    color: theme.primary,
    fontWeight: 'bold',
  },

  // Pills (Recorrência e Meio de Pagamento)
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pillActive: {
    backgroundColor: theme.primaryOpacity,
    borderColor: theme.primary,
  },
  pillText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: theme.primary,
  },

  // Seleção de Cartão
  cardSelectorScroll: {
    paddingVertical: 4,
    gap: 12,
  },
  cardSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  cardSelectName: {
    fontSize: 14,
    fontWeight: '600',
  },
  addCardMiniButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  addCardMiniText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  noCardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  noCardsText: {
    color: theme.textMuted,
    fontSize: 14,
    flex: 1,
  },

  // Categorias
  noCategoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  noCategoriesText: {
    color: theme.textMuted,
    fontSize: 14,
    flex: 1,
  },
  categoryScroll: {
    gap: 12,
    paddingVertical: 8,
  },
  categoryCard: {
    width: 90,
    height: 90,
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  // Rodapé e Botão Salvar
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: 12,
    backgroundColor: theme.bg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
