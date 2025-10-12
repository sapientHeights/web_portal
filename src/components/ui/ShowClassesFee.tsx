import { ClassFeeData } from "@/types/fee"
import { Receipt, ArrowRight } from "lucide-react";
import FormSection from "./FormSection";
import NoDataSection from "./NoDataSection";
import { SetStateAction, useState } from "react";
import EditClassFee from "./EditClassFee";

type Props = {
    classesFee : ClassFeeData[] | null;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
    fetchClassFees: () => void;
}

export default function ShowClassesFee({classesFee, setLoading, fetchClassFees} : Props){
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassFeeData>({classId: '', fee: 0});

    const openDialog = (classFee: ClassFeeData) => {
        setSelectedClass(classFee);
        setShowEditDialog(true);
    }

    const closeDialog = () => {
        setShowEditDialog(false);
    }

    return(
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
            {classesFee && classesFee.length === 0 ? (
                <NoDataSection />
            ) : (
                <FormSection title="All Admins" icon={<Receipt />} margin={false} >
                    <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
                        <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                <tr>
                                    <th className="px-6 py-4">Class</th>
                                    <th className="px-6 py-4">Fee (Rs.)</th>
                                    <th className="px-1 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-center">
                                {classesFee && classesFee.map((data, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">{data.classId}</td>
                                        <td className="px-6 py-4">{data.fee}</td>
                                        <td className="px-1 py-4 cursor-pointer" onClick={() => openDialog(data)}>{<ArrowRight size={12} />}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </FormSection >
            )}

            {showEditDialog && (
                <EditClassFee classFeeData={selectedClass} setClassFeeData={setSelectedClass} closeDialog={closeDialog} setLoading={setLoading} fetchClassFees = {fetchClassFees} />
            )}
        </div >
    )
}