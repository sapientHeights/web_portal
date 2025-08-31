import { ArrowBigLeft, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import ResetPasswordForm from "./ResetPasswordForm";

type Props = {
    setForgetPassword?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ForgetPasswordForm({setForgetPassword} : Props) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetPassword, setResetPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/checkUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email
                }),
            });

            const data = await res.json();
            if (data.success) {
                setIsLoading(false);
                setResetPassword(true);
                toast.success("User Available");
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

    const handleGoBack = () => {
        setForgetPassword?.(false);
    }

    if (resetPassword) {
        return <ResetPasswordForm email={email} showResetPassword={setResetPassword} />
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
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
                        Checking...
                    </div>
                ) : (
                    'Reset Password'
                )}
            </button>

            {/* Go Back */}
            <div className="flex items-center justify-center gap-1" onClick={handleGoBack}>
                <ArrowBigLeft className="h-4 w-4 text-white"/>
                <p
                    className="block text-center text-white font-medium text-sm cursor-pointer"
                >
                    Go Back to Login
                </p>
            </div>
        </form>
    )
}