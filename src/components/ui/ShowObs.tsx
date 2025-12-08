import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormSection from "./FormSection";
import { Glasses, Loader } from "lucide-react";
import InputField from "./InputField";

type Props = {
    sessionId: string;
    classId: string;
    section: string;
}

type ObsData = {
    sessionId: string;
    classId: string;
    section: string;
    date: string;
    sId: string;
    observation: string;
    tId: string;
    studentName: string;
    teacherName: string;
}

export default function ShowObs({ sessionId, classId, section }: Props) {
    const [noData, setNoData] = useState(false);
    const [obsData, setObsData] = useState<ObsData[]>([]);
    const [filteredObsData, setFilteredObsData] = useState<ObsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchObs = async () => {
        try {
            const res = await fetch(`${backendUrl}/getStdObsByClass.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId, classId, section
                })
            });

            const data = await res.json();
            if (data.error) {
                setNoData(true);
            }
            else {
                const sortedData = data.obsData.sort((a:ObsData, b:ObsData) => a.studentName.localeCompare(b.studentName));
                setObsData(sortedData);
                setFilteredObsData(sortedData);
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
        if(searchTerm === ''){
            setFilteredObsData(obsData);
            return;
        }

        const filteredRecords = obsData.filter(data => data.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || data.teacherName.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredObsData(filteredRecords);

    }, [searchTerm])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        setSearchTerm(value);
    }

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
            <FormSection title="Student Observations" icon={<Glasses />} margin={false} >
                <InputField label="Search by Teacher or Student Name" name="search" value={searchTerm} onChange={handleSearchChange} disabled={noData}/>            
                {loading && (
                    <div className="flex items-center justify-center">
                        <Loader className="animate-spin text-black text-9xl" />
                    </div>
                )}
                {!loading && (
                    <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white mt-6">
                        <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                <tr>
                                    <th className="px-6 py-4">S.No.</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Teacher Name</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Observation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-center">
                                {(noData || obsData === null || obsData.length === 0) && (
                                    <tr>
                                        <td className="px-6 py-4" colSpan={5}>No Data available</td>
                                    </tr>
                                )}
                                {obsData && filteredObsData && filteredObsData.length > 0 && filteredObsData.map((data, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4">{data.studentName}</td>
                                        <td className="px-6 py-4">{data.teacherName}</td>
                                        <td className="px-6 py-4">{data.date}</td>
                                        <td className="px-6 py-4">{data.observation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </FormSection >
        </div>
    )
}