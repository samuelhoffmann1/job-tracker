import React from 'react';
import { FaPencilAlt, FaTrash, FaExternalLinkAlt, FaStickyNote } from "react-icons/fa";
import { Job } from '../../types/job.types';
import { getStatusColor } from '../../utils/statusUtils';
import { formatDate, formatSalary } from '../../utils/formatters';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: number) => void;
  onViewNotes: (id: number, notes: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete, onViewNotes }) => {
  return (
    <div className="border border-gray-800 bg-gray-900 rounded-sm overflow-hidden h-full">
      <div className="flex justify-between items-center border-b border-gray-800 bg-gray-800/30 px-3 sm:px-4 py-2">
        <div className="text-amber-500 font-medium flex items-center truncate mr-2">
          {job.company}
        </div>
        <div className="text-gray-400 text-sm whitespace-nowrap">
          Rating: <span className="text-amber-400">{job.rating?.toFixed(1) ?? 'N/A'}</span>/10
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col h-[calc(100%-48px)]">
        <div className="mb-3">
          <h3 className="text-white font-medium mb-1 text-sm sm:text-base">{job.title}</h3>
          <div className="flex items-center text-xs sm:text-sm">
            <span className="text-gray-500 mr-2">@</span>
            <span className="text-gray-300 truncate">{job.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-3 text-xs sm:text-sm mb-4">
          <div className="col-span-1">
            <div className="text-gray-500">STATUS</div>
            <div className={`${getStatusColor(job.status)}`}>
              {job.status || 'N/A'}
            </div>
          </div>

          <div className="col-span-1">
            <div className="text-gray-500 flex items-center">
              APPLIED
              {job.date_posted && (
                <span className="text-blue-400 ml-1 group relative cursor-pointer">
                  *
                  <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                    Posted: {formatDate(job.date_posted)}
                  </div>
                </span>
              )}
            </div>
            <div>
              {formatDate(job.applied_date)}
            </div>
          </div>

          {(job.min_salary || job.max_salary) && (
            <div className="col-span-2 sm:col-span-1 mt-2 sm:mt-0">
              <div className="text-gray-500">SALARY</div>
              <div className="text-amber-400">
                {formatSalary(job.min_salary, job.max_salary)}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-auto pt-3 border-t border-gray-800">
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
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
                onClick={() => onViewNotes(job.id, job.feeling || '')}
                className="text-gray-400 hover:text-gray-200 text-sm flex items-center cursor-pointer"
              >
                <FaStickyNote className="mr-1" size={12} />
                View notes
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(job)}
              className="text-gray-400 hover:text-white p-1.5 transition-colors"
              title="Edit job"
            >
              <FaPencilAlt size={16} />
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="text-gray-400 hover:text-red-400 p-1.5 transition-colors"
              title="Delete job"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;