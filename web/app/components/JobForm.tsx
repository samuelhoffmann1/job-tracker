'use client'

import React, { useState, useEffect } from 'react';
import { FaTimes, FaAsterisk } from 'react-icons/fa';

interface JobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  jobToEdit?: any;
  isEditing?: boolean;
}

const JobForm: React.FC<JobFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  jobToEdit = null,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    url: '',
    location: '',
    date_posted: '',
    applied_date: new Date().toISOString().split('T')[0],
    min_salary: '',
    max_salary: '',
    rating: 7.5,
    status: 'Applied',
    feeling: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState<string>('7.5');

  // If editing, populate form with job data
  useEffect(() => {
    if (jobToEdit && isEditing) {
      const editData = {
        ...jobToEdit,
        min_salary: jobToEdit.min_salary?.toString() || '',
        max_salary: jobToEdit.max_salary?.toString() || '',
        applied_date: jobToEdit.applied_date
          ? new Date(jobToEdit.applied_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        date_posted: jobToEdit.date_posted
          ? new Date(jobToEdit.date_posted).toISOString().split('T')[0]
          : '',
      };
      setFormData(editData);
      setRatingInput(jobToEdit.rating?.toString() || '7.5');
    }
  }, [jobToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Format number with commas as user types
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove any non-digits
    const digitsOnly = value.replace(/\D/g, '');

    // Format with commas
    const formattedValue = digitsOnly === ''
      ? ''
      : new Intl.NumberFormat('en-US').format(parseInt(digitsOnly));

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  // Handle rating input (allowing decimals)
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow numbers and one decimal point
    if (value === '' || /^\d+(\.\d*)?$/.test(value)) {
      setRatingInput(value);

      // Parse as float and cap between 0 and 10
      const numValue = parseFloat(value || '0');
      const capped = Math.min(Math.max(numValue, 0), 10);

      if (!isNaN(capped)) {
        setFormData(prev => ({ ...prev, rating: capped }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse salary values - remove commas and convert to numbers
      const minSalary = formData.min_salary
        ? parseInt(formData.min_salary.replace(/,/g, ''))
        : null;

      const maxSalary = formData.max_salary
        ? parseInt(formData.max_salary.replace(/,/g, ''))
        : null;

      // Build job data with parsed values
      const jobData = {
        ...formData,
        min_salary: minSalary,
        max_salary: maxSalary,
        date_posted: formData.date_posted === '' ? null : formData.date_posted,
      };

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch('/api/apps', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobData,
          ...(isEditing && jobToEdit ? { id: jobToEdit.id } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} job`);
      }

      if (onSuccess) onSuccess();
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setFormData({
      title: '',
      company: '',
      url: '',
      location: '',
      date_posted: '',
      applied_date: new Date().toISOString().split('T')[0],
      min_salary: '',
      max_salary: '',
      rating: 7.5,
      status: 'Applied',
      feeling: '',
    });
    setRatingInput('7.5');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 font-mono">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl overflow-auto max-h-[90vh] rounded-sm shadow-xl">
        <div className="px-6 py-3 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl text-gray-200">
            <span className="text-gray-500">$</span> {isEditing ? 'edit-job' : 'add-job'}
          </h2>
          <button
            onClick={resetAndClose}
            className="text-gray-500 hover:text-gray-300"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-sm">
              <span className="text-gray-500">$</span> ERROR: {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1 flex items-center">
                <span className="text-gray-500 mr-1">$</span> JOB_TITLE
                <FaAsterisk className="text-red-500 ml-1" size={8} title="Required field" />
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
                placeholder="Senior Developer"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1 flex items-center">
                <span className="text-gray-500 mr-1">$</span> COMPANY
                <FaAsterisk className="text-red-500 ml-1" size={8} title="Required field" />
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1 flex items-center">
                <span className="text-gray-500 mr-1">$</span> LOCATION
                <FaAsterisk className="text-red-500 ml-1" size={8} title="Required field" />
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
                placeholder="Remote, City, or Country"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1 flex items-center">
                <span className="text-gray-500 mr-1">$</span> URL
                <FaAsterisk className="text-red-500 ml-1" size={8} title="Required field" />
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
                placeholder="https://example.com/job-posting"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <span className="text-gray-500 mr-1">$</span> DATE_POSTED
              </label>
              <input
                type="date"
                name="date_posted"
                value={formData.date_posted}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <span className="text-gray-500 mr-1">$</span> APPLIED_DATE
              </label>
              <input
                type="date"
                name="applied_date"
                value={formData.applied_date}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <span className="text-gray-500 mr-1">$</span> STATUS
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
              >
                <option value="Applied">Applied</option>
                <option value="Saved">Saved</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Accepted">Accepted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <span className="text-gray-500 mr-1">$</span> INTEREST_LEVEL
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={ratingInput}
                  onChange={handleRatingChange}
                  className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
                  placeholder="Rate from 0-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <span className="text-gray-500 mr-1">$</span> MIN_SALARY
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="min_salary"
                  value={formData.min_salary}
                  onChange={handleSalaryChange}
                  className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <span className="text-gray-500 mr-1">$</span> MAX_SALARY
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="max_salary"
                  value={formData.max_salary}
                  onChange={handleSalaryChange}
                  className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">
                <span className="text-gray-500 mr-1">$</span> NOTES
              </label>
              <textarea
                name="feeling"
                value={formData.feeling || ''}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 focus:border-blue-600 focus:outline-none rounded-sm"
                placeholder="Any thoughts about this position..."
              ></textarea>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
            <div className="text-gray-400">
              {loading ? '> Processing...' : <span className="text-gray-500 mr-1 animate-blink">_</span>}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2 text-gray-400 border border-gray-700 hover:bg-gray-800 transition-colors rounded-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900/30 text-blue-300 border border-blue-700 hover:bg-blue-800/40 transition-colors rounded-sm"
                disabled={loading}
              >
                {loading ? 'Processing...' : isEditing ? 'Update Job' : 'Save Job'}
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;