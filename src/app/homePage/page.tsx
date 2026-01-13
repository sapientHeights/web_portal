'use client';

import React, { useState } from 'react';
import { GraduationCap, Users, BookOpen, Award, ChevronRight } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import { useRouter } from 'next/navigation';
import FullPageLoader from '@/components/ui/FullPageLoader';


const HomePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    //const appUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/app-build/sapient-app.apk`;

    const goToLogin = () => {
        setLoading(true);
        router.push('/login');
    }

    if (loading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="relative z-10">
                <nav className="container mx-auto px-6 py-6 flex flex-col sm:flex-row gap-5 items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Sapient Heights</h1>
                            <p className="text-sm text-gray-600">School Management System</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <a
                            href="https://expo.dev/artifacts/eas/vWXo1D6aqK3UNJnRUWwQCt.apk"
                            download
                            className="px-8 py-3 bg-white text-purple-600 border border-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                        >
                            Download the App
                        </a>

                        <button onClick={goToLogin} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer">
                            Login
                        </button>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-6 py-6">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="mb-8">
                        <span className="inline-block px-4 py-2 bg-white/80 text-purple-600 rounded-full text-sm font-medium mb-6 shadow-sm">
                            🏫 Sapient Heights Administrative Portal
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Efficient Administration for
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Sapient Heights</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Comprehensive administrative control for Sapient Heights.
                            Manage teachers, students, classes, and finances from one powerful dashboard designed for school administrators.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <button onClick={goToLogin} className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center cursor-pointer">
                            Login to Sapient Heights
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    <div className="group p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Student Management</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Comprehensive student profiles, enrollment tracking, and academic progress monitoring all in one place.
                        </p>
                    </div>

                    <div className="group p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Class Scheduling</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Smart scheduling system that optimizes class timings, room assignments, and teacher availability.
                        </p>
                    </div>

                    <div className="group p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance Analytics</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Advanced analytics and reporting tools to track student performance and institutional metrics.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white shadow-2xl">
                    <h2 className="text-4xl font-bold mb-4">Ready to Streamline Sapient Heights Administration?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Manage all aspects of Sapient Heights operations from one powerful administrative interface.
                    </p>
                    <button onClick={goToLogin} className="px-10 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer">
                        Enter Management Portal
                    </button>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;