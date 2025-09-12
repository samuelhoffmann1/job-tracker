import React from 'react';
import { render, screen } from '@testing-library/react';
import JobsList from '../JobsList';

// Mock the useJobs hook
jest.mock('../../hooks/useJobs', () => ({
  useJobs: jest.fn(),
}));

import { useJobs } from '../../hooks/useJobs';

describe('JobsList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders job title and company', () => {
    (useJobs as jest.Mock).mockImplementation(() => ({
      jobs: [
        {
          id: 1,
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'Remote',
          url: 'https://example.com/job',
          min_salary: 80000,
          max_salary: 120000,
          rating: 8.5,
          date_posted: '2024-01-01',
        },
      ],
      loading: false,
      error: null,
    }));

    render(<JobsList />);
    expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useJobs as jest.Mock).mockImplementation(() => ({
      jobs: [],
      loading: true,
      error: null,
    }));

    render(<JobsList />);
    expect(screen.getByText(/Loading job data/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useJobs as jest.Mock).mockImplementation(() => ({
      jobs: [],
      loading: false,
      error: 'Something went wrong',
    }));

    render(<JobsList />);
    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
});