import { Receipt } from "lucide-react";
import FormSection from "./FormSection";
import InputField from "./InputField";
import FormFooterActions from "./FormFooterActions";
import { ClassFeeData } from "@/types/fee";
import { SetStateAction } from "react";
import toast from "react-hot-toast";

type Props = {
    classFeeData: ClassFeeData | null;
    setClassFeeData: React.Dispatch<SetStateAction<ClassFeeData>>;
    closeDialog: () => void;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
    fetchClassFees: () => void;
}

export default function EditClassFee({ classFeeData, setClassFeeData, closeDialog, setLoading, fetchClassFees }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setClassFeeData(prev => {
            if (prev === null) {
                return { classId: '', fee: 0 }
            }
            return { ...prev, [name]: value };
        });
    }

    const updateFee = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        if (classFeeData?.fee === 0) {
            toast.error("Fee cannot be zero");
            return;
        }

        const sendData = {
            classFeeData: {
                classId: classFeeData?.classId,
                fee: classFeeData?.fee
            }
        };
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateClassFee.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendData),
            });

            const data = await res.json();
            if (data.error) {
                toast.error(data.message);
            }
            else {
                toast.success('Fee updated successfully');
                fetchClassFees();
                closeDialog();
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
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
                <FormSection title="Edit Class Fee" icon={<Receipt />} margin={false}>
                    <form onSubmit={updateFee}>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField label="Class" name="classId" value={classFeeData ? classFeeData.classId : ''} onChange={handleChange} disabled />
                            <InputField label="Fee" name="fee" value={classFeeData ? classFeeData.fee.toString() : ''} onChange={handleChange} required />
                        </div>
                        <FormFooterActions primaryLabel="Save" cancel={closeDialog} />
                    </form>
                </FormSection>
            </div>
        </div>
    )
}