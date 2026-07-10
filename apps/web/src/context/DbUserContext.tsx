'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiClient } from '@/lib/api';

interface DbUserContextType {
  dbUser: any;
  loading: boolean;
  refreshDbUser: () => Promise<void>;
}

const DbUserContext = createContext<DbUserContextType | undefined>(undefined);

export function DbUserProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const authApi = useApiClient();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDbUser = useCallback(async () => {
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
    if (isLoaded) {
      fetchDbUser();
    }
  }, [isLoaded, user, fetchDbUser]);

  return (
    <DbUserContext.Provider value={{ dbUser, loading, refreshDbUser: fetchDbUser }}>
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
