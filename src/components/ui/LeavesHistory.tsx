import { useEffect, useState } from "react";
import FormSection from "./FormSection";
import { CirclePlus, List, ListPlus, SquareMousePointer, Table } from "lucide-react";
import SelectField from "./SelectField";
import FormFooterActions from "./FormFooterActions";
import toast from "react-hot-toast";
import InputField from "./InputField";
import NoDataSection from "./NoDataSection";

type LeaveHistory = {
    id: string;
    sessionId: string;
    tId: string;
    startDate: string;
    endDate: string;
    type: string;
    teacherName: string;
    empId: string;
}

type Props = {
    sessions: string[];
    activeSession: string | undefined;
}

export default function LeavesHistory({ sessions, activeSession }: Props) {
    const [leavesHistory, setLeavesHistory] = useState<LeaveHistory[]>([]);
    const [sessionId, setSessionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState('');
    const [empLeavesHistory, setEmpLeavesHistory] = useState<LeaveHistory[]>(leavesHistory);
    const [showDialog, setShowDialog] = useState(false);
    const [newLeaveHistory, setNewLeaveHistory] = useState<LeaveHistory>({ id: '', sessionId: '', tId: '', startDate: '', endDate: '', type: '', teacherName: '', empId: '' });
    const [leavesHistoryFound, setLeavesHistoryFound] = useState(false);

    const uniqueTeachers = Array.from(
        new Map(leavesHistory.map(item => [item.tId, item])).values()
    );

    useEffect(() => {
        if (activeSession) {
            setSessionId(activeSession);
        }
    }, [activeSession])

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const getLeavesHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/getLeavesHistory.php`, {
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
                setLeavesHistoryFound(data.leavesHistoryFound);
                setLeavesHistory(data.data);
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
        getLeavesHistory();
    }

    const handleActionButtons = (action: string, empData: LeaveHistory) => {
        setAction(action);
        if (action === 'add') {
            setNewLeaveHistory({
                id: '',
                sessionId: empData.sessionId,
                tId: empData.tId,
                startDate: '',
                endDate: '',
                type: '',
                teacherName: empData.teacherName,
                empId: empData.empId
            });
        }

        if (action === 'view') {
            const filteredData = leavesHistory.filter(data => data.tId === empData.tId);
            setEmpLeavesHistory(filteredData);
        }
        setShowDialog(true);
    }

    const handleAddLeaveHistory = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowDialog(false);
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/saveLeavesHistory.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    leavesHistory: newLeaveHistory
                })
            })
            const data = await res.json();
            if (data.error) {
                toast.error(data.details);
                setShowDialog(true);
            }
            else {
                toast.success("History Saved Successfully")
                getLeavesHistory();
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    const handleNewDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewLeaveHistory((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    return (
        <>
            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10">
                <form onSubmit={handleSubmit}>
                    <FormSection title="Select" icon={<SquareMousePointer />} margin={false}>
                        <div className="grid grid-cols-2">
                            <SelectField label="Select session" name="sessionId" value={sessionId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSessionId(e.target.value)} options={sessions} />
                        </div>
                        <FormFooterActions primaryLabel="Get Data" />
                    </FormSection>
                </form>
            </div>
            {leavesHistory && leavesHistory.length > 0 && (
                <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10">
                    <FormSection title="Leaves History" icon={<Table />} margin={false}>
                        <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white mt-6">
                            <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                    <tr>
                                        <th className="px-6 py-4">S.No.</th>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Emp Code</th>
                                        <th className="px-6 py-4"></th>
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
                                        leavesHistory && uniqueTeachers.map((data, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">{index + 1}</td>
                                                <td className="px-6 py-4">{data.tId}</td>
                                                <td className="px-6 py-4">{data.teacherName}</td>
                                                <td className="px-6 py-4">{data.empId}</td>
                                                <td className="px-6 py-4">
                                                    <span className="flex justify-end gap-4">
                                                        <CirclePlus size={12} className="cursor-pointer hover:text-green-700" onClick={() => handleActionButtons('add', data)} />
                                                        <List size={12} className="cursor-pointer hover:text-amber-700" onClick={() => handleActionButtons('view', data)} />
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </FormSection>
                </div>
            )}
            {showDialog && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[90%] max-w-3xl rounded-2xl shadow-xl p-6 relative">
                        <button
                            className="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-red-700"
                            onClick={() => setShowDialog(false)}
                        >
                            ✕
                        </button>

                        {action === 'add' && (
                            <>
                                <form onSubmit={handleAddLeaveHistory}>
                                    <FormSection title="Add Leave History" icon={<ListPlus />}>
                                        <div className="grid grid-col-1 sm:grid-cols-3 gap-10">
                                            <InputField label="Teacher ID" name="tId" value={newLeaveHistory.tId} onChange={() => { }} disabled />
                                            <InputField label="Teacher Name" name="teacherName" value={newLeaveHistory.teacherName} onChange={() => { }} disabled />
                                            <InputField label="Emp Code" name="empId" value={newLeaveHistory.empId} onChange={() => { }} disabled />
                                        </div>
                                        <div className="grid grid-col-1 sm:grid-cols-3 gap-10 mt-10">
                                            <InputField type="date" label="Start Date" name="startDate" value={newLeaveHistory.startDate} onChange={handleNewDataChange} required />
                                            <InputField type="date" label="End Date" name="endDate" value={newLeaveHistory.endDate} onChange={handleNewDataChange} required />
                                            <SelectField label="Type" name="type" value={newLeaveHistory.type} onChange={handleNewDataChange} options={['CL', 'LWP']} required />
                                        </div>
                                    </FormSection>
                                    <FormFooterActions primaryLabel="Add" cancel={() => setShowDialog(false)} />
                                </form>
                            </>
                        )}

                        {action === 'view' && empLeavesHistory.length > 0 && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {empLeavesHistory[0].teacherName}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Emp ID: {empLeavesHistory[0].empId}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Code: {empLeavesHistory[0].tId}
                                    </p>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                                    <table className="w-full text-sm text-gray-700">
                                        <thead className="bg-gray-100 text-xs uppercase text-gray-600 sticky top-0">
                                            <tr className="text-center">
                                                <th className="px-4 py-3">Start Date</th>
                                                <th className="px-4 py-3">End Date</th>
                                                <th className="px-4 py-3">Number of Days</th>
                                                <th className="px-4 py-3">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-center">
                                            {leavesHistoryFound && empLeavesHistory.map((leave, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3">{leave.startDate}</td>
                                                    <td className="px-4 py-3">{leave.endDate}</td>
                                                    <td className="px-4 py-3">{((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}</td>
                                                    <td className="px-4 py-3">{leave.type}</td>
                                                </tr>
                                            ))}
                                            {!leavesHistoryFound && (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-3">
                                                        <NoDataSection />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}