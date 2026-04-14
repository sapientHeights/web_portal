'use client';

import { Settings2 } from "lucide-react";
import FormSection from "./FormSection";
import InputField from "./InputField";
import FormFooterActions from "./FormFooterActions";
import toast from "react-hot-toast";

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

type Props = {
    title: string;
    selectedExamData: ExamDBData;
    setSelectedExamData: React.Dispatch<React.SetStateAction<ExamDBData | undefined>>
    setEnableEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setPageLoading: React.Dispatch<React.SetStateAction<boolean>>;
    getExamsData: () => void;
}

export default function ExamUpdateDialog({ title, selectedExamData, setSelectedExamData, setEnableEdit, setPageLoading, getExamsData }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setSelectedExamData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [name]: value
            };
        });
    };

    const handleCancel = () => {
        setEnableEdit(false);
        setSelectedExamData(undefined);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (Number(selectedExamData.minMarks) < 0 || Number(selectedExamData.maxMarks) > 100) {
            toast.error("Please enter valid exam marks");
            return;
        }

        setPageLoading(true);

        const dataToSend = {
            examData: selectedExamData
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateExam.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Exam Updated!");
                getExamsData();
                setEnableEdit(false);
            }
            else {
                toast.error("Failed to update exam data");
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl">
                <form onSubmit={handleSubmit}>
                    <FormSection title={title} icon={<Settings2 />} margin={false}>
                        <div className="grid grid-cols-1 gap-5">
                            <div className="grid grid-cols-2 gap-5">
                                <InputField label="Session Id" name="sessionId" value={selectedExamData.sessionId} onChange={() => { }} disabled />
                                <InputField label="Class" name="classId" value={selectedExamData.classId} onChange={() => { }} disabled />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <InputField label="Subject" name="subjectId" value={selectedExamData.subjectId} onChange={() => {}} disabled />
                                <InputField type="date" label="Date" name="date" value={selectedExamData.date} onChange={() => { }} disabled />
                            </div>
                            <InputField label="Name" name="name" value={selectedExamData.name} onChange={handleChange} maxLength={80} required />
                            <InputField label="Description" name="description" value={selectedExamData.description} onChange={handleChange} maxLength={200} />
                            <div className="grid grid-cols-2 gap-5">
                                <InputField label="Min Marks" name="minMarks" value={selectedExamData.minMarks} onChange={handleChange} required />
                                <InputField label="Max Marks" name="maxMarks" value={selectedExamData.maxMarks} onChange={handleChange} required />
                            </div>
                        </div>

                        <FormFooterActions primaryLabel="Update" cancel={handleCancel} />
                    </FormSection>
                </form>
            </div>
        </div>
    )
}