import { collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { DenunciaStatus } from '../types';

export type RegistroAdministrativo = {
  id: string;
  titulo: string;
  descricao: string;
  protocolo: string;
  categoriaId: string;
  status: DenunciaStatus;
  usuarioId: string;
  data: string;
  localizacao?: { endereco?: string };
  fotos?: Array<{ uri: string }>;
  observacaoAdmin?: string;
};

export function observarTodasDenuncias(onChange: (items: RegistroAdministrativo[]) => void, onError: (error: Error) => void) {
  return onSnapshot(query(collection(db, 'denuncias'), orderBy('data', 'desc')), snapshot => {
    onChange(snapshot.docs.map(item => {
      const data = item.data();
      return {
        id: item.id,
        titulo: String(data.titulo ?? ''),
        descricao: String(data.descricao ?? ''),
        protocolo: String(data.protocolo ?? item.id),
        categoriaId: String(data.categoriaId ?? 'outro'),
        status: (data.status ?? 'ENVIADA') as DenunciaStatus,
        usuarioId: String(data.usuarioId ?? ''),
        data: data.data?.toDate?.()?.toISOString?.() ?? '',
        localizacao: data.localizacao,
        fotos: data.fotos,
        observacaoAdmin: data.observacaoAdmin,
      };
    }));
  }, onError);
}

export async function atualizarStatusAdministrativo(id: string, status: DenunciaStatus, observacao: string, uid: string) {
  await updateDoc(doc(db, 'denuncias', id), {
    status,
    observacaoAdmin: observacao.trim().slice(0, 1000),
    atualizadoEm: serverTimestamp(),
    atualizadoPor: uid,
  });
}

export async function excluirDenunciaAdministrativa(id: string) {
  await deleteDoc(doc(db, 'denuncias', id));
}
