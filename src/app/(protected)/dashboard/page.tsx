'use client'

import { useRouter } from 'next/navigation';
import { LogOut, TriangleAlert } from 'lucide-react';
import UserInfo from '@/components/ui/UserInfo';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import Footer from '@/components/ui/Footer';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import ResetPasswordForm from '@/components/ui/ResetPasswordForm';
import { useUser } from '@/context/UserContext';
import { dashboardCards } from '@/data/dashboardCards';
import { useClasses } from '@/hooks/useClasses';
import FullPageLoader from '@/components/ui/FullPageLoader';

export default function Dashboard() {
    const router = useRouter();
    const { classes, isLoading: classesLoading } = useClasses();
    const [showResetPassword, setShowResetPassword] = useState(false);
    const { user, refreshUser } = useUser();
    const [studentsCount, setStudentsCount] = useState(null);
    const [teachersCount, setTeachersCount] = useState(null);
    const [pageLoading, setPageLoading] = useState(false);

    useEffect(() => {
        if (user?.firstLogin === 1) {
            setShowResetPassword(true);
        }
    }, [user])

    const fetchAllStudentsCount = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllStudentsCount.php`, {
            method: 'GET'
        });
        const data = await res.json();
        if (!data.error) {
            setStudentsCount(data.studentsCount);
            return;
        }
    }

    const fetchAllTeachersCount = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllTeachersCount.php`, {
            method: 'GET'
        });
        const data = await res.json();
        if (!data.error) {
            setTeachersCount(data.teachersCount);
            return;
        }
    }

    useEffect(() => {
        fetchAllStudentsCount();
        fetchAllTeachersCount();
    }, [])

    const navigateTo = (id: number) => {
        switch (id) {
            case 1:
                setPageLoading(true);
                router.push('/teacherRegistration');
                break;
            case 2:
                setPageLoading(true);
                router.push('/studentRegistration');
                break;
            case 3:
                setPageLoading(true);
                router.push('/feeManagement');
                break;
            case 4:
                setPageLoading(true);
                router.push('/reports');
                break;
            case 5:
                setPageLoading(true);
                router.push('/attendance');
                break;
            case 6:
                setPageLoading(true);
                router.push('/settings');
                break;
            case 7:
                setPageLoading(true);
                router.push('/notice');
                break;
            default:
                toast("Coming Soon...");
        }
    };

    const logout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            const res = await fetch('/api/logout', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                setPageLoading(true);
                router.push("/login");
            }
            else {
                toast.error("Some error occurred!");
            }
        }
    };

    const isLoading = classesLoading || pageLoading;
    if (isLoading) {
        return <FullPageLoader />
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6 font-sans relative">
                {/* Logout Button */}
                <Button onClick={logout} icon={<LogOut size={18} />} text='Logout' />

                {/* User Info */}
                <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

                {/* Header */}
                <Header title='Sapient Heights' info='School Management Dashboard' />

                {/* Stats Bar */}
                <div className="flex flex-wrap justify-center gap-6 mb-10">
                    {[
                        { label: 'Teachers', value: `${teachersCount == null ? '0' : teachersCount}` },
                        { label: 'Students', value: `${studentsCount == null ? '0' : studentsCount}` },
                        { label: 'Classes', value: classes.length },
                        // { label: 'This Month', value: '₹14.2L' },
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-white/90 backdrop-blur-md shadow-md px-8 py-5 rounded-xl text-center border border-white/30 min-w-[120px]"
                        >
                            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {dashboardCards.map((card, idx) => {
                        if (user && user.role === 'A' && card.id === 6) return null;
                        return (
                            <div
                                key={idx}
                                onClick={() => navigateTo(card.id)}
                                className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 rounded-2xl text-white cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 shadow-xl relative overflow-hidden group"
                            >
                                <div className="bg-white/20 border border-white/10 backdrop-blur-md w-14 h-14 flex items-center justify-center rounded-xl mb-5">
                                    <card.icon className='w-6 h-6 text-white' />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                                <p className="text-sm opacity-90 leading-relaxed">{card.description}</p>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-300" />
                            </div>
                        );
                    })}
                </div>

                {/* Reset Password */}
                {user?.firstLogin === 1 && showResetPassword && (
                    <div className="fixed top-0 left-0 w-full h-screen bg-black/50 z-50 flex items-center justify-center">
                        <div className="w-full max-w-md bg-gradient-to-br from-blue-500 to-purple-500 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
                            <div className='flex justify-center items-center gap-2 mb-2'>
                                <TriangleAlert className='h-6 w-6 text-red-700' />
                                <p className='text-center text-white font-semibold text-md tracking-wider'>Reset Your Password for Better Security</p>
                            </div>
                            <ResetPasswordForm email={user.email} showResetPassword={setShowResetPassword} fromDashboard={true} executeFunction={refreshUser} />
                        </div>
                    </div>
                )}

                <Footer />
            </div>
        </>
    );
};
