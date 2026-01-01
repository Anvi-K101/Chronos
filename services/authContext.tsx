import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isOfflineMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInGoogle: async () => {},
  logout: async () => {},
  isOfflineMode: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isOfflineMode = !auth;

  useEffect(() => {
    if (isOfflineMode) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isOfflineMode]);

  const signInGoogle = async () => {
    if (isOfflineMode) {
      alert("Firebase not configured. Check services/firebase.ts");
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth!, provider);
  };

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInGoogle, logout, isOfflineMode }}>
      {children}
    </AuthContext.Provider>
  );
};