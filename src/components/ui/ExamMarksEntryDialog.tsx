'use client';

import Button from "@/components/ui/Button";
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { useUser } from "@/context/UserContext";
import { ExamDBData } from "@/types/exam";
import { ATTENDANCE_OPTIONS, ATTENDANCE_CODE, ATTENDANCE_LABEL, EXAM_TYPE_STYLES } from "@/lib/examConstants";
import { ListPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
    title: string;
    examData: ExamDBData;
    section: string;
    setPageLoading: (val: boolean) => void;
    setShowMarksEntryDialog: (val: boolean) => void;
};

type ExamMarksData = {
    id: string;
    sId: string;
    examId: string;
    markedBy: string;
    date: string;
    marks: string;
    att: string; // canonical code: "P" | "A" | "L" | ""
    studentName: string;
    curSessId: string;
    curClass: string;
    curSection: string;
};

export default function ExamMarksEntryDialog({
    title,
    examData,
    section,
    setPageLoading,
    setShowMarksEntryDialog
}: Props) {
    const { user } = useUser();
    const [examMarksData, setExamMarksData] = useState<ExamMarksData[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const minMarks = Number(examData.minMarks);
    const maxMarks = Number(examData.maxMarks);

    useEffect(() => {
        const getSavedMarksData = async () => {
            setLoading(true);

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/getStdMarksData.php`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            examId: examData.id,
                            sessionId: examData.sessionId,
                            classId: examData.classId,
                            section
                        })
                    }
                );

                const data = await res.json();

                if (data.error) {
                    toast.error(data.message || "Unable to load students");
                    setExamMarksData([]);
                    return;
                }
                
                setExamMarksData(data.marksDataFound ? data.marksData : data.stdData ?? []);
            } catch (err) {
                console.error(err);
                toast.error("Some error occurred!");
                setExamMarksData([]);
            } finally {
                setLoading(false);
            }
        };

        getSavedMarksData();
    }, [examData.id, examData.sessionId, examData.classId, section]);

    const handleMarksChange = (studentId: string, value: string) => {
        console.log(studentId, " ", value);
        if(Number(value) > Number(examData.maxMarks)){
            toast.error("Marks cannot be greater than the maximum marks");
            return;
        }

        setExamMarksData(prev =>
            prev
                ? prev.map(student =>
                    student.sId === studentId
                        ? { ...student, marks: value }
                        : student
                )
                : prev
        );

        handleAttendanceChange(studentId, "Present");
        console.log(examMarksData)
    };

    const handleAttendanceChange = (studentId: string, label: string) => {
        const code = ATTENDANCE_CODE[label] ?? label;
        setExamMarksData(prev =>
            prev
                ? prev.map(student =>
                    student.sId === studentId
                        ? { ...student, att: code }
                        : student
                )
                : prev
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!examMarksData || examMarksData.length === 0) {
            toast.error("No student data available");
            return;
        }

        // Validate every row: marks present, numeric, within the exam's min/max range, attendance selected
        for (const student of examMarksData) {
            if (student.marks === '' || student.marks === null || student.marks === undefined) {
                student.marks = "0";
                student.att = 'A';
            }

            const marksNum = Number(student.marks);
            if (Number.isNaN(marksNum)) {
                toast.error(`Invalid marks for ${student.studentName}`);
                return;
            }

            if (marksNum < minMarks || marksNum > maxMarks) {
                toast.error(`Marks for ${student.studentName} must be between ${minMarks} and ${maxMarks}`);
                return;
            }

            if (!student.att) {
                toast.error(`Please select attendance for ${student.studentName}`);
                return;
            }
        }

        const payload = examMarksData?.map(student => ({
            sId: student.sId,
            examId: examData.id,
            markedBy: user?.name ?? '',
            date: examData.date,
            marks: student.marks,
            att: student.att,
        }));

        setSaving(true);
        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/saveStdMarksData.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stdExamMarksData: payload }),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Marks saved successfully!");
                setShowMarksEntryDialog(false);
            } else {
                toast.error(data.message || "Failed to save marks");
            }
        } catch (err) {
            console.error(err);
            toast.error("Some error occurred");
        } finally {
            setSaving(false);
            setPageLoading(false);
        }
    };

    const handleClose = () => {
        setShowMarksEntryDialog(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 w-full max-w-3xl relative max-h-[90vh]">

                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-gray-800"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <form onSubmit={handleSubmit}>
                    <FormSection title={title} icon={<ListPlus />} margin={false}>

                        {/* Exam info header */}
                        <div className="mb-6 rounded-2xl bg-linear-to-r from-indigo-50 to-blue-50 px-5 py-4">
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                                <div>
                                    <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Term</p>
                                    <p className="font-bold text-gray-800">{examData.name}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Subject</p>
                                    <p className="font-medium text-gray-700">{examData.subjectId}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Exam Type</p>
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${EXAM_TYPE_STYLES[examData.examType] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {examData.examType}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Class / Section</p>
                                    <p className="font-medium text-gray-700">
                                        {examData.classId}{section ? ` - ${section}` : ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Date</p>
                                    <p className="font-medium text-gray-700">
                                        {new Date(examData.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Marks Range</p>
                                    <p className="font-medium text-gray-700">{examData.minMarks} – {examData.maxMarks}</p>
                                </div>
                                {examData.description && (
                                    <div>
                                        <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Description</p>
                                        <p className="text-gray-600 italic max-w-xs truncate">{examData.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-10 text-center">
                                <p className="text-gray-500 text-sm">Loading students...</p>
                            </div>
                        ) : examMarksData === null ? (
                            <div className="py-10 text-center">
                                <p className="text-gray-500 text-sm">Loading students...</p>
                            </div>
                        ) : examMarksData.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-gray-500 text-sm">No students found for this exam.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[40vh] overflow-y-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wide">
                                        <tr>
                                            <th className="px-6 py-2.5 text-left w-20">S.No.</th>
                                            <th className="px-4 py-2.5 text-left">Student Name</th>
                                            <th className="px-4 py-2.5 text-left w-40">
                                                Marks <span className="normal-case text-gray-400">(max {maxMarks})</span>
                                            </th>
                                            <th className="px-4 py-2.5 text-left w-32">Attendance</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {examMarksData.map((student, index) => (
                                            <tr
                                                key={student.sId || student.id || index}
                                                className="border-t border-gray-100 hover:bg-blue-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-3 text-gray-600">{index + 1}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{student.studentName}</td>
                                                <td className="px-4 py-3">
                                                    <InputField
                                                        label=""
                                                        name={`marks-${student.sId}`}
                                                        type="number"
                                                        value={student.marks ?? ''}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                            handleMarksChange(student.sId, e.target.value)
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <SelectField
                                                        label=""
                                                        name={`att-${student.sId}`}
                                                        value={ATTENDANCE_LABEL[student.att] ?? ''}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                            handleAttendanceChange(student.sId, e.target.value)
                                                        }
                                                        options={ATTENDANCE_OPTIONS}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                text="Cancel"
                                onClick={handleClose}
                                icon={<X size={16} />}
                            />

                            {examMarksData && examMarksData.length > 0 && (
                                <Button
                                    type="submit"
                                    text={saving ? "Saving..." : "Save Marks"}
                                    icon={<ListPlus size={16} />}
                                    onClick={() => {}}
                                    setGreen
                                />
                            )}
                        </div>
                    </FormSection>
                </form>
            </div>
        </div>
    );
}