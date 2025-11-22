'use client';

import FullPageLoader from "@/components/ui/FullPageLoader";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import NoDataSection from "@/components/ui/NoDataSection";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import Button from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import UserInfo from "@/components/ui/UserInfo";
import { FileDown, RouteOff, StepBack } from "lucide-react";
import { useUser } from "@/context/UserContext";

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
};

type AttStatsData = {
    sId: string;
    name: string;
    class: string;
    section: string;
    totalRecords: number;
    presents: number;
    absents: number;
    leaves: number;
    totalUniqueDates: number;
    attendancePercentage: number;
}

export default function GetAttendance() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("sessionId") : null;
    const { user } = useUser();

    const [attData, setAttData] = useState<AttData[]>([]);
    const [noData, setNoData] = useState(false);

    const [filters, setFilters] = useState({
        selectedClass: "",
        selectedSection: "",
        search: ""
    });

    const { selectedClass, selectedSection, search } = filters;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        setFilters(prev => ({ ...prev, selectedSection: "" }));
    }, [selectedClass]);

    const { classes, isLoading: classesLoading } = useClasses();
    const { sections, isLoading: sectionsLoading } = useSections(selectedClass);

    const [todayStats, setTodayStats] = useState({
        presents: 0,
        absents: 0,
        leaves: 0,
        total: 0
    });

    const todayDate = new Date().toISOString().split('T')[0];

    const [studentStats, setStudentStats] = useState<AttStatsData[]>([]);

    const fetchData = async () => {
        if (!sessionId) {
            toast.error("Some error occurred");
            router.push('/dashboard');
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/getAttDataBySess.php`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                }
            );

            const data = await res.json();

            if (!data.error) {
                setAttData(data.attData);
            } else {
                setNoData(true);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const today = attData.filter(d => d.classDate === todayDate);

        let presents = 0, absents = 0, leaves = 0;
        today.forEach(d => {
            if (d.att === 'P') presents++;
            else if (d.att === 'A') absents++;
            else if (d.att === 'L') leaves++;
        });

        setTodayStats({
            presents,
            absents,
            leaves,
            total: today.length
        });
    }, [attData]);

    const calculateStats = () => {
        const stats: Record<string, {
            sId: string;
            name: string;
            class: string;
            section: string;
            totalRecords: number;
            presents: number;
            absents: number;
            leaves: number;
            totalUniqueDates: number;
            attendancePercentage: number;
        }> = {};

        attData.forEach(d => {
            if (!stats[d.sId]) {
                stats[d.sId] = {
                    sId: d.sId,
                    name: d.studentName,
                    class: d.classId,
                    section: d.section,
                    totalRecords: 0,
                    presents: 0,
                    absents: 0,
                    leaves: 0,
                    totalUniqueDates: 0,
                    attendancePercentage: 0
                };
            }

            stats[d.sId].totalRecords++;

            if (d.att === "P") stats[d.sId].presents++;
            else if (d.att === "A") stats[d.sId].absents++;
            else if (d.att === "L") stats[d.sId].leaves++;
        });

        const finalStats = Object.values(stats).map(s => {
            const classSectionRecords = attData.filter(
                x => x.classId === s.class && x.section === s.section
            );

            const uniqueDates = new Set(classSectionRecords.map(x => x.classDate)).size;

            const percentage = (s.presents / uniqueDates) * 100;

            return {
                ...s,
                totalUniqueDates: uniqueDates,
                attendancePercentage: Math.round(percentage)
            };
        });

        setStudentStats(finalStats);
    };


    useEffect(() => {
        if (attData.length > 0) calculateStats();
    }, [attData]);

    const filteredStats = useMemo(() => {
        return studentStats.filter(s => {
            return (
                (!selectedClass || s.class === selectedClass) &&
                (!selectedSection || s.section === selectedSection) &&
                s.name.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [studentStats, selectedClass, selectedSection, search]);

    const goBack = () => {
        setIsLoading(true);
        router.back();
    }

    const clearFilters = () => {
        setFilters({
            selectedClass: "",
            selectedSection: "",
            search: ""
        });
    }

    const exportToExcel = async () => {
        if (!filteredStats || filteredStats.length === 0) {
            toast.error("No data to export");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/exportExcelAtt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: filteredStats }),
            });

            if (!res.ok) {
                toast.error("Failed to download Excel");
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            let finalName = `Attendance Stats ${sessionId}`;
            if(filters.selectedClass != ''){
                finalName += `_${filters.selectedClass}`;
            }

            if(filters.selectedSection != ''){
                finalName += `_${filters.selectedSection}`;
            }

            if (filters.search != '') {
                finalName += '_searchTerm_' + filters.search;
            }

            a.download = (finalName + '.xlsx');
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while exporting Excel");
        }
        finally{
            setIsLoading(false);
        }
    }

    if (isLoading || classesLoading || sectionsLoading) {
        return <FullPageLoader />;
    }

    if (noData) {
        return <NoDataSection />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6 relative">
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />
            <Header title='Sapient Heights' info={`View Attendance Data for session ${sessionId}`} />

            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-5">Today’s Attendance Summary</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                        <StatCard title="Total" value={todayStats.total} color="from-gray-100 to-gray-200" />
                        <StatCard title="Present" value={todayStats.presents} color="from-green-100 to-green-200" />
                        <StatCard title="Absent" value={todayStats.absents} color="from-red-100 to-red-200" />
                        <StatCard title="Leave" value={todayStats.leaves} color="from-yellow-100 to-yellow-200" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 space-y-5">
                    <h2 className="text-lg font-semibold text-gray-800">Filters</h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        <SelectField label="Class" name="selectedClass" value={selectedClass} onChange={handleChange} options={classes} />
                        <SelectField label="Section" name="selectedSection" value={selectedSection} onChange={handleChange} options={sections} disabled={!selectedClass} />
                        <InputField label="Search Student" name="search" value={search} onChange={handleChange} type="text" />
                    </div>

                    <Button text="Clear Filters" icon={<RouteOff />} onClick={clearFilters} setGreen />
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Attendance Records</h2>

                    {(selectedClass !== '' || selectedSection !== '') && (
                        <div className="flex flex-wrap gap-3 mt-4 mb-6">
                            {selectedClass !== '' && (
                                <span className="px-4 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-full font-medium shadow-sm">
                                    Class: {selectedClass}
                                </span>
                            )}

                            {selectedSection !== '' && (
                                <span className="px-4 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-full font-medium shadow-sm">
                                    Section: {selectedSection}
                                </span>
                            )}

                            {selectedClass !== '' && selectedSection !== '' && (
                                <span className="px-4 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-full font-medium shadow-sm">
                                    Total Classes: {filteredStats[0].totalUniqueDates}
                                </span>
                            )}
                        </div>
                    )}


                    <div className="overflow-auto max-h-[500px] rounded-lg border border-gray-200">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr className="text-left text-gray-700">
                                    <th className="p-3 border-b">S.No</th>
                                    <th className="p-3 border-b">Student</th>
                                    {selectedClass === '' && <th className="p-3 border-b">Class</th>}
                                    {selectedSection === '' && <th className="p-3 border-b">Section</th>}
                                    {selectedSection === '' && <th className="p-3 border-b">Total Classes</th>}
                                    <th className="p-3 border-b">Presents</th>
                                    <th className="p-3 border-b">Absents</th>
                                    <th className="p-3 border-b">Leaves</th>
                                    <th className="p-3 border-b text-center">Attendance %</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStats && filteredStats.length > 0 && filteredStats.map((s, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 border-b">
                                        <td className="p-3">{idx + 1}</td>
                                        <td className="p-3">{s.name}</td>
                                        {selectedClass === '' && <td className="p-3">{s.class}</td>}
                                        {selectedSection === '' && <td className="p-3">{s.section}</td>}
                                        {selectedSection === '' && <td className="p-3">{s.totalUniqueDates}</td>}
                                        <td className="p-3">{s.presents}</td>
                                        <td className="p-3">{s.absents}</td>
                                        <td className="p-3">{s.leaves}</td>
                                        <td className="p-3 text-center font-semibold">{s.attendancePercentage}%</td>
                                    </tr>
                                ))}

                                {filteredStats && filteredStats.length === 0 && (
                                    <tr>
                                        <td className="p-8" colSpan={10}><NoDataSection /></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5">
                        <Button text="Export to Excel" icon={<FileDown />} onClick={exportToExcel} setGreen />
                    </div>

                </div>

            </div>
        </div>
    );
}


function StatCard({
    title,
    value,
    color
}: {
    title: string;
    value: number;
    color: string;
}) {
    return (
        <div className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-sm border border-gray-200`}>
            <div className="text-xs text-gray-600">{title}</div>
            <div className="text-3xl font-semibold text-gray-900">{value}</div>
        </div>
    );
}
