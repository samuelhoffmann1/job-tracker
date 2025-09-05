'use client'

import React, { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import JobForm from './JobForm';

const JobsList: React.FC = () => {
  const { jobs, loading, error, refetch } = useJobs();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddJobSuccess = () => {
    // Refetch jobs after successful addition
    refetch();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 text-lg">No jobs found</div>
        <p className="text-gray-400 mt-2">Start by adding your first job!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Jobs ({jobs.length})</h2>
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 hover:underline"
                  >
                    {job.title}
                  </a>
                </h3>
                <p className="text-gray-600 text-lg mb-2">{job.company}</p>
                <p className="text-gray-500 mb-2">📍 {job.location}</p>

                {(job.min_salary || job.max_salary) && (
                  <p className="text-green-600 font-medium mb-2">
                    💰 {job.min_salary && job.max_salary ? (
                      `$${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}`
                    ) : job.min_salary ? (
                      `From $${job.min_salary.toLocaleString()}`
                    ) : job.max_salary ? (
                      `Up to $${job.max_salary.toLocaleString()}`
                    ) : null}
                  </p>
                )}

                <p className="text-gray-400 text-sm">
                  📅 Posted: {new Date(job.date_posted).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center ml-4">
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                  <span className="text-yellow-500 text-lg">⭐</span>
                  <span className="ml-1 font-medium text-yellow-700">
                    {job.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
      >
        <span className="mr-1">+</span> Add Job
      </button>
      {/* Job Form Modal */}
      <JobForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleAddJobSuccess}
      />
    </div>
  );
};

export default JobsList;