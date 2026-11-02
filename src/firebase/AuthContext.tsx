import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from './config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (newName: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Bootstrapped default admin email specified by system and metadata
const BOOTSTRAP_ADMIN_EMAIL = 'teisco181@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Initial connection test
  useEffect(() => {
    testConnection().catch((err) => {
      console.warn('Initial testConnection call caught:', err);
    });
  }, []);

  // Fetch or sync user profile from Firestore
  const syncUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snap = await getDoc(userRef);
      const isBootstrapAdmin = firebaseUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // If user is bootstrap admin but role isn't admin yet in DB, upgrade it
        if (isBootstrapAdmin && data.role !== 'admin') {
          try {
            await updateDoc(userRef, {
              role: 'admin',
              updatedAt: serverTimestamp()
            });
            data.role = 'admin';
          } catch (e) {
            console.warn('Could not auto-upgrade bootstrap admin role:', e);
          }
        }
        setUserProfile(data);
        return data;
      } else {
        // Create new user profile document
        const initialRole: UserRole = isBootstrapAdmin ? 'admin' : 'user';
        const newProfile: Record<string, any> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Gamer',
          role: initialRole,
          createdAt: serverTimestamp()
        };

        if (firebaseUser.photoURL) {
          newProfile.photoURL = firebaseUser.photoURL;
        }

        await setDoc(userRef, newProfile);

        const profileState: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: newProfile.displayName,
          photoURL: firebaseUser.photoURL || undefined,
          role: initialRole,
          createdAt: new Date().toISOString()
        };

        setUserProfile(profileState);
        return profileState;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await syncUserProfile(currentUser);
        } catch (err: any) {
          console.error('Failed to sync profile:', err);
          setError('Er was een probleem bij het laden van je profiel.');
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Het Google inlogvenster werd geannuleerd.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Het inlogvenster werd geblokkeerd door je browser. Sta pop-ups toe.');
      } else {
        setError(err.message || 'Inloggen met Google mislukt.');
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (res.user) {
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      console.error('Email Sign-In Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Onjuist e-mailadres of wachtwoord.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Voer een geldig e-mailadres in.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Te veel mislukte pogingen. Probeer het later opnieuw.');
      } else {
        setError('Inloggen mislukt: ' + (err.message || 'Onbekende fout'));
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (res.user) {
        const cleanName = displayName.trim() || email.split('@')[0];
        try {
          await updateProfile(res.user, { displayName: cleanName });
        } catch (e) {
          console.warn('Failed to set displayName on auth user:', e);
        }
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      console.error('Email Register Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Dit e-mailadres is al in gebruik. Probeer in te loggen.');
      } else if (err.code === 'auth/weak-password') {
        setError('Het wachtwoord is te zwak. Gebruik minimaal 6 tekens.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Voer een geldig e-mailadres in.');
      } else {
        setError('Registreren mislukt: ' + (err.message || 'Onbekende fout'));
      }
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      setError('Uitloggen mislukt.');
      throw err;
    }
  };

  const updateDisplayName = async (newName: string) => {
    if (!user || !userProfile) return;
    try {
      await updateProfile(user, { displayName: newName.trim() });
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: newName.trim(),
        updatedAt: serverTimestamp()
      });
      setUserProfile((prev) => prev ? { ...prev, displayName: newName.trim() } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await syncUserProfile(user);
    }
  };

  const isAdmin = userProfile?.role === 'admin' || user?.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateDisplayName,
        refreshProfile,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
