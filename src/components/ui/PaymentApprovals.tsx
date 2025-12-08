'use client';

import { useEffect, useState } from "react";
import NoDataSection from "./NoDataSection";
import toast from "react-hot-toast";
import FullPageLoader from "./FullPageLoader";
import FormSection from "./FormSection";
import { Loader, Signature } from "lucide-react";
import InputField from "./InputField";

type PaymentVerification = {
    pId: string;
    sessionId: string;
    sId: string;
    studentName: string;
    classId: string;
    section: string;
    amount: string;
    paymentDate: string;
    paymentMode: string;
    transactionId: string;
    status: string;
}

export default function PaymentApprovals() {
    const [paymentVerifications, setPaymentVerifications] = useState<PaymentVerification[]>([]);
    const [filteredPayVerifications, setFilteredPayVerifications] = useState(paymentVerifications);
    const [noData, setNoData] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageLoading, setPageLoading] = useState(false);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchPaymentsSubmission = async () => {
        setPageLoading(true);
        try {
            const res = await fetch(
                `${BACKEND_URL}/getPendingPaySubmissions.php`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const data = await res.json();

            if (!data.error) {
                const sortedData = data.paymentsData.sort((a: PaymentVerification, b: PaymentVerification) => a.studentName.localeCompare(b.studentName));
                setPaymentVerifications(sortedData);
                setFilteredPayVerifications(sortedData);
            } else {
                setNoData(true);
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

    useEffect(() => {
        fetchPaymentsSubmission();
    }, [])

    useEffect(() => {
        const searchedData = paymentVerifications.filter((data) => (data.studentName.toLowerCase().includes(searchTerm.toLowerCase())) || (data.transactionId.toLowerCase().includes(searchTerm.toLowerCase())));
        setFilteredPayVerifications(searchedData);
    }, [searchTerm])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchTerm(value);
    }

    const handleApprove = async (id: string) => {
        setPageLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/approvePaymentSubmission.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pId: id
                })
            });

            const data = await res.json();
            if (data.error) {
                toast.error("Some error occurred");
            }
            else {
                toast.success("Request approved");
                setFilteredPayVerifications([]);
                setPaymentVerifications([]);
                fetchPaymentsSubmission();
            }
        }
        catch (e) {
            toast.error("Some error occurred");
        }
        finally {
            setPageLoading(false);
        }
    }

    const handleDecline = async (id: string) => {
        setPageLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/declinePaymentSubmission.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pId: id
                })
            });

            const data = await res.json();
            if (data.error) {
                toast.error("Some error occurred");
            }
            else {
                toast.success("Approval request declined");
                setFilteredPayVerifications([]);
                setPaymentVerifications([]);
                fetchPaymentsSubmission();
            }
        }
        catch (e) {
            toast.error("Some error occurred");
        }
        finally {
            setPageLoading(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10">
            <FormSection title="Payment Submissions" icon={<Signature />} margin={false}>
                {pageLoading && (
                    <div className="flex items-center justify-center">
                        <Loader className="animate-spin text-black text-9xl" />
                    </div>
                )}

                {!pageLoading && (
                    <>
                        <div className="mb-8">
                            <InputField label="Search by Name or Transaction Id" name="search" value={searchTerm} onChange={handleSearchChange} disabled={noData} />
                        </div>

                        <div className="overflow-auto max-h-[600px]">
                            <table className="min-w-[600px] w-full text-sm text-left text-gray-800">
                                <thead className="bg-gray-100 sticky top-0 z-20 text-xs uppercase text-gray-600 tracking-wider text-center">
                                    <tr>
                                        <th className="px-4 py-3">S.No.</th>
                                        <th className="px-4 py-3">Session</th>
                                        <th className="px-4 py-3">Student ID</th>
                                        <th className="px-4 py-3">Student Name</th>
                                        <th className="px-4 py-3">Transaction Id</th>
                                        <th className="px-4 py-3">Payment Date</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white text-center">
                                    {filteredPayVerifications && filteredPayVerifications.length === 0 && (
                                        <tr className="p-10">
                                            <td colSpan={7}><NoDataSection /></td>
                                        </tr>
                                    )}
                                    {filteredPayVerifications && filteredPayVerifications.map((data, index) => {
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors text-black">
                                                <td className="px-4 py-6">{index + 1}</td>
                                                <td className="px-4 py-6">{data.sessionId}</td>
                                                <td className="px-4 py-6">{data.sId}</td>
                                                <td className="px-4 py-6">{data.studentName}</td>
                                                <td className="px-4 py-6">{data.transactionId}</td>
                                                <td className="px-4 py-6">{data.paymentDate}</td>
                                                <td className="px-4 py-6 flex items-center gap-3 justify-center">
                                                    <button
                                                        onClick={() => handleApprove(data.pId)}
                                                        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold cursor-pointer"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        onClick={() => handleDecline(data.pId)}
                                                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold cursor-pointer"
                                                    >
                                                        Decline
                                                    </button>
                                                </td>

                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </FormSection>
        </div>
    )
}