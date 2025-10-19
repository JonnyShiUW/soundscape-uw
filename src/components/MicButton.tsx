import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
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
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const backgroundColor = disabled
    ? theme.colors.border
    : isListening
    ? theme.colors.danger
    : theme.colors.primary;

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor }, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isListening ? 'Listening for command' : 'Tap to speak command'}
        accessibilityHint="Speak a command like 'Where am I', 'Guide me', or 'What do you see'"
        accessibilityState={{ disabled, selected: isListening }}
      >
        <Text style={styles.icon}>{isListening ? '⏹' : '🎤'}</Text>
        <Text style={styles.text}>
          {isListening ? 'Listening...' : 'Tap to Speak'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: theme.buttonHeight.large,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    minWidth: 200,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
});
