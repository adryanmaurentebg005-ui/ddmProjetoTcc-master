import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let sequence = 0;
    return onAuthStateChanged(auth, async (nextUser) => {
      const current = ++sequence;
      setLoading(true);
      setUser(nextUser);
      setIsAdmin(false);
      if (nextUser) {
        try {
          const snapshot = await getDoc(doc(db, 'administradores', nextUser.uid));
          if (current === sequence) setIsAdmin(snapshot.exists() && snapshot.data().ativo === true);
        } catch (error) {
          console.warn('Não foi possível verificar permissão administrativa:', error);
        }
      }
      if (current === sequence) setLoading(false);
    });
  }, []);

  const signIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email.trim(), password).then(() => undefined);

  const signUp = async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(credential.user, { displayName: name.trim() });
  };

  const logout = () => signOut(auth);

  return <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signUp, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return value;
}

export function getAuthErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/invalid-email': 'Informe um e-mail válido.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  };
  return messages[code ?? ''] ?? 'Não foi possível concluir a operação. Tente novamente.';
}
