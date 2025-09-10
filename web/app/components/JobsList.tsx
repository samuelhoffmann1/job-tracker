'use client'

import React, { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import JobForm from './JobForm';

const JobsList: React.FC = () => {
  const { jobs, loading, error, refetch } = useJobs();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);

  const handleAddJobSuccess = () => {
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (jobToDelete === null) return;

    try {
      await fetch('/api/apps', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobToDelete }),
      });
      refetch();
    } catch (err) {
      console.error('Failed to delete job:', err);
    } finally {
      setJobToDelete(null);
    }
  };

  // Delete confirmation modal
  const DeleteConfirmation = () => {
    if (jobToDelete === null) return null;

    const job = jobs.find(j => j.id === jobToDelete);
    if (!job) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-mono">
        <div className="bg-black border border-red-500 w-full max-w-md overflow-auto p-4">
          <div className="px-6 py-3 border-b border-red-700 flex justify-between items-center bg-black text-red-500">
            <h2 className="text-xl text-red-400">
              $ system --danger
            </h2>
          </div>

          <div className="py-6 px-4">
            <div className="text-red-400 mb-4">WARNING: This operation cannot be undone.</div>
            <div className="text-green-300 mb-6">
              $ rm -f "/jobs/{jobToDelete}" <span className="animate-blink">_</span>
            </div>
            <div className="mb-6 text-amber-300">
              Delete job "{job.title}" at {job.company}?
            </div>

            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => setJobToDelete(null)}
                className="px-4 py-1 bg-black text-green-400 border border-green-700 hover:bg-green-900/30"
              >
                [N] CANCEL
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-1 bg-black text-red-400 border border-red-700 hover:bg-red-900/30"
              >
                [Y] DELETE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 p-6 font-mono">
        <div className="animate-pulse">$ Loading job data...</div>
        <div className="animate-pulse mt-2">$ Please wait...</div>
        <div className="animate-pulse mt-2 inline-block">_</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-6 font-mono">
        <div>$ ERROR: Connection failed</div>
        <div className="mt-2">$ {error}</div>
        <div className="mt-4">$ Try again later</div>
        <div className="mt-2 inline-block animate-blink">_</div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-black text-green-500 p-6 font-mono">
        <div>$ No jobs found in database</div>
        <div className="mt-2">$ Use 'add-job' command to create a new entry</div>
        <div className="mt-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-black text-green-400 hover:text-green-300 border border-green-500 px-3 py-1"
          >
            $ add-job
          </button>
        </div>
        <div className="mt-2 inline-block animate-blink">_</div>

        <JobForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleAddJobSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-6 font-mono">
      <div className="flex items-center mb-2">
        <span className="text-xl">$ jobs --list</span>
      </div>

      <div className="mb-6 text-xs opacity-70">Displaying {jobs.length} job records</div>

      <div>
        {jobs.map((job) => (
          <div key={job.id} className="mb-6 border border-green-900 border-opacity-50 p-4">
            <div className="flex justify-between border-b border-green-900 border-opacity-30 pb-2 mb-2">
              <div className="text-amber-400">JOB#{job.id}</div>
              <div className="text-green-300">RATING: {job.rating?.toFixed(1) ?? 'N/A'}/10.0</div>
            </div>

            <div className="mb-2">
              <span className="text-gray-500">TITLE: </span>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 hover:underline hover:text-green-200"
              >
                {job.title}
              </a>
            </div>

            <div className="mb-2">
              <span className="text-gray-500">COMPANY: </span>
              <span className="text-white">{job.company}</span>
            </div>

            <div className="mb-2">
              <span className="text-gray-500">LOCATION: </span>
              <span className="text-white">{job.location}</span>
            </div>

            <div className="mb-2">
              <span className="text-gray-500">APPLIED DATE: </span>
              <span className="text-white">
                {job.applied_date
                  ? new Date(job.applied_date).toISOString().split('T')[0]
                  : 'N/A'}
              </span>
            </div>

            {(job.min_salary || job.max_salary) && (
              <div className="mb-2">
                <span className="text-gray-500">COMPENSATION: </span>
                <span className="text-amber-300">
                  {job.min_salary && job.max_salary ? (
                    `$${job.min_salary.toLocaleString()}-$${job.max_salary.toLocaleString()}`
                  ) : job.min_salary ? (
                    `>=$${job.min_salary.toLocaleString()}`
                  ) : job.max_salary ? (
                    `<=$${job.max_salary.toLocaleString()}`
                  ) : null}
                </span>
              </div>
            )}

            <div className="mb-2">
              <span className="text-gray-500">STATUS: </span>
              <span className="text-white">{job.status || 'N/A'}</span>
            </div>

            {job.feeling && (
              <div className="mb-2">
                <span className="text-gray-500">FEELING: </span>
                <span className="text-white">{job.feeling}</span>
              </div>
            )}

            <div className="flex justify-end mt-2">
              <button
                onClick={() => setJobToDelete(job.id)}
                className="text-red-400 hover:text-red-300 border border-red-900 px-2 py-0.5 text-sm"
              >
                rm -f job#{job.id}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-green-900 pt-4">
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-black text-green-400 hover:text-green-300 border border-green-500 px-3 py-1"
        >
          $ add-job
        </button>

        {!isFormOpen && !jobToDelete && (
          <div className="mt-4 ml-4 inline-block animate-blink">_</div>
        )}
      </div>

      <JobForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleAddJobSuccess}
      />

      <DeleteConfirmation />
    </div>
  );
};

export default JobsList;