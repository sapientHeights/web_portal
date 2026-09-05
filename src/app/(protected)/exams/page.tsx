'use client';

import Button from "@/components/ui/Button";
import ExamAddSubjectDialog from "@/components/ui/ExamAddSubjectDialog";
import ExamAddTypeDialog, { AddTypeTarget } from "@/components/ui/ExamAddTypeDialog";
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
import { useSections } from "@/hooks/useSections";
import { ExamDBData } from "@/types/exam";
import { TERM_OPTIONS, EXAM_TYPE_OPTIONS, DEFAULT_MAX_MARKS, EXAM_TYPE_STYLES } from "@/lib/examConstants";
import { BadgePlus, BookOpenCheck, Calendar, ChevronRight, Delete, Dices, Edit, FileText, Filter, GraduationCap, Layers, Layers2, ListPlus, NotebookPen, Pencil, ScrollText, SquarePercent, SquareSigma, StepBack, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ExamMarksEntryDialog from "@/components/ui/ExamMarksEntryDialog";

type ExamComponent = {
    examType: string;
    date: string;
    minMarks: string;
    maxMarks: string;
};

// One subject block, holding its exam-type components
type ExamItem = {
    subjectId: string;
    components: ExamComponent[];
};

type ExamData = {
    sessionId: string;
    classId: string;
    term: string;
    desc: string;
    items: ExamItem[];
};

const emptyComponent = (): ExamComponent => ({ examType: "", date: "", minMarks: "", maxMarks: "" });
const emptyItem = (): ExamItem => ({ subjectId: "", components: [emptyComponent()] });

// Sentinel value for "no class filter applied" — kept as its own constant so
// the comparison stays type-safe/searchable rather than a bare magic string
const ALL_CLASSES = "All";

export default function Exams() {
    const router = useRouter();
    const { user, refreshUser } = useUser();
    const [pageLoading, setPageLoading] = useState(false);
    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();
    const { classes, isLoading: classesLoading } = useClasses();
    const [category, setCategory] = useState('add');

    const initialExamData: ExamData = {
        sessionId: "",
        classId: "",
        term: "",
        desc: "",
        items: [emptyItem()]
    };

    const [newExamData, setNewExamData] = useState<ExamData>(initialExamData);
    const [examsData, setExamsData] = useState<ExamDBData[]>();

    // Class filter applied on top of the already-loaded Exams Data list,
    // used for View Exams and Marks Analysis only. Defaults to "show all".
    const [classFilterForData, setClassFilterForData] = useState(ALL_CLASSES);

    const [enableEdit, setEnableEdit] = useState(false);
    const [enableDelete, setEnableDelete] = useState(false);
    const [enableAddSubject, setEnableAddSubject] = useState(false);
    const [enableAddType, setEnableAddType] = useState(false);
    const [addTypeTarget, setAddTypeTarget] = useState<AddTypeTarget>();
    const [selectedExamData, setSelectedExamData] = useState<ExamDBData>();
    const [editExamInfo, setEditExamInfo] = useState(false);
    const [deleteAllExams, setDeleteAllExams] = useState(false);

    const { subjects, isLoading: subjectsLoading } = useSubjects(newExamData.classId);
    const [classForReport, setClassForReport] = useState('');

    const { sections, isLoading: sectionsLoading } = useSections(newExamData.classId);
    const [sectionForMarksEntry, setSectionForMarksEntry] = useState('');
    const [subjectForMarksEntry, setSubjectForMarksEntry] = useState('');

    // Holds the full exam row (subject/type/marks/date) so the marks-entry
    // dialog has everything it needs without re-fetching
    const [selectedExamForMarksEntry, setSelectedExamForMarksEntry] = useState<ExamDBData>();
    const [showMarksEntryDialog, setShowMarksEntryDialog] = useState(false);

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

    // Reset the class filter back to "All" whenever a fresh data set is
    // loaded, so a stale selection from a previous search doesn't silently
    // hide everything
    useEffect(() => {
        setClassFilterForData(ALL_CLASSES);
    }, [examsData]);

    const handleCategoryClick = (category: string) => {
        reset(false);
        setCategory(category);
        setExamsData([]);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'classId') {
            // Class changed — subjects depend on class, so clear every subject
            // selection (and reset each subject back to a single blank component)
            setNewExamData(prev => ({
                ...prev,
                classId: value,
                items: [emptyItem()]
            }));
            return;
        }

        setNewExamData(prev => ({ ...prev, [name]: value }));
    };

    const reset = (showToast?: boolean) => {
        if (category === 'add') {
            if (JSON.stringify(newExamData) === JSON.stringify(initialExamData)) {
                if (showToast) toast.error("Nothing to clear!");
                return;
            }
            setNewExamData(initialExamData);
            setActiveSession();
        } else if (category === 'view' || category === 'analysis') {
            if (newExamData.sessionId === '') {
                if (showToast) toast.error("Nothing to clear!");
                return;
            }
            setNewExamData(initialExamData);
            setActiveSession();
        } else if (category === 'reportGen') {
            if (newExamData.sessionId === '' && classForReport === '') {
                if (showToast) toast.error("Nothing to clear!");
                return;
            }
            setNewExamData(initialExamData);
            setActiveSession();
            setClassForReport('');
        } else if (category === 'submitMarks') {
            if (newExamData.sessionId === '' && newExamData.classId === '' && sectionForMarksEntry === '' && subjectForMarksEntry === '') {
                if (showToast) toast.error("Nothing to clear!");
                return;
            }
            setNewExamData(initialExamData);
            setActiveSession();
            setSectionForMarksEntry('');
            setSubjectForMarksEntry('');
        }

        if (showToast) toast.success("Fields cleared!");
        setExamsData([]);
    };

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

    const getFilteredExamsData = async () => {
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
            const examsData = data.data;
            const filteredExams = examsData.filter((exam: ExamDBData) => exam.sessionId === newExamData.sessionId && exam.classId === newExamData.classId && exam.subjectId === subjectForMarksEntry);
            if (filteredExams.length === 0) {
                toast.error("No Exams available");
            }
            setExamsData(filteredExams);
        }
        else {
            toast.error("Some error occurred!");
        }
    }

    // Subjects already picked in other subject blocks, so the same subject
    // can't be selected twice within one term
    const usedSubjectIds = (excludingSubjectIndex?: number) =>
        newExamData.items
            .filter((_, i) => i !== excludingSubjectIndex)
            .map(item => item.subjectId)
            .filter(Boolean);

    const subjectOptionsFor = (subjectIndex: number): string[] => {
        const used = usedSubjectIds(subjectIndex);
        return subjects.filter(s => !used.includes(s));
    };

    // Subject-level helpers
    const addSubject = () => {
        if (subjects.length > 0 && newExamData.items.length >= subjects.length) return;

        setNewExamData(prev => ({
            ...prev,
            items: [...prev.items, emptyItem()]
        }));
    };

    const removeSubject = (subjectIndex: number) => {
        setNewExamData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== subjectIndex)
        }));
    };

    const handleSubjectChange = (subjectIndex: number, subjectId: string) => {
        setNewExamData(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === subjectIndex ? { ...item, subjectId } : item
            )
        }));
    };

    // Component-level (exam type) helpers, scoped to a subject
    const addComponent = (subjectIndex: number) => {
        const item = newExamData.items[subjectIndex];
        if (!item?.subjectId || item.components.length >= EXAM_TYPE_OPTIONS.length) return;

        setNewExamData(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === subjectIndex
                    ? { ...item, components: [...item.components, emptyComponent()] }
                    : item
            )
        }));
    };

    const removeComponent = (subjectIndex: number, componentIndex: number) => {
        setNewExamData(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === subjectIndex
                    ? { ...item, components: item.components.filter((_, ci) => ci !== componentIndex) }
                    : item
            )
        }));
    };

    // Updating a component; when the field being changed is examType and
    // maxMarks hasn't been manually set yet, prefill a sensible default
    const handleComponentChange = (
        subjectIndex: number,
        componentIndex: number,
        field: keyof ExamComponent,
        value: string
    ) => {
        setNewExamData(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
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
        }));
    };

    // Exam types already used within a given subject, so the dropdown for a
    // new/edited component only offers the remaining ones
    const usedExamTypes = (subjectIndex: number, excludingComponentIndex?: number) =>
        newExamData.items[subjectIndex]?.components
            .filter((_, ci) => ci !== excludingComponentIndex)
            .map(c => c.examType)
            .filter(Boolean) ?? [];

    const examTypeOptionsFor = (subjectIndex: number, componentIndex: number): string[] => {
        const used = usedExamTypes(subjectIndex, componentIndex);
        return EXAM_TYPE_OPTIONS.filter(opt => !used.includes(opt));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (category === 'add') {
            if (!newExamData.classId) {
                toast.error("Please select a class");
                return;
            }
            if (!newExamData.term) {
                toast.error("Please select a term");
                return;
            }
            const hasIncompleteSubject = newExamData.items.some(
                item => !item.subjectId || item.components.length === 0
            );
            if (hasIncompleteSubject) {
                toast.error("Please complete every subject and add at least one exam type");
                return;
            }
        }
        else if (category === 'view' || category === 'analysis') {
            if (newExamData.sessionId === '') {
                toast.error("Please fill all the required data");
                return;
            }
        }
        else if (category === 'submitMarks') {
            if (!newExamData.sessionId || !newExamData.classId || !sectionForMarksEntry || !subjectForMarksEntry) {
                toast.error("Please select session, class, section and subject");
                return;
            }
        }

        setPageLoading(true);
        try {
            if (category === 'add') {
                // Flatten subject -> components into the flat row shape the backend expects
                const exams = newExamData.items.flatMap(item =>
                    item.components.map(comp => ({
                        classId: newExamData.classId,
                        subjectId: item.subjectId,
                        examType: comp.examType,
                        date: comp.date,
                        minMarks: comp.minMarks,
                        maxMarks: comp.maxMarks,
                    }))
                );

                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createExam.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId: newExamData.sessionId,
                        name: newExamData.term,
                        desc: newExamData.desc,
                        exams
                    })
                });

                const data = await res.json();
                if (!data.error) {
                    toast.success("Exam Created successfully!");
                    reset();
                }
                else {
                    toast.error(data.message);
                }
            }
            else if (category === 'reportGen') {
                if (!newExamData.sessionId || !classForReport) {
                    toast.error("Please select a session and class");
                    setPageLoading(false);
                    return;
                }

                const res = await fetch('/api/reportCard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: newExamData.sessionId,
                        classId: classForReport,
                    }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    toast.error(err.error || "Failed to generate report cards");
                    return;
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report-cards-${classForReport}-${newExamData.sessionId}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Report cards downloaded!");
            }
            else if (category === 'submitMarks') {
                getFilteredExamsData();
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

    const handleAddSubject = (examData: ExamDBData) => {
        setSelectedExamData(examData);
        setEnableAddSubject(true);
    }

    // Opens the "add one more exam type" dialog for an existing subject within a term
    const handleAddType = (exam: ExamDBData, subjectId: string, existingExamTypes: string[]) => {
        setAddTypeTarget({
            uniqueExamId: exam.uniqueExamId,
            classId: exam.classId,
            subjectId,
            existingExamTypes
        });
        setEnableAddType(true);
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
                toast.error(data.message || "Some error occurred!");
                setPageLoading(false);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
            setPageLoading(false);
        }
    }

    const handleMarksEntry = (examData: ExamDBData) => {
        setSelectedExamForMarksEntry(examData);
        setShowMarksEntryDialog(true);
    }

    // Group first by term (uniqueExamId), then by subject, for the view table
    const groupedExams = examsData?.reduce((acc, exam) => {
        if (!acc[exam.uniqueExamId]) {
            acc[exam.uniqueExamId] = {};
        }
        if (!acc[exam.uniqueExamId][exam.subjectId]) {
            acc[exam.uniqueExamId][exam.subjectId] = [];
        }
        acc[exam.uniqueExamId][exam.subjectId].push(exam);
        return acc;
    }, {} as Record<string, Record<string, ExamDBData[]>>);

    // Distinct classes actually present in the loaded data — feeds the filter
    // chips, so they never offer a class with no matching rows
    const availableClassesForFilter = examsData
        ? Array.from(new Set(examsData.map(exam => exam.classId))).sort()
        : [];

    // Term groups, filtered down to the selected class (or everything, if "All")
    const visibleGroupedEntries = groupedExams
        ? Object.entries(groupedExams).filter(([, subjectsMap]) => {
            if (classFilterForData === ALL_CLASSES) return true;
            const first = Object.values(subjectsMap)[0][0];
            return first.classId === classFilterForData;
        })
        : [];

    const loading = pageLoading || sessionsLoading || classesLoading || subjectsLoading;
    if (loading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-100 to-blue-200 p-6 relative">
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />
            <Header title='Sapient Heights' info='Manage Exams for Sapient Heights' />

            <div className="max-w-7xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-5 sm:gap-10 gap-3">
                    <Button icon={<Pencil />} text="Create Exam" onClick={() => handleCategoryClick('add')} setGreen={category === 'add'} />
                    <Button icon={<Layers2 />} text="View Exams" onClick={() => handleCategoryClick('view')} setGreen={category === 'view'} />
                    <Button icon={<NotebookPen />} text="Submit Marks" onClick={() => handleCategoryClick('submitMarks')} setGreen={category === 'submitMarks'} />
                    <Button icon={<Dices />} text="Marks Analysis" onClick={() => handleCategoryClick('analysis')} setGreen={category === 'analysis'} />
                    {/* <Button icon={<ScrollText />} text="Report Generation" onClick={() => handleCategoryClick('reportGen')} setGreen={category === 'reportGen'} /> */}
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <form onSubmit={handleSubmit}>
                    <FormSection title={category === 'add' ? `Enter Exam Details` : category === 'view' ? 'View Exams' : category === 'analysis' ? 'Analyze Marks' : category === 'reportGen' ? 'Generate Report Cards' : 'Enter Marks'} icon={category === 'add' ? <BadgePlus /> : category === 'view' ? <BookOpenCheck /> : category === 'analysis' ? <SquareSigma /> : category === 'reportGen' ? <FileText /> : <SquarePercent />} margin={true}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-5">
                            <SelectField label="Session" name="sessionId" value={newExamData.sessionId} onChange={handleChange} options={sessions} required />
                            {(category === 'add' || category === 'submitMarks') && (
                                <SelectField label="Class" name="classId" value={newExamData.classId} onChange={handleChange} options={classes} required />
                            )}
                            {category === 'add' && (
                                <SelectField label="Term" name="term" value={newExamData.term} onChange={handleChange} options={TERM_OPTIONS} required />
                            )}
                            {category === 'reportGen' && (
                                <SelectField label="Class" name="class" value={classForReport} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClassForReport(e.target.value)} options={classes} required />
                            )}
                            {category === 'submitMarks' && (
                                <>
                                    <SelectField label="Section" name="section" value={sectionForMarksEntry} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSectionForMarksEntry(e.target.value)} options={sections} required />
                                    <SelectField label="Subject" name="subject" value={subjectForMarksEntry} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubjectForMarksEntry(e.target.value)} options={subjects} required />
                                </>
                            )}

                        </div>
                        {category === 'add' && (
                            <TextAreaField label="Term Description" name="desc" value={newExamData.desc} onChange={handleChange} maxLength={200} />
                        )}
                        {category === 'add' && (
                            <>
                                {newExamData.items.map((item, subjectIndex) => (
                                    <div key={subjectIndex} className="border border-gray-200 rounded-xl mt-4">
                                        <div className="flex items-center justify-between p-2">
                                            <div className="flex-1">
                                                <SelectField
                                                    label={`Subject ${subjectIndex + 1}`}
                                                    name="subject"
                                                    value={item.subjectId}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSubjectChange(subjectIndex, e.target.value)}
                                                    options={subjectOptionsFor(subjectIndex)}
                                                    required
                                                    disabled={newExamData.classId === ''}
                                                />
                                            </div>
                                            {newExamData.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSubject(subjectIndex)}
                                                    aria-label="Remove subject"
                                                    className="ml-2"
                                                >
                                                    <X size={16} className="text-gray-500 hover:text-red-500" />
                                                </button>
                                            )}
                                        </div>
                                        <hr className="text-gray-200" />

                                        {item.components.map((comp, componentIndex) => (
                                            <div key={componentIndex} className="border-t border-gray-100">
                                                <div className="flex items-center justify-between px-4 pt-3">
                                                    <p className="text-sm font-medium text-gray-500">
                                                        Exam {componentIndex + 1}
                                                    </p>
                                                    {item.components.length > 1 && (
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
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleComponentChange(subjectIndex, componentIndex, "examType", e.target.value)}
                                                        options={examTypeOptionsFor(subjectIndex, componentIndex)}
                                                        required
                                                        disabled={!item.subjectId}
                                                    />
                                                    <InputField label="Date" name="date" type="date" value={comp.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleComponentChange(subjectIndex, componentIndex, "date", e.target.value)} required />
                                                    <InputField label="Min Marks" name="minMarks" value={comp.minMarks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleComponentChange(subjectIndex, componentIndex, "minMarks", e.target.value)} required />
                                                    <InputField label="Max Marks" name="maxMarks" value={comp.maxMarks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleComponentChange(subjectIndex, componentIndex, "maxMarks", e.target.value)} required />
                                                </div>
                                            </div>
                                        ))}

                                        {item.subjectId && item.components.length < EXAM_TYPE_OPTIONS.length && (
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
                                {(subjects.length === 0 || newExamData.items.length < subjects.length) && (
                                    <div className="mt-2">
                                        <Button type="button" text="Add Subject" onClick={addSubject} icon={<ListPlus />} setGreen />
                                    </div>
                                )}
                            </>
                        )}

                        <FormFooterActions
                            primaryLabel={
                                category === 'add' ? 'Create'
                                    : category === 'view' ? 'View'
                                        : category === 'analysis' ? 'Analyze'
                                            : category === 'reportGen' ? 'Generate'
                                                : 'Get Exams'
                            }
                            reset={() => reset(true)}
                        />
                    </FormSection>
                </form>
            </div>

            {category != 'reportGen' && examsData && examsData.length > 0 && (
                <div className="max-w-6xl mx-auto mb-10">
                    <FormSection title="Exams Data" icon={<Layers />} margin={false}>

                        {(category === 'view' || category === 'analysis') && availableClassesForFilter.length > 1 && (
                            <div className="flex flex-wrap items-center gap-2 mb-5">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
                                    <Filter size={14} />
                                    Class
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setClassFilterForData(ALL_CLASSES)}
                                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                        classFilterForData === ALL_CLASSES
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    All
                                </button>
                                {availableClassesForFilter.map(cls => (
                                    <button
                                        key={cls}
                                        type="button"
                                        onClick={() => setClassFilterForData(cls)}
                                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                            classFilterForData === cls
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        <GraduationCap size={13} />
                                        {cls}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            {visibleGroupedEntries.map(([groupId, subjectsMap]) => {
                                    const subjectEntries = Object.entries(subjectsMap);
                                    const first = subjectEntries[0][1][0];

                                    return (
                                        <div key={groupId} className="bg-gray-50 rounded-3xl shadow-lg overflow-hidden">
                                            {/* Term header bar */}
                                            <div className="flex flex-wrap items-center justify-between gap-4 bg-linear-to-r from-indigo-100 to-blue-100 px-6 py-4">
                                                <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                                                    <div>
                                                        <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Term</p>
                                                        <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                                            <ScrollText size={15} />
                                                            {first.name}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Session</p>
                                                        <p className="font-medium text-gray-700">{first.sessionId}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Class</p>
                                                        <p className="font-medium text-gray-700 flex items-center gap-1.5">
                                                            <GraduationCap size={15} />
                                                            {first.classId}
                                                        </p>
                                                    </div>
                                                    {first.description && (
                                                        <div>
                                                            <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Description</p>
                                                            <p className="text-gray-600 italic max-w-xs truncate">{first.description}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {category === 'view' && (
                                                    <div className="flex items-center gap-3 bg-white/70 rounded-full px-3 py-1.5 shadow-sm">
                                                        <button type="button" onClick={() => handleAddSubject(first)} title="Add Subject" className="text-green-600 hover:text-green-700">
                                                            <ListPlus size={17} />
                                                        </button>
                                                        <button type="button" onClick={() => handleEdit(first, true)} title="Edit Term" className="text-gray-500 hover:text-gray-800">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button type="button" onClick={() => handleDelete(first, true)} title="Delete Term" className="text-red-500 hover:text-red-700">
                                                            <Delete size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Subject / exam-type table */}
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-sm">
                                                    <thead className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wide">
                                                        <tr>
                                                            <th className="px-6 py-2.5 text-left w-40">Subject</th>
                                                            <th className="px-4 py-2.5 text-left w-32">Exam Type</th>
                                                            <th className="px-4 py-2.5 text-left w-20">Min</th>
                                                            <th className="px-4 py-2.5 text-left w-20">Max</th>
                                                            <th className="px-4 py-2.5 text-left w-32">Date</th>
                                                            {(category === 'view' || category === 'analysis' || category === 'submitMarks') && (
                                                                <th className="px-4 py-2.5 text-right w-24">Actions</th>
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {subjectEntries.map(([subjectId, exams], subjectIdx) => (
                                                            <Fragment key={subjectId}>
                                                                {exams.map((exam, index) => (
                                                                    <tr
                                                                        key={exam.id ?? index}
                                                                        className={`border-t border-gray-100 hover:bg-blue-50/50 transition-colors ${subjectIdx % 2 === 1 ? 'bg-gray-50/60' : ''}`}
                                                                    >
                                                                        {index === 0 && (
                                                                            <td
                                                                                rowSpan={exams.length}
                                                                                className="px-6 py-3 align-top font-semibold text-gray-800 border-r border-gray-100"
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <span>{subjectId}</span>
                                                                                    {category === 'view' && exams.length < EXAM_TYPE_OPTIONS.length && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleAddType(exam, subjectId, exams.map(e => e.examType))}
                                                                                            title="Add Exam Type"
                                                                                            className="text-green-600 hover:text-green-700"
                                                                                        >
                                                                                            <ListPlus size={14} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                        )}
                                                                        <td className="px-4 py-3">
                                                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${EXAM_TYPE_STYLES[exam.examType] ?? 'bg-gray-100 text-gray-600'}`}>
                                                                                {exam.examType || '—'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-gray-600">{exam.minMarks}</td>
                                                                        <td className="px-4 py-3 text-gray-600">{exam.maxMarks}</td>
                                                                        <td className="px-4 py-3 text-gray-500 flex items-center gap-1.5">
                                                                            <Calendar size={13} className="text-gray-400" />
                                                                            {new Date(exam.date).toLocaleDateString()}
                                                                        </td>

                                                                        {category === 'view' && (
                                                                            <td className="px-4 py-3">
                                                                                <span className="flex justify-end gap-3">
                                                                                    <button type="button" onClick={() => handleEdit(exam, false)} title="Edit" className="text-gray-500 hover:text-gray-800">
                                                                                        <Edit size={15} />
                                                                                    </button>
                                                                                    <button type="button" onClick={() => handleDelete(exam)} title="Delete" className="text-red-500 hover:text-red-700">
                                                                                        <Delete size={15} />
                                                                                    </button>
                                                                                </span>
                                                                            </td>
                                                                        )}

                                                                        {(category === 'analysis' || category === 'submitMarks') && (
                                                                            <td className="px-4 py-3 text-right">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={category === 'analysis' ? () => handleMarksAnalysis(exam) : () => handleMarksEntry(exam)}
                                                                                    title={category === 'analysis' ? 'Analyze' : 'Enter Marks'}
                                                                                    className="text-gray-500 hover:text-indigo-600 inline-flex"
                                                                                >
                                                                                    <ChevronRight size={17} />
                                                                                </button>
                                                                            </td>
                                                                        )}
                                                                    </tr>
                                                                ))}
                                                            </Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
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

            {enableAddSubject && selectedExamData && (
                <ExamAddSubjectDialog
                    title="Add Subject"
                    examGroup={{
                        uniqueExamId: selectedExamData.uniqueExamId,
                        classId: selectedExamData.classId,
                        name: selectedExamData.name
                    }}
                    existingSubjectIds={
                        groupedExams?.[selectedExamData.uniqueExamId]
                            ? Object.keys(groupedExams[selectedExamData.uniqueExamId])
                            : []
                    }
                    setEnableAddSubject={setEnableAddSubject}
                    setPageLoading={setPageLoading}
                    getExamsData={getExamsData}
                />
            )}

            {enableAddType && addTypeTarget && (
                <ExamAddTypeDialog
                    title="Add Exam Type"
                    target={addTypeTarget}
                    setEnableAddType={setEnableAddType}
                    setPageLoading={setPageLoading}
                    getExamsData={getExamsData}
                />
            )}

            {showMarksEntryDialog && selectedExamForMarksEntry && (
                <ExamMarksEntryDialog
                    title="Enter Marks"
                    examData={selectedExamForMarksEntry}
                    section={sectionForMarksEntry}
                    setPageLoading={setPageLoading}
                    setShowMarksEntryDialog={setShowMarksEntryDialog}
                />
            )}
        </div>
    )
}