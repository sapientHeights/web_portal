'use client';
import { StudentData, studentDocLabels, studentFieldLabels } from "@/types/student";
import Button from "./Button";
import { ArrowBigLeft, Pencil, PencilIcon, PencilLine, UserRoundPen } from "lucide-react";
import { useEffect, useState } from "react";
import { TeacherData, teacherDocLabels, teacherFieldLabels } from "@/types/teacher";
import UpdateStudentData from "./UpdateStudentData";
import UpdateDoc from "./UpdateDoc";
import UpdateTeacherData from "./UpdateTeacherData";

type DialogStateType = {
    openDialog: boolean;
    selectedData: StudentData | TeacherData | null;
    detailsTab: boolean;
    id: string | null;
};

type Props = {
    dialog: DialogStateType;
    setDialog: React.Dispatch<React.SetStateAction<DialogStateType>>;
    reportType: string;
    getData: () => Promise<void>;
}


export default function DataDialog({ dialog, setDialog, reportType, getData }: Props) {
    const [edit, setEdit] = useState(false);
    const [docEdit, setDocEdit] = useState(false);
    const [fileToUpdate, setFileToUpdate] = useState<{ fileLabel: string; fileName: string; displayName: string; type: string } | null>(null);

    const closeDialog = () => {
        setDialog({
            openDialog: false,
            selectedData: null,
            detailsTab: false,
            id: null
        });
    }

    const openFile = (id: string, fileName: string) => {
        let fileUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads`;
        if (reportType === "students") {
            fileUrl += `/students/${id}/${fileName}`;
        }
        if (reportType === "teachers") {
            fileUrl += `/teachers/${id}/${fileName}`;
        }

        window.open(fileUrl, '_blank');
    }

    useEffect(() => {
        if (dialog.openDialog) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Clean up on unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [dialog.openDialog]);

    const editDoc = (fileLabel: string, fileName: string, displayName: string, type: string) => {
        setFileToUpdate({
            fileLabel: fileLabel,
            fileName: fileName,
            displayName: displayName,
            type: type
        });
        setDocEdit(true);
    }


    if (!dialog || !dialog.selectedData) return;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300">
            <div
                className={`
                    max-w-5xl max-h-[800px] w-full mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 
                    transform transition-all duration-300 ease-out
                    scale-100 opacity-100 translate-y-0
                `}
            >
                <div className={`flex justify-between items-center ${dialog.detailsTab ? '' : 'gap-12'}`}>
                    <div className={`flex justify-start items-center ${dialog.detailsTab ? 'gap-10' : 'gap-5'} p-4`}>
                        <p
                            onClick={() => setDialog(prev => ({ ...prev, detailsTab: true }))}
                            className={`${dialog.detailsTab ? 'text-blue-800' : 'text-gray-500 hover:text-blue-800 cursor-pointer'}`}
                        >
                            {reportType === "students" ? 'Student Details' : 'Teacher Details'}
                        </p>
                        <p
                            onClick={() => setDialog(prev => ({ ...prev, detailsTab: false }))}
                            className={`${dialog.detailsTab ? 'text-gray-500 hover:text-blue-800 cursor-pointer' : 'text-blue-800'}`}
                        >
                            {reportType === "students" ? 'Student Documents' : 'Teacher Documents'}
                        </p>
                    </div>
                    <div className="flex justify-end items-center gap-10">
                        {dialog.detailsTab && <Button text="Edit Data" onClick={() => setEdit(true)} icon={<Pencil size={15} />} setGreen />}
                        <Button text="Go Back" onClick={closeDialog} icon={<ArrowBigLeft size={15} />} />
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[550px] p-4 mt-10 mb-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Object.keys(dialog.selectedData).map((key, index) => {
                            const selectedData = dialog.selectedData;
                            const id = dialog.id;
                            if (!selectedData) return null;

                            if (dialog.detailsTab) {
                                if (reportType === "students") {
                                    if (studentFieldLabels[key as keyof typeof selectedData] === undefined) return null;
                                    const value = selectedData[key as keyof typeof selectedData];

                                    return (
                                        <div key={index}>
                                            <p className="text-black text-md">{studentFieldLabels[key as keyof typeof selectedData]}</p>
                                            <p className={`${value === null ? 'text-red-500' : 'text-gray-500'} text-md`}>{value === null ? 'Not Available' : value}</p>
                                        </div>
                                    );
                                }
                                else {
                                    if (teacherFieldLabels[key as keyof typeof selectedData] === undefined) return null;

                                    const value = selectedData[key as keyof typeof selectedData];

                                    return (
                                        <div key={index}>
                                            <p className="text-black text-md">{teacherFieldLabels[key as keyof typeof selectedData]}</p>
                                            <p className={`${value === null ? 'text-red-500' : 'text-gray-500'} text-md`}>{value === null ? 'Not Available' : value}</p>
                                        </div>
                                    );
                                }
                            } else {
                                if (reportType === "students") {
                                    if (!(key in studentDocLabels)) return null;
                                    return (
                                        <div key={index}>
                                            <p className="text-black text-md">{studentDocLabels[key as keyof typeof studentDocLabels]}</p>
                                            {id && selectedData[key as keyof typeof selectedData] ? (
                                                <div className="flex justify-start items-center gap-4">
                                                    <p
                                                        onClick={() => openFile(id, selectedData[key as keyof typeof selectedData])}
                                                        className="text-gray-500 text-md cursor-pointer hover:text-blue-300"
                                                    >
                                                        View Image
                                                    </p>
                                                    <UserRoundPen className="cursor-pointer hover:text-green-600" size={14} onClick={() => editDoc(key, selectedData[key as keyof typeof selectedData], studentDocLabels[key as keyof typeof studentDocLabels], 'students')} />
                                                </div>
                                            ) : (
                                                <div className="flex justify-start items-center gap-4">
                                                    <p className="text-red-500 text-md">Not Available</p>
                                                    <UserRoundPen className="cursor-pointer hover:text-green-600" size={14} onClick={() => editDoc(key, selectedData[key as keyof typeof selectedData], studentDocLabels[key as keyof typeof studentDocLabels], 'students')} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                else {
                                    if (!(key in teacherDocLabels)) return null;
                                    return (
                                        <div key={index}>
                                            <p className="text-black text-md">{teacherDocLabels[key as keyof typeof teacherDocLabels]}</p>
                                            {id && selectedData[key as keyof typeof selectedData] ? (
                                                <div className="flex justify-start items-center gap-4">
                                                    <p
                                                        onClick={() => openFile(id, selectedData[key as keyof typeof selectedData])}
                                                        className="text-gray-500 text-md cursor-pointer hover:text-blue-300"
                                                    >
                                                        View Image
                                                    </p>
                                                    <UserRoundPen className="cursor-pointer hover:text-green-600" size={14} onClick={() => editDoc(key, selectedData[key as keyof typeof selectedData], teacherDocLabels[key as keyof typeof teacherDocLabels], 'teachers')} />
                                                </div>
                                            ) : (
                                                <div className="flex justify-start items-center gap-4">
                                                    <p className="text-red-500 text-md">Not Available</p>
                                                    <UserRoundPen className="cursor-pointer hover:text-green-600" size={14} onClick={() => editDoc(key, selectedData[key as keyof typeof selectedData], teacherDocLabels[key as keyof typeof teacherDocLabels], 'teachers')} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                            }
                        })}
                    </div>
                </div>
            </div>

            {edit && reportType === "students" && (
                <UpdateStudentData studentData={dialog.selectedData as StudentData} setEdit={setEdit} id={dialog.id} getData={getData} closeDialog={closeDialog} />
            )}

            {edit && reportType === "teachers" && (
                <UpdateTeacherData teacherData={dialog.selectedData as TeacherData} setEdit={setEdit} id={dialog.id} getData={getData} closeDialog={closeDialog} />
            )}

            {docEdit && (
                <UpdateDoc id={dialog.id} fileLabel={fileToUpdate?.fileLabel || null} fileName={fileToUpdate?.fileName || null} displayName={fileToUpdate?.displayName || null} setDocEdit={setDocEdit} type={fileToUpdate?.type || null} getData={getData} closeDialog={closeDialog} />
            )}
        </div>
    )
}