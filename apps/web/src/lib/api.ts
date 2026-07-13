import { useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create a base axios instance
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Helper to create an authenticated api instance inside a component
// Usage: const authApi = useApiClient();
export function useApiClient() {
  const { getToken } = useAuth();

  const authApi = useMemo(() => {
    const instance = axios.create({
      baseURL: `${BASE_URL}/api`,
      headers: { 'Content-Type': 'application/json' },
    });

    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [getToken]);

  return authApi;
}

// Standalone function for non-hook contexts (server actions, etc.)
export async function getAuthHeaders(getToken: () => Promise<string | null>) {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
