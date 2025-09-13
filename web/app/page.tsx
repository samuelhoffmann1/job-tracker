'use client'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { FaTerminal, FaSignInAlt, FaSignOutAlt, FaUserAlt } from "react-icons/fa"
import JobsList from "./components/jobs/JobsList"

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-mono">
      {/* Terminal Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaTerminal className="mr-2 text-gray-500" />
              <span className="text-xl text-gray-200">JOB-TRACKER</span>
            </div>
            
            {!session ? (
              <Link
                href="/signin"
                className="bg-gray-800 text-gray-300 hover:text-white border border-gray-700 px-3 py-1 flex items-center transition-colors"
              >
                <FaSignInAlt className="mr-2" />
                <span>login</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 flex items-center">
                  <FaUserAlt className="mr-2" />
                  <span>user@{session.user?.name?.toLowerCase().replace(/\s/g, '-')}</span>
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/', redirect: true })}
                  className="text-gray-400 hover:text-gray-200 border border-gray-700 px-3 py-1 flex items-center transition-colors"
                >
                  <FaSignOutAlt className="mr-2" />
                  <span>logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {session ? (
          <JobsList />
        ) : (
          <div className="p-6">
            <div className="mb-6">
              <div className="text-gray-200 text-xl mb-2">
                <span className="text-gray-500">$</span> welcome to job-tracker
              </div>
              <div className="text-gray-400 mb-4">
                A terminal-based job application tracking system.
              </div>
            </div>

            <div className="mb-8 bg-gray-800/50 p-4 border border-gray-800">
              <div className="text-gray-300 mb-2">
                <span className="text-gray-500">$</span> job-tracker --help
              </div>
              <div className="ml-4 mt-2 text-gray-400">
                <div className="mb-1">DESCRIPTION:</div>
                <div className="ml-4 mb-3 text-gray-300">
                  Track and manage your job applications in one place.
                </div>
                <div className="mb-1">COMMANDS:</div>
                <div className="ml-4 mb-1 text-gray-300">
                  login      - Access your personal job database
                </div>
                <div className="ml-4 mb-1 text-gray-300">
                  add-job    - Create new job application record
                </div>
                <div className="ml-4 mb-1 text-gray-300">
                  list-jobs  - View all job applications
                </div>
                <div className="ml-4 mb-3 text-gray-300">
                  delete-job - Remove job from database
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-gray-300">
                <span className="text-gray-500">$</span> To continue, please authenticate:
              </div>
            </div>

            <Link
              href="/signin"
              className="bg-gray-800 text-gray-300 hover:text-white border border-gray-700 px-4 py-2 inline-block transition-colors"
            >
              <span className="text-gray-500">$</span> ./login.sh
            </Link>

            <div className="mt-8 ml-4 inline-block animate-blink">_</div>
          </div>
        )}
      </main>
    </div>
  )
}