'use client';

import Button from "@/components/ui/Button";
import DataDialog from "@/components/ui/DataDialog";
import DataTable from "@/components/ui/DataTable";
import FullPageLoader from "@/components/ui/FullPageLoader";
import Header from "@/components/ui/Header";
import NoDataSection from "@/components/ui/NoDataSection";
import SelectField from "@/components/ui/SelectField";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { useSessions } from "@/hooks/useSessions";
import { StudentAllData, StudentData } from "@/types/student";
import { TeacherAllData, TeacherData } from "@/types/teacher";
import { Briefcase, Newspaper, StepBack, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Reports() {
    const router = useRouter();
    const { user } = useUser();
    const [pageLoading, setPageLoading] = useState(false);

    const [stdSesData, setStdSesData] = useState({
        sessionId: "", studentClass: "", section: ""
    });

    const { classes, isLoading: classesLoading } = useClasses();
    const { sections, isLoading: sectionsLoading } = useSections(stdSesData.studentClass);
    const { sessions, isLoading: sessionsLoading } = useSessions();

    const [studentsData, setStudentsData] = useState<StudentAllData[] | null>(null);
    const [dialog, setDialog] = useState<{
        openDialog: boolean;
        selectedData: StudentData | TeacherData | null;
        detailsTab: boolean;
        id: string | null;
    }>({
        openDialog: false,
        selectedData: null,
        detailsTab: true,
        id: null
    });
    const [reportType, setReportType] = useState("students");
    const [teachersData, setTeachersData] = useState<TeacherAllData[] | null>(null);

    const goBack = () => {
        setPageLoading(true);
        router.back();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setStdSesData(prev => ({ ...prev, [name]: value }));
    };

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const getStudentsData = async () => {
        try {
            setPageLoading(true);
            const res = await fetch(`${backendUrl}/getStudentsByClassData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session: stdSesData.sessionId,
                    class: stdSesData.studentClass,
                    section: stdSesData.section
                })
            })

            const data = await res.json();
            if (data.error) {
                toast.error("No students available");
            }
            else {
                setStudentsData(data.studentsData);
            }
        }
        catch (err) {
            toast.error("Failed to load Data");
            console.error(err);
        }
        finally {
            setPageLoading(false);
        }
    }

    const getTeachersData = async () => {
        try {
            setPageLoading(true);
            const res = await fetch(`${backendUrl}/getTeachers.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            if (data.error) {
                toast.error("No teachers available");
            }
            else {
                setTeachersData(data.teachersData);
            }
        }
        catch (err) {
            toast.error("Failed to load Data");
            console.error(err);
        }
        finally {
            setPageLoading(false);
        }
    }

    const changeReportType = (reportTypeValue: string) => {
        if (reportType != reportTypeValue) {
            setStdSesData({ sessionId: "", studentClass: "", section: "" });
            setStudentsData(null);
        }
        setReportType(reportTypeValue);
        if (reportTypeValue === "teachers") {
            getTeachersData();
        }
    }

    const isLoading = sessionsLoading || classesLoading || sectionsLoading || pageLoading;
    if (isLoading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6 relative">
            {/* Back Button */}
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />

            {/* User Info */}
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

            {/* Header */}
            <Header title='Sapient Heights' info='View Reports Data for Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button text="Get Students Data" icon={<User />} onClick={() => changeReportType("students")} setGreen={reportType === "students"} />
                    <Button text="Get Teachers Data" icon={<Briefcase />} onClick={() => changeReportType("teachers")} setGreen={reportType === "teachers"} />
                </div>
            </div>

            {reportType === 'students' && (
                <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SelectField label="Session" name="sessionId" value={stdSesData.sessionId} onChange={handleChange} options={sessions} required />
                        <SelectField
                            label="Class"
                            name="studentClass"
                            value={stdSesData.studentClass}
                            onChange={handleChange}
                            options={classes}
                            required
                        />
                        <SelectField label="Section" name="section" value={stdSesData.section} onChange={handleChange} options={sections} required disabled={stdSesData.studentClass === ""} />
                    </div>
                    <div className="w-fit mx-auto mt-6">
                        <Button onClick={getStudentsData} icon={<Newspaper />} text="Get Student Data" setGreen={true} />
                    </div>
                </div>
            )}

            {reportType === "students" && studentsData && (
                <DataTable
                    allData={studentsData}
                    setDialog={setDialog}
                    columns={["Student Name", "Father Name", "Mother Name", "DOB"]}
                    values={["studentName", "fatherName", "motherName", "dob"]}
                    reportType={reportType}
                />
            )}

            {reportType === "teachers" && teachersData && (
                <DataTable
                    allData={teachersData}
                    setDialog={setDialog}
                    columns={["Teacher Name", "DOB", "Qualification", "Experience"]}
                    values={["teacherName", "dob", "qualification", "experience"]}
                    reportType={reportType}
                />
            )}

            {reportType === "teachers" && !teachersData && (
                <NoDataSection />
            )}

            {reportType === "students" && !studentsData && (
                <NoDataSection />
            )}


            {dialog.openDialog && dialog.selectedData && (
                <DataDialog dialog={dialog} setDialog={setDialog} reportType={reportType} />
            )}

        </div>
    )
}