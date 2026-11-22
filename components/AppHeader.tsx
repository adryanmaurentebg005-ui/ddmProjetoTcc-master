import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function AppHeader({ title, subtitle, icon, action, style }: AppHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.copy}>
        {icon && (
          <View style={styles.iconBox}>
            <MaterialIcons name={icon} size={20} color={theme.colors.primary} />
          </View>
        )}
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  copy: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.md,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
