import { BookOpen, Loader, UserRoundCog } from "lucide-react";
import FormFooterActions from "./FormFooterActions";
import FormSection from "./FormSection";
import InputField from "./InputField";
import SelectField from "./SelectField";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { useSessions } from "@/hooks/useSessions";
import { SetStateAction, useEffect, useState } from "react";
import { TeacherAllData } from "@/types/teacher";
import { useSubjects } from "@/hooks/useSubjects";
import toast from "react-hot-toast";

type ClassTeacherData = {
    sessionId: string;
    classId: string;
    section: string;
    subjectId: string;
    tId: string;
}

type Props = {
    setShowDialog: React.Dispatch<SetStateAction<boolean>>;
    selectedTeacher: TeacherAllData | null;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
}

const initialClassTeacherData: ClassTeacherData = {
    sessionId: '', classId: '', section: '', subjectId: '', tId: ''
}

export default function AllotTeacher({ setShowDialog, selectedTeacher, setLoading }: Props) {
    const [classTeacherData, setClassTeacherData] = useState<ClassTeacherData>(initialClassTeacherData);

    const { classes, isLoading: classesLoading } = useClasses();
    const { sections, isLoading: sectionsLoading } = useSections(classTeacherData.classId);
    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();
    const { subjects, isLoading: subjectsLoading } = useSubjects(classTeacherData.classId);

    useEffect(() => {
        if(activeSession){
            setClassTeacherData(prev => ({
                ...prev,
                sessionId: activeSession
            }))
        }
    }, [activeSession])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setClassTeacherData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const sendData = {
            classTeacherData: {
                sessionId: classTeacherData.sessionId,
                classId: classTeacherData.classId,
                section: classTeacherData.section,
                subjectId: classTeacherData.subjectId,
                tId: selectedTeacher?.tId
            }
        };
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allotTeacher.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendData),
            });

            const data = await res.json();
            if (data.error) {
                toast.error(data.message);
            }
            else {
                toast.success('Teacher has been allotted successfully');
                setShowDialog(false);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }

    const loading = classesLoading || sectionsLoading || sessionsLoading || subjectsLoading;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
                <FormSection title='Allot Class & Subject to Teacher' icon={<UserRoundCog />} margin={false} >
                    {loading && (
                        <div className="flex items-center justify-center">
                            <Loader className="animate-spin text-black text-9xl" />
                        </div>
                    )}
                    {!loading && (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6">
                                <InputField label="Enter name" name="name" value={selectedTeacher ? selectedTeacher.teacherName : ''} onChange={() => { }} disabled />
                                <SelectField label="Session" name="sessionId" value={classTeacherData.sessionId} onChange={handleChange} options={sessions} required />
                                <SelectField
                                    label="Class"
                                    name="classId"
                                    value={classTeacherData.classId}
                                    onChange={handleChange}
                                    options={classes}
                                    required
                                />
                                <SelectField label="Section" name="section" value={classTeacherData.section} onChange={handleChange} options={sections} required disabled={classTeacherData.classId === ''} />
                                <SelectField label="Subject" name="subjectId" value={classTeacherData.subjectId} onChange={handleChange} options={subjects} required disabled={classTeacherData.classId === ''} />
                            </div>
                            <FormFooterActions primaryLabel='Allot' cancel={() => setShowDialog(false)} />
                        </form>
                    )}
                </FormSection>
            </div>
        </div>
    )
}