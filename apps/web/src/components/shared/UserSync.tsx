'use client';

import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useApiClient } from '@/lib/api';

/**
 * Silently syncs the Clerk user with the backend database on mount.
 * Place this inside any authenticated layout so it runs once per session.
 */
export default function UserSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const authApi = useApiClient();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const sync = async () => {
      try {
        const username =
          user.username ||
          user.emailAddresses[0]?.emailAddress?.split('@')[0] ||
          user.id;

        await authApi.post('/users/sync', {
          clerkId: user.id,
          username,
          email: user.emailAddresses[0]?.emailAddress,
          avatarUrl: user.imageUrl,
        });
      } catch (err) {
        // Non-fatal — user might already be synced
        console.debug('[UserSync] sync skipped:', err);
      }
    };

    sync();
  }, [user, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
