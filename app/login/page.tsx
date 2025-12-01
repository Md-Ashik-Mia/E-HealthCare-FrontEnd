'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.ok) {
            const session = await getSession();

            if (session?.user?.accessToken) {
                localStorage.setItem('access_token', session.user.accessToken);
            }

            if (session?.user?.role) {
                const role = session.user.role;
                setIsLoading(false);

                if (role === 'patient') {
                    router.push('/dashboard/patient');
                } else if (role === 'doctor') {
                    router.push('/dashboard/doctor');
                } else if (role === 'admin') {
                    router.push('/dashboard/admin');
                } else {
                    router.push('/');
                }
            } else {
                setIsLoading(false);
                router.push('/');
            }
        } else {
            setIsLoading(false);
            toast.error('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-4 top-0 h-72 w-72 animate-blob rounded-full bg-purple-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
                <div className="animation-delay-2000 absolute -right-4 top-0 h-72 w-72 animate-blob rounded-full bg-yellow-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
                <div className="animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 animate-blob rounded-full bg-pink-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
            </div>

            {/* Left Side - Branding */}
            <div className="relative hidden w-1/2 items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 lg:flex">
                <div className="relative z-10 px-12 text-white">
                    <div className="mb-8 animate-float">
                        <div className="mb-4 text-6xl">🏥</div>
                        <h1 className="mb-4 text-5xl font-bold">MediCare+</h1>
                        <p className="text-xl text-blue-100">Your Health, Our Priority</p>
                    </div>

                    <div className="mt-12 space-y-6">
                        <div className="flex items-center gap-4 animate-slide-in-left">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold">24/7 Healthcare Access</h3>
                                <p className="text-sm text-blue-100">Connect with doctors anytime</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 animate-slide-in-left animation-delay-200">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold">Secure & Private</h3>
                                <p className="text-sm text-blue-100">Your data is encrypted and safe</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 animate-slide-in-left animation-delay-400">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold">Expert Doctors</h3>
                                <p className="text-sm text-blue-100">Qualified healthcare professionals</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative flex w-full items-center justify-center p-8 lg:w-1/2">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="animate-fade-in-up rounded-2xl bg-white p-8 shadow-2xl backdrop-blur-sm">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h2 className="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h2>
                            <p className="text-gray-600">Sign in to continue to your account</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div className="group">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <span className="text-gray-400">📧</span>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="group">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <span className="text-gray-400">🔒</span>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pl-12 pr-12 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-600">Remember me</span>
                                </label>
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <span className="transition-transform group-hover:translate-x-1">→</span>
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300"></div>
                            <span className="text-sm text-gray-500">OR</span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300"></div>
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href="/register"
                                    className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-gray-500">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
}
