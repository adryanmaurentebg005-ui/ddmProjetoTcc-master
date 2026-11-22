import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Denuncia } from '../types';
import { getNomeCategoria } from '../constants/categorias';
import { StatusBadge } from './StatusBadge';
import { theme } from '../constants/theme';

export function ComplaintCard({ item }: { item: Denuncia }) {
  const date = new Date(item.dataOcorrencia ?? item.data);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir denúncia ${item.titulo}`}
      onPress={() => router.push({ pathname: '/(citizen)/denuncia/[id]', params: { id: item.id } })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && { opacity: 0.78, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.categoryIcon, { backgroundColor: theme.colors.elevated }]}>
          <MaterialCommunityIcons name="map-marker-alert-outline" size={23} color={theme.colors.primaryLight} />
        </View>
        <View style={styles.main}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>{item.titulo}</Text>
          <Text style={[styles.category, { color: theme.colors.textSecondary }]}>{getNomeCategoria(item.categoriaId)}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.textSecondary} />
      </View>
      <Text numberOfLines={2} style={[styles.description, { color: theme.colors.textSecondary }]}>{item.descricao}</Text>
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <StatusBadge status={item.status} />
        <View style={styles.meta}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {Number.isNaN(date.getTime()) ? 'Data não informada' : date.toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 22, padding: 17, marginBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  categoryIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1 },
  title: { fontSize: 16, letterSpacing: -0.3, fontWeight: '800' },
  category: { marginTop: 4, fontSize: 12, fontWeight: '600' },
  description: { marginTop: 14, marginBottom: 15, lineHeight: 20, fontSize: 13 },
  footer: { paddingTop: 12, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  date: { fontSize: 11 },
});
