'use client';

import Button from "@/components/ui/Button";
import FullPageLoader from "@/components/ui/FullPageLoader";
import Header from "@/components/ui/Header";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { CalendarFold, FileClock, IndianRupee, Sheet, StepBack, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InputField from "@/components/ui/InputField";
import SheetAnalysis from "@/components/ui/SheetAnalysis";
import FormSection from "@/components/ui/FormSection";
import LeavesData from "@/components/ui/LeavesData";
import { useSessions } from "@/hooks/useSessions";
import LeavesHistory from "@/components/ui/LeavesHistory";

type BasicSalaryData = {
    id: string;
    tId: string;
    salary: number;
    installment: number;
    teacherName: string;
    empId: string;
}

type TeachersData = {
    tId: string;
    teacherName: string;
    empId: string;
}


export default function Salary() {
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(false);

    const { user } = useUser();

    const [category, setCategory] = useState('salary');

    const [basicSalaryData, setBasicSalaryData] = useState<BasicSalaryData[] | null>(null);
    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();

    const goBack = () => {
        setPageLoading(true);
        router.back();
    };

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const getBasicSalaryData = async () => {
        setPageLoading(true);
        try {
            const res = await fetch(`${backendUrl}/getBasicSalaryData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            if (data.error) {
                toast.error("Some error occurred");
            }
            else {
                if (data.bsDataFound) {
                    setBasicSalaryData(data.basicSalaryData);
                }
                else {
                    const bsData: BasicSalaryData[] = [];
                    data.teachersData.forEach((data: TeachersData) => {
                        bsData.push({
                            id: '',
                            tId: data.tId,
                            salary: 0,
                            installment: 0,
                            teacherName: data.teacherName,
                            empId: data.empId
                        })
                    });

                    setBasicSalaryData(bsData);
                }
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setPageLoading(false);
        }
    }

    const saveBasicSalaryData = async () => {
        setPageLoading(true);
        try {
            const res = await fetch(`${backendUrl}/saveBasicSalaryData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    basicSalaryData
                })
            })
            const data = await res.json();
            if (data.error) {
                toast.error("Some error occurred - Failed to save data");
            }
            else {
                toast.success("Data Saved successfully!");
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setPageLoading(false);
        }
    }

    useEffect(() => {
        if (category === 'salary') {
            getBasicSalaryData();
        }
    }, [])

    const handleCategoryClick = (category: string) => {
        if (category === 'salary') {
            getBasicSalaryData();
        }
        setCategory(category);
    }

    const handleChange = (
        index: number,
        field: "salary" | "installment",
        value: string
    ) => {
        setBasicSalaryData(prev => {
            if (!prev) return prev;

            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: Number(value)
            };

            return updated;
        });
    };

    const loading = pageLoading || sessionsLoading;
    if (loading) return <FullPageLoader />;

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-100 to-blue-200 p-6">
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />

            <UserInfo name={user?.name || ''} role={user?.desc || ''} />

            <Header title='Sapient Heights' info='Manage salary for Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button icon={<IndianRupee />} text="Salary Data" onClick={() => handleCategoryClick('salary')} setGreen={category === 'salary'} />
                    <Button icon={<CalendarFold />} text="Leave Data" onClick={() => handleCategoryClick('leavesData')} setGreen={category === 'leavesData'} />
                    <Button icon={<FileClock />} text="Leave History" onClick={() => handleCategoryClick('leavesHistory')} setGreen={category === 'leavesHistory'} />
                    <Button icon={<Sheet />} text="Sheet Analysis" onClick={() => handleCategoryClick('sheet')} setGreen={category === 'sheet'} />
                </div>
            </div>

            {category === 'salary' && (
                <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10">
                    <form onSubmit={() => { }}>
                        <FormSection title="Basic Salary" icon={<Wallet />} margin={false}>
                            <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white mt-6">
                                <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                                    <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                        <tr>
                                            <th className="px-6 py-4">S.No.</th>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Emp Code</th>
                                            <th className="px-1 py-4">Basic Salary</th>
                                            <th className="px-1 py-4">Installment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-center">
                                        {basicSalaryData && basicSalaryData.map((data, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">{index + 1}</td>
                                                <td className="px-6 py-4">{data.tId}</td>
                                                <td className="px-6 py-4">{data.teacherName}</td>
                                                <td className="px-6 py-4">{data.empId}</td>
                                                <td className="px-6 py-4">
                                                    <InputField value={data.salary.toString()} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, "salary", e.target.value)} label="" name="salary" />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <InputField value={data.installment.toString()} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, "installment", e.target.value)} label="" name="installment" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            </div>
                            <div className="mt-6 flex gap-5">
                                <Button type="button" onClick={getBasicSalaryData} icon={<></>} text="Reset" />
                                <Button onClick={saveBasicSalaryData} icon={<></>} text="Save Data" setGreen />
                            </div>
                        </FormSection>
                    </form>
                </div>
            )}

            {category === 'leavesData' && (
                <LeavesData sessions={sessions} activeSession={activeSession} />
            )}

            {category === 'leavesHistory' && (
                <LeavesHistory sessions={sessions} activeSession={activeSession} />
            )}

            {category === 'sheet' && (
                <SheetAnalysis basicSalaryData={basicSalaryData} />
            )}

        </div>
    );
}