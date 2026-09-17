import { CirclePlus, ListPlus, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import FormSection from "./FormSection";
import { StudentAllData } from "@/types/student";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import InputField from "./InputField";
import Button from "./Button";

type Props = {
    title: string;
    sessionId: string;
    classId: string;
    section: string;
    setShowStdExtraDataDialog: (val: boolean) => void;
    subjects: string[];
};

type StudentExtraData = {
    height: string;
    weight: string;
    workEducation: string;
    attendance: string;
    discipline: string;
    thinkingSkill: string;
    remark: string;
};

export default function StdExtraDataDialog({
    title,
    sessionId,
    classId,
    section,
    setShowStdExtraDataDialog,
    subjects
}: Props) {
    const [studentsData, setStudentsData] = useState<StudentAllData[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [extraData, setExtraData] = useState<
        Record<string, StudentExtraData>
    >({});

    // Currently selected/expanded student
    const [expandedStudent, setExpandedStudent] = useState<string | null>(
        null
    );

    const fetchStudents = async () => {
        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/getStudentsByClassData.php`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        session: sessionId,
                        class: classId,
                        section: section
                    })
                }
            );

            const data = await res.json();

            if (data.error) {
                toast.error(
                    data.message || "Failed to fetch students data"
                );
                return;
            }

            setStudentsData(data.studentsData);

            // Automatically open first student
            if (data.studentsData?.length > 0) {
                setExpandedStudent(data.studentsData[0].sId);
            }
        } catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleClose = () => {
        setShowStdExtraDataDialog(false);
    };

    const handleChange = (
        sId: string,
        field: keyof StudentExtraData,
        value: string
    ) => {
        setExtraData((prev) => ({
            ...prev,
            [sId]: {
                ...prev[sId],
                [field]: value
            }
        }));
    };

    const handlePrevious = () => {
        if (!expandedStudent) return;

        const currentIndex = studentsData.findIndex(
            (student) => student.sId === expandedStudent
        );

        if (currentIndex > 0) {
            setExpandedStudent(
                studentsData[currentIndex - 1].sId
            );
        }
    };

    const handleNext = () => {
        if (!expandedStudent) return;

        const currentIndex = studentsData.findIndex(
            (student) => student.sId === expandedStudent
        );

        if (
            currentIndex !== -1 &&
            currentIndex < studentsData.length - 1
        ) {
            setExpandedStudent(
                studentsData[currentIndex + 1].sId
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setSaving(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/getTermSheetData.php`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        sessionId: sessionId,
                        classId: classId,
                        section: section
                    })
                }
            );

            const data = await res.json();

            if (data.error) {
                toast.error(
                    "Failed to get the term sheet data!"
                );
                return;
            }

            const sheetRes = await fetch(
                "/api/exportTermSheet",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        data: data.termSheetData,
                        subjects: subjects,
                        extraData: extraData
                    })
                }
            );

            if (!sheetRes.ok) {
                toast.error("Failed to download Excel");
                return;
            }

            const blob = await sheetRes.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;

            const finalName = `TermSheet_${sessionId}_Class_${classId}`;

            a.download = `${finalName}.xlsx`;
            a.click();

            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            toast.error("Some error occurred!");
        } finally {
            setSaving(false);
        }
    };

    const currentStudentIndex = expandedStudent
        ? studentsData.findIndex(
              (student) => student.sId === expandedStudent
          )
        : -1;

    const currentStudent =
        currentStudentIndex >= 0
            ? studentsData[currentStudentIndex]
            : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-5xl max-h-[95vh] flex flex-col">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col min-h-0"
                >
                    <FormSection
                        title={title}
                        icon={<CirclePlus />}
                        margin={false}
                    >
                        {/* Loading */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />

                                    <p className="text-gray-500 font-medium">
                                        Loading students...
                                    </p>
                                </div>
                            </div>
                        ) : studentsData.length === 0 ? (
                            /* No students */
                            <div className="flex items-center justify-center py-20">
                                <p className="text-gray-500 font-medium">
                                    No students found.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-col min-h-0">
                                {/* Student selector */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Student
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {currentStudent?.studentName}
                                        </p>
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {currentStudentIndex + 1} of{" "}
                                        {studentsData.length}
                                    </div>
                                </div>

                                {/* Student Cards */}
                                <div className="w-full max-h-[500px] overflow-y-auto pr-1">
                                    <div className="space-y-3">
                                        {studentsData.map(
                                            (student, index) => {
                                                const isExpanded =
                                                    expandedStudent ===
                                                    student.sId;

                                                return (
                                                    <div
                                                        key={
                                                            student.sId
                                                        }
                                                        className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                                                    >
                                                        {/* Student Header */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedStudent(
                                                                    isExpanded
                                                                        ? null
                                                                        : student.sId
                                                                )
                                                            }
                                                            className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
                                                                isExpanded
                                                                    ? "bg-purple-50"
                                                                    : "bg-gray-50 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold ${
                                                                        isExpanded
                                                                            ? "bg-purple-600 text-white"
                                                                            : "bg-purple-100 text-purple-700"
                                                                    }`}
                                                                >
                                                                    {index +
                                                                        1}
                                                                </div>

                                                                <div className="text-left">
                                                                    <p className="font-semibold text-gray-800">
                                                                        {
                                                                            student.studentName
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-gray-500">
                                                                        Student
                                                                        ID:{" "}
                                                                        {
                                                                            student.sId
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {isExpanded ? (
                                                                <ChevronUp
                                                                    size={
                                                                        20
                                                                    }
                                                                    className="text-purple-600"
                                                                />
                                                            ) : (
                                                                <ChevronDown
                                                                    size={
                                                                        20
                                                                    }
                                                                    className="text-gray-500"
                                                                />
                                                            )}
                                                        </button>

                                                        {/* Fields */}
                                                        {isExpanded && (
                                                            <div className="p-5 border-t border-gray-200">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                                                    {/* Height */}
                                                                    <InputField
                                                                        label="Height (ft)"
                                                                        name={`height-${student.sId}`}
                                                                        value={
                                                                            extraData[
                                                                                student
                                                                                    .sId
                                                                            ]
                                                                                ?.height ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e: React.ChangeEvent<HTMLInputElement>
                                                                        ) =>
                                                                            handleChange(
                                                                                student.sId,
                                                                                "height",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />

                                                                    {/* Weight */}
                                                                    <InputField
                                                                        label="Weight (Kg)"
                                                                        name={`weight-${student.sId}`}
                                                                        value={
                                                                            extraData[
                                                                                student
                                                                                    .sId
                                                                            ]
                                                                                ?.weight ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e: React.ChangeEvent<HTMLInputElement>
                                                                        ) =>
                                                                            handleChange(
                                                                                student.sId,
                                                                                "weight",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />

                                                                    {/* Work Education */}
                                                                    <InputField
                                                                        label="Work Education"
                                                                        name={`workEducation-${student.sId}`}
                                                                        value={
                                                                            extraData[
                                                                                student
                                                                                    .sId
                                                                            ]
                                                                                ?.workEducation ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e: React.ChangeEvent<HTMLInputElement>
                                                                        ) =>
                                                                            handleChange(
                                                                                student.sId,
                                                                                "workEducation",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />

                                                                    {/* Attendance */}
                                                                    <InputField
                                                                        label="Attendance"
                                                                        name={`attendance-${student.sId}`}
                                                                        value={
                                                                            extraData[
                                                                                student
                                                                                    .sId
                                                                            ]
                                                                                ?.attendance ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e: React.ChangeEvent<HTMLInputElement>
                                                                        ) =>
                                                                            handleChange(
                                                                                student.sId,
                                                                                "attendance",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />

                                                                    {/* Discipline */}
                                                                    <InputField
                                                                        label="Discipline"
                                                                        name={`discipline-${student.sId}`}
                                                                        value={
                                                                            extraData[
                                                                                student
                                                                                    .sId
                                                                            ]
                                                                                ?.discipline ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e: React.ChangeEvent<HTMLInputElement>
                                                                        ) =>
                                                                            handleChange(
                                                                                student.sId,
                                                                                "discipline",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />

                                                                    {/* Thinking Skill */}
                                                                    <InputField
                                                                        label="Thinking Skill"
                                                                        name={`thinkingSkill-${student.sId}`}
                                                                        value={
                                                                            extraData[
                                                                                student
                                                                                    .sId
                                                                            ]
                                                                                ?.thinkingSkill ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e: React.ChangeEvent<HTMLInputElement>
                                                                        ) =>
                                                                            handleChange(
                                                                                student.sId,
                                                                                "thinkingSkill",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />

                                                                    {/* Remark */}
                                                                    <div className="sm:col-span-2 lg:col-span-3">
                                                                        <InputField
                                                                            label="Remark"
                                                                            name={`remark-${student.sId}`}
                                                                            value={
                                                                                extraData[
                                                                                    student
                                                                                        .sId
                                                                                ]
                                                                                    ?.remark ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e: React.ChangeEvent<HTMLInputElement>
                                                                            ) =>
                                                                                handleChange(
                                                                                    student.sId,
                                                                                    "remark",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Navigation */}
                                                                <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-200">
                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            handlePrevious
                                                                        }
                                                                        disabled={
                                                                            currentStudentIndex <=
                                                                            0
                                                                        }
                                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                                    >
                                                                        <ChevronLeft
                                                                            size={
                                                                                17
                                                                            }
                                                                        />
                                                                        Previous
                                                                    </button>

                                                                    <span className="text-sm text-gray-500">
                                                                        {currentStudentIndex +
                                                                            1}{" "}
                                                                        /{" "}
                                                                        {
                                                                            studentsData.length
                                                                        }
                                                                    </span>

                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            handleNext
                                                                        }
                                                                        disabled={
                                                                            currentStudentIndex ===
                                                                                -1 ||
                                                                            currentStudentIndex >=
                                                                                studentsData.length -
                                                                                    1
                                                                        }
                                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                                    >
                                                                        Next
                                                                        <ChevronRight
                                                                            size={
                                                                                17
                                                                            }
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                text="Cancel"
                                onClick={handleClose}
                                icon={<X size={16} />}
                            />

                            {studentsData.length > 0 && (
                                <Button
                                    type="submit"
                                    text={
                                        saving
                                            ? "Generating..."
                                            : "Generate Term Sheet"
                                    }
                                    icon={
                                        <ListPlus size={16} />
                                    }
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
