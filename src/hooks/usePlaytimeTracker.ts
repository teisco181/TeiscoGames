import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import { GameItem } from '../types';

export function usePlaytimeTracker(game: GameItem | null, isOpen: boolean) {
  const { user } = useAuth();
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // References to keep sync values current inside interval callbacks
  const sessionSecondsRef = useRef<number>(0);
  const initialTotalSecondsRef = useRef<number>(0);
  const lastSyncedSessionSecondsRef = useRef<number>(0);

  // Load existing playtime when game opens
  useEffect(() => {
    if (!game || !isOpen || !user) {
      setSessionSeconds(0);
      setInitialTotalSeconds(0);
      sessionSecondsRef.current = 0;
      initialTotalSecondsRef.current = 0;
      lastSyncedSessionSecondsRef.current = 0;
      return;
    }

    let isMounted = true;
    const fetchExistingPlaytime = async () => {
      try {
        const playtimeRef = doc(db, 'users', user.uid, 'playtimes', game.id);
        const snap = await getDoc(playtimeRef);
        if (snap.exists() && isMounted) {
          const data = snap.data();
          const existingTotal = Number(data.totalSeconds) || 0;
          setInitialTotalSeconds(existingTotal);
          initialTotalSecondsRef.current = existingTotal;
        }
      } catch (err) {
        console.warn('Could not fetch existing playtime:', err);
      }
    };

    fetchExistingPlaytime();

    return () => {
      isMounted = false;
    };
  }, [game?.id, isOpen, user?.uid]);

  // Sync to Firestore function
  const syncToFirestore = useCallback(async () => {
    if (!game || !user) return;
    const currentSession = sessionSecondsRef.current;
    const unsavedDelta = currentSession - lastSyncedSessionSecondsRef.current;

    // Only write if there's new accumulated playtime
    if (unsavedDelta <= 0 && currentSession === 0) return;

    try {
      setIsSyncing(true);
      const newTotal = initialTotalSecondsRef.current + currentSession;
      const playtimeRef = doc(db, 'users', user.uid, 'playtimes', game.id);

      await setDoc(
        playtimeRef,
        {
          userId: user.uid,
          gameId: game.id,
          gameTitle: game.title,
          totalSeconds: Math.floor(newTotal),
          lastPlayedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      lastSyncedSessionSecondsRef.current = currentSession;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/playtimes/${game.id}`);
    } finally {
      setIsSyncing(false);
    }
  }, [game, user]);

  // 1-second Interval Timer tracking time open
  useEffect(() => {
    if (!game || !isOpen || !user) return;

    // Interval timer: increments every 1000ms
    const timerInterval = setInterval(() => {
      setSessionSeconds((prev) => {
        const next = prev + 1;
        sessionSecondsRef.current = next;

        // Auto-sync every 10 seconds to Firestore
        if (next % 10 === 0) {
          syncToFirestore();
        }

        return next;
      });
    }, 1000);

    // Sync when user switches tab or window unloads
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncToFirestore();
      }
    };

    const handleBeforeUnload = () => {
      syncToFirestore();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timerInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Final flush sync on close
      syncToFirestore();
    };
  }, [game?.id, isOpen, user?.uid, syncToFirestore]);

  const currentTotalSeconds = initialTotalSeconds + sessionSeconds;

  return {
    sessionSeconds,
    totalSeconds: currentTotalSeconds,
    isSyncing,
    forceSync: syncToFirestore,
  };
}
