'use client';

import { LaptopMinimalCheck } from "lucide-react";
import FormSection from "./FormSection";
import InputField from "./InputField";
import FormFooterActions from "./FormFooterActions";
import toast from "react-hot-toast";
import { FeeData } from "@/types/fee";
import SelectField from "./SelectField";
import TextAreaField from "./TextAreaField";
import { useState } from "react";

type Props = {
    category: string;
    setUpdateFee: React.Dispatch<React.SetStateAction<boolean>>;
    selectedStd: FeeData | null;
    setSelectedStd: React.Dispatch<React.SetStateAction<FeeData | null>>
    setPageLoading: React.Dispatch<React.SetStateAction<boolean>>;
    getFeeData: () => void;
}

export default function FeeUpdateDialog({ category, setUpdateFee, selectedStd, setSelectedStd, setPageLoading, getFeeData }: Props) {
    const [paymentDetails, setPaymentDetails] = useState({
        date: '', mode: '', remark: ''
    });

    if (!selectedStd) {
        return;
    }

    const PaidFee = category === 'feePaid';
    const FeeMaster = category === 'feeMaster';
    const title = PaidFee ? 'Update Paid Fee Amount' : FeeMaster ? 'Update Discount Amount' : 'Update Fee';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'discount' && parseInt(value) > selectedStd.fee) {
            toast.error("Invalid amount");
            return;
        }

        if (name === 'paid' && parseInt(value) > (selectedStd.fee - selectedStd.discount)) {
            toast.error("Invalid amount");
            return;
        }

        if (name === 'date' || name === 'mode' || name === 'remark') {
            if (name === 'date' && new Date(value) > new Date()) {
                toast.error("Invalid date");
                return;
            }

            setPaymentDetails(prev => ({
                ...prev,
                [name]: value
            }));

            return;
        }

        setSelectedStd(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [name]: name === 'paid' || name === 'discount' ? parseInt(value) : value
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (FeeMaster) {
            if ((selectedStd.paid) > (selectedStd.fee - selectedStd.discount)) {
                toast.error("Some fee has already been paid.");
                return;
            }
        }

        const dataToSend = {
            feeData: selectedStd,
            updateDiscount: (FeeMaster),
            paymentDetails
        }

        const toastMessage = FeeMaster ? "Discount Amount Updated" : "Paid Amount updated";

        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateStudentFee.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success(toastMessage);
                getFeeData();
                setUpdateFee(false);
            }
            else {
                toast.error("Failed to fetch Attendance Data");
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally {
            setPageLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl">
                <form onSubmit={handleSubmit}>
                    <FormSection title={title} icon={<LaptopMinimalCheck />} margin={false}>
                        <div className="grid grid-cols-1 gap-5">
                            <InputField label="Student Name" name="studentName" value={selectedStd.studentName} onChange={() => { }} disabled />
                            <InputField label="Fee" name="fee" value={FeeMaster ? selectedStd.fee.toString() : (selectedStd.fee - selectedStd.discount).toString()} onChange={() => { }} disabled />
                            {FeeMaster && (
                                <InputField label="Discount" name="discount" value={selectedStd.discount.toString()} onChange={handleChange} type="number" required />
                            )}

                            {PaidFee && (
                                <>
                                    <InputField label="Paid Amount" name="paid" value={selectedStd.paid.toString()} onChange={handleChange} type="number" required />
                                    <div className="grid grid-cols-2 items-center gap-10">
                                        <InputField label="Payment Date" name="date" value={paymentDetails.date} onChange={handleChange} type="date" required />
                                        <SelectField label="Payment Mode" name="mode" value={paymentDetails.mode} onChange={handleChange} options={['Cash', 'UPI', 'Card']} required />
                                    </div>
                                    <TextAreaField label="Remark" name="remark" value={paymentDetails.remark} onChange={handleChange} maxLength={100} />
                                </>
                            )}
                        </div>
                        <FormFooterActions primaryLabel="Update" cancel={() => setUpdateFee(false)} />
                    </FormSection>
                </form>
            </div>
        </div>
    );
}