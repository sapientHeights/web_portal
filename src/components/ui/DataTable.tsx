'use client';

import { StudentAllData, StudentData } from "@/types/student";
import { TeacherAllData, TeacherData } from "@/types/teacher";
import { ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

type DialogStateType = {
    openDialog: boolean;
    selectedData: StudentData | TeacherData | null;
    detailsTab: boolean;
    id: string | null;
};

type Props = {
    allData: StudentAllData[] | TeacherAllData[] | null;
    setDialog: React.Dispatch<React.SetStateAction<DialogStateType>>;
    columns: string[];
    values: (keyof StudentData | keyof TeacherData)[];
    reportType: string;
}

export default function DataTable({ allData, setDialog, columns, values, reportType }: Props) {
    const configureDialog = (data: StudentAllData | TeacherAllData) => {
        if ('sId' in data) {
            setDialog({
                openDialog: true,
                selectedData: data,
                detailsTab: true,
                id: data.sId
            });
        }
        else if('tId' in data){
            setDialog({
                openDialog: true,
                selectedData: data,
                detailsTab: true,
                id: data.tId
            })
        }
        else{
            toast.error("Some error occurred!");
        }
    }

    if(reportType === "students"){
        allData = allData as StudentAllData[];
    }
    else{
        allData = allData as TeacherAllData[];
    }

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10 z-1">
            <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
                <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                        <tr>
                            {columns.map((column, index) => (
                                <th key={index} className="px-6 py-4">{column}</th>
                            ))}
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-center">
                        {allData && allData.map((data, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                {data && values.map((value, vIndex) => (
                                    <td key={vIndex} className="px-6 py-4">{
                                        reportType === "students" ? (data as StudentData)[value as keyof StudentData] : (data as TeacherData)[value as keyof TeacherData]
                                    }</td>
                                ))}
                                <td onClick={() => configureDialog(data)} className="px-6 py-4">{<ArrowRight size={12} className="hover:text-green-700 cursor-pointer" />}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}