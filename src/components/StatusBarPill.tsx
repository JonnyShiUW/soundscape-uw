import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface StatusBarPillProps {
  status: 'offline' | 'analyzing' | 'ready' | 'error';
  message?: string;
  fps?: number;
}

export function StatusBarPill({ status, message, fps }: StatusBarPillProps) {
  const statusColor =
    status === 'offline'
      ? theme.colors.textSecondary
      : status === 'analyzing'
      ? theme.colors.primary
      : status === 'error'
      ? theme.colors.danger
      : theme.colors.success;

  const statusText =
    status === 'offline'
      ? 'Offline'
      : status === 'analyzing'
      ? 'Analyzing...'
      : status === 'error'
      ? 'Error'
      : 'Ready';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.indicator, { backgroundColor: statusColor }]} />
        <Text style={styles.statusText}>{statusText}</Text>
        {fps !== undefined && (
          <Text style={styles.fpsText}> · {fps.toFixed(1)} fps</Text>
        )}
      </View>
      {message && (
        <Text style={styles.messageText} numberOfLines={2}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: -0.2,
  },
  fpsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  messageText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    lineHeight: 18,
    fontWeight: theme.fontWeight.regular,
  },
});
