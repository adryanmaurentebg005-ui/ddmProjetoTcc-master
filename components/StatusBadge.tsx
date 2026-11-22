import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DenunciaStatus } from '../types';
import { theme } from '../constants/theme';

const statusMap: Record<DenunciaStatus, { label: string; tone: 'info' | 'warning' | 'success' | 'error' }> = {
  ENVIADA: { label: 'Enviada', tone: 'info' },
  EM_ANALISE: { label: 'Em análise', tone: 'warning' },
  AGUARDANDO_INFORMACOES: { label: 'Aguardando informações', tone: 'warning' },
  VALIDADA: { label: 'Validada', tone: 'success' },
  EM_ATENDIMENTO: { label: 'Em atendimento', tone: 'info' },
  RESOLVIDA: { label: 'Resolvida', tone: 'success' },
  REJEITADA: { label: 'Rejeitada', tone: 'error' },
};

export function StatusBadge({ status }: { status: DenunciaStatus }) {
  const config = statusMap[status] ?? { label: 'Status desconhecido', tone: 'info' as const };
  const color = theme.colors[config.tone];
  return <View style={[styles.badge, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.border }]}>
    <View style={[styles.dot, { backgroundColor: color }]}/>
    <Text style={[styles.text, { color }]} numberOfLines={1}>{config.label}</Text>
  </View>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', maxWidth: '72%', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 10, fontWeight: '800', flexShrink: 1 },
});
