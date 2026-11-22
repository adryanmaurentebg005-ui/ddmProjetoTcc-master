import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function Button({ title, variant = 'primary', style, icon, loading, disabled, ...props }: ButtonProps) {
  const variantStyle = {
    primary: styles.primary,
    secondary: styles.secondary,
    danger: styles.danger,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        style,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
      {...props}
    >
      {icon}
      <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{loading ? 'Aguarde...' : title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primary: {
    backgroundColor: theme.colors.primaryLight,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryText: {
    color: theme.colors.text,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.55,
  },
});
