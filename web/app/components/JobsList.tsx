'use client'

import React, { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import JobForm from './JobForm';
import { FaTerminal, FaPencilAlt, FaTrash, FaExternalLinkAlt, FaTimes, FaStickyNote, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const JobsList: React.FC = () => {
  const { jobs, loading, error, refetch } = useJobs();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const [activeNotes, setActiveNotes] = useState<{ id: number, notes: string } | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<'company' | 'rating' | 'applied_date' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'company' | 'rating' | 'applied_date') => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort jobs based on current sort settings
  const sortedJobs = [...jobs].sort((a, b) => {
    if (!sortField) return 0;

    const direction = sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'company') {
      const comparison = direction * ((a.company || '').localeCompare(b.company || ''));
      if (comparison !== 0) return comparison; // Primary sort by company
    }

    if (sortField === 'rating') {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      const comparison = direction * (ratingA - ratingB);
      if (comparison !== 0) return comparison; // Primary sort by rating
    }

    if (sortField === 'applied_date') {
      const dateA = a.applied_date ? new Date(a.applied_date).getTime() : 0;
      const dateB = b.applied_date ? new Date(b.applied_date).getTime() : 0;
      const comparison = direction * (dateA - dateB);
      if (comparison !== 0) return comparison; // Primary sort by applied_date
    }

    // Secondary sort by job.id (descending order)
    return b.id - a.id;
  });

  const getSortIcon = (field: 'company' | 'rating' | 'applied_date') => {
    if (sortField !== field) return <FaSort className="ml-1" size={12} />;
    return sortDirection === 'asc' ?
      <FaSortUp className="ml-1 text-blue-400" size={12} /> :
      <FaSortDown className="ml-1 text-blue-400" size={12} />;
  };


  const handleAddJobSuccess = () => {
    refetch();
  };

  const NotesPopup = () => {
    if (!activeNotes) return null;

    const handleClose = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).id === 'notes-popup-overlay') {
        setActiveNotes(null);
      }
    };

    return (
      <div
        id="notes-popup-overlay"
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 font-mono"
        onClick={handleClose}
      >
        <div className="bg-gray-900 border border-gray-700 w-full max-w-lg overflow-auto p-4 shadow-lg rounded-sm">
          <div className="px-6 py-3 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl text-gray-200">
              <span className="text-gray-500">$</span> view-notes
            </h2>
            <button
              onClick={() => setActiveNotes(null)}
              className="text-gray-500 hover:text-gray-300"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          <div className="py-6 px-6">
            <pre className="whitespace-pre-wrap text-gray-300 font-mono">
              {activeNotes.notes}
            </pre>
          </div>

          <div className="flex justify-end px-6 py-3 border-t border-gray-700">
            <button
              onClick={() => setActiveNotes(null)}
              className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleEditJob = (job: any) => {
    setJobToEdit(job);
    setIsEditFormOpen(true);
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
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 font-mono">
        <div className="bg-gray-900 border border-gray-700 w-full max-w-md overflow-auto p-4 shadow-lg rounded-sm">
          <div className="px-6 py-3 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl text-amber-500">
              <span className="text-gray-400">$</span> confirm delete
            </h2>
          </div>

          <div className="py-6 px-4">
            <div className="text-red-400 mb-4">WARNING: This operation cannot be undone.</div>
            <div className="text-gray-300 mb-6">
              <span className="text-gray-500">$</span> rm -f /jobs/{jobToDelete}
              <span className="animate-blink ml-1">_</span>
            </div>
            <div className="mb-6 text-gray-300">
              Delete job "<span className="text-white">{job.title}</span>" at <span className="text-white">{job.company}</span>?
            </div>

            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => setJobToDelete(null)}
                className="px-4 py-1 bg-transparent text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-1 bg-transparent text-red-400 border border-red-900 hover:bg-red-900/30 transition-colors"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-300 p-6 font-mono">
        <div className="animate-pulse">$ Loading job data...</div>
        <div className="animate-pulse mt-2">$ Please wait...</div>
        <div className="animate-pulse mt-2 inline-block">_</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 p-6 font-mono">
        <div>$ ERROR: Connection failed</div>
        <div className="mt-2">$ {error}</div>
        <div className="mt-4">$ Try again later</div>
        <div className="mt-2 inline-block animate-blink">_</div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-300 p-6 font-mono">
        <div>$ No jobs found in database</div>
        <div className="mt-2">$ Use 'add-job' command to create a new entry</div>
        <div className="mt-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-gray-800 text-gray-300 hover:text-white border border-gray-700 px-4 py-1 transition-colors"
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
    <div className="min-h-screen bg-gray-900 text-gray-300 p-6 font-mono">
      <div className="flex items-center mb-4 border-b border-gray-800 pb-2">
        <FaTerminal className="mr-2 text-gray-500" />
        <span className="text-xl text-gray-200">$ jobs --list</span>
      </div>

      <div className="flex justify-between mb-6">
        <div className="text-sm text-gray-500">Displaying {jobs.length} job records</div>

        <div className="flex space-x-4 text-xs">
          <button
            onClick={() => handleSort('company')}
            className="flex items-center text-gray-400 hover:text-gray-200"
          >
            SORT BY COMPANY {getSortIcon('company')}
          </button>
          <button
            onClick={() => handleSort('rating')}
            className="flex items-center text-gray-400 hover:text-gray-200"
          >
            SORT BY RATING {getSortIcon('rating')}
          </button>
          <button
            onClick={() => handleSort('applied_date')}
            className="flex items-center text-gray-400 hover:text-gray-200"
          >
            SORT BY DATE {getSortIcon('applied_date')}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {sortedJobs.map((job) => (
          <div key={job.id} className="border border-gray-800 bg-gray-900 rounded-sm overflow-hidden h-full">
            <div className="flex justify-between items-center border-b border-gray-800 bg-gray-800/30 px-4 py-2">
              <div className="text-amber-500 font-medium flex items-center">
                {job.company}
              </div>
              <div className="text-gray-400 text-sm">
                Rating: <span className="text-amber-400">{job.rating?.toFixed(1) ?? 'N/A'}</span>/10
              </div>
            </div>

            <div className="p-4 flex flex-col h-[calc(100%-48px)]">
              <div className="mb-3">
                <h3 className="text-white font-medium mb-1">{job.title}</h3>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 mr-2">@</span>
                  <span className="text-gray-300">{job.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                <div>
                  <div className="text-gray-500">STATUS</div>
                  <div className={`${getStatusColor(job.status)}`}>
                    {job.status || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 flex items-center">
                    APPLIED
                    {job.date_posted && (
                      <span className="text-blue-400 ml-1 group relative cursor-pointer">
                        * {/* Removed `cursor-help` */}
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                          Posted: {new Date(job.date_posted).toLocaleDateString()}
                        </div>
                      </span>
                    )}
                  </div>
                  <div>
                    {job.applied_date
                      ? new Date(job.applied_date).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>

                {job.min_salary || job.max_salary ? (
                  <div>
                    <div className="text-gray-500">SALARY</div>
                    <div className="text-amber-400">
                      {job.min_salary && job.max_salary ? (
                        `$${job.min_salary.toLocaleString()}-${job.max_salary.toLocaleString()}`
                      ) : job.min_salary ? (
                        `>=$${job.min_salary.toLocaleString()}`
                      ) : job.max_salary ? (
                        `<=$${job.max_salary.toLocaleString()}`
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-between mt-6 pt-3 border-t border-gray-800">
                <div className="flex items-center">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                  >
                    <FaExternalLinkAlt className="mr-1" size={12} />
                    View listing
                  </a>

                  {job.feeling && (
                    <button
                      onClick={() => setActiveNotes({ id: job.id, notes: job.feeling || '' })}
                      className="ml-3 text-gray-400 hover:text-gray-200 text-sm flex items-center cursor-pointer"
                    >
                      <FaStickyNote className="mr-1" size={12} />
                      View notes
                    </button>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditJob(job)}
                    className="text-gray-400 hover:text-white p-1 transition-colors"
                    title="Edit job"
                  >
                    <FaPencilAlt size={14} />
                  </button>
                  <button
                    onClick={() => setJobToDelete(job.id)}
                    className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                    title="Delete job"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-800 pt-4">
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-gray-800 text-gray-300 hover:text-white border border-gray-700 px-4 py-2 transition-colors"
        >
          $ add-job
        </button>

        {!isFormOpen && !jobToDelete && !isEditFormOpen && (
          <div className="mt-4 ml-4 inline-block animate-blink">_</div>
        )}
      </div>

      <JobForm
        isOpen={isFormOpen || isEditFormOpen} // Open the form for both adding and editing
        onClose={() => {
          setIsFormOpen(false); // Close the "Add Job" form
          setIsEditFormOpen(false); // Close the "Edit Job" form
          setJobToEdit(null); // Reset the job being edited
        }}
        onSuccess={() => {
          setIsFormOpen(false);
          setIsEditFormOpen(false);
          setJobToEdit(null);
          refetch(); // Refetch jobs after adding or editing
        }}
        jobToEdit={isEditFormOpen ? jobToEdit : null} // Pass jobToEdit only when editing
        isEditing={isEditFormOpen} // Indicate whether the form is for editing
      />

      <DeleteConfirmation />
      <NotesPopup />
    </div>
  );
};

// Helper function to get status color
function getStatusColor(status: string | undefined): string {
  if (!status) return 'text-gray-400';

  status = status.toLowerCase();

  if (status === 'applied') return 'text-blue-400';
  if (status === 'interview') return 'text-purple-400';
  if (status === 'offer') return 'text-green-400';
  if (status === 'rejected') return 'text-red-400';
  if (status === 'accepted') return 'text-green-500';
  return 'text-gray-300';
}

export default JobsList;