'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddVendor() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const vendorData = {
                ...formData,
                createdAt: Date.now(),
            };

            await addDoc(collection(db, 'vendors'), vendorData);

            setMessage({
                type: 'success',
                text: `Vendor ${formData.name} added successfully! They can now login with ${formData.email}`,
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                company: '',
            });
        } catch (error) {
            console.error('Error adding vendor:', error);
            setMessage({
                type: 'error',
                text: 'Failed to add vendor. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800 p-4">
            <div className="max-w-2xl mx-auto py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                        Add New Vendor
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        Create a new vendor account for the portal
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Full Name *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 
                         bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         transition-all placeholder-slate-400"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Email Address *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 
                         bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         transition-all placeholder-slate-400"
                                placeholder="john@company.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Password *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 
                         bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         transition-all placeholder-slate-400"
                                placeholder="Minimum 6 characters"
                            />
                        </div>

                        {/* Company */}
                        <div>
                            <label htmlFor="company" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Company Name *
                            </label>
                            <input
                                id="company"
                                name="company"
                                type="text"
                                value={formData.company}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 
                         bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         transition-all placeholder-slate-400"
                                placeholder="Acme Corporation"
                            />
                        </div>

                        {/* Message */}
                        {message && (
                            <div
                                className={`p-4 rounded-xl border ${message.type === 'success'
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    }`}
                            >
                                <p
                                    className={`text-sm flex items-center gap-2 ${message.type === 'success'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}
                                >
                                    {message.type === 'success' ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {message.text}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                       text-white font-semibold rounded-xl shadow-lg hover:shadow-xl
                       hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transform hover:scale-[1.02] transition-all duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Adding Vendor...
                                </span>
                            ) : (
                                'Add Vendor'
                            )}
                        </button>
                    </form>

                    {/* Quick Links */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-4 justify-center">
                            <a
                                href="/vendor/login"
                                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                Go to Vendor Login
                            </a>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <a
                                href="/"
                                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                Back to Home
                            </a>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-semibold mb-1">Security Note</p>
                            <p>This is a simple admin interface for adding vendors. In production, you should implement proper authentication and password hashing.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
