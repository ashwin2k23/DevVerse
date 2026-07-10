'use client';

import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useApiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

/**
 * Silently syncs the Clerk user with the backend database on mount.
 * Retries up to 5 times with exponential backoff so a temporary Railway
 * restart / cold-start never silently loses a new user registration.
 */
export default function UserSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const authApi = useApiClient();
  const router = useRouter();
  const synced = useRef(false); // prevent double-sync in React StrictMode

  useEffect(() => {
    if (!isLoaded || !user || synced.current) return;

    const syncWithRetry = async (attempt = 0): Promise<void> => {
      try {
        const username =
          user.username ||
          user.emailAddresses[0]?.emailAddress?.split('@')[0] ||
          user.id;

        const res = await authApi.post('/users/sync', {
          clerkId: user.id,
          username,
          email: user.emailAddresses[0]?.emailAddress,
          avatarUrl: user.imageUrl,
        });

        synced.current = true;
        console.debug('[UserSync] ✅ synced as:', username);

        if (res.data?.isNew) {
          console.debug('[UserSync] New user detected, redirecting to profile setup...');
          router.push('/edit-profile');
        }
      } catch (err: any) {
        const status = err?.response?.status;

        // Don't retry on auth errors (401/403) — token problem, not a transient failure
        if (status === 401 || status === 403) {
          console.debug('[UserSync] auth error, skipping retry:', status);
          return;
        }

        if (attempt < 5) {
          const delay = Math.min(1000 * 2 ** attempt, 30000); // 1s, 2s, 4s, 8s, 16s, 30s cap
          console.debug(`[UserSync] retry ${attempt + 1}/5 in ${delay}ms`, err?.message);
          await new Promise((r) => setTimeout(r, delay));
          return syncWithRetry(attempt + 1);
        }

        console.warn('[UserSync] failed after 5 retries:', err?.message);
      }
    };

    syncWithRetry();
  }, [user?.id, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
