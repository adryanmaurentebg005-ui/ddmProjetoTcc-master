import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '../constants/theme';
import { useAppTheme } from '../contexts/ThemeContext';

export function ScreenShell({ title, subtitle, icon, children }: {
  title: string; subtitle?: string; icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name']; children: React.ReactNode;
}) {
  useAppTheme();
  return <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.kicker, { color: theme.colors.primaryLight }]}>DENÚNCIA URBANA</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {icon ? <View style={[styles.icon, { backgroundColor: theme.colors.elevated }]}><MaterialCommunityIcons name={icon} size={26} color={theme.colors.primaryLight} /></View> : null}
    </View>
    {children}
  </ScrollView>;
}

export function Surface({ children }: { children: React.ReactNode }) {
  return <View style={[styles.surface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>{children}</View>;
}

export function InfoRow({ icon, title, description }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; title: string; description: string }) {
  return <View style={styles.infoRow}>
    <View style={[styles.infoIcon, { backgroundColor: theme.colors.elevated }]}><MaterialCommunityIcons name={icon} size={22} color={theme.colors.primaryLight}/></View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.infoTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.infoDescription, { color: theme.colors.textSecondary }]}>{description}</Text>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 26, paddingBottom: 44, width: '100%', maxWidth: 760, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 26 },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 13, lineHeight: 20, marginTop: 7 },
  icon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  surface: { borderWidth: 1, borderRadius: 23, padding: 20, marginBottom: 14 },
  infoRow: { flexDirection: 'row', gap: 13, alignItems: 'center', paddingVertical: 12 },
  infoIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontSize: 15, fontWeight: '800' },
  infoDescription: { fontSize: 13, lineHeight: 20, marginTop: 4 },
});
