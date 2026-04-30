import { CalendarFold, MousePointer2 } from "lucide-react";
import FormSection from "./FormSection";
import { useEffect, useState } from "react";
import InputField from "./InputField";
import toast from "react-hot-toast";
import SelectField from "./SelectField";
import FormFooterActions from "./FormFooterActions";
import Button from "./Button";

type LeaveData = {
    id: string;
    sessionId: string;
    tId: string;
    maxCLs: number;
    usedCLs: number;
    teacherName: string;
    empId: string;
}

type Props = {
    sessions: string[];
    activeSession: string | undefined;
}

export default function LeavesData({ sessions, activeSession }: Props) {
    const [leavesData, setLeavesData] = useState<LeaveData[]>([]);
    const [sessionId, setSessionId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeSession) {
            setSessionId(activeSession);
        }
    }, [activeSession])

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const getLeavesData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/getLeavesData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: sessionId
                })
            })
            const data = await res.json();
            if (data.error) {
                toast.error("Some error occurred");
            }
            else {
                setLeavesData(data.data);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        getLeavesData();
    }

    const saveLeavesData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/saveLeavesData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    leavesData
                })
            })
            const data = await res.json();
            if (data.error) {
                toast.error("Some error occurred - Failed to save data");
            }
            else {
                toast.success("Data Saved successfully!");
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    const handleChange = (
        index: number,
        field: "maxCLs" | "maxLWPs",
        value: string
    ) => {
        setLeavesData(prev => {
            if (!prev) return prev;

            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: Number(value)
            };

            return updated;
        });
    };

    return (
        <>
            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10">
                <form onSubmit={handleSubmit}>
                    <FormSection title="Select" icon={<MousePointer2 />} margin={false}>
                        <div className="grid grid-cols-2">
                            <SelectField label="Select session" name="sessionId" value={sessionId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSessionId(e.target.value)} options={sessions} />
                        </div>
                        <FormFooterActions primaryLabel="Get Data" />
                    </FormSection>
                </form>
            </div>
            {leavesData && leavesData.length > 0 && (
                <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10">
                    <FormSection title="Leaves Data" icon={<CalendarFold />} margin={false}>
                        <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white mt-6">
                            <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                    <tr>
                                        <th className="px-6 py-4">S.No.</th>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Emp Code</th>
                                        <th className="px-1 py-4">Max CL</th>
                                        <th className="px-1 py-4">Used CL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-center">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="py-10">
                                                <div className="flex flex-col items-center justify-center gap-3">

                                                    {/* Spinner */}
                                                    <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

                                                    {/* Text */}
                                                    <p className="text-gray-500 text-sm animate-pulse">
                                                        Loading leaves data...
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        leavesData && leavesData.map((data, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">{index + 1}</td>
                                                <td className="px-6 py-4">{data.tId}</td>
                                                <td className="px-6 py-4">{data.teacherName}</td>
                                                <td className="px-6 py-4">{data.empId}</td>
                                                <td className="px-6 py-4">
                                                    <InputField value={data.maxCLs.toString()} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, "maxCLs", e.target.value)} label="" name="maxCLs" />
                                                </td>
                                                <td className="px-6 py-4">{data.usedCLs}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>

                            </table>
                        </div>

                        <div className="mt-6 flex gap-5">
                            <Button type="button" onClick={getLeavesData} icon={<></>} text="Reset" />
                            <Button onClick={saveLeavesData} icon={<></>} text="Save Leaves Data" setGreen />
                        </div>
                    </FormSection>
                </div>
            )}
        </>
    )
}