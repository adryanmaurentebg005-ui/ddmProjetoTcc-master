import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBKDPUja-w3A6KJwjfGW2Hi2ROvQysxw4k',
  authDomain: 'ddmmassa.firebaseapp.com',
  projectId: 'ddmmassa',
  storageBucket: 'ddmmassa.firebasestorage.app',
  messagingSenderId: '616424654135',
  appId: '1:616424654135:web:76494898f81958356a06b2',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const authModule = require('firebase/auth') as typeof import('firebase/auth') & {
  initializeAuth: (firebaseApp: typeof app, options: { persistence: unknown }) => ReturnType<typeof getAuth>;
  getReactNativePersistence: (storage: typeof ReactNativeAsyncStorage) => unknown;
};

let auth: ReturnType<typeof getAuth>;
try {
  auth = authModule.initializeAuth(app, {
    persistence: authModule.getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);

