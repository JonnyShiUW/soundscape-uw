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
      <View style={[styles.indicator, { backgroundColor: statusColor }]} />
      <Text style={styles.statusText}>{statusText}</Text>
      {fps !== undefined && (
        <Text style={styles.fpsText}> • {fps.toFixed(1)} FPS</Text>
      )}
      {message && (
        <Text style={styles.messageText} numberOfLines={1}>
          {' '}
          • {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  fpsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  messageText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    flex: 1,
  },
});
