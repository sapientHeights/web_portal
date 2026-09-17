'use client';

import Button from "@/components/ui/Button";
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import RadioGroup from "@/components/ui/RadioGroup";
import { useSubjects } from "@/hooks/useSubjects";
import { EXAM_TYPE_OPTIONS, DEFAULT_MAX_MARKS, SINGLE_MARK_SUBJECTS, SINGLE_MARK_EXAM_TYPE } from "@/lib/examConstants";
import { ListPlus, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type Component = {
    examType: string;
    date: string;
    minMarks: string;
    maxMarks: string;
};

// examFormat controls whether this subject block gets the full component
// breakdown or a single locked-down mark (GK/Art style) — per-subject, same
// as the create-exam form
type SubjectItem = {
    subjectId: string;
    examFormat: "Single" | "Multiple";
    components: Component[];
};

type ExamGroupInfo = {
    uniqueExamId: string;
    classId: string;
    name: string;
};

type Props = {
    title: string;
    examGroup: ExamGroupInfo;
    existingSubjectIds: string[];
    setEnableAddSubject: (val: boolean) => void;
    setPageLoading: (val: boolean) => void;
    getExamsData: () => Promise<void>;
};

const emptyComponent = (): Component => ({ examType: "", date: "", minMarks: "", maxMarks: "" });
const emptyItem = (): SubjectItem => ({ subjectId: "", examFormat: "Multiple", components: [emptyComponent()] });

export default function ExamAddSubjectDialog({
    title,
    examGroup,
    existingSubjectIds,
    setEnableAddSubject,
    setPageLoading,
    getExamsData,
}: Props) {
    const [items, setItems] = useState<SubjectItem[]>([emptyItem()]);

    const { subjects, isLoading: subjectsLoading } = useSubjects(examGroup.classId);

    // Subjects already saved in the DB for this term, plus subjects picked in
    // other subject blocks in this dialog — neither should be selectable again
    const usedSubjectIds = (excludingSubjectIndex?: number) => [
        ...existingSubjectIds,
        ...items
            .filter((_, i) => i !== excludingSubjectIndex)
            .map(item => item.subjectId)
            .filter(Boolean)
    ];

    // Subject pool for a given block depends on that block's own format:
    // Single -> only single-mark subjects (GK, Art, etc.)
    // Multiple -> everything except single-mark subjects
    const subjectOptionsFor = (subjectIndex: number): string[] => {
        const used = usedSubjectIds(subjectIndex);
        const format = items[subjectIndex]?.examFormat ?? "Multiple";
        const pool = format === "Single"
            ? SINGLE_MARK_SUBJECTS
            : subjects.filter(s => !SINGLE_MARK_SUBJECTS.includes(s));
        return pool.filter(s => !used.includes(s));
    };

    // How many subjects are still eligible to be added at all, ignoring what's
    // already picked in the currently-open blocks
    const remainingSubjectsCount = () => subjects.filter(s => !existingSubjectIds.includes(s)).length;

    const addSubject = () => {
        if (subjects.length > 0 && items.length >= remainingSubjectsCount()) return;
        setItems(prev => [...prev, emptyItem()]);
    };

    const removeSubject = (subjectIndex: number) => {
        setItems(prev => prev.filter((_, i) => i !== subjectIndex));
    };

    // Switching a block's format resets its subject + components, since the
    // subject pool and component rules differ between the two modes
    const handleFormatChange = (subjectIndex: number, format: string) => {
        const normalized: "Single" | "Multiple" = format === "Single" ? "Single" : "Multiple";
        setItems(prev =>
            prev.map((item, i) =>
                i === subjectIndex
                    ? { subjectId: "", examFormat: normalized, components: [emptyComponent()] }
                    : item
            )
        );
    };

    const handleSubjectChange = (subjectIndex: number, subjectId: string) => {
        setItems(prev =>
            prev.map((item, i) => {
                if (i !== subjectIndex) return item;

                if (item.examFormat === "Single") {
                    // Single-format subjects always get exactly one
                    // component, locked to SINGLE_MARK_EXAM_TYPE
                    const existing = item.components[0] ?? emptyComponent();
                    return {
                        ...item,
                        subjectId,
                        components: [{
                            ...existing,
                            examType: SINGLE_MARK_EXAM_TYPE,
                            maxMarks: existing.maxMarks || DEFAULT_MAX_MARKS[SINGLE_MARK_EXAM_TYPE] || "",
                        }]
                    };
                }

                return { ...item, subjectId };
            })
        );
    };

    const addComponent = (subjectIndex: number) => {
        const item = items[subjectIndex];
        if (item?.examFormat === "Single") return; // Single format always has exactly one component
        if (!item?.subjectId || item.components.length >= EXAM_TYPE_OPTIONS.length) return;

        setItems(prev =>
            prev.map((item, i) =>
                i === subjectIndex ? { ...item, components: [...item.components, emptyComponent()] } : item
            )
        );
    };

    const removeComponent = (subjectIndex: number, componentIndex: number) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === subjectIndex
                    ? { ...item, components: item.components.filter((_, ci) => ci !== componentIndex) }
                    : item
            )
        );
    };

    // Updating a component; when the field being changed is examType and
    // maxMarks hasn't been manually set yet, prefill a sensible default
    const handleComponentChange = (
        subjectIndex: number,
        componentIndex: number,
        field: keyof Component,
        value: string
    ) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === subjectIndex
                    ? {
                        ...item,
                        components: item.components.map((comp, ci) => {
                            if (ci !== componentIndex) return comp;
                            const updated = { ...comp, [field]: value };
                            if (field === "examType" && !comp.maxMarks) {
                                updated.maxMarks = DEFAULT_MAX_MARKS[value] ?? "";
                            }
                            return updated;
                        })
                    }
                    : item
            )
        );
    };

    const usedExamTypes = (subjectIndex: number, excludingComponentIndex?: number) =>
        items[subjectIndex]?.components
            .filter((_, ci) => ci !== excludingComponentIndex)
            .map(c => c.examType)
            .filter(Boolean) ?? [];

    const examTypeOptionsFor = (subjectIndex: number, componentIndex: number): string[] => {
        const item = items[subjectIndex];
        if (item?.examFormat === "Single") return [SINGLE_MARK_EXAM_TYPE];
        const used = usedExamTypes(subjectIndex, componentIndex);
        return EXAM_TYPE_OPTIONS.filter(opt => !used.includes(opt));
    };

    const handleClose = () => setEnableAddSubject(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const invalid = items.some(
            item =>
                !item.subjectId ||
                item.components.length === 0 ||
                item.components.some(c => !c.examType || !c.date || !c.minMarks || !c.maxMarks)
        );
        if (invalid) {
            toast.error("Please complete every subject and add at least one exam type");
            return;
        }

        // Flatten subject -> components into the flat row shape the backend expects
        const exams = items.flatMap(item =>
            item.components.map(comp => ({
                classId: examGroup.classId,
                subjectId: item.subjectId,
                examType: comp.examType,
                date: comp.date,
                minMarks: comp.minMarks,
                maxMarks: comp.maxMarks,
            }))
        );

        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addExamSubject.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uniqueExamId: examGroup.uniqueExamId,
                    exams,
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
                        {items.map((item, subjectIndex) => (
                            <div key={subjectIndex} className="border border-gray-200 rounded-xl mt-4">
                                <div className="flex items-center justify-between p-2">
                                    <div className="flex-1">
                                        <div className="mb-4">
                                            <RadioGroup
                                                label="Exam Format"
                                                name={`examFormat-${subjectIndex}`}
                                                options={["Single", "Multiple"]}
                                                value={item.examFormat}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => handleFormatChange(subjectIndex, e.target.value)}
                                                required
                                            />
                                        </div>
                                        <SelectField
                                            label={`Subject ${subjectIndex + 1}`}
                                            name="subject"
                                            value={item.subjectId}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                handleSubjectChange(subjectIndex, e.target.value)
                                            }
                                            options={subjectOptionsFor(subjectIndex)}
                                            required
                                            disabled={subjectsLoading}
                                        />
                                    </div>
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => removeSubject(subjectIndex)} className="ml-2">
                                            <X size={16} className="text-gray-500 hover:text-red-500" />
                                        </button>
                                    )}
                                </div>
                                <hr className="text-gray-200" />

                                {item.components.map((comp, componentIndex) => (
                                    <div key={componentIndex} className="border-t border-gray-100">
                                        <div className="flex items-center justify-between px-4 pt-3">
                                            <p className="text-sm font-medium text-gray-500">Exam {componentIndex + 1}</p>
                                            {item.examFormat === "Multiple" && item.components.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeComponent(subjectIndex, componentIndex)}
                                                    aria-label="Remove exam type"
                                                >
                                                    <X size={14} className="text-gray-400 hover:text-red-500" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                                            <SelectField
                                                label="Exam Type"
                                                name="examType"
                                                value={comp.examType}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                    handleComponentChange(subjectIndex, componentIndex, "examType", e.target.value)
                                                }
                                                options={examTypeOptionsFor(subjectIndex, componentIndex)}
                                                required
                                                disabled={item.examFormat === "Single" || !item.subjectId}
                                            />
                                            <InputField
                                                label="Date"
                                                name="date"
                                                type="date"
                                                value={comp.date}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleComponentChange(subjectIndex, componentIndex, "date", e.target.value)
                                                }
                                                required
                                            />
                                            <InputField
                                                label="Min Marks"
                                                name="minMarks"
                                                value={comp.minMarks}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleComponentChange(subjectIndex, componentIndex, "minMarks", e.target.value)
                                                }
                                                required
                                            />
                                            <InputField
                                                label="Max Marks"
                                                name="maxMarks"
                                                value={comp.maxMarks}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleComponentChange(subjectIndex, componentIndex, "maxMarks", e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}

                                {item.examFormat === "Multiple" && item.subjectId && item.components.length < EXAM_TYPE_OPTIONS.length && (
                                    <div className="p-4 pt-0">
                                        <Button
                                            type="button"
                                            text="Add Exam Type"
                                            onClick={() => addComponent(subjectIndex)}
                                            icon={<ListPlus size={16} />}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        {(subjects.length === 0 || items.length < remainingSubjectsCount()) && (
                            <div className="mt-4 flex gap-3">
                                <Button type="button" text="Add Subject" onClick={addSubject} icon={<ListPlus />} setGreen />
                                <Button type="submit" text="Save" icon={<></>} onClick={() => { }} />
                                <Button type="button" text="Cancel" onClick={handleClose} icon={<></>} />
                            </div>
                        )}
                        {subjects.length > 0 && items.length >= remainingSubjectsCount() && (
                            <div className="mt-4 flex gap-3">
                                <Button type="submit" text="Save" icon={<></>} onClick={() => { }} />
                                <Button type="button" text="Cancel" onClick={handleClose} icon={<></>} />
                            </div>
                        )}
                    </FormSection>
                </form>
            </div>
        </div>
    );
}