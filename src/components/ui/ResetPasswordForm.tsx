import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
    email: string;
    showResetPassword?: React.Dispatch<React.SetStateAction<boolean>>;
    fromDashboard?: boolean;
    executeFunction?: () => void;
}

export default function ResetPasswordForm({ email, showResetPassword, fromDashboard = false, executeFunction }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        newPassword: '',
        reNewPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        newPassword: false,
        reNewPassword: false
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (passwords.newPassword !== passwords.reNewPassword) {
            toast.error("Passwords mismatched");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/resetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password: passwords.newPassword
                }),
            });

            const data = await res.json();
            if (data.success) {
                setIsLoading(false);
                toast.success("Password Updated");
                showResetPassword?.(false);
            }
            else {
                toast.error("Failed to update password");
            }
        }
        catch (e) {
            toast.error("Some error occurred!");
            console.error(e);
        }
        finally {
            setIsLoading(false);
        }
        
        if (fromDashboard) {
            try {
                const res = await fetch('/api/disableFirstLogin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email
                    }),
                });

                const data = await res.json();
                if (!data.success) {
                    toast.error("Failed to disable first login");
                }
                else{
                    executeFunction?.();
                }
            }
            catch(e){
                toast.error("Some error occurred!");
                console.error(e);
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    const handleShowPassword = (name: string) => {
        let value = showPasswords['newPassword'];
        if (name === 'reNewPassword') {
            value = showPasswords['reNewPassword'];
        }
        setShowPasswords(prev => ({
            ...prev,
            [name]: !value
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            { /* Email Label */}
            <div className='space-y-2'>
                <label className='block text-center text-sm font-medium text-white tracking-wider'>Email: {email}</label>
            </div>
            {/* New Password Field */}
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white tracking-wider">
                    New Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white" />
                    </div>
                    <input
                        id="new-password"
                        name="newPassword"
                        type={showPasswords.newPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        value={passwords.newPassword}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => handleShowPassword("newPassword")}
                    >
                        {showPasswords.newPassword ? (
                            <EyeOff className="h-5 w-5 text-blue-200 hover:text-white transition-colors" />
                        ) : (
                            <Eye className="h-5 w-5 text-blue-200 hover:text-white transition-colors" />
                        )}
                    </button>
                </div>
            </div>

            {/* Re-New Password Field */}
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white tracking-wider">
                    Re-enter New Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white" />
                    </div>
                    <input
                        id="re-new-password"
                        name="reNewPassword"
                        type={showPasswords.reNewPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        value={passwords.reNewPassword}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => handleShowPassword("reNewPassword")}
                    >
                        {showPasswords.reNewPassword ? (
                            <EyeOff className="h-5 w-5 text-blue-200 hover:text-white transition-colors" />
                        ) : (
                            <Eye className="h-5 w-5 text-blue-200 hover:text-white transition-colors" />
                        )}
                    </button>
                </div>
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
                        Working...
                    </div>
                ) : (
                    'Reset Password'
                )}
            </button>
        </form>
    )
}