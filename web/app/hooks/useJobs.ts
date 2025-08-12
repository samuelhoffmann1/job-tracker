import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Job {
  id: number;
  title: string;
  company: string;
  url: string;
  location: string;
  min_salary: number | null;
  max_salary: number | null;
  rating: number;
  date_posted: string;
  owner_id: number;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const fetchJobs = async () => {
    if (status !== 'authenticated') return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/jobs', { credentials: "include" });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const jobsData = await response.json();
      setJobs(jobsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [session, status]);

  return { jobs, loading, error, refetch: fetchJobs };
};