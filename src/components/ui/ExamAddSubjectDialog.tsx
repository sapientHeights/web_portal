'use client';

import Button from "@/components/ui/Button";
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { useSubjects } from "@/hooks/useSubjects";
import { ListPlus, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type SubjectItem = {
    subjectId: string;
    date: string;
    minMarks: string;
    maxMarks: string;
};

type ExamGroupInfo = {
    uniqueExamId: string;
    classId: string;
    name: string;
};

type Props = {
    title: string;
    examGroup: ExamGroupInfo;
    setEnableAddSubject: (val: boolean) => void;
    setPageLoading: (val: boolean) => void;
    getExamsData: () => Promise<void>;
};

export default function ExamAddSubjectDialog({
    title,
    examGroup,
    setEnableAddSubject,
    setPageLoading,
    getExamsData,
}: Props) {
    const initialItem: SubjectItem = { subjectId: "", date: "", minMarks: "", maxMarks: "" };
    const [items, setItems] = useState<SubjectItem[]>([{ ...initialItem }]);

    const { subjects, isLoading: subjectsLoading } = useSubjects(examGroup.classId);

    const handleItemChange = (index: number, field: keyof SubjectItem, value: string) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const addItem = () => {
        setItems(prev => [...prev, { ...initialItem }]);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleClose = () => setEnableAddSubject(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const invalid = items.some(
            item => !item.subjectId || !item.date || !item.minMarks || !item.maxMarks
        );
        if (invalid) {
            toast.error("Please fill all fields for each subject");
            return;
        }

        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addExamSubject.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uniqueExamId: examGroup.uniqueExamId,
                    exams: items,
                }),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Subject(s) added successfully!");
                await getExamsData();
                setEnableAddSubject(false);
            } else {
                toast.error(data.message || "Some error occurred!");
            }
        } catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        } finally {
            setPageLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-gray-800"
                >
                    <X size={20} />
                </button>

                <form onSubmit={handleSubmit}>
                    <FormSection title={`${title} — ${examGroup.name}`} icon={<ListPlus />} margin={true}>
                        {items.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl mt-4">
                                <div className="flex items-center justify-between p-2">
                                    <p className="font-semibold font-sans">Subject: {index + 1}</p>
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(index)}>
                                            <X size={16} className="text-gray-500 hover:text-red-500" />
                                        </button>
                                    )}
                                </div>
                                <hr className="text-gray-200" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                                    <SelectField
                                        label="Subject"
                                        name="subject"
                                        value={item.subjectId}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                            handleItemChange(index, "subjectId", e.target.value)
                                        }
                                        options={subjects}
                                        required
                                        disabled={subjectsLoading}
                                    />
                                    <InputField
                                        label="Date"
                                        name="date"
                                        type="date"
                                        value={item.date}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleItemChange(index, "date", e.target.value)
                                        }
                                        required
                                    />
                                    <InputField
                                        label="Min Marks"
                                        name="minMarks"
                                        value={item.minMarks}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleItemChange(index, "minMarks", e.target.value)
                                        }
                                        required
                                    />
                                    <InputField
                                        label="Max Marks"
                                        name="maxMarks"
                                        value={item.maxMarks}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleItemChange(index, "maxMarks", e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="mt-4 flex gap-3">
                            <Button type="button" text="Add More" onClick={addItem} icon={<ListPlus />} setGreen />
                            <Button type="submit" text="Save" icon={<></>} onClick={() => {}} />
                            <Button type="button" text="Cancel" onClick={handleClose} icon={<></>} />
                        </div>
                    </FormSection>
                </form>
            </div>
        </div>
    );
}