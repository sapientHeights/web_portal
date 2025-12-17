'use client';

import FullPageLoader from "@/components/ui/FullPageLoader";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import NoDataSection from "@/components/ui/NoDataSection";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import Button from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import UserInfo from "@/components/ui/UserInfo";
import { FileDown, RouteOff, School, StepBack } from "lucide-react";
import { useUser } from "@/context/UserContext";
import FormSection from "@/components/ui/FormSection";
import FormFooterActions from "@/components/ui/FormFooterActions";

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
    const [isLoading, setIsLoading] = useState(false);
    const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("sessionId") : null;
    const { user } = useUser();

    const [attData, setAttData] = useState<AttData[]>([]);
    const [noData, setNoData] = useState(false);

    const [filters, setFilters] = useState({
        selectedMonth: "",
        selectedClass: "",
        selectedSection: "",
        selectedDate: "",
        selectedStartRange: "",
        selectedEndRange: "",
        search: "",
    });

    const { selectedMonth, selectedClass, selectedSection, selectedDate, selectedStartRange, selectedEndRange, search } = filters;

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

    const todayDate = new Date().toLocaleDateString("en-CA");

    const [studentStats, setStudentStats] = useState<AttStatsData[]>([]);
    const [filterCategory, setFilterCategory] = useState('month');

    const fetchDataByClass = async (e: FormEvent) => {
        e.preventDefault();

        if (!filters.selectedClass || !filters.selectedSection) {
            toast.error("Please fill all the required fields");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/getAttDataByClass.php`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, classId: filters.selectedClass, section: filters.selectedSection }),
                }
            );

            const data = await res.json();

            if (!data.error) {
                const sortedData = data.attData.sort((a: AttData, b: AttData) => a.studentName.localeCompare(b.studentName));
                setAttData(sortedData);
                calTodayStatsData(sortedData);
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


    }

    const calTodayStatsData = (data: AttData[]) => {
        const today = data.filter(d => d.classDate === todayDate);

        let totalStudents = 0, presents = 0, absents = 0, leaves = 0;
        const set = new Set<string>();

        data.forEach(d => {
            set.add(d.sId);
        })

        totalStudents = set.size;

        set.forEach(s => {
            const stdData = today.find(d => d.sId == s);
            if (stdData) {
                if (stdData.att === 'P') presents++;
                else if (stdData.att === 'A') absents++;
                else if (stdData.att === 'L') leaves++;
            }
        })

        setTodayStats({
            presents,
            absents,
            leaves,
            total: totalStudents
        })
    }

    const calculateStats = (data: AttData[] = attData) => {
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

        data.forEach(d => {
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
            const classSectionRecords = data.filter(
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

    const getAttforDate = (sId: string, classId: string, section: string, date: string) => {
        if (!sId || !classId || !section || !date) return null;

        const record = attData.find((r) => r.sId === sId && r.classId === classId && r.section === section && r.classDate === date);
        return record ? record.att : "-";
    }

    useEffect(() => {
        const filterByMonth = () => {
            if (selectedMonth === '') {
                calculateStats();
                return;
            }

            const year = selectedMonth.split(' ')[1];
            const month = selectedMonth.split(' ')[0];

            const MONTHS = [
                'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
            ];

            const monthNum = MONTHS.indexOf(month);

            const records = attData.filter(data => {
                const date = new Date(data.classDate);
                return (
                    date.getMonth() === monthNum && date.getFullYear().toString() === year
                )
            })

            calculateStats(records);
        }

        filterByMonth();
    }, [selectedMonth])

    const monthOptions = useMemo(() => {
        setIsLoading(true);
        const map = new Map<number, Set<number>>();

        attData.forEach(d => {
            const date = new Date(d.classDate);
            const key = date.getFullYear();
            const value = date.getMonth();
            const s = map.get(key);
            if (s) {
                s.add(value);
            }
            else {
                const set = new Set<number>();
                set.add(value);
                map.set(key, set);
            }
        });

        const options: string[] = [];
        map.forEach((set, key) => {
            const values = Array.from(set).sort((a, b) => a - b);

            const MONTHS = [
                'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
            ];

            const getMonth = (month: number) => MONTHS[month];

            values.forEach(val => {
                options.push(`${getMonth(val)} ${key}`);
            })
        });

        setIsLoading(false);
        return options;
    }, [attData]);

    useEffect(() => {
        if (attData.length > 0) calculateStats();
    }, [attData]);

    const filteredStats = useMemo(() => {
        return studentStats.filter(s => {
            return (
                s.name.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [studentStats, search]);

    useEffect(() => {
        const filterByRange = () => {
            if(selectedStartRange === "" && selectedEndRange === ""){
                calculateStats();
                return;
            }

            if((selectedStartRange !== "" && selectedEndRange !== "") && (selectedEndRange >= selectedEndRange)){
                if(selectedEndRange === selectedStartRange){
                    toast.error("Filter by date to get the specific date attendance data");
                    clearFilters();
                    setFilterCategory('date');
                    return;
                }

                if(selectedStartRange > selectedEndRange){
                    toast.error("Start Date cannot be ahead of the end date");
                    clearFilters();
                    return;
                }
            }

            const filteredData = attData.filter(data => data.classDate >= selectedStartRange && data.classDate <= selectedEndRange);
            calculateStats(filteredData);
        }

        filterByRange();
    }, [selectedStartRange, selectedEndRange])

    const goBack = () => {
        setIsLoading(true);
        router.back();
    }

    const reset = () => {
        setFilters({
            selectedMonth: "",
            selectedClass: "",
            selectedSection: "",
            selectedDate: "",
            selectedStartRange: "",
            selectedEndRange: "",
            search: ""
        })
        setAttData([]);
        setStudentStats([]);
    }

    const clearFilters = () => {
        setFilters({
            selectedMonth: "",
            selectedClass: filters.selectedClass,
            selectedSection: filters.selectedSection,
            selectedDate: "",
            selectedStartRange: "",
            selectedEndRange: "",
            search: ""
        });
    }

    const filterCategoryChange = (category: string) => {
        clearFilters();
        setFilterCategory(category);
    }

    const exportToExcel = async () => {
        if (!filteredStats || filteredStats.length === 0) {
            toast.error("No data to export");
            return;
        }

        setIsLoading(true);

        if (selectedDate !== "") {
            const dataToExport = filteredStats.map((s) => ({
                name: s.name,
                class: s.class,
                section: s.section,
                attendance: getAttforDate(
                    s.sId,
                    s.class,
                    s.section,
                    selectedDate
                ),
            }));

            console.log(dataToExport);
            try {
                const res = await fetch("/api/exportExcelAttByDate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data: dataToExport }),
                });

                if (!res.ok) {
                    toast.error("Failed to download Excel");
                    return;
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;

                let finalName = `Attendance Stats By Date ${sessionId}`;
                if (filters.selectedMonth != '') {
                    finalName += `_${filters.selectedMonth}`;
                }

                if (filters.selectedClass != '') {
                    finalName += `_${filters.selectedClass}`;
                }

                if (filters.selectedSection != '') {
                    finalName += `_${filters.selectedSection}`;
                }

                if (filters.selectedDate != '') {
                    finalName += `_${filters.selectedDate}`;
                }

                if (filters.search != '') {
                    finalName += '_searchTerm_' + filters.search;
                }

                a.download = (finalName + '.xlsx');
                a.click();
                URL.revokeObjectURL(url);
            }
            catch (err) {
                console.error(err);
                toast.error("An error occurred while exporting Excel");
            }
            finally {
                setIsLoading(false);
            }

            return;
        }

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
            if (filters.selectedClass != '') {
                finalName += `_${filters.selectedClass}`;
            }

            if (filters.selectedSection != '') {
                finalName += `_${filters.selectedSection}`;
            }

            if (filters.selectedMonth != '') {
                finalName += `_${filters.selectedMonth}`;
            }

            if (filters.selectedDate != '') {
                finalName += `_${filters.selectedDate}`;
            }

            if(filters.selectedStartRange != '' && filters.selectedEndRange != ''){
                finalName += `_${filters.selectedStartRange}_to_${filters.selectedEndRange}`;
            }

            if (filters.search != '') {
                finalName += '_searchTerm_' + filters.search;
            }

            a.download = (finalName + '.xlsx');
            a.click();
            URL.revokeObjectURL(url);
        }
        catch (err) {
            console.error(err);
            toast.error("An error occurred while exporting Excel");
        }
        finally {
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
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 space-y-5">
                    <form onSubmit={fetchDataByClass}>
                        <FormSection title="Select Class" icon={<School />}>
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-5">
                                <SelectField label="Class" name="selectedClass" value={selectedClass} onChange={handleChange} options={classes} required />
                                <SelectField label="Section" name="selectedSection" value={selectedSection} onChange={handleChange} options={sections} disabled={!selectedClass} required />
                            </div>
                            <FormFooterActions primaryLabel="Get Data" reset={reset} />
                        </FormSection>
                    </form>
                </div>

                {attData && attData.length > 0 && (
                    <>
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 mb-5">{"Today's Attendance Summary"}</h2>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                                <StatCard title="Total Students" value={todayStats.total} color="from-gray-100 to-gray-200" />
                                {(todayStats.presents !== 0 || todayStats.absents !== 0 || todayStats.leaves !== 0 )&& (
                                    <>
                                        <StatCard title="Present" value={todayStats.presents} color="from-green-100 to-green-200" />
                                        <StatCard title="Absent" value={todayStats.absents} color="from-red-100 to-red-200" />
                                        <StatCard title="Leave" value={todayStats.leaves} color="from-yellow-100 to-yellow-200" />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 space-y-5">
                            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>

                            <div className="grid md:grid-cols-5 gap-4">
                                <Button text="Filter by Month" icon={<></>} onClick={() => filterCategoryChange('month')} setGreen={filterCategory === 'month'} />
                                <Button text="Filter by Date" icon={<></>} onClick={() => filterCategoryChange('date')} setGreen={filterCategory === 'date'} />
                                <Button text="Filter by Range" icon={<></>} onClick={() => filterCategoryChange('range')} setGreen={filterCategory === 'range'} />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {filterCategory === 'month' && (
                                    <SelectField label="Month/Year" name="selectedMonth" value={selectedMonth} onChange={handleChange} options={monthOptions} />
                                )}
                                {filterCategory === 'date' && (
                                    <InputField label="Date" name="selectedDate" value={selectedDate} onChange={handleChange} type="date" />
                                )}
                                {filterCategory === 'range' && (
                                    <>
                                    <InputField label="Start Date" name="selectedStartRange" value={selectedStartRange} onChange={handleChange} type="date" />
                                    <InputField label="End Date" name="selectedEndRange" value={selectedEndRange} onChange={handleChange} type="date" />
                                    </>
                                )}
                            </div>

                            <hr className="text-gray-100" />
                            <InputField label="Search Student" name="search" value={search} onChange={handleChange} type="text" />


                            <Button text="Clear Filters" icon={<RouteOff />} onClick={clearFilters} setGreen />
                        </div>
                    </>
                )}

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

                            {selectedClass !== '' && selectedSection !== '' && selectedDate === '' && filteredStats.length > 0 && (
                                <span className="px-4 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-full font-medium shadow-sm">
                                    Total Classes: {filteredStats.length > 0 && filteredStats[0].totalUniqueDates}
                                </span>
                            )}

                            {selectedClass !== '' && selectedSection !== '' && selectedDate !== '' && (
                                <span className="px-4 py-1.5 text-sm bg-red-100 text-red-700 rounded-full font-medium shadow-sm">
                                    Date: {selectedDate}
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
                                    {!selectedDate && (
                                        <>
                                            {selectedClass === '' && <th className="p-3 border-b">Class</th>}
                                            {selectedSection === '' && <th className="p-3 border-b">Section</th>}
                                            {selectedSection === '' && <th className="p-3 border-b">Total Classes</th>}
                                            <th className="p-3 border-b">Presents</th>
                                            <th className="p-3 border-b">Absents</th>
                                            <th className="p-3 border-b">Leaves</th>
                                            <th className="p-3 border-b text-center">Attendance %</th>
                                        </>
                                    )}

                                    {selectedDate && (
                                        <th className="p-3 border-b">Attendance</th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStats && filteredStats.length > 0 && filteredStats.map((s, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 border-b">
                                        <td className="p-3">{idx + 1}</td>
                                        <td className="p-3">{s.name}</td>
                                        {!selectedDate && (
                                            <>
                                                {selectedClass === '' && <td className="p-3">{s.class}</td>}
                                                {selectedSection === '' && <td className="p-3">{s.section}</td>}
                                                {selectedSection === '' && <td className="p-3">{s.totalUniqueDates}</td>}
                                                <td className="p-3">{s.presents}</td>
                                                <td className="p-3">{s.absents}</td>
                                                <td className="p-3">{s.leaves}</td>
                                                <td className="p-3 text-center font-semibold">{s.attendancePercentage}%</td>
                                            </>
                                        )}

                                        {selectedDate && (
                                            <td className="p-3 text-left font-semibold">
                                                {getAttforDate(s.sId, selectedClass, selectedSection, selectedDate)}
                                            </td>
                                        )}
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
