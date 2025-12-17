import { CalendarSync, CalendarPlus, ShieldX, ShieldCheck, Loader, Trash } from "lucide-react";
import Button from "./Button";
import FormSection from "./FormSection";
import NoDataSection from "./NoDataSection";
import { FormEvent, SetStateAction, useState } from "react";
import { useSessions } from "@/hooks/useSessions";
import AddSessionDialog from "./AddSessionDialog";
import toast from "react-hot-toast";

type Props = {
    setLoading: React.Dispatch<SetStateAction<boolean>>;
}

type NewSessionData = {
    startYear: string;
    endYear: string;
    sessionId: string;
    remark: string;
}

export default function ShowSessions({ setLoading }: Props) {
    const initialSessionData = {
        startYear: "", endYear: "", sessionId: "", remark: "", isActive: false
    }

    const { sessions, isLoading: sessionsLoading, activeSession, refresh: refreshSessions } = useSessions();
    const [newSession, setNewSession] = useState<NewSessionData>(initialSessionData);
    const [addSession, setAddSession] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const cancelNewSession = () => {
        setNewSession(initialSessionData);
        setAddSession(false);
    }

    const activateSession = async (sessionId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/activateSession.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });

            const data = await res.json();
            if (data.error) {
                toast.error("Failed to activate session");
            }
            else {
                toast.success("Session activated successfully");
                refreshSessions();
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    const rowActionToast = (sessionId: string, activate: boolean) => {
        toast.custom((t) => (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4 w-[320px] text-center animate-slide-in">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{activate ? 'Activate' : 'Delete'} Session?</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to {activate ? 'activate' : 'delete'} this session?
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        className={`px-4 py-2 ${activate ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}  text-white rounded-lg cursor-pointer transition`}
                        onClick={() => {
                            toast.dismiss(t.id);
                            {activate ? activateSession(sessionId) : handleRowDeleteAction(sessionId)}
                        }}
                    >
                        {activate ? 'Activate' : 'Delete'}
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ));
    }


    const handleRowAction = (sessionId: string) => {
        const deactive = sessionId === activeSession;
        if (deactive) {
            if (sessions.length === 1) {
                toast.error("One session needs to be activated");
                return;
            }
            else{
                toast.error("Activate another session first");
                return;
            }
        }
        else {
            rowActionToast(sessionId, true);
        }
    }

    const handleRowDeleteAction = async (sessionId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/deleteSession.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });

            const data = await res.json();
            if (data.error) {
                toast.error("Failed to delete new session");
            }
            else {
                toast.success("Session deleted successfully");
                refreshSessions();
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    const addNewSession = async (e: FormEvent) => {
        e.preventDefault();

        const findSess = sessions.find(sess => sess === newSession.sessionId);
        if (findSess) {
            toast.error("Same session id exists");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/addSession.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: newSession.sessionId, remark: newSession.remark })
            });

            const data = await res.json();
            if (data.error) {
                toast.error("Failed to add new session");
            }
            else {
                toast.success("Session added successfully");
                refreshSessions();
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    const loading = sessionsLoading;


    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
            {loading && (
                <div className="flex items-center justify-center">
                    <Loader className="animate-spin text-black text-9xl" />
                </div>
            )}

            {!loading && sessions && sessions.length === 0 && (
                <NoDataSection />
            )}

            {!loading && sessions && sessions.length > 0 && (
                <FormSection title="All Sessions" icon={<CalendarSync />} margin={false} >
                    <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
                        <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                <tr>
                                    <th className="px-6 py-4">S.No.</th>
                                    <th className="px-6 py-4">Session</th>
                                    <th className="px-6 py-4">Active</th>
                                    <th className="py-4"></th>
                                    <th className="py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-center">
                                {sessions && sessions.map((data, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4">{data}</td>
                                        <td className="px-6 py-4">{data === activeSession ? "Yes" : "No"}</td>
                                        <td className="py-4 cursor-pointer" onClick={() => handleRowAction(data)}>{data === activeSession ? <ShieldX size={20} className="text-red-700 hover:text-red-800" /> : <ShieldCheck size={20} className="text-green-700 hover:text-green-800" />}</td>
                                        <td className="py-4 cursor-pointer" onClick={() => rowActionToast(data, false)}>{data === activeSession ? <></> : <Trash size={20} className="text-red-700 hover:text-red-800" />}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6">
                        <Button text="Add Session" icon={<CalendarPlus />} setGreen={true} onClick={() => setAddSession(true)} />
                    </div>
                </FormSection >
            )}


            {addSession && (
                <AddSessionDialog
                    sectionTitle="Add Session"
                    formSubmitFunction={addNewSession}
                    sessionData={newSession}
                    setSessionData={setNewSession}
                    icon={<CalendarPlus />}
                    footerPrimaryLabel="Add"
                    cancelFunction={cancelNewSession}
                />
            )}
        </div >
    )
}