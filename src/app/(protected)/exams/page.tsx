'use client';

import Button from "@/components/ui/Button";
import ExamDeleteDialog from "@/components/ui/ExamDeleteDialog";
import ExamUpdateDialog from "@/components/ui/ExamUpdateDialog";
import FormFooterActions from "@/components/ui/FormFooterActions";
import FormSection from "@/components/ui/FormSection";
import FullPageLoader from "@/components/ui/FullPageLoader";
import Header from "@/components/ui/Header";
import InputField from "@/components/ui/InputField";
import MultiSelectField from "@/components/ui/MultiSelectField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { useClasses } from "@/hooks/useClasses";
import { useCommonSubjects } from "@/hooks/useCommonSubjects";
import { useSessions } from "@/hooks/useSessions";
import { BadgePlus, BookOpenCheck, ChevronRight, Delete, Dices, Edit, Layers, Layers2, Pencil, SquareSigma, StepBack } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type ExamData = {
    sessionId: string;
    classes: string[];
    subject: string;
    date: string;
    name: string;
    desc: string;
    minMarks: string;
    maxMarks: string;
    analysisClass: string;
}

type ExamDBData = {
    id: number;
    sessionId: string;
    classId: string;
    subjectId: string;
    date: string;
    name: string;
    description: string;
    minMarks: string;
    maxMarks: string;
}

type ExamAnalysisData = {
    id: string;
    sId: string;
    examId: string;
    markedBy: string;
    date: string;
    marks: string;
    att: string;
    studentName: string;
    curSessId: string;
    curClass: string;
    curSection: string;
}

export default function Exams() {
    const router = useRouter();
    const { user, refreshUser } = useUser();
    const [pageLoading, setPageLoading] = useState(false);
    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();
    const { classes, isLoading: classesLoading } = useClasses();
    const [category, setCategory] = useState('add');

    const initialExamData = {
        sessionId: "", classes: [], subject: "", date: "", name: "", desc: "", minMarks: "", maxMarks: "", analysisClass: ""
    }

    const [newExamData, setNewExamData] = useState<ExamData>(initialExamData);
    const [examsData, setExamsData] = useState<ExamDBData[]>();

    const [enableEdit, setEnableEdit] = useState(false);
    const [enableDelete, setEnableDelete] = useState(false);
    const [selectedExamData, setSelectedExamData] = useState<ExamDBData>();

    const { subjects, isLoading: subjectsLoading } = useCommonSubjects(newExamData.classes);

    const goBack = () => {
        setPageLoading(true);
        router.back();
    }

    const setActiveSession = () => {
        if (activeSession) {
            setNewExamData(prev => ({
                ...prev,
                sessionId: activeSession
            }))
        }
    }

    useEffect(() => {
        setActiveSession();
    }, [activeSession])

    const handleCategoryClick = (category: string) => {
        reset(false);
        setCategory(category);
        setExamsData([]);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewExamData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (name: string, values: string[]) => {
        setNewExamData(prev => ({
            ...prev,
            [name]: values
        }));
    };

    const reset = (showToast?: boolean) => {
        console.log(JSON.stringify(newExamData));
        if (category === 'add') {
            if ((JSON.stringify(newExamData) === JSON.stringify(initialExamData))) {
                if (showToast) {
                    toast.error("Nothing to clear!");
                }
                return;
            }
            setNewExamData(initialExamData);
            setActiveSession();
        }
        else if(category === 'view'){
            if (newExamData.sessionId === '' && newExamData.classes.length === 0) {
                if (showToast) {
                    toast.error("Nothing to clear!");
                }
                return;
            }
            setNewExamData(initialExamData);
            setActiveSession();
        }
        else{
            if (newExamData.sessionId === '' && newExamData.analysisClass === '') {
                if (showToast) {
                    toast.error("Nothing to clear!");
                }
                return;
            }
            setActiveSession();
        }
        
        if (showToast) {
            toast.success("Fields cleared!");
        }

        setExamsData([]);
    }

    const getExamsData = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/viewExams.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: newExamData.sessionId,
                classes: category === 'view' ? newExamData.classes : new Array(newExamData.analysisClass),
            }),
        });

        const data = await res.json();
        if (!data.error) {
            if (data.data.length === 0) {
                toast.error("No data available");
                return;
            }
            setExamsData(data.data);
        }
        else {
            toast.error("Some error occurred!");
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (category === 'add') {
            if (newExamData === initialExamData) {
                toast.error("Please fill all the required data");
                return;
            }

            if (newExamData.classes.length === 0) {
                toast.error("Please select a class");
                return;
            }

            if (newExamData.subject === "") {
                toast.error("Please select a subject");
                return;
            }

            if (Number(newExamData.minMarks) < 0 || Number(newExamData.maxMarks) > 100) {
                toast.error("Please enter valid exam marks");
                return;
            }

            if (new Date(newExamData.date) < new Date()) {
                toast.error("Date is invalid");
                return;
            }
        }
        else if (category === 'view') {
            if (newExamData.sessionId === '' || newExamData.classes.length === 0) {
                toast.error("Please fill all the required data");
                return;
            }
        }
        else if (category === 'analysis') {
            if (newExamData.sessionId === '' || newExamData.analysisClass === '') {
                toast.error("Please fill all the required data");
            }
        }

        setPageLoading(true);
        try {
            if (category === 'add') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createExam.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId: newExamData.sessionId,
                        classes: newExamData.classes,
                        subject: newExamData.subject,
                        name: newExamData.name,
                        desc: newExamData.desc,
                        minMarks: newExamData.minMarks,
                        maxMarks: newExamData.maxMarks,
                        date: newExamData.date
                    }),
                });

                const data = await res.json();
                if (!data.error) {
                    toast.success("Exam Created successfully!");
                    reset();
                }
                else {
                    toast.error("Some error occurred!");
                }
            }
            else {
                getExamsData();
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally {
            setPageLoading(false);
        }
    }

    const handleEdit = (examData: ExamDBData) => {
        setEnableEdit(true);
        setSelectedExamData(examData);
    }

    const handleDelete = (examData: ExamDBData) => {
        setEnableDelete(true);
        setSelectedExamData(examData);
    }

    const handleMarksAnalysis = async (examData: ExamDBData) => {
        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getSavedMarksData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    examId: examData.id,
                    sessionId: examData.sessionId,
                    classId: newExamData.analysisClass
                }),
            });

            const data = await res.json();
            if (!data.error) {
                sessionStorage.setItem('selectedExamData', JSON.stringify(examData));
                sessionStorage.setItem('examAnalysisData', JSON.stringify(data.marksData));
                router.push('/exams/marksAnalysis');
            }
            else {
                toast.error("No Data available - Some error occurred!");
                setPageLoading(false);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
            setPageLoading(false);
        }
    }

    const loading = pageLoading || sessionsLoading || classesLoading || subjectsLoading;
    if (loading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-100 to-blue-200 p-6 relative">
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />
            <Header title='Sapient Heights' info='Manage Exams for Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 sm:gap-15 gap-5">
                    <Button icon={<Pencil />} text="Create Exam" onClick={() => handleCategoryClick('add')} setGreen={category === 'add'} />
                    <Button icon={<Layers2 />} text="View Exams" onClick={() => handleCategoryClick('view')} setGreen={category === 'view'} />
                    <Button icon={<Dices />} text="Marks Analysis" onClick={() => handleCategoryClick('analysis')} setGreen={category === 'analysis'} />
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <form onSubmit={handleSubmit}>
                    <FormSection title={category === 'add' ? `Enter Exam Details` : category === 'view' ? 'View Exams' : 'Analyze Marks'} icon={category === 'add' ? <BadgePlus /> : category === 'view' ? <BookOpenCheck /> : <SquareSigma />} margin={false}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-5">
                            <SelectField label="Session" name="sessionId" value={newExamData.sessionId} onChange={handleChange} options={sessions} required />
                            {category !== 'analysis' && (
                                <MultiSelectField label="Class" name="class" value={newExamData.classes} onChange={(values) => handleMultiSelectChange("classes", values)} options={classes} required />
                            )}

                            {category === 'add' && (
                                <SelectField label="Subject" name="subject" value={newExamData.subject} onChange={handleChange} options={subjects} required disabled={newExamData.classes.length === 0} />
                            )}

                            {category === 'analysis' && (
                                <>
                                    <SelectField label="Class" name="analysisClass" value={newExamData.analysisClass} onChange={handleChange} options={classes} required disabled={newExamData.sessionId === ''} />
                                </>

                            )}
                        </div>
                        {category === 'add' && (
                            <>
                                <InputField label="Exam Name" type="text" name="name" value={newExamData.name} onChange={handleChange} maxLength={80} required />
                                <div className="mt-5">
                                    <TextAreaField label="Exam Description" name="desc" value={newExamData.desc} onChange={handleChange} maxLength={200} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-5">
                                    <InputField label="Minimum Marks" type="text" name="minMarks" value={newExamData.minMarks} onChange={handleChange} required />
                                    <InputField label="Maximum Marks" type="text" name="maxMarks" value={newExamData.maxMarks} onChange={handleChange} required />
                                    <InputField label="Date" name="date" type="date" value={newExamData.date} onChange={handleChange} required />
                                </div>
                            </>
                        )}

                        <FormFooterActions primaryLabel={category === 'add' ? 'Create' : category === 'view' ? 'View' : 'Analyze'} reset={() => reset(true)} />
                    </FormSection>
                </form>
            </div>

            {examsData && examsData.length > 0 && (
                <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                    <FormSection title="Exams Data" icon={<Layers />} margin={false}>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                                <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Session ID</th>
                                        <th className="px-4 py-3 text-left">Class</th>
                                        <th className="px-4 py-3 text-left">Exam Name</th>
                                        <th className="px-4 py-3 text-left">Description</th>
                                        <th className="px-4 py-3 text-left">Min Marks</th>
                                        <th className="px-4 py-3 text-left">Max Marks</th>
                                        <th className="px-4 py-3 text-left">Subject</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-2 py-3 text-left"></th>
                                    </tr>
                                </thead>

                                <tbody className="text-gray-600 text-sm">
                                    {examsData.map((exam, index) => (
                                        <tr
                                            key={index}
                                            className="border-t hover:bg-gray-50 transition"
                                        >
                                            <td className="px-4 py-3">{exam.sessionId}</td>
                                            <td className="px-4 py-3">{exam.classId}</td>
                                            <td className="px-4 py-3 font-medium">{exam.name}</td>
                                            <td className="px-4 py-3">{exam.description}</td>
                                            <td className="px-4 py-3">{exam.minMarks}</td>
                                            <td className="px-4 py-3">{exam.maxMarks}</td>
                                            <td className="px-4 py-3">{exam.subjectId}</td>
                                            <td className="px-4 py-3">
                                                {new Date(exam.date).toLocaleDateString()}
                                            </td>
                                            {category === 'view' && (
                                                <td className="px-4 py-3">
                                                    <span className="flex gap-2">
                                                        <Edit onClick={() => handleEdit(exam)} size={16} className="cursor-pointer hover:text-yellow-600" />
                                                        <Delete onClick={() => handleDelete(exam)} size={16} className="cursor-pointer hover:text-red-500" />
                                                    </span>
                                                </td>
                                            )}
                                            {category === 'analysis' && (
                                                <td className="px-4 py-3">
                                                    <ChevronRight onClick={() => handleMarksAnalysis(exam)} size={16} className="cursor-pointer hover:text-green-500" />
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </FormSection>
                </div>
            )}

            {enableEdit && selectedExamData && (
                <ExamUpdateDialog title="Edit Exam" selectedExamData={selectedExamData} setSelectedExamData={setSelectedExamData} setEnableEdit={setEnableEdit} setPageLoading={setPageLoading} getExamsData={getExamsData} />
            )}

            {enableDelete && selectedExamData && (
                <ExamDeleteDialog title="Delete Exam" selectedExamData={selectedExamData} setSelectedExamData={setSelectedExamData} setEnableDelete={setEnableDelete} setPageLoading={setPageLoading} getExamsData={getExamsData} />
            )}
        </div>
    )
}