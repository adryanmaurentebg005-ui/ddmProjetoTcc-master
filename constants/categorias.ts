export const CATEGORIAS_DENUNCIA = [
  { id: 'buraco', nome: 'Buraco na via' },
  { id: 'iluminacao', nome: 'Iluminação pública' },
  { id: 'lixo', nome: 'Lixo e resíduos' },
  { id: 'calcada', nome: 'Calçada' },
  { id: 'semaforo', nome: 'Semáforo' },
  { id: 'alagamento', nome: 'Alagamento' },
  { id: 'outro', nome: 'Outro' },
] as const;

export type CategoriaDenunciaId = (typeof CATEGORIAS_DENUNCIA)[number]['id'];

export function getNomeCategoria(id: string) {
  return CATEGORIAS_DENUNCIA.find((categoria) => categoria.id === id)?.nome ?? 'Outro';
}
