'use client';

import Button from "@/components/ui/Button";
import Footer from "@/components/ui/Footer";
import FullPageLoader from "@/components/ui/FullPageLoader";
import InputField from "@/components/ui/InputField";
import NoDataSection from "@/components/ui/NoDataSection";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { CalendarRange, School, Send, StepBack, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type AttData = {
    sId: string;
    teacherName: string;
    studentName: string;
    sessionId: string;
    classId: string;
    section: string;
    classDate: string;
    att: string;
    markedBy: string;
}

export default function EditAttendance() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();
    const [attData, setAttData] = useState<AttData[]>([]);
    const [noData, setNoData] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAttData, setFilteredAttData] = useState<AttData[]>([]);

    const jsonData = sessionStorage.getItem('academicData');
    const academicData = jsonData ? JSON.parse(jsonData) : null;

    const fetchAttData = async () => {
        if (!jsonData || academicData === null) {
            toast.error("Some error occurred");
            router.push('/dashboard');
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAttendanceData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: academicData.sessionId,
                    classId: academicData.studentClass,
                    section: academicData.section,
                    date: academicData.date
                }),
            });

            const data = await res.json();
            if (!data.error) {
                const sortedAttData = data.attData.sort((a: AttData, b: AttData) => a.studentName.localeCompare(b.studentName));
                setAttData(sortedAttData);
                setFilteredAttData(sortedAttData);
            }
            else {
                setNoData(true);
                toast.error("Failed to fetch Attendance Data");
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchAttData();
    }, [])


    useEffect(() => {
        if(searchTerm === ''){
            setFilteredAttData(attData);
        }
        else{
            const filteredData = attData.filter(data => data.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
            setFilteredAttData(filteredData);
        }
    }, [searchTerm])

    const goBack = () => {
        router.back();
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setSearchTerm(value);
    }

    const handleAttChange = (selectedAtt: string, sId: string) => {
        const att = selectedAtt === 'Present' ? 'P' : selectedAtt === 'Absent' ? 'A' : 'L';
        setAttData((prevData) =>
            prevData.map((data) =>
                data.sId === sId ? {
                    sId,
                    studentName: data.studentName,
                    teacherName: data.teacherName,
                    sessionId: academicData.sessionId,
                    classId: academicData.studentClass,
                    section: academicData.section,
                    classDate: academicData.date,
                    att,
                    markedBy: user ? user.email : 'SYSTEM'
                } : data
            )
        );

        setFilteredAttData((prevData) =>
            prevData.map((data) =>
                data.sId === sId ? {
                    sId,
                    studentName: data.studentName,
                    teacherName: data.teacherName,
                    sessionId: academicData.sessionId,
                    classId: academicData.studentClass,
                    section: academicData.section,
                    classDate: academicData.date,
                    att,
                    markedBy: user ? user.email : 'SYSTEM'
                } : data
            )
        );
    }

    const saveAttData = async () => {
        const noAtt = attData.find((data) => data.att === undefined);
        if (noAtt) {
            toast.error("Please fill the attendance");
            return;
        }

        const sendAttData = attData.map((data) =>
            data.sessionId === undefined ? {
                sId: data.sId,
                studentName: data.studentName,
                teacherName: data.teacherName,
                sessionId: academicData.sessionId,
                classId: academicData.studentClass,
                section: academicData.section,
                classDate: academicData.date,
                att: data.att,
                markedBy: user ? user.email : 'SYSTEM'
            } : data
        )

        console.log(sendAttData);
        const dataToSend = {
            attData: sendAttData
        }

        try {
            setIsLoading(true);
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const res = await fetch(`${backendUrl}/saveAttendanceData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            })

            const data = await res.json();
            if (data.error) {
                toast.error("Failed to Save Attendance");
            }
            else {
                toast.success("Attendance marked successfully");
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6 relative">
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

            <div className="max-w-6xl mx-auto mt-10 bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-4">
                    <div className="max-w-md rounded-4xl shadow-xl p-6 md:p-10 bg-red-600 text-white">
                        <div className="flex flex-row justify-between items-center gap-2">
                            <span className=""><CalendarRange size={40} /></span>
                            <p>Session:</p>
                            <h3 className="text-2xl">{academicData.sessionId}</h3>
                        </div>
                    </div>
                    <div className="max-w-md bg-green-600 text-white rounded-4xl shadow-xl p-6 md:p-10">
                        <div className="flex flex-row justify-between items-center gap-2">
                            <span className=""><School size={40} /></span>
                            <p>Class:</p>
                            <h3 className="text-2xl">{academicData.studentClass}</h3>
                        </div>
                    </div>
                    <div className="max-w-md bg-blue-600 text-white rounded-4xl shadow-xl p-6 md:p-10">
                        <div className="flex flex-row justify-between items-center gap-2">
                            <span className=""><Workflow size={40} /></span>
                            <p>Section:</p>
                            <h3 className="text-2xl">{academicData.section}</h3>
                        </div>
                    </div>
                </div>
                <hr className="text-gray-300 mb-4" />
                <div className="flex flex-col md:flex-row justify-between items-center text-sm font-sans tracking-wider">
                    {/* <p><b>Teacher Name:</b></p> */}
                    <p><b>Total Students</b>: {attData.length}</p>
                    <p><b>Date</b>: {academicData.date}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto bg-gray-50 shadow-xl p-6 md:p-10 mb-10 rounded-3xl">
                <h3 className="text-black text-2xl text-center mb-10 font-mono">Student Data - Mark Attendance</h3>

                <div className="mb-8">
                    <InputField label="Search by Student Name" name="search" value={searchTerm} onChange={handleSearchChange} />
                </div>

                {/* Scrollable Table Wrapper */}
                <div className="overflow-auto max-h-[600px]">
                    <table className="min-w-[600px] w-full text-sm text-left text-gray-800">
                        <thead className="bg-gray-100 sticky top-0 z-20 text-xs uppercase text-gray-600 tracking-wider text-center">
                            <tr>
                                <th className="px-4 py-3">S.No.</th>
                                <th className="px-4 py-3">Student ID</th>
                                <th className="px-4 py-3">Student Name</th>
                                <th className="px-4 py-3">Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white text-center">
                            {filteredAttData && filteredAttData.length === 0 && (
                                <tr className="p-10">
                                    <td colSpan={4}><NoDataSection /></td>
                                </tr>
                            )}
                            {filteredAttData && filteredAttData.map((data, index) => {
                                let value = '';
                                if (data.att === undefined) {
                                    data.att = 'P';
                                }
                                value = data.att === 'P' ? "Present" : data.att === 'A' ? "Absent" : data.att === 'L' ? "Leave" : '';
                                return (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-6">{index + 1}</td>
                                        <td className="px-4 py-6">{data.sId}</td>
                                        <td className="px-4 py-6">{data.studentName}</td>
                                        <td className="px-4 py-6">
                                            <div className="flex justify-center gap-2">
                                                {['P', 'A', 'L'].map((attType) => (
                                                    <button
                                                        key={attType}
                                                        onClick={() => handleAttChange(
                                                            attType === 'P' ? 'Present' : attType === 'A' ? 'Absent' : 'Leave',
                                                            data.sId
                                                        )}
                                                        className={`px-3 py-1 rounded-full text-sm font-medium 
                                                            ${data.att === attType
                                                                ? attType === 'P'
                                                                    ? 'bg-green-500 text-white'
                                                                    : attType === 'A'
                                                                        ? 'bg-red-500 text-white'
                                                                        : 'bg-yellow-400 text-white'
                                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 transition'}`}
                                                    >
                                                        {attType === 'P' ? 'Present' : attType === 'A' ? 'Absent' : 'Leave'}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>

                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {noData ? (
                    <div className="mt-10">
                        <NoDataSection />
                    </div>
                ) : (
                    <div className="mt-10 flex justify-center">
                        <Button onClick={saveAttData} text="Save Attendance" icon={<Send />} setGreen={true} />
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}