import { FileUser, Loader } from "lucide-react";
import FormSection from "./FormSection";
import toast from "react-hot-toast";
import FormFooterActions from "./FormFooterActions";
import { SetStateAction, useState } from "react";
import InputField from "./InputField";
import { TeacherAllData } from "@/types/teacher";

type ClassInchargeData = {
    sessionId: string;
    classId: string;
    section: string;
    tId: string;
};

type Props = {
    classInchargeData: ClassInchargeData | null;
    setShowDialog: React.Dispatch<SetStateAction<boolean>>;
    teachersData: TeacherAllData[] | null;
    getIncharge: () => Promise<void>;
}

export default function UpdateClassIncharge({ classInchargeData, setShowDialog, teachersData, getIncharge }: Props) {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>(classInchargeData?.tId || "");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSelectedTeacherId(value);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTeacherId === '') {
            toast.error("Select a teacher");
            return;
        }
        if (selectedTeacherId === classInchargeData?.tId) {
            toast.error("Nothing to update");
            return;
        }

        setLoading(true);

        const dataToSend = {
            classInchargeData,
            selectedTeacherId
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateClassIncharge.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    updateData: dataToSend
                })
            });

            const data = await res.json();

            if (!data.error) {
                if (data.isAlloted) {
                    if(classInchargeData){
                        reAllotToast(classInchargeData, selectedTeacherId);
                    }
                    else{
                        toast.error("Some error occurred");
                    }
                }
                else {
                    toast.success("Class Incharge Updated");
                    getIncharge();
                    setShowDialog(false);
                }
            } else {
                toast.error("Failed to update class incharge.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Some error occurred");
        } finally {
            setLoading(false);
        }
    }

    const reAllotToast = (classInchargeData: ClassInchargeData, selectedTeacherId: string) => {
        toast.custom((t) => (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4 w-[320px] text-center animate-slide-in">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Re-Allot Class Teacher?</h2>
                <p className="text-sm text-gray-600 mb-4">
                    This teacher is already alloted to some other class. Re-Allot?
                </p>

                <div className="flex justify-center gap-4 items-center">
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition"
                        onClick={() => {
                            reAllotTeacher(classInchargeData, selectedTeacherId);
                            toast.dismiss(t.id);
                        }}
                    >
                        Allot
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

    const reAllotTeacher = async (classInchargeData: ClassInchargeData, selectedTeacherId: string) => {
        setLoading(true);

        const dataToSend = {
            classInchargeData,
            selectedTeacherId
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reAllotClassIncharge.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    updateData: dataToSend
                })
            });

            const data = await res.json();

            if (!data.error) {
                toast.success("Class Incharge Updated");
                getIncharge();
                setShowDialog(false);
            } else {
                toast.error("Failed to update class incharge.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Some error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
                <FormSection title='Update Class Incharge' icon={<FileUser />} margin={false} >
                    {loading && (
                        <div className="flex items-center justify-center">
                            <Loader className="animate-spin text-black text-9xl" />
                        </div>
                    )}
                    {!loading && (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6">
                                <InputField label="Enter Class" name="classId" value={classInchargeData ? classInchargeData.classId : ''} onChange={() => { }} disabled />
                                <InputField label="Enter Section" name="section" value={classInchargeData ? classInchargeData.section : ''} onChange={() => { }} disabled />
                                <div>
                                    <label className="block text-sm font-bold tracking-wide text-gray-700 mb-1">Select Teacher <span className="text-red-500">*</span></label>
                                    <select
                                        name='tId'
                                        value={selectedTeacherId}
                                        onChange={handleChange}
                                        required={true}
                                        className={`w-full border border-gray-300 bg-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    >
                                        <option value="">-- Select --</option>
                                        {teachersData && teachersData.map((teacher, index) => (
                                            <option key={index} value={teacher.tId}>
                                                {teacher.teacherName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <FormFooterActions primaryLabel='Update' cancel={() => setShowDialog(false)} />
                        </form>
                    )}
                </FormSection>
            </div>
        </div>
    )
}