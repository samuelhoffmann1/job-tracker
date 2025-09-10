'use client'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { FaTerminal, FaSignInAlt, FaSignOutAlt, FaUserAlt } from "react-icons/fa"
import JobsList from "./components/JobsList"

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono">
      {/* Terminal Header */}
      <header className="border-b border-green-900 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaTerminal className="mr-2" />
              <span className="text-xl text-green-400">JOB-TRACKER v1.0.0</span>
            </div>
            
            {!session ? (
              <Link
                href="/signin"
                className="bg-black text-green-400 hover:text-green-300 border border-green-500 px-3 py-1 flex items-center"
              >
                <FaSignInAlt className="mr-2" />
                <span>login.sh</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-green-300 flex items-center">
                  <FaUserAlt className="mr-2" />
                  <span>user@{session.user?.name?.toLowerCase().replace(/\s/g, '-')}</span>
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/', redirect: true })}
                  className="text-amber-400 hover:text-amber-300 border border-amber-700 px-3 py-1 flex items-center"
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
              <div className="text-green-400 text-xl mb-2">$ welcome to job-tracker</div>
              <div className="text-green-300 mb-4">
                A terminal-based job application tracking system.
              </div>
            </div>

            <div className="mb-8">
              <div className="text-green-400">$ job-tracker --help</div>
              <div className="ml-4 mt-2 text-green-300">
                <div className="mb-1">DESCRIPTION:</div>
                <div className="ml-4 mb-3 text-green-200">
                  Track and manage your job applications in one place.
                </div>
                <div className="mb-1">COMMANDS:</div>
                <div className="ml-4 mb-1 text-green-200">
                  login      - Access your personal job database
                </div>
                <div className="ml-4 mb-1 text-green-200">
                  add-job    - Create new job application record
                </div>
                <div className="ml-4 mb-1 text-green-200">
                  list-jobs  - View all job applications
                </div>
                <div className="ml-4 mb-3 text-green-200">
                  delete-job - Remove job from database
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-green-400">$ To continue, please authenticate:</div>
            </div>

            <Link
              href="/signin"
              className="bg-black text-green-400 hover:text-green-300 border border-green-500 px-4 py-2 inline-block"
            >
              $ ./login.sh
            </Link>

            <div className="mt-8 ml-4 inline-block animate-blink">_</div>
          </div>
        )}
      </main>
    </div>
  )
}