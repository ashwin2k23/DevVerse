'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiClient } from '@/lib/api';
import { User } from '@devverse/shared';

interface DbUserContextType {
  dbUser: User | null;
  loading: boolean;
  refreshDbUser: () => Promise<void>;
}

const DbUserContext = createContext<DbUserContextType | undefined>(undefined);

export function DbUserProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const authApi = useApiClient();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshDbUser = useCallback(async () => {
    if (!user) {
      setDbUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await authApi.get('/users/me/profile');
      if (res.data?.success && res.data?.data) {
        setDbUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch DB user profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authApi]);

  useEffect(() => {
    let isMounted = true;
    if (!isLoaded) return;
    if (!user) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setDbUser(null);
          setLoading(false);
        }
      });
      return;
    }

    const loadUser = async () => {
      try {
        const res = await authApi.get('/users/me/profile');
        if (isMounted && res.data?.success && res.data?.data) {
          setDbUser(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch DB user profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, user, authApi]);

  return (
    <DbUserContext.Provider value={{ dbUser, loading, refreshDbUser }}>
      {children}
    </DbUserContext.Provider>
  );
}

export function useDbUser() {
  const context = useContext(DbUserContext);
  if (context === undefined) {
    throw new Error('useDbUser must be used within a DbUserProvider');
  }
  return context;
}
