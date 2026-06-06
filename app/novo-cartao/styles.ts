import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../src/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // Card Preview Estilizado
  cardPreview: {
    height: 210,
    borderRadius: 24,
    marginBottom: 32,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  cardOverlay: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardChip: {
    width: 45,
    height: 35,
    backgroundColor: 'rgba(255,215,0,0.6)',
    borderRadius: 6,
    padding: 5,
    justifyContent: 'space-around',
  },
  chipLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
  },
  cardPreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPreviewMiddle: {
    marginTop: 10,
  },
  cardPreviewLimitLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardPreviewLimitValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardPreviewName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  cardPreviewDates: {
    flexDirection: 'row',
  },
  cardPreviewDayLabel: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
    opacity: 0.6,
    marginBottom: 2,
  },
  cardPreviewDayValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    height: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  // Limit Style
  limitContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: theme.surface,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  limitLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  limitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
    opacity: 0.8,
  },
  displayLimitText: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  hiddenInputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  helperText: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  // Brands
  section: {
    marginBottom: 30,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandCard: {
    width: '48%',
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  brandText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  // Colors
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  colorOption: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#FFF',
    transform: [{ scale: 1.1 }],
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.bg,
  },
  saveButton: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
