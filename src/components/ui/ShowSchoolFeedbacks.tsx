import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormSection from "./FormSection";
import { Glasses, Loader, NotepadText } from "lucide-react";
import InputField from "./InputField";
import Button from "./Button";

type Props = {
    sessionId: string;
}

type FeedbackData = {
    sessionId: string;
    sId: string;
    date: string;
    category: string;
    details: string;
    studentName: string;
}

export default function ShowSchoolFeedbacks({ sessionId }: Props) {
    const [noData, setNoData] = useState(false);
    const [feedbacksData, setFeedbacksData] = useState<FeedbackData[]>([]);
    const [filteredFeedbacksData, setFilteredFeedbacksData] = useState<FeedbackData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchObs = async () => {
        try {
            const res = await fetch(`${backendUrl}/getSchoolFeedbacksByClass.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId
                })
            });

            const data = await res.json();
            if (data.error) {
                setNoData(true);
            }
            else {
                const sortedData = data.feedbacksData.sort((a: FeedbackData, b: FeedbackData) => a.studentName.localeCompare(b.studentName));
                setFeedbacksData(sortedData);
                setFilteredFeedbacksData(sortedData);
            }
        }
        catch (err) {
            setNoData(true);
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchObs();
    }, [])

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredFeedbacksData(feedbacksData);
            return;
        }

        const filteredRecords = feedbacksData.filter(data => data.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredFeedbacksData(filteredRecords);

    }, [searchTerm])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchTerm(value);
    }

    const exportToExcel = async (data: FeedbackData[]) => {
        if (!data || data.length === 0) {
            toast.error("No data to export");
            return;
        }

        const columns = [
            { header: "Session ID", key: "sessionId"},
            { header: "Student ID", key: "sId"},
            { header: "Student Name", key: "studentName"},
            { header: "Date", key: "date"},
            { header: "Category", key: "category"},
            { header: "Details", key: "details"},
        ]

        try {
            const res = await fetch("/api/genricExcelExport", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data, columns }),
            });

            if (!res.ok) {
                toast.error("Failed to download Excel");
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            let finalName = `School Feedbacks ${sessionId}`;
            if (searchTerm != '') {
                finalName += '_searchTerm_' + searchTerm;
            }

            a.download = (finalName + '.xlsx');
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while exporting Excel");
        }
    }

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
            <FormSection title="School Feedbacks" icon={<NotepadText />} margin={false} >
                <InputField label="Search by Student Name" name="search" value={searchTerm} onChange={handleSearchChange} disabled={noData} />
                {loading && (
                    <div className="flex items-center justify-center">
                        <Loader className="animate-spin text-black text-9xl" />
                    </div>
                )}
                {!loading && (
                    <>
                    <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white mt-6">
                        <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                <tr>
                                    <th className="px-6 py-4">S.No.</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Feedback</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-center">
                                {(noData || feedbacksData === null || feedbacksData.length === 0) && (
                                    <tr>
                                        <td className="px-6 py-4" colSpan={5}>No Data available</td>
                                    </tr>
                                )}
                                {feedbacksData && filteredFeedbacksData && filteredFeedbacksData.length > 0 && filteredFeedbacksData.map((data, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4">{data.studentName}</td>
                                        <td className="px-6 py-4">{data.date}</td>
                                        <td className="px-6 py-4">{data.category}</td>
                                        <td className="px-6 py-4">{data.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6">
                        <Button text="Export to Excel" icon={<></>} onClick={() => exportToExcel(filteredFeedbacksData)} setGreen />
                    </div>
                    </>
                )}
            </FormSection >
        </div>
    )
}