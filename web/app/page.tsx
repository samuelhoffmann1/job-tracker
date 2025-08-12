'use client'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import JobsList from "./components/JobsList"

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
            
            {!session ? (
              <Link
                href="/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {session.user?.name}!
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/', redirect: true })}
                  className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-12 px-4">
        {session ? (
          <JobsList />
        ) : (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Track Your Job Search
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Manage your job applications in one place.
            </p>
            <Link
              href="/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}