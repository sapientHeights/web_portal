import { BadgeIndianRupee } from "lucide-react"
import FormSection from "./FormSection"
import FormFooterActions from "./FormFooterActions";
import InputField from "./InputField";
import SelectField from "./SelectField";
import TextAreaField from "./TextAreaField";
import { SetStateAction } from "react";
import toast from "react-hot-toast";
import { FeeData } from "@/types/fee";

type StudentPayment = {
    sessionId: string;
    sId: string;
    classId: string;
    section: string;
    amount: string;
    paymentDate: string;
    paymentMode: string;
    remark: string;
}

type Props = {
    selectedFeePayment: StudentPayment | null;
    setSelectedFeePayment: React.Dispatch<SetStateAction<StudentPayment | null>>;
    setShowPaymentUpdate: React.Dispatch<SetStateAction<boolean>>;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
    stdFee: FeeData | null;
    fetchStdPayments: () => void;
    getFeeData: () => void;
}

export default function FeePaymentUpdateDialog({ selectedFeePayment, setSelectedFeePayment, setShowPaymentUpdate, setLoading, stdFee, fetchStdPayments, getFeeData }: Props) {
    if(!selectedFeePayment || !stdFee){
        return;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if(name === 'amount' && parseInt(value) > stdFee.fee){
            toast.error("Invalid Amount");
            return;
        }

        setSelectedFeePayment(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [name]: value
            };
        });
    }

    const handleSubmit = async () => {
        setShowPaymentUpdate(false);
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateStdPayment.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stdFeePayment : selectedFeePayment
                }),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Payment Updated");
                fetchStdPayments();
                getFeeData();
            }
            else {
                toast.error("Some error occurred");
                setShowPaymentUpdate(true);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
            setShowPaymentUpdate(true);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl">
                <form onSubmit={handleSubmit}>
                    <FormSection title={"Update Fee Payment"} icon={<BadgeIndianRupee />} margin={false}>
                        <div className="grid grid-cols-1 gap-5">
                            <InputField label="Payment Date" name="paymentDate" value={selectedFeePayment.paymentDate} onChange={handleChange} type="date" disabled />
                            <div className="grid grid-cols-2 items-center gap-10">
                                <InputField label="Amount" name="amount" value={selectedFeePayment.amount} onChange={handleChange} required />
                                <SelectField label="Payment Mode" name="paymentMode" value={selectedFeePayment.paymentMode} onChange={handleChange} options={['Cash', 'UPI', 'Card']} disabled />
                            </div>
                            <TextAreaField label="Remark" name="remark" value={selectedFeePayment.remark} onChange={handleChange} maxLength={100} />
                        </div>
                        <FormFooterActions primaryLabel="Update" cancel={() => setShowPaymentUpdate(false)} />
                    </FormSection>
                </form>
            </div>
        </div>
    )
}