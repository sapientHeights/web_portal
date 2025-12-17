import { useSessions } from "@/hooks/useSessions";
import { useClasses } from "@/hooks/useClasses";
import FormSection from "./FormSection";
import SelectField from "./SelectField";
import FormFooterActions from "./FormFooterActions";

import { useEffect, useState } from "react";
import { ArrowRight, FileUser, Loader, MousePointerClick, UserRoundX } from "lucide-react";
import toast from "react-hot-toast";
import UpdateClassIncharge from "./UpdateClassIncharge";
import { TeacherAllData } from "@/types/teacher";

type FormSelection = {
    sessionId: string;
    classId: string;
};

type ClassInchargeData = {
    sessionId: string;
    classId: string;
    section: string;
    tId: string;
    teacherName: string;
};

const initialSelection: FormSelection = {
    sessionId: "",
    classId: ""
};

type Props = {
    teachersData : TeacherAllData[] | null;
};

export default function ShowClassIncharge({ teachersData } : Props) {
    const [classSelection, setClassSelection] = useState<FormSelection>(initialSelection);
    const [classInchargeData, setClassInchargeData] = useState<ClassInchargeData[] | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [selectedClassInchargeData, setSelectedClassInchargeData] = useState<ClassInchargeData | null>(null);
    const [updateDialog, setUpdateDialog] = useState(false);

    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();
    const { classes, isLoading: classesLoading } = useClasses();

    useEffect(() => {
        if(activeSession){
            setClassSelection(prev => ({
                ...prev,
                sessionId: activeSession
            }))
        }
    }, [activeSession])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setClassSelection((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchInchargeData = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getClassIncharge.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ sessClass: classSelection })
            });

            const data = await res.json();

            if (!data.error) {
                setClassInchargeData(data.classInchargeData);
            } else {
                toast.error("Failed to fetch class incharge data.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Some error occurred");
        } finally {
            setPageLoading(false);
        }
    }

    const getIncharge = async (e: React.FormEvent) => {
        e.preventDefault();
        setPageLoading(true);
        fetchInchargeData();
    };

    const openUpdateDialog = (cIData: ClassInchargeData) => {
        setSelectedClassInchargeData(cIData);
        setUpdateDialog(true);
    }

    useEffect(() => {
        if (!sessionsLoading && !classesLoading) {
            setPageLoading(false);
        }
    }, [sessionsLoading, classesLoading]);

    const removeClassIncharge = async (cIData: ClassInchargeData) => {
        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/removeClassIncharge.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cIData
                })
            });

            const data = await res.json();

            if (!data.error) {
                toast.success("Class Incharge Removed");
                fetchInchargeData();
            } else {
                toast.error("Failed to update class incharge.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Some error occurred");
        } finally {
            setPageLoading(false);
        }
    }

    const deleteToast = (cIData: ClassInchargeData) => {
        if(cIData.tId === ''){
            toast.error("Class Incharge is not allotted");
            return;
        }
        
        toast.custom((t) => (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4 w-[320px] text-center animate-slide-in">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Remove Class Incharge?</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to remove the Class Incharge
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition"
                        onClick={() => {
                            removeClassIncharge(cIData);
                            toast.dismiss(t.id);
                        }}
                    >
                        Delete
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

    if (pageLoading) {
        return (
            <div className="max-w-xl mx-auto bg-gray-50 rounded-4xl shadow-xl max-h-[400px]">
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader className="animate-spin text-black text-9xl" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <FormSection title="Select Class" icon={<MousePointerClick />} margin={false}>
                    <form onSubmit={getIncharge}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                label="Session"
                                name="sessionId"
                                value={classSelection.sessionId}
                                onChange={handleChange}
                                options={sessions}
                            />
                            <SelectField
                                label="Class"
                                name="classId"
                                value={classSelection.classId}
                                onChange={handleChange}
                                options={classes}
                            />
                        </div>
                        <FormFooterActions primaryLabel="Get Data" />
                    </form>
                </FormSection>
            </div>

            {classInchargeData && (
                <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                    <FormSection title="Class Incharge" icon={<FileUser />} margin={false}>
                        {classInchargeData?.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">No data found.</p>
                        ) : (
                            <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
                                <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                                    <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                        <tr>
                                            <th className="px-6 py-4">Section</th>
                                            <th className="px-6 py-4">Class Incharge</th>
                                            <th className="px-1 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-center">
                                        {classInchargeData?.map((data, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">{data.section}</td>
                                                <td className="px-6 py-4">{data.tId === '' ? 'Not Assigned' : data.teacherName}</td>
                                                <td className="px-1 py-4 text-green-500 cursor-pointer">
                                                    <div className="flex justify-evenly items-center gap-2">
                                                        <UserRoundX size={12} onClick={() => deleteToast(data)} />
                                                        <ArrowRight size={12} onClick={() => openUpdateDialog(data)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </FormSection>
                </div>
            )}

            {updateDialog && (
                <UpdateClassIncharge classInchargeData={selectedClassInchargeData} setShowDialog={setUpdateDialog} teachersData={teachersData} getIncharge={fetchInchargeData} />
            )}

        </div>
    );
}
