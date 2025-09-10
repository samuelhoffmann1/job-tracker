'use client'

import React, { useState } from 'react';

interface JobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    url: '',
    location: '',
    date_posted: new Date().toISOString().split('T')[0],
    min_salary: '',
    max_salary: '',
    rating: 7.5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      rating: parseFloat(e.target.value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert salary strings to numbers or null
      const jobData = {
        ...formData,
        min_salary: formData.min_salary ? parseInt(formData.min_salary) : null,
        max_salary: formData.max_salary ? parseInt(formData.max_salary) : null,
      };

      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create job');
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
      date_posted: new Date().toISOString().split('T')[0],
      min_salary: '',
      max_salary: '',
      rating: 7.5,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-mono">
      <div className="bg-black border border-green-500 w-full max-w-2xl overflow-auto max-h-[90vh]">
        <div className="px-6 py-3 border-b border-green-700 flex justify-between items-center bg-black text-green-500">
          <h2 className="text-xl text-green-400">
            $ job-tracker --add-new-job
          </h2>
          <button
            onClick={resetAndClose}
            className="text-green-500 hover:text-green-300"
          >
            [X]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-black border border-red-500 text-red-400 px-4 py-3">
              $ ERROR: {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-green-400 mb-1">$ JOB_TITLE=</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-black border border-green-600 px-3 py-2 text-green-300 focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-green-400 mb-1">$ COMPANY=</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full bg-black border border-green-600 px-3 py-2 text-green-300 focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-green-400 mb-1">$ LOCATION=</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full bg-black border border-green-600 px-3 py-2 text-green-300 focus:border-green-400 focus:outline-none"
                placeholder="remote | city | country"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-green-400 mb-1">$ URL=</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                className="w-full bg-black border border-green-600 px-3 py-2 text-green-300 focus:border-green-400 focus:outline-none"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="block text-sm text-green-400 mb-1">$ DATE_POSTED=</label>
              <input
                type="date"
                name="date_posted"
                value={formData.date_posted}
                onChange={handleChange}
                required
                className="w-full bg-black border border-green-600 px-3 py-2 text-green-300 focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-green-400 mb-1">
                $ INTEREST_LEVEL={formData.rating.toFixed(1)}
              </label>
              <input
                type="range"
                name="rating"
                min="0"
                max="10"
                step="0.1"
                value={formData.rating}
                onChange={handleSliderChange}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-xs text-green-600">
                <span>0.0</span>
                <span>5.0</span>
                <span>10.0</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-green-400 mb-1">$ MIN_SALARY=</label>
              <input
                type="number"
                name="min_salary"
                value={formData.min_salary}
                onChange={handleChange}
                min="0"
                className="w-full bg-black border border-green-600 px-3 py-2 text-green-300 focus:border-green-400 focus:outline-none placeholder:text-green-800"
                placeholder="(optional)"
              />
            </div>

            <div>
              <label className="block text-sm text-green-400 mb-1">$ MAX_SALARY=</label>
              <input
                type="number"
                name="max_salary"
                value={formData.max_salary}
                onChange={handleChange}
                min="0"
                className="w-full bg-black border border-green-600 px-3 py-2 text-green-300 focus:border-green-400 focus:outline-none placeholder:text-green-800"
                placeholder="(optional)"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-green-900 pt-4 flex justify-between">
            <div className="text-green-500 animate-blink">
              {loading ? '> Saving job data...' : '_'}
            </div>
            
            <div>
              <button
                type="button"
                onClick={resetAndClose}
                className="mr-3 px-4 py-1 text-red-400 border border-red-700 hover:bg-red-900/30"
                disabled={loading}
              >
                ./cancel.sh
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-green-900/30 text-green-400 border border-green-700 hover:bg-green-800/50"
                disabled={loading}
              >
                {loading ? 'executing...' : './submit-job.sh'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;