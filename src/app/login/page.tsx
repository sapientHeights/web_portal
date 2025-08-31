'use client';

import { GraduationCap } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import LoginForm from '@/components/ui/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100/50 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 -right-20 w-60 h-60 bg-purple-100/50 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-1/4 w-32 h-32 bg-blue-50/50 rounded-full blur-xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500 rounded-full mb-4 shadow-lg backdrop-blur-sm">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2 drop-shadow-sm">Sapient Heights</h1>
          <p className="text-gray-500 text-sm">Sign in to your teacher account</p>
        </div>
        {/* Main Login Card */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-200/30 p-8">
          {/* Login Form */}
          <LoginForm />

          {/* Additional Links */}
          {/* <div className="mt-6 text-center">
            <p className="text-sm text-blue-50">
              Need help?{' '}
              <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">
                Contact Administrator
              </a>
            </p>
          </div> */}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}