'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            router.push('/');
        }
    };

    return (
        // p-4 (16px) on mobile, sm:p-8 (32px) on larger screens
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-8">
            {/* p-6 (24px) on mobile, sm:p-8 (32px) on desktop */}
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
                {/* mb-2 (8px) */}
                <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Welcome Back</h1>
                {/* mb-8 (32px) */}
                <p className="text-center text-gray-500 mb-8">Sign in to access VDM App</p>

                {/* gap-6 (24px) between form blocks */}
                <form onSubmit={handleSignIn} className="flex flex-col gap-6">

                    {/* gap-2 (8px) between label and input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // h-12 (48px height) for perfect mobile touch target, px-4 (16px) padding
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black transition-all"
                            placeholder="bram@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
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
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                {errorMsg && (
                    // mt-4 (16px)
                    <p className="mt-4 text-center text-sm text-red-600">
                        {errorMsg}
                    </p>
                )}

                {/* mt-6 (24px) */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-indigo-600 hover:underline font-medium">
                        Create one
                    </Link>
                </div>
            </div>
        </div>
    );
}