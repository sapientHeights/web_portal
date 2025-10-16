import { Delete, Loader, UserRoundCog, X } from "lucide-react";
import FormSection from "./FormSection";
import { SetStateAction, useEffect, useState } from "react";
import { TeacherAllData } from "@/types/teacher";
import toast from "react-hot-toast";
import Button from "./Button";

type TeacherClasses = {
    sessionId: string;
    classId: string;
    section: string;
    subjectId: string;
    tId: string;
}

type Props = {
    setShowTable: React.Dispatch<SetStateAction<boolean>>;
    selectedTeacher: TeacherAllData | null;
}

export default function ShowTeacherClasses({ setShowTable, selectedTeacher }: Props) {
    const [teacherClasses, setTeacherClasses] = useState<TeacherClasses[] | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchTeacherClasses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getTeacherClasses.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tId: selectedTeacher?.tId
                }),
            });

            const data = await res.json();
            if (!data.error) {
                setTeacherClasses(data.tClassesData);
            }
            else {
                setTeacherClasses(null);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTeacherClasses();
    }, []);

    const deleteToast = (teacherClass: TeacherClasses) => {
        toast.custom((t) => (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4 w-[320px] text-center animate-slide-in">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Delete Payment?</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to remove the assignment?
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition"
                        onClick={() => {
                            deleteTeacherClass(teacherClass);
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

    const deleteTeacherClass = async (teacherClass : TeacherClasses) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteTeacherClass.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teacherClass
                }),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Assignment Removed");
                fetchTeacherClasses();
            }
            else {
                toast.error("Some error occurred");
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
                <FormSection title="Teacher Allotted Classes" icon={<UserRoundCog />} margin={false} >
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
                                        <th className="px-6 py-4">Session Id</th>
                                        <th className="px-6 py-4">Class</th>
                                        <th className="px-6 py-4">Section</th>
                                        <th className="px-6 py-4">Subject</th>
                                        <th className="px-1 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-center">
                                    {(teacherClasses === null || teacherClasses.length === 0) && (
                                        <tr>
                                            <td className="px-6 py-4" colSpan={5}>No Data available</td>
                                        </tr>
                                    )}
                                    {teacherClasses && teacherClasses.length > 0 && teacherClasses.map((data, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">{index + 1}</td>
                                            <td className="px-6 py-4">{data.sessionId}</td>
                                            <td className="px-6 py-4">{data.classId}</td>
                                            <td className="px-6 py-4">{data.section}</td>
                                            <td className="px-6 py-4">{data.subjectId}</td>
                                            <td className="px-2 py-4 text-red-500 cursor-pointer" onClick={() => deleteToast(data)}>{<Delete size={12} />}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </FormSection >
                <div className="mt-4">
                    <Button text="Close" icon={<X />} onClick={() => setShowTable(false)} />
                </div>
            </div>
        </div>
    )
}