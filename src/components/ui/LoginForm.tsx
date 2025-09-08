import { Eye, EyeOff, Mail, Lock, ArrowBigLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import ForgetPasswordForm from './ForgetPasswordForm';

export default function LoginForm() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [forgetPassword, setForgetPassword] = useState(false);
    const [loadHome, setLoadHome] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    rememberMe: formData.rememberMe
                }),
            });

            const data = await res.json();
            if (data.success) {
                router.push("/dashboard");
            }
            else {
                toast.error("Invalid User");
            }
        }
        catch (e) {
            toast.error("Some error occurred!");
            console.error(e);
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    if (forgetPassword) {
        return <ForgetPasswordForm setForgetPassword={setForgetPassword} />
    }

    const goToHome = () => {
        setLoadHome(true);
        setIsLoading(true);
        router.push('/');
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
                <ArrowBigLeft onClick={goToHome} size={12} className='text-white fill-white mb-2 cursor-pointer' />
                <label htmlFor="email" className="block text-sm font-medium text-white tracking-wider">
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-white" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white tracking-wider">
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-blue-200 hover:text-white transition-colors" />
                        ) : (
                            <Eye className="h-5 w-5 text-blue-200 hover:text-white transition-colors" />
                        )}
                    </button>
                </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/20"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                    />
                    <label htmlFor="rememberMe" className="ml-2 mt-1 block text-sm text-white">
                        Remember me
                    </label>
                </div>
                <p
                    className="text-sm text-blue-100 hover:text-white transition-colors duration-200 cursor-pointer"
                    onClick={() => setForgetPassword(true)}
                >
                    Forgot password?
                </p>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
            >
                {isLoading ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {loadHome ? 'Going back...' : 'Signing in...'}
                    </div>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    )
}