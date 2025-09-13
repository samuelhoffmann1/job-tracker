import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { SortField, SortDirection } from '../../types/job.types';

interface JobSortingControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: 'company' | 'rating' | 'applied_date') => void;
}

const JobSortingControls: React.FC<JobSortingControlsProps> = ({ 
  sortField, 
  sortDirection, 
  onSort 
}) => {
  const getSortIcon = (field: 'company' | 'rating' | 'applied_date') => {
    if (sortField !== field) return <FaSort className="ml-1" size={12} />;
    return sortDirection === 'asc' ?
      <FaSortUp className="ml-1 text-blue-400" size={12} /> :
      <FaSortDown className="ml-1 text-blue-400" size={12} />;
  };

  return (
    <>
      <button
        onClick={() => onSort('company')}
        className="flex items-center justify-center md:justify-start text-gray-400 hover:text-gray-200 py-1.5 px-2 md:px-0"
      >
        SORT BY COMPANY {getSortIcon('company')}
      </button>
      <button
        onClick={() => onSort('rating')}
        className="flex items-center justify-center md:justify-start text-gray-400 hover:text-gray-200 py-1.5 px-2 md:px-0"
      >
        SORT BY RATING {getSortIcon('rating')}
      </button>
      <button
        onClick={() => onSort('applied_date')}
        className="flex items-center justify-center md:justify-start text-gray-400 hover:text-gray-200 py-1.5 px-2 md:px-0"
      >
        SORT BY DATE {getSortIcon('applied_date')}
      </button>
    </>
  );
};

export default JobSortingControls;