import { StyleSheet } from 'react-native';
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
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  },
  cardGradient: {
    height: 180,
    padding: 20,
    borderRadius: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: 35,
    height: 25,
    backgroundColor: 'rgba(255,215,0,0.6)',
    borderRadius: 4,
    padding: 4,
    justifyContent: 'space-around',
  },
  chipLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardBrand: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  cardMiddle: {
    marginTop: 5,
  },
  cardName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    opacity: 0.9,
  },
  cardLimitLabel: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    opacity: 0.7,
    letterSpacing: 1,
  },
  cardLimitValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardDates: {
    flexDirection: 'row',
    gap: 15,
  },
  dateInfo: {
    alignItems: 'flex-start',
  },
  dateLabel: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  dateValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteIconButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
  },
  // Alerts
  alertsContainer: {
    padding: 12,
    gap: 8,
  },
  cardAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  cardAlertText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '500',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 16,
    marginTop: 15,
    marginBottom: 25,
  },
  emptyButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
