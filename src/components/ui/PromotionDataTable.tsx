'use client';

import { StudentAllData, StudentData } from "@/types/student";
import { TeacherAllData, TeacherData } from "@/types/teacher";
import { Axis3D, Grip, ListCheck, ListX } from "lucide-react";
import toast from "react-hot-toast";
import InputField from "./InputField";
import { useEffect, useState } from "react";
import Button from "./Button";
import { useSessions } from "@/hooks/useSessions";
import FormSection from "./FormSection";
import SelectField from "./SelectField";
import FormFooterActions from "./FormFooterActions";
import FullPageLoader from "./FullPageLoader";

type DialogStateType = {
    openDialog: boolean;
    selectedData: StudentData | TeacherData | null;
    detailsTab: boolean;
    id: string | null;
};

type Props = {
    allData: StudentAllData[] | TeacherAllData[] | null;
    setStudentsData: React.Dispatch<React.SetStateAction<StudentAllData[] | null>>;
    setDialog: React.Dispatch<React.SetStateAction<DialogStateType>>;
    columns: string[];
    values: (keyof StudentAllData | keyof TeacherAllData)[];
    reportType: string;
    getStudentsData: () => void;
}

export default function PromotionDataTable({ allData, setStudentsData, setDialog, columns, values, reportType, getStudentsData }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<StudentAllData[] | TeacherAllData[] | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectSessionDialog, setSelectSessionDialog] = useState(false);

    const { sessions, isLoading: sessionsLoading } = useSessions();
    const [selectedSession, setSelectedSession] = useState('');

    const [loading, setLoading] = useState(false);

    const isAllSelected =
        filteredData &&
        filteredData.length > 0 &&
        selectedIds.size === filteredData.length;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchTerm(value);
    }

    const toggleCheckbox = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (searchTerm === '') {
            const sortedData = allData
                ? reportType === 'students'
                    ? [...(allData as StudentAllData[])].sort((a, b) => a.studentName.localeCompare(b.studentName))
                    : [...(allData as TeacherAllData[])].sort((a, b) => a.teacherName.localeCompare(b.teacherName))
                : []

            setFilteredData(sortedData);
        }
        else {
            const searchedData = allData
                ? reportType === 'students'
                    ? (allData as StudentAllData[]).filter((data) => data.studentName.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.studentName.localeCompare(b.studentName))
                    : (allData as TeacherAllData[]).filter((data) => data.teacherName.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.teacherName.localeCompare(b.teacherName))
                : null;

            setFilteredData(searchedData);
        }
    }, [searchTerm])

    if (reportType === "students") {
        allData = allData as StudentAllData[];
    }
    else {
        allData = allData as TeacherAllData[];
    }

    const checkAllBoxes = () => {
        if (!filteredData) return;

        if (selectedIds.size === filteredData.length) {
            // Uncheck all
            setSelectedIds(new Set());
        } else {
            // Check all
            const allIds = filteredData.map(data =>
                'sId' in data ? data.sId : data.tId
            );
            setSelectedIds(new Set(allIds));
        }
    };

    const handlePromote = async (selectData: boolean) => {
        if (!filteredData) return;

        const selectedStudents = filteredData
            .filter(data =>
                selectedIds.has('sId' in data ? data.sId : data.tId)
            )
            .map(data => {
                if (reportType === "students") {
                    const student = data as StudentAllData;
                    return {
                        sId: student.sId,
                        sessionId: student.sessionId,
                        classId: student.studentClass,
                        section: student.section
                    };
                }
                return null;
            })
            .filter(Boolean);

        if (selectedStudents.length === 0) {
            toast.error("Please select atleast one student to promote");
            return;
        }

        if (selectData) {
            setSelectSessionDialog(true);
            return;
        }

        if (selectedSession === selectedStudents[0]?.sessionId) {
            toast.error("Students can't be promoted to the same session");
            return;
        }

        setSelectSessionDialog(false);
        setLoading(true);

        const dataToSend = {
            students: selectedStudents,
            toSess: selectedSession
        }

        console.log(JSON.stringify(dataToSend));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/promoteStudents.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    promotionData: dataToSend
                })
            });

            const data = await res.json();

            if (!data.error) {
                toast.success("Students Promoted");
                setStudentsData([]);
                getStudentsData();
            } else {
                toast.error("Failed to promote the students.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Some error occurred");
        } finally {
            setLoading(false);
        }

    };

    const handleSessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSelectedSession(value);
    }

    const pageLoading = loading || sessionsLoading;
    if (pageLoading) return <FullPageLoader />

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10 z-1">
            <InputField label="Search by Name" name="search" value={searchTerm} onChange={handleSearchChange} />
            <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white mt-10">
                <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                        <tr>
                            <th className="px-6 py-4">S.No.</th>
                            {columns.map((column, index) => (
                                <th key={index} className="px-6 py-4">{column}</th>
                            ))}
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-center">
                        {filteredData && filteredData.map((data, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">{index + 1}</td>
                                {data && values.map((value, vIndex) => (
                                    <td key={vIndex} className="px-6 py-4">{
                                        reportType === "students" ? (data as StudentData)[value as keyof StudentData] : (data as TeacherData)[value as keyof TeacherData]
                                    }</td>
                                ))}
                                <td>{
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has('sId' in data ? data.sId : data.tId)}
                                        onChange={() => toggleCheckbox('sId' in data ? data.sId : data.tId)}
                                    />
                                }</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="w-fit mx-auto mt-6 flex space-x-2">
                <Button onClick={checkAllBoxes} icon={isAllSelected ? <ListX /> : <ListCheck />} text="" setGreen={isAllSelected ? false : true} />
                <Button onClick={() => handlePromote(true)} icon={<Axis3D />} text="Promote" setGreen={true} />
            </div>

            {selectSessionDialog && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handlePromote(false);
                        }}>
                            <FormSection title='Select Data' icon={<Grip />} margin={false} >
                                <SelectField label="Session" name="sessionId" value={selectedSession} onChange={handleSessChange} options={sessions} required />
                            </FormSection>

                            <FormFooterActions primaryLabel={'Promote Students'} cancel={() => setSelectSessionDialog(false)} />
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}