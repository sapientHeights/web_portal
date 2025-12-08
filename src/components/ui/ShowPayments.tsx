import { BadgeIndianRupee, Delete, Download, Loader, SquarePen, X } from "lucide-react";
import FormSection from "./FormSection";
import Button from "./Button";
import { SetStateAction, useEffect, useState } from "react";
import { FeeData } from "@/types/fee";
import toast from "react-hot-toast";
import FeePaymentUpdateDialog from "./FeePaymentUpdateDialog";

type StudentPayment = {
    sessionId: string;
    sId: string;
    classId: string;
    section: string;
    amount: string;
    paymentDate: string;
    paymentMode: string;
    remark: string;
    studentName: string;
}

type Props = {
    selectedStd: FeeData | null;
    setShowPayments: React.Dispatch<SetStateAction<boolean>>;
    getFeeData: () => void;
}

export default function ShowPayments({ selectedStd, setShowPayments, getFeeData }: Props) {
    const [paymentsData, setPaymentsData] = useState<StudentPayment[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
    const [showPaymentUpdate, setShowPaymentUpdate] = useState(false);

    const fetchStdPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getStdPayments.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stdData: selectedStd
                }),
            });

            const data = await res.json();
            if (!data.error) {
                setPaymentsData(data.paymentsData);
            }
            else {
                setPaymentsData(null);
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
        if (paymentsData === null) fetchStdPayments();
    }, [])

    const deletePaymentToast = (payment: StudentPayment) => {
        setSelectedPayment(payment);
        toast.custom((t) => (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4 w-[320px] text-center animate-slide-in">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Delete Payment?</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to delete this payment? This action is permanent.
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition"
                        onClick={() => {
                            deletePayment(payment);
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

    const deletePayment = async (payment: StudentPayment) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteStdPayment.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stdPaymentData: payment
                }),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Payment Deleted");

                fetchStdPayments();
                getFeeData();
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

    const showUpdateDialog = (payment: StudentPayment) => {
        setSelectedPayment(payment);
        setShowPaymentUpdate(true);
    }

    const numberToWords = (num: number) : string => {
        const a = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"
        ];

        const b = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
        ];

        const inWords = (n: number) : string => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
            if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
            if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
            if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
            return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
        }

        return inWords(num) || "Zero";
    }


    const downloadReceipt = async (payment: StudentPayment) => {
        setLoading(true);
        const date = payment.paymentDate;
        const amount = payment.amount;
        const studentName = selectedStd?.studentName || payment.sId;
        const amountInWords = numberToWords(Number(payment.amount));
        const classId = payment.classId;
        const paymentMethod = payment.paymentMode;
        const paymentPurpose = '';

        const data = {
            date, amount, studentName, amountInWords, classId, paymentMethod, paymentPurpose
        };

        try {
            const response = await fetch('/api/generateReceipt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const blob = await response.blob();

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const fileName = `${selectedStd?.studentName || payment.sId}_${payment.classId}_${payment.paymentDate}_${payment.amount}_receipt.pdf`;

            link.download = fileName;
            link.click();

            toast.success("Receipt saved successfully");
        }
        catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate receipt");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-10 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
                <FormSection title="Student Payments" icon={<BadgeIndianRupee />} margin={false} >
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
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Mode</th>
                                        <th className="px-1 py-4"></th>
                                        <th className="px-1 py-4"></th>
                                        <th className="px-1 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-center">
                                    {(paymentsData === null || paymentsData.length === 0) && (
                                        <tr>
                                            <td className="px-6 py-4" colSpan={4}>No Data available</td>
                                        </tr>
                                    )}
                                    {paymentsData && paymentsData.length > 0 && paymentsData.map((data, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">{index + 1}</td>
                                            <td className="px-6 py-4">{data.amount}</td>
                                            <td className="px-6 py-4">{data.paymentDate}</td>
                                            <td className="px-6 py-4">{data.paymentMode}</td>
                                            <td className="px-2 py-4 text-green-500 cursor-pointer" onClick={() => downloadReceipt(data)}>{<Download size={12} />}</td>
                                            <td className="px-2 py-4 text-blue-500 cursor-pointer" onClick={() => showUpdateDialog(data)}>{<SquarePen size={12} />}</td>
                                            <td className="px-2 py-4 text-red-500 cursor-pointer" onClick={() => deletePaymentToast(data)}>{<Delete size={12} />}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </FormSection >
                <div className="mt-4">
                    <Button text="Close" icon={<X />} onClick={() => setShowPayments(false)} />
                </div>
            </div>

            {showPaymentUpdate && (
                <FeePaymentUpdateDialog selectedFeePayment={selectedPayment} setSelectedFeePayment={setSelectedPayment} setShowPaymentUpdate={setShowPaymentUpdate} setLoading={setLoading} stdFee={selectedStd} fetchStdPayments={fetchStdPayments} getFeeData={getFeeData} />
            )}
        </div>
    )
}