'use client'

import { signIn } from "next-auth/react"
import Link from "next/link"
import { FaTerminal, FaArrowLeft, FaGoogle } from "react-icons/fa"

export default function SignInPage() {
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-6 font-mono">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-8">
          <FaTerminal className="mr-2" />
          <span className="text-xl">JOB-TRACKER v1.0.0</span>
        </div>
        
        <div className="mb-6">
          <div className="text-green-400 mb-1">$ authentication required</div>
          <div className="text-green-300 text-sm mb-4">Please select an authentication method</div>
        </div>

        <div className="border border-green-900 p-6 mb-6">
          <div className="text-amber-400 mb-4">$ google-auth --connect</div>
          
          <div className="text-green-200 mb-6">
            This will open a secure connection to Google's authentication service.
            <div className="mt-2">No credentials are stored locally.</div>
          </div>
          
          <button
            onClick={handleSignIn}
            className="w-full bg-black text-green-400 hover:text-green-300 border border-green-500 px-4 py-2 flex items-center justify-center"
          >
            <FaGoogle className="mr-2" />
            <span>$ ./auth-with-google.sh --exec</span>
          </button>
        </div>
        
        <Link
          href="/"
          className="text-amber-400 hover:text-amber-300 border border-amber-700 px-3 py-1 flex items-center w-fit"
        >
          <FaArrowLeft className="mr-2" />
          <span>cd ..</span>
        </Link>
        
        <div className="mt-8 inline-block animate-blink">_</div>
      </div>
    </div>
  )
}