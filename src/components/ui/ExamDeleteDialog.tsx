import { DeleteIcon } from "lucide-react";
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
    uniqueExamId: string;
}

type Props = {
    title: string;
    selectedExamData: ExamDBData;
    setSelectedExamData: React.Dispatch<React.SetStateAction<ExamDBData | undefined>>
    setEnableDelete: React.Dispatch<React.SetStateAction<boolean>>;
    setPageLoading: React.Dispatch<React.SetStateAction<boolean>>;
    getExamsData: () => void;
    deleteAllExams: boolean;
}

export default function ExamDeleteDialog({ title, selectedExamData, setSelectedExamData, setEnableDelete, setPageLoading, getExamsData, deleteAllExams }: Props) {
    const handleCancel = () => {
        setEnableDelete(false);
        setSelectedExamData(undefined);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setPageLoading(true);

        const dataToSend = {
            examData: selectedExamData
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteExam.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Exam deleted!");
                getExamsData();
                setEnableDelete(false);
            }
            else {
                toast.error("Failed to delete exam data");
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
                    <FormSection title={title} icon={<DeleteIcon />} margin={false}>
                        <div className="mt-5 mb-5 text-center bg-red-600 w-fit m-auto text-white px-2 py-2 rounded-full">
                            <p className="font-sans">Do you want to delete the following Exam?</p>
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                            {deleteAllExams && (
                                <>
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputField label="Session Id" name="sessionId" value={selectedExamData.sessionId} onChange={() => { }} disabled />
                                        <InputField label="Name" name="name" value={selectedExamData.name} onChange={() => { }} disabled />
                                    </div>
                                    <InputField label="Description" name="description" value={selectedExamData.description} onChange={() => { }} disabled />
                                </>
                            )}
                            {!deleteAllExams && (
                                <>
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputField label="Session Id" name="sessionId" value={selectedExamData.sessionId} onChange={() => { }} disabled />
                                        <InputField label="Class" name="classId" value={selectedExamData.classId} onChange={() => { }} disabled />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputField label="Subject" name="subjectId" value={selectedExamData.subjectId} onChange={() => { }} disabled />
                                        <InputField type="date" label="Date" name="date" value={selectedExamData.date} onChange={() => { }} disabled />
                                    </div>
                                    <InputField label="Name" name="name" value={selectedExamData.name} onChange={() => { }} disabled />
                                    <InputField label="Description" name="description" value={selectedExamData.description} onChange={() => { }} disabled />
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputField label="Min Marks" name="minMarks" value={selectedExamData.minMarks} onChange={() => { }} disabled />
                                        <InputField label="Max Marks" name="maxMarks" value={selectedExamData.maxMarks} onChange={() => { }} disabled />
                                    </div>
                                </>
                            )}
                        </div>

                        <FormFooterActions primaryLabel="Delete" cancel={handleCancel} />
                    </FormSection>
                </form>
            </div>
        </div>
    )
}