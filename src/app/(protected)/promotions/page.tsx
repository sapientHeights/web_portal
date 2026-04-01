'use client';

import Button from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { Newspaper, StepBack } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SelectField from "@/components/ui/SelectField";
import { StudentAllData, StudentData } from "@/types/student";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { useSessions } from "@/hooks/useSessions";
import DataTable from "@/components/ui/DataTable";
import { TeacherData } from "@/types/teacher";
import toast from "react-hot-toast";
import PromotionDataTable from "@/components/ui/PromotionDataTable";
import FullPageLoader from "@/components/ui/FullPageLoader";


export default function Promotions() {
    const router = useRouter();
    const { user } = useUser();
    const [pageLoading, setPageLoading] = useState(false);

    const [stdSesData, setStdSesData] = useState({
        sessionId: "", studentClass: "", section: ""
    });

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();
    const { classes, isLoading: classesLoading } = useClasses();
    const { sections, isLoading: sectionsLoading } = useSections(stdSesData.studentClass);

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

    const [studentsData, setStudentsData] = useState<StudentAllData[] | null>(null);

    useEffect(() => {
        if (activeSession) {
            setStdSesData(prev => ({
                ...prev,
                sessionId: activeSession
            }));
        }
    }, [activeSession]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'sessionId') {
            setStdSesData(prev => ({ ...prev, ['studentClass']: '' }));
            setStdSesData(prev => ({ ...prev, ['section']: '' }));
        }

        if (name === 'studentClass') {
            setStdSesData(prev => ({ ...prev, ['section']: '' }));
        }

        setStdSesData(prev => ({ ...prev, [name]: value }));

        setStudentsData([]);
    };

    const goBack = () => {
        setPageLoading(true);
        router.back();
    }

    const getStudentsData = async () => {
        if(stdSesData.sessionId === "" || stdSesData.studentClass === "" || stdSesData.section === ""){
            toast.error("Please fill all the required data");
            return;
        }

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

    const handleButtonClick = () => { 
        getStudentsData();
    }

    const loading = pageLoading || sessionsLoading || classesLoading || sectionsLoading;
    if(loading){
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-100 to-blue-200 p-6 relative">
            {/* Back Button */}
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />

            {/* User Info */}
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

            {/* Header */}
            <Header title='Sapient Heights' info='Promote Students' />

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
                    <Button onClick={handleButtonClick} icon={<Newspaper />} text="Get Student Data" setGreen={true} />
                </div>
            </div>

            {studentsData && studentsData.length > 0 && (
                <PromotionDataTable
                    allData={studentsData}
                    setStudentsData={setStudentsData}
                    setDialog={setDialog}
                    columns={["Student ID", "Student Name"]}
                    values={["sId", "studentName"]}
                    reportType={"students"}
                    getStudentsData={getStudentsData}
                />
            )}
        </div>
    )
}