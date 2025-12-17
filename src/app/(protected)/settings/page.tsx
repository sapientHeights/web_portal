'use client';

import ShowAdmins from "@/components/ui/ShowAdmins";
import Button from "@/components/ui/Button";
import FullPageLoader from "@/components/ui/FullPageLoader";
import Header from "@/components/ui/Header";
import ShowClassesFee from "@/components/ui/ShowClassesFee";
import ShowTeachers from "@/components/ui/ShowTeachers";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext"
import { ClassFeeData } from "@/types/fee";
import { TeacherAllData } from "@/types/teacher";
import { CalendarSync, FileUser, Receipt, ShieldUser, StepBack, UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ShowClassIncharge from "@/components/ui/ShowClassIncharge";
import ShowSessions from "@/components/ui/ShowSessions";

type UserData = {
    email: string;
    name: string;
    role: string;
    desc: string;
    firstLogin: number;
}

export default function Settings() {
    const { user } = useUser();
    const router = useRouter();
    const [category, setCategory] = useState('admins');
    const [admins, setAdmins] = useState<UserData[] | null>(null);

    const [classesFee, setClassesFee] = useState<ClassFeeData[] | null>(null);
    const [teachers, setTeachers] = useState<TeacherAllData[] | null>(null);

    const [loading, setLoading] = useState(true);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/getAdmins.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            if (data.error) {
                toast.error("No Admins available");
            }
            else {
                setAdmins(data.adminsData);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    const fetchClassFees = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/getClassesFee.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            if (data.error) {
                toast.error("No data available");
            }
            else {
                setClassesFee(data.feesData);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/getTeachers.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            if (data.error) {
                toast.error("No data available");
            }
            else {
                setTeachers(data.teachersData);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAdmins();
    }, [])

    useEffect(() => {
        if (category === 'admins') fetchAdmins();
        else if (category === 'fees') fetchClassFees();
        else if (category === 'teachers') fetchTeachers();
        else if(category === 'incharges' && teachers === null) fetchTeachers(); 
    }, [category])

    const goBack = () => {
        router.back();
    }

    const handleCategoryClick = (category: string) => {
        setCategory(category);
    }

    if (loading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6 relative">
            {/* Back Button */}
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />

            {/* User Info */}
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

            {/* Header */}
            <Header title='Sapient Heights' info='Manage all the settings for Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Button icon={<ShieldUser />} text="Add or Remove Admins" onClick={() => handleCategoryClick('admins')} setGreen={category === 'admins'} />
                    <Button icon={<Receipt />} text="Class Fee" onClick={() => handleCategoryClick('fees')} setGreen={category === 'fees'} />
                    <Button icon={<UserRoundCog />} text="Allot Teachers" onClick={() => handleCategoryClick('teachers')} setGreen={category === 'teachers'} />
                    <Button icon={<FileUser />} text="Assign Class Incharge" onClick={() => handleCategoryClick('incharges')} setGreen={category === 'incharges'} />
                    <Button icon={<CalendarSync />} text="Sessions" onClick={() => handleCategoryClick('sessions')} setGreen={category === 'sessions'} />
                </div>
            </div>

            {category === 'admins' && (
                <ShowAdmins admins={admins} fetchAdmins={fetchAdmins} setLoading={setLoading} />
            )}

            {category === 'fees' && (
                <ShowClassesFee classesFee={classesFee} setLoading={setLoading} fetchClassFees = {fetchClassFees} />
            )}

            {category === 'teachers' && (
                <ShowTeachers teachersData={teachers} setLoading = {setLoading} />
            )}

            {category === 'incharges' && (
                <ShowClassIncharge teachersData={teachers} />
            )}

            {category === 'sessions' && (
                <ShowSessions setLoading={setLoading} />
            )}
        </div>
    )
}