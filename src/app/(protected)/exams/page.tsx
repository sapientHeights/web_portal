'use client';

import Button from "@/components/ui/Button";
import ExamDeleteDialog from "@/components/ui/ExamDeleteDialog";
import ExamUpdateDialog from "@/components/ui/ExamUpdateDialog";
import FormFooterActions from "@/components/ui/FormFooterActions";
import FormSection from "@/components/ui/FormSection";
import FullPageLoader from "@/components/ui/FullPageLoader";
import Header from "@/components/ui/Header";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { useClasses } from "@/hooks/useClasses";
import { useSessions } from "@/hooks/useSessions";
import { useSubjects } from "@/hooks/useSubjects";
import { BadgePlus, BookOpenCheck, ChevronRight, Delete, Dices, Edit, Layers, Layers2, ListPlus, NotebookPen, Pencil, SquareSigma, StepBack } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";

type ExamItem = {
    classId: string;
    subjectId: string;
    date: string;
    minMarks: string;
    maxMarks: string;
};

type ExamData = {
    sessionId: string;
    name: string;
    desc: string;
    items: ExamItem[];
};

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
    uniqueExamId: string;
}

export default function Exams() {
    const router = useRouter();
    const { user, refreshUser } = useUser();
    const [pageLoading, setPageLoading] = useState(false);
    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();
    const { classes, isLoading: classesLoading } = useClasses();
    const [category, setCategory] = useState('add');

    const initialExamData = { sessionId: "", name: "", desc: "", items: [{ classId: "", subjectId: "", date: "", minMarks: "", maxMarks: "" }] };

    const [newExamData, setNewExamData] = useState<ExamData>(initialExamData);
    const [examsData, setExamsData] = useState<ExamDBData[]>();

    const [enableEdit, setEnableEdit] = useState(false);
    const [enableDelete, setEnableDelete] = useState(false);
    const [selectedExamData, setSelectedExamData] = useState<ExamDBData>();
    const [editExamInfo, setEditExamInfo] = useState(false);
    const [deleteAllExams, setDeleteAllExams] = useState(false);

    const { subjects, isLoading: subjectsLoading } = useSubjects(newExamData.items[newExamData.items.length - 1].classId);

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
        if (name == 'classes') {
            setNewExamData(prev => ({
                ...prev,
                subjects: []
            }));
        }

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
        else if (category === 'view' || category === 'analysis') {
            if (newExamData.sessionId === '') {
                if (showToast) {
                    toast.error("Nothing to clear!");
                }
                return;
            }
            setNewExamData(initialExamData);
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
        }
        else if (category === 'view' || category === 'analysis') {
            if (newExamData.sessionId === '') {
                toast.error("Please fill all the required data");
                return;
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
                        name: newExamData.name,
                        desc: newExamData.desc,
                        exams: newExamData.items
                    })
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

    const handleEdit = (examData: ExamDBData, editExamInfo: boolean) => {
        setEnableEdit(true);
        setEditExamInfo(editExamInfo);
        setSelectedExamData(examData);
    }

    const handleDelete = (examData: ExamDBData, deleteAllExams: boolean = false) => {
        setEnableDelete(true);
        setDeleteAllExams(deleteAllExams);
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
                    examId: examData.id
                })
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

    const addItem = () => {
        setNewExamData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    classId: "",
                    subjectId: "",
                    date: "",
                    minMarks: "",
                    maxMarks: ""
                }
            ]
        }));
    };

    const handleItemChange = (index: number, field: keyof ExamItem, value: string) => {
        const updatedItems = [...newExamData.items];
        updatedItems[index][field] = value;

        setNewExamData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const groupedExams = examsData?.reduce((acc, exam) => {
        if (!acc[exam.uniqueExamId]) {
            acc[exam.uniqueExamId] = [];
        }
        acc[exam.uniqueExamId].push(exam);
        return acc;
    }, {} as Record<string, ExamDBData[]>);

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
                    <FormSection title={category === 'add' ? `Enter Exam Details` : category === 'view' ? 'View Exams' : 'Analyze Marks'} icon={category === 'add' ? <BadgePlus /> : category === 'view' ? <BookOpenCheck /> : <SquareSigma />} margin={true}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-5">
                            <SelectField label="Session" name="sessionId" value={newExamData.sessionId} onChange={handleChange} options={sessions} required />
                            {category === 'add' && (
                                <InputField label="Exam Name" type="text" name="name" value={newExamData.name} onChange={handleChange} maxLength={80} required />
                            )}
                        </div>
                        {category === 'add' && (
                            <TextAreaField label="Exam Description" name="desc" value={newExamData.desc} onChange={handleChange} maxLength={200} />
                        )}
                        {category === 'add' && (
                            <>
                                {newExamData.items.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-xl mt-4">
                                        <p className="p-2 font-semibold font-sans">Exam: {index + 1}</p>
                                        <hr className="text-gray-200" />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                                            <SelectField label="Class" name="class" value={item.classId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "classId", e.target.value)} options={classes} required />
                                            <SelectField label="Subject" name="subject" value={item.subjectId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleItemChange(index, "subjectId", e.target.value)} options={subjects} required disabled={item.classId === ''} />
                                            <InputField label="Date" name="date" type="date" value={item.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "date", e.target.value)} required />
                                            <InputField label="Min Marks" name="minMarks" value={item.minMarks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "minMarks", e.target.value)} required />
                                            <InputField label="Max Marks" name="maxMarks" value={item.maxMarks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "maxMarks", e.target.value)} required />
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-2">
                                    <Button type="button" text="Add More" onClick={addItem} icon={<ListPlus />} setGreen />
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
                                    {groupedExams &&
                                        Object.entries(groupedExams).map(([groupId, exams], index) => {
                                            const first = exams[0];

                                            return (
                                                <Fragment key={groupId}>
                                                    {/* Group Header Row */}
                                                    <tr className="bg-gray-200 font-semibold">
                                                        <td className="px-4 py-3">{first.sessionId}</td>
                                                        <td className="px-4 py-3">-</td>
                                                        <td className="px-4 py-3">
                                                            {first.name}
                                                        </td>
                                                        <td className="px-4 py-3">{first.description}</td>
                                                        <td className="px-4 py-3">-</td>
                                                        <td className="px-4 py-3">-</td>
                                                        <td className="px-4 py-3">-</td>
                                                        <td className="px-4 py-3">-</td>
                                                        <td className="px-4 py-3">
                                                            {category === 'view' && (
                                                                <span className="flex gap-2">
                                                                    <Edit onClick={() => handleEdit(first, true)} size={16} />
                                                                    <Delete onClick={() => handleDelete(first, true)} size={16} />
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td></td>
                                                    </tr>

                                                    {/* Child Rows */}
                                                    {exams.map((exam, index) => (
                                                        <tr key={index} className="border-t hover:bg-gray-50">
                                                            <td className="px-4 py-3"></td>
                                                            <td className="px-4 py-3">{exam.classId}</td>
                                                            <td className="px-4 py-3"></td>
                                                            <td className="px-4 py-3"></td>
                                                            <td className="px-4 py-3">{exam.minMarks}</td>
                                                            <td className="px-4 py-3">{exam.maxMarks}</td>
                                                            <td className="px-4 py-3">{exam.subjectId}</td>
                                                            <td className="px-4 py-3">
                                                                {new Date(exam.date).toLocaleDateString()}
                                                            </td>

                                                            {category === 'view' && (
                                                                <td className="px-4 py-3">
                                                                    <span className="flex gap-2">
                                                                        <Edit onClick={() => handleEdit(exam, false)} size={16} />
                                                                        <Delete onClick={() => handleDelete(exam)} size={16} />
                                                                    </span>
                                                                </td>
                                                            )}

                                                            {category === 'analysis' && (
                                                                <td className="px-4 py-3">
                                                                    <ChevronRight onClick={() => handleMarksAnalysis(exam)} size={16} />
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </Fragment>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </FormSection>
                </div>
            )}

            {enableEdit && selectedExamData && (
                <ExamUpdateDialog title="Edit Exam" selectedExamData={selectedExamData} setSelectedExamData={setSelectedExamData} setEnableEdit={setEnableEdit} setPageLoading={setPageLoading} getExamsData={getExamsData} editExamInfo={editExamInfo} />
            )}

            {enableDelete && selectedExamData && (
                <ExamDeleteDialog title="Delete Exam" selectedExamData={selectedExamData} setSelectedExamData={setSelectedExamData} setEnableDelete={setEnableDelete} setPageLoading={setPageLoading} getExamsData={getExamsData} deleteAllExams={deleteAllExams} />
            )}
        </div>
    )
}