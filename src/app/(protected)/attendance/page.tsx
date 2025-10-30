'use client';

import Button from "@/components/ui/Button";
import FormFooterActions from "@/components/ui/FormFooterActions";
import FormSection from "@/components/ui/FormSection";
import FullPageLoader from "@/components/ui/FullPageLoader";
import Header from "@/components/ui/Header";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { useSessions } from "@/hooks/useSessions";
import { useSubjects } from "@/hooks/useSubjects";
import { Book, StepBack } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Attendance() {
    const router = useRouter();
    const { user } = useUser();
    const [pageLoading, setPageLoading] = useState(false);

    const initialAcademicData = {
        sessionId: "", studentClass: "", section: "", subject: "", date: new Date().toISOString().split('T')[0] 
    }

    const [academicData, setAcademicData] = useState(initialAcademicData);

    const { classes, isLoading: classesLoading } = useClasses();
    const { sections, isLoading: sectionsLoading } = useSections(academicData.studentClass);
    const { sessions, isLoading: sessionsLoading } = useSessions();
    const { subjects, isLoading: subjectsLoading } = useSubjects(academicData.studentClass);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAcademicData(prev => ({ ...prev, [name]: value }));
    };

    const goBack = () => {
        setPageLoading(true);
        router.back();
    }

    const reset = () => {
        if(JSON.stringify(academicData) === JSON.stringify(initialAcademicData)){
            toast.error("Nothing to clear!");
            return;
        }
        setAcademicData(initialAcademicData);
        toast.success("Fields cleared!");
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(JSON.stringify(academicData) === JSON.stringify(initialAcademicData)){
            toast.error("Please fill all the required data");
        }
        setPageLoading(true);
        sessionStorage.setItem('academicData', JSON.stringify(academicData));
        router.push('/attendance/editAttendance');
    }

    const isLoading = pageLoading || classesLoading || sectionsLoading || sessionsLoading || subjectsLoading;
    if (isLoading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6 relative">
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />
            <Header title='Sapient Heights' info='Manage Attendance for Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <form onSubmit={handleSubmit}>
                    <FormSection title="Enter Attendance Details" icon={<Book />} margin={false}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <SelectField label="Session" name="sessionId" value={academicData.sessionId} onChange={handleChange} options={sessions} required />
                            <SelectField
                                label="Class"
                                name="studentClass"
                                value={academicData.studentClass}
                                onChange={handleChange}
                                options={classes}
                                required
                            />
                            <SelectField label="Section" name="section" value={academicData.section} onChange={handleChange} options={sections} required disabled={academicData.studentClass === ""} />
                            <SelectField label="Subject" name="subject" value={academicData.subject} onChange={handleChange} options={subjects} required disabled={academicData.studentClass === ""} />
                            <InputField label="Date" name="date" type="date" value={academicData.date} onChange={handleChange} disabled />
                        </div>
                        <FormFooterActions primaryLabel={'Get Attendance Data'} reset={reset} />
                    </FormSection>
                </form>
            </div>
        </div>
    )
}