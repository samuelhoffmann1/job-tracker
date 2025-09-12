'use client'

import { signIn } from "next-auth/react"
import Link from "next/link"
import { FaTerminal, FaArrowLeft, FaGoogle } from "react-icons/fa"

export default function SignInPage() {
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-6 font-mono">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-8">
          <FaTerminal className="mr-2 text-gray-500" />
          <span className="text-xl text-gray-200">JOB-TRACKER</span>
        </div>
        
        <div className="mb-6">
          <div className="text-gray-200 mb-1">
            <span className="text-gray-500">$</span> authentication required
          </div>
          <div className="text-gray-400 text-sm mb-4">Please select an authentication method</div>
        </div>

        <div className="border border-gray-800 bg-gray-800/20 p-6 mb-6 rounded-sm">
          <div className="text-gray-300 mb-4">
            <span className="text-gray-500">$</span> google-auth --connect
          </div>
          
          <div className="text-gray-400 mb-6 text-sm">
            This will open a secure connection to Google's authentication service.
            <div className="mt-2">No credentials are stored locally.</div>
          </div>
          
          <button
            onClick={handleSignIn}
            className="w-full bg-gray-800 text-gray-300 hover:text-white border border-gray-700 px-4 py-2 flex items-center justify-center transition-colors"
          >
            <FaGoogle className="mr-2" />
            <span>Sign in with Google</span>
          </button>
        </div>
        
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-200 border border-gray-700 px-3 py-1 flex items-center w-fit transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to home</span>
        </Link>
        
        <div className="mt-8 inline-block animate-blink">_</div>
      </div>
    </div>
  )
}