'use client';
import { StudentData, studentDocLabels, studentFieldLabels } from "@/types/student";
import Button from "./Button";
import { ArrowBigLeft } from "lucide-react";
import { useEffect } from "react";
import { TeacherData, teacherDocLabels, teacherFieldLabels } from "@/types/teacher";

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
}


export default function DataDialog({ dialog, setDialog, reportType }: Props) {
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
        if(reportType === "students"){
            fileUrl += `/students/${id}/${fileName}`;
        }
        if(reportType === "teachers"){
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

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [dialog.openDialog]);


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
                    <Button text="Go Back" onClick={closeDialog} icon={<ArrowBigLeft size={15} />} />
                </div>

                <div className="overflow-y-auto max-h-[550px] p-4 mt-10 mb-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Object.keys(dialog.selectedData).map((key, index) => {
                            const selectedData = dialog.selectedData;
                            const id = dialog.id;
                            if (!selectedData) return null;

                            if (dialog.detailsTab) {
                                if(reportType === "students"){
                                    if (studentFieldLabels[key as keyof typeof selectedData] === undefined) return null;
                                    const value = selectedData[key as keyof typeof selectedData];

                                    return (
                                        <div key={index}>
                                            <p className="text-black text-md">{studentFieldLabels[key as keyof typeof selectedData]}</p>
                                            <p className={`${value === null ? 'text-red-500' : 'text-gray-500'} text-md`}>{value === null ? 'Not Available' : value}</p>
                                        </div>
                                    );
                                }
                                else{
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
                                if(reportType === "students"){
                                    if (!(key in studentDocLabels)) return null;
                                    return (
                                        <div key={index}>
                                            <p className="text-black text-md">{studentDocLabels[key as keyof typeof studentDocLabels]}</p>
                                            {id && selectedData[key as keyof typeof selectedData] ? (
                                                <p
                                                    onClick={() => openFile(id, selectedData[key as keyof typeof selectedData])}
                                                    className="text-gray-500 text-md cursor-pointer hover:text-blue-300"
                                                >
                                                    View Image
                                                </p>
                                            ) : (
                                                <p className="text-red-500 text-md">Not Available</p>
                                            )}
                                        </div>
                                    );
                                }
                                else{
                                    if (!(key in teacherDocLabels)) return null;
                                    return (
                                        <div key={index}>
                                            <p className="text-black text-md">{teacherDocLabels[key as keyof typeof teacherDocLabels]}</p>
                                            {id && selectedData[key as keyof typeof selectedData] ? (
                                                <p
                                                    onClick={() => openFile(id, selectedData[key as keyof typeof selectedData])}
                                                    className="text-gray-500 text-md cursor-pointer hover:text-blue-300"
                                                >
                                                    View Image
                                                </p>
                                            ) : (
                                                <p className="text-red-500 text-md">Not Available</p>
                                            )}
                                        </div>
                                    );
                                }
                                
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}