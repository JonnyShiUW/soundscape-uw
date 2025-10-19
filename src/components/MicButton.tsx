import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated, View } from 'react-native';
import { theme } from '../theme';

interface MicButtonProps {
  onPress: () => void;
  isListening: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function MicButton({
  onPress,
  isListening,
  disabled = false,
  style,
}: MicButtonProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isListening) {
      // Create pulsing animation when listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const backgroundColor = disabled
    ? theme.colors.surfaceElevated
    : isListening
    ? theme.colors.danger
    : theme.colors.primary;

  const borderColor = disabled
    ? theme.colors.border
    : isListening
    ? theme.colors.danger
    : theme.colors.primary;

  const textColor = disabled ? theme.colors.textTertiary : '#ffffff';

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor, borderColor },
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isListening ? 'Listening for command' : 'Tap to speak command'}
        accessibilityHint="Speak a command like 'Where am I', 'Guide me', or 'What do you see'"
        accessibilityState={{ disabled, selected: isListening }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{isListening ? '⏹' : '🎤'}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: textColor }]}>
              {isListening ? 'Listening...' : 'Voice Command'}
            </Text>
            {!isListening && (
              <Text style={styles.subtitle}>
                Tap and speak your command
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: theme.buttonHeight.large + 16,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    letterSpacing: -0.1,
  },
});
