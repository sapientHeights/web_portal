'use client';

import Button from "@/components/ui/Button";
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { EXAM_TYPE_OPTIONS, DEFAULT_MAX_MARKS } from "@/lib/examConstants";
import { ListPlus, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export type AddTypeTarget = {
    uniqueExamId: string;
    classId: string;
    subjectId: string;
    existingExamTypes: string[]; // exam types this subject already has in this term
};

type Props = {
    title: string;
    target: AddTypeTarget;
    setEnableAddType: (val: boolean) => void;
    setPageLoading: (val: boolean) => void;
    getExamsData: () => Promise<void>;
};

const initialForm = { examType: "", date: "", minMarks: "", maxMarks: "" };

export default function ExamAddTypeDialog({
    title,
    target,
    setEnableAddType,
    setPageLoading,
    getExamsData,
}: Props) {
    const [form, setForm] = useState(initialForm);

    const availableExamTypes = EXAM_TYPE_OPTIONS.filter(
        opt => !target.existingExamTypes.includes(opt)
    );

    // When exam type is picked and maxMarks hasn't been manually set yet,
    // prefill a sensible default
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === "examType" && !prev.maxMarks) {
                updated.maxMarks = DEFAULT_MAX_MARKS[value] ?? "";
            }
            return updated;
        });
    };

    const handleClose = () => setEnableAddType(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.examType || !form.date || !form.minMarks || !form.maxMarks) {
            toast.error("Please fill all fields");
            return;
        }

        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addExamSubject.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uniqueExamId: target.uniqueExamId,
                    exams: [{
                        classId: target.classId,
                        subjectId: target.subjectId,
                        examType: form.examType,
                        date: form.date,
                        minMarks: form.minMarks,
                        maxMarks: form.maxMarks,
                    }],
                }),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Exam type added!");
                await getExamsData();
                setEnableAddType(false);
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
            <div className="bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 w-full max-w-xl relative">
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-gray-800"
                >
                    <X size={20} />
                </button>

                <form onSubmit={handleSubmit}>
                    <FormSection title={`${title} — ${target.subjectId}`} icon={<ListPlus />} margin={true}>
                        {availableExamTypes.length === 0 ? (
                            <p className="text-gray-500 text-sm py-4">
                                All exam types are already added for this subject.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Exam Type"
                                    name="examType"
                                    value={form.examType}
                                    onChange={handleChange}
                                    options={availableExamTypes}
                                    required
                                />
                                <InputField
                                    label="Date"
                                    name="date"
                                    type="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                />
                                <InputField
                                    label="Min Marks"
                                    name="minMarks"
                                    value={form.minMarks}
                                    onChange={handleChange}
                                    required
                                />
                                <InputField
                                    label="Max Marks"
                                    name="maxMarks"
                                    value={form.maxMarks}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            {availableExamTypes.length > 0 && (
                                <Button type="submit" text="Save" icon={<></>} onClick={() => { }} />
                            )}
                            <Button type="button" text="Cancel" onClick={handleClose} icon={<></>} />
                        </div>
                    </FormSection>
                </form>
            </div>
        </div>
    );
}