'use client'

import React, { useState, useMemo } from 'react';
import { FaTerminal, FaFilter } from "react-icons/fa";
import { useJobs } from '../../hooks/useJobs';
import { Job, SortField, SortDirection } from '../../types/job.types';
import JobForm from './JobForm';
import JobCard from './JobCard';
import NotesPopupModal from './modals/NotesPopupModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';
import LoadingState from '../ui/LoadingState';
import JobSortingControls from './JobSortingControls';

const JobsList: React.FC = () => {
  const { jobs, loading, error, refetch } = useJobs();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [activeNotes, setActiveNotes] = useState<{ id: number, notes: string } | null>(null);
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: 'company' | 'rating' | 'applied_date') => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
    // Auto-hide sort options on mobile after selection
    if (window.innerWidth < 768) {
      setShowSortOptions(false);
    }
  };

  // Memoized sorted jobs
  const sortedJobs = useMemo(() => {
    if (!sortField) return jobs;
    
    return [...jobs].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;

      if (sortField === 'company') {
        const comparison = direction * ((a.company || '').localeCompare(b.company || ''));
        if (comparison !== 0) return comparison;
      }

      if (sortField === 'rating') {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        const comparison = direction * (ratingA - ratingB);
        if (comparison !== 0) return comparison;
      }

      if (sortField === 'applied_date') {
        const dateA = a.applied_date ? new Date(a.applied_date).getTime() : 0;
        const dateB = b.applied_date ? new Date(b.applied_date).getTime() : 0;
        const comparison = direction * (dateA - dateB);
        if (comparison !== 0) return comparison;
      }

      // Secondary sort by job.id (descending order)
      return b.id - a.id;
    });
  }, [jobs, sortField, sortDirection]);

  // Rest of your functions remain the same...
  const handleAddJobSuccess = () => {
    refetch();
  };

  const handleEditJob = (job: Job) => {
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

  const handleViewNotes = (id: number, notes: string) => {
    setActiveNotes({ id, notes });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 p-4 md:p-6 font-mono">
        <div>$ ERROR: Connection failed</div>
        <div className="mt-2">$ {error}</div>
        <div className="mt-4">$ Try again later</div>
        <div className="mt-2 inline-block animate-blink">_</div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-300 p-4 md:p-6 font-mono">
        <div>$ No jobs found in database</div>
        <div className="mt-2">$ Use 'add-job' command to create a new entry</div>
        <div className="mt-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-gray-800 text-gray-300 hover:text-white border border-gray-700 px-4 py-2 transition-colors text-base"
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
    <div className="min-h-screen bg-gray-900 text-gray-300 p-4 md:p-6 font-mono">
      <div className="flex items-center mb-4 border-b border-gray-800 pb-2">
        <FaTerminal className="mr-2 text-gray-500" />
        <span className="text-xl text-gray-200">$ jobs --list</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-2 md:space-y-0">
        <div className="text-sm text-gray-500">Displaying {jobs.length} job records</div>
        
        {/* Mobile sort toggle button */}
        <div className="md:hidden">
          <button 
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="flex items-center text-gray-300 bg-gray-800 px-3 py-1.5 rounded-sm"
          >
            <FaFilter className="mr-2" size={12} />
            Sort Options
          </button>
        </div>
        
        {/* Sort controls - hidden on mobile unless toggled */}
        <div className={`${showSortOptions ? 'flex' : 'hidden'} md:flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4`}>
          <JobSortingControls 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {sortedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onEdit={handleEditJob}
            onDelete={setJobToDelete}
            onViewNotes={handleViewNotes}
          />
        ))}
      </div>

      <div className="mt-6 border-t border-gray-800 pt-4">
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-gray-800 text-gray-300 hover:text-white border border-gray-700 px-4 py-2 transition-colors text-base"
        >
          $ add-job
        </button>

        {!isFormOpen && !jobToDelete && !isEditFormOpen && (
          <div className="mt-4 ml-4 inline-block animate-blink">_</div>
        )}
      </div>

      <JobForm
        isOpen={isFormOpen || isEditFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setIsEditFormOpen(false);
          setJobToEdit(null);
        }}
        onSuccess={() => {
          setIsFormOpen(false);
          setIsEditFormOpen(false);
          setJobToEdit(null);
          refetch();
        }}
        jobToEdit={isEditFormOpen ? jobToEdit : null}
        isEditing={isEditFormOpen}
      />

      {jobToDelete !== null && (
        <DeleteConfirmationModal
          id={jobToDelete}
          title={jobs.find(j => j.id === jobToDelete)?.title || ''}
          company={jobs.find(j => j.id === jobToDelete)?.company || ''}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setJobToDelete(null)}
        />
      )}

      {activeNotes && (
        <NotesPopupModal
          notes={activeNotes.notes}
          onClose={() => setActiveNotes(null)}
        />
      )}
    </div>
  );
};

export default JobsList;