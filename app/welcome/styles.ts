import { StyleSheet } from 'react-native';
import { theme } from '../../src/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 30,
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    resizeMode: 'contain',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  emailButton: {
    backgroundColor: theme.surface,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  emailButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: theme.textMuted,
    fontSize: 15,
  },
  footerLink: {
    color: theme.primaryLight,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
