'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevents page reload
        setLoading(true);
        setMessage('');

        // We pass full_name as metadata so our Trigger can grab it!
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage('Success! Check your email to confirm your account.');
        }
        setLoading(false);
    };

    return (
        // p-4 (16px) on mobile, sm:p-8 (32px) on larger screens
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-8">
            {/* p-6 (24px) on mobile, sm:p-8 (32px) on desktop */}
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
                {/* mb-2 (8px) */}
                <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Create Account</h1>
                {/* mb-8 (32px) */}
                <p className="text-center text-gray-500 mb-8">Join the VDM App</p>

                {/* gap-6 (24px) between form blocks */}
                <form onSubmit={handleSignUp} className="flex flex-col gap-6">

                    {/* gap-2 (8px) between label and input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            // h-12 (48px height) for perfect mobile touch target, px-4 (16px) padding
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black transition-all"
                            placeholder="e.g. Johannes Maker"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black transition-all"
                            placeholder="johannes@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        // h-12 (48px) to match inputs
                        className="w-full h-12 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                {message && (
                    // mt-4 (16px)
                    <p className={`mt-4 text-center text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}

                {/* mt-6 (24px) */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}