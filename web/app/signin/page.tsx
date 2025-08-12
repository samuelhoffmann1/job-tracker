'use client'

import { signIn } from "next-auth/react"
import Link from "next/link"

export default function SignInPage() {
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <Link href="/" className="text-blue-600 hover:text-blue-500 text-sm">
          ← Back to Home
        </Link>
        
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to Job Tracker
        </h2>
        
        <div className="mt-8">
          <button
            onClick={handleSignIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  )
}