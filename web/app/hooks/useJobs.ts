import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Job } from '../types/job.types';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const hasLoadedRef = useRef(false);
  const forceUpdateRef = useRef(0);

  const fetchJobs = async (forceRefresh = false) => {
    // Don't fetch if not authenticated
    if (status !== 'authenticated') return;
    
    // Don't fetch if we already have jobs and this isn't a forced refresh
    if (jobs.length > 0 && !forceRefresh && hasLoadedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/apps', { credentials: "include" });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.status}`);
      }

      const jobsData = await response.json();
      setJobs(jobsData);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only refetch when session/status changes or when explicitly requested
  useEffect(() => {
    fetchJobs();
  }, [session, status, forceUpdateRef.current]);

  // Explicit refetch function that forces a refresh
  const refetch = () => {
    forceUpdateRef.current += 1;
    fetchJobs(true);
  };

  return { jobs, loading, error, refetch };
};