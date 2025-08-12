'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any lingering OAuth state from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('next-auth')) {
        localStorage.removeItem(key);
      }
    });

    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.trim().startsWith('next-auth')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });

    // Add slight delay before redirecting
    const timeout = setTimeout(() => {
      router.push('/');
    }, 500);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-bold">Signing out...</h1>
        <p className="mt-2 text-center text-gray-600">
          You are being logged out of Job Tracker.
        </p>
      </div>
    </div>
  );
}