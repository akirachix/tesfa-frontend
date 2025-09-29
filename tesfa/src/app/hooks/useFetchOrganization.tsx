'use client';

import { useState, useCallback, useEffect } from "react";
import { fetchProfile } from "../utils/fetchOrganizations";

export type User = {
  email: string;
  role: string;
  org_name?: string;
  logo_image?: string;
  created_at?: string;
};

const useFetchOrganization = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProfile();
      setUser(data);
      setError(null);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {

    refetch();
  }, [refetch]);

  return { user, loading, error, refetch };
};

export default useFetchOrganization;
