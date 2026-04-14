'use client';

import Button from "@/components/ui/Button";
import FullPageLoader from "@/components/ui/FullPageLoader";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { Download, StepBack, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

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
}

export default function MarksAnalysis() {
    const router = useRouter();
    const { user } = useUser();

    const [examAnalysisData, setExamAnalysisData] = useState<ExamAnalysisData[] | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedExamData, setSelectedExamData] = useState<ExamDBData | null>(null);

    const [loading, setLoading] = useState(false);

    const jsonData = sessionStorage.getItem('examAnalysisData');
    const analysisData = jsonData ? JSON.parse(jsonData) : null;

    const examJsonData = sessionStorage.getItem('selectedExamData');
    const examData = examJsonData ? JSON.parse(examJsonData) : null;

    useEffect(() => {
        if (!jsonData || analysisData === null) {
            toast.error("Some error occurred");
            router.push('/dashboard');
            return;
        }

        if (!examJsonData || examData === null) {
            toast.error("Some error occurred");
            router.push('/dashboard');
            return;
        }

        setExamAnalysisData(analysisData);
        setSelectedExamData(examData);
    }, []);

    const goBack = () => router.back();

    // ===== ANALYSIS =====
    const totalStudents = examAnalysisData?.length || 0;

    const summary = examAnalysisData?.reduce(
        (acc, student) => {
            if (student.att === 'A') {
                acc.leave++;
                return acc;
            }

            const marks = Number(student.marks);
            if (isNaN(marks)) return acc;

            if (marks >= 35) acc.pass++;
            else acc.fail++;

            if (marks >= 90) acc.above90++;
            else if (marks >= 70) acc.between70_90++;
            else if (marks >= 50) acc.between50_70++;
            else if (marks >= 30) acc.between30_50++;
            else acc.below30++;

            return acc;
        },
        {
            pass: 0,
            fail: 0,
            leave: 0,
            above90: 0,
            between70_90: 0,
            between50_70: 0,
            between30_50: 0,
            below30: 0,
        }
    );

    // ===== FILTER =====
    const getCategoryStudents = () => {
        if (!examAnalysisData || !selectedCategory) return [];

        if (selectedCategory === 'all') return examAnalysisData;

        return examAnalysisData.filter((student) => {
            if (student.att === 'A') return selectedCategory === 'leave';

            const marks = Number(student.marks);
            if (isNaN(marks)) return false;

            switch (selectedCategory) {
                case 'above90': return marks >= 90;
                case 'between70_90': return marks >= 70 && marks < 90;
                case 'between50_70': return marks >= 50 && marks < 70;
                case 'between30_50': return marks >= 30 && marks < 50;
                case 'below30': return marks < 30;
                default: return false;
            }
        });
    };

    const filteredStudents = getCategoryStudents();

    // ===== PIE =====
    const pieData = [
        { name: 'Pass', value: summary?.pass || 0 },
        { name: 'Fail', value: summary?.fail || 0 },
        { name: 'Leave', value: summary?.leave || 0 },
    ];

    const COLORS = ['#22c55e', '#ef4444', '#facc15'];

    const getCategoryTitle = () => {
        switch (selectedCategory) {
            case 'above90': return 'Above 90%';
            case 'between70_90': return '70% - 90%';
            case 'between50_70': return '50% - 70%';
            case 'between30_50': return '30% - 50%';
            case 'below30': return 'Below 30%';
            case 'all': return 'All Students';
            default: return '';
        }
    };

    const handleExport = async () => {
        if (!filteredStudents || filteredStudents.length === 0) {
            toast.error("No data to export");
            return;
        }
        setLoading(true);

        const columns = [
            { header: "Student ID", key: "sId" },
            { header: "Student Name", key: "studentName" },
            { header: "Marks", key: "marks" },
            { header: "Status", key: "att" }
        ]

        try {
            const res = await fetch("/api/genricExcelExport", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: filteredStudents, columns }),
            });

            if (!res.ok) {
                toast.error("Failed to download Excel");
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            const finalName = `MarksAnalysisData ${selectedExamData?.name} ${selectedExamData?.sessionId} ${selectedExamData?.subjectId} ${selectedCategory}`;

            a.download = (finalName + '.xlsx');
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while exporting Excel");
        }
        finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-100 to-blue-200 p-6">
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-3xl shadow-xl mt-10 p-6 md:p-10 mb-10">

                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Exam Analysis Dashboard
                </h2>

                <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl mt-6 p-6 md:p-10 mb-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {selectedExamData?.name || "Exam Name"}
                            </h2>
                            <p className="text-gray-500 mt-1">
                                {selectedExamData?.description || "No description available"}
                            </p>
                        </div>

                        <div className="mt-4 md:mt-0 text-sm text-gray-600">
                            📅 {selectedExamData?.date || "--"}
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InfoCard label="Class" value={selectedExamData?.classId || "--"} />
                        <InfoCard label="Subject" value={selectedExamData?.subjectId || "--"} />
                        <InfoCard label="Min Marks" value={selectedExamData?.minMarks || "--"} />
                        <InfoCard label="Max Marks" value={selectedExamData?.maxMarks || "--"} />

                    </div>

                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card title="Total Students" value={totalStudents} color="bg-blue-500" />
                    <Card title="Passed" value={summary?.pass} color="bg-green-500" />
                    <Card title="Failed" value={summary?.fail} color="bg-red-500" />
                    <Card title="On Leave" value={summary?.leave} color="bg-yellow-500" />
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="font-semibold mb-4">Result Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" outerRadius={90} label>
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="font-semibold mb-4">Performance Distribution</h3>

                        <Progress label="Above 90%" value={summary?.above90} total={totalStudents} color="bg-green-600" />
                        <Progress label="70% - 90%" value={summary?.between70_90} total={totalStudents} color="bg-blue-500" />
                        <Progress label="50% - 70%" value={summary?.between50_70} total={totalStudents} color="bg-yellow-500" />
                        <Progress label="30% - 50%" value={summary?.between30_50} total={totalStudents} color="bg-orange-500" />
                        <Progress label="Below 30%" value={summary?.below30} total={totalStudents} color="bg-red-500" />
                    </div>
                </div>

                {/* Category Table */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-4">Category</th>
                                <th className="p-4">Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Row label="Above 90%" value={summary?.above90} onClick={() => setSelectedCategory('above90')} />
                            <Row label="70% - 90%" value={summary?.between70_90} onClick={() => setSelectedCategory('between70_90')} />
                            <Row label="50% - 70%" value={summary?.between50_70} onClick={() => setSelectedCategory('between50_70')} />
                            <Row label="30% - 50%" value={summary?.between30_50} onClick={() => setSelectedCategory('between30_50')} />
                            <Row label="Below 30%" value={summary?.below30} onClick={() => setSelectedCategory('below30')} />

                            {/* NEW ROW */}
                            <Row label="All Students" value={totalStudents} onClick={() => setSelectedCategory('all')} />
                        </tbody>
                    </table>
                </div>

            </div>

            {/* MODAL */}
            {selectedCategory && filteredStudents.length > 0 && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white w-[95%] max-w-4xl rounded-2xl shadow-lg p-6 relative">

                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 cursor-pointer"
                        >
                            <X />
                        </button>

                        <h3 className="text-lg font-semibold mb-4">
                            {getCategoryTitle()} ({filteredStudents.length})
                        </h3>

                        <div className="overflow-auto max-h-[70vh]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Student ID</th>
                                        <th className="p-3">Marks</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((s) => (
                                        <tr key={s.id} className="border-t">
                                            <td className="p-3">{s.studentName}</td>
                                            <td className="p-3">{s.sId}</td>
                                            <td className="p-3">{s.att === 'A' ? '-' : s.marks}</td>
                                            <td className="p-3">
                                                {s.att === 'A'
                                                    ? 'Leave'
                                                    : Number(s.marks) >= Number(selectedExamData?.minMarks)
                                                        ? 'Pass'
                                                        : 'Fail'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6">
                            <Button type="button" icon={<Download />} onClick={handleExport} text="Export to Excel" setGreen />
                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}

// UI Components

type CardProps = {
  title: string;
  value: number | undefined;
  color: string;
};

function Card({ title, value, color }: CardProps) {
  return (
    <div className={`${color} text-white p-4 rounded-2xl shadow`}>
      <p className="text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

type ProgressProps = {
  label: string;
  value?: number;
  total?: number;
  color: string;
};

function Progress({ label, value = 0, total = 1, color }: ProgressProps) {
  const percent = total ? (value / total) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type RowProps = {
  label: string;
  value: number | undefined;
  onClick?: () => void;
};

function Row({ label, value, onClick }: RowProps) {
  return (
    <tr
      onClick={onClick}
      className="border-t cursor-pointer hover:bg-blue-50 transition"
    >
      <td className="p-4 font-medium">{label}</td>
      <td className="p-4">{value}</td>
    </tr>
  );
}

type InfoCardProps = {
  label: string;
  value: string | number;
};

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}