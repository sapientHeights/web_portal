'use client';

import Button from "@/components/ui/Button";
import Footer from "@/components/ui/Footer";
import FormFooterActions from "@/components/ui/FormFooterActions";
import FormSection from "@/components/ui/FormSection";
import FullPageLoader from "@/components/ui/FullPageLoader";
import Header from "@/components/ui/Header";
import NoDataSection from "@/components/ui/NoDataSection";
import SelectField from "@/components/ui/SelectField";
import FeeTable from "@/components/ui/FeeTable";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { useSessions } from "@/hooks/useSessions";
import { Receipt, School, StepBack, GraduationCap, FileChartColumnIncreasing, CalendarDays, CalendarSearch, TrendingUpDown, ClipboardList, IndianRupee, Banknote, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FeeUpdateDialog from "@/components/ui/FeeUpdateDialog";
import { FeeData, StudentPaymentReport } from "@/types/fee";
import InputField from "@/components/ui/InputField";
import ShowPaymentsReport from "@/components/ui/ShowPaymentsReport";

export default function FeeManagement() {
    const router = useRouter();
    const { user } = useUser();

    const initialAcademicData = {
        session: "", class: "", section: ""
    }

    const [academicSelection, setAcademicSelection] = useState(initialAcademicData);

    const { classes, isLoading: classesLoading } = useClasses();
    const { sections, isLoading: sectionsLoading } = useSections(academicSelection.class);
    const { sessions, isLoading: sessionsLoading } = useSessions();

    const [category, setCategory] = useState('feeMaster');
    const [subCategory, setSubCategory] = useState('');
    const [noData, setNoData] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);
    const [feeData, setFeeData] = useState<FeeData[]>([]);
    const [updateFee, setUpdateFee] = useState(false);
    const [selectedStd, setSelectedStd] = useState<FeeData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<FeeData[]>([]);

    const [feePaymentsData, setFeePaymentsData] = useState<StudentPaymentReport[]>([]);
    const [filteredFeePaymentsData, setFilteredFeePaymentsData] = useState<StudentPaymentReport[]>([]);
    const [date, setDate] = useState('');

    const [sessionId, setSessionId] = useState('');
    const [month, setMonth] = useState('');

    useEffect(() => {
        if(searchTerm === ''){
            if(category === 'feeReport'){
                setFilteredFeePaymentsData(feePaymentsData);
            }
            else{
                setFilteredData(feeData);
            }
        }
        else{
            if(category === 'feeReport'){
                const paymentsSearch = feePaymentsData.filter((data) => data.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
                setFilteredFeePaymentsData(paymentsSearch);
            }
            else{
                const searchedData = feeData.filter((data) => data.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
                setFilteredData(searchedData);
            }
        }
    }, [searchTerm])

    useEffect(() => {
        setNoData(true);
    }, [academicSelection])

    useEffect(() => {
        console.log("Fetched Data");
        console.log(feeData);
        console.log("Filtered Data - ");
        console.log(filteredData);
    }, [filteredData])

    const goBack = () => {
        router.back();
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setSearchTerm(value);
    }

    const handleCategoryClick = (category: string) => {
        setNoData(true);
        setCategory(category);
        if(category === 'feeReport'){
            setSubCategory('daily');
        }
    }

    const handleSubCategoryClick = (subCategory: string) => {
        setNoData(true);
        setSubCategory(subCategory);
    }

    const reset = () => {
        setNoData(true);
        setAcademicSelection(initialAcademicData);
        setDate('');
        toast.success("Fields cleared");
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAcademicSelection(prev => ({ ...prev, [name]: value }));
    };

    const handleReportFieldsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        if(name === 'date'){
            setDate(value);
        }

        if(name === 'sessionId'){
            setSessionId(value);
        }

        if(name === 'month'){
            setMonth(value);
        }
    }

    const getFeeData = async() => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getStudentsFeeData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: academicSelection.session,
                    classId: academicSelection.class,
                    section: academicSelection.section
                }),
            });

            const data = await res.json();
            if (!data.error) {
                setNoData(false);
                setFeeData(data.feeData);
                setFilteredData(data.feeData);
                setSearchTerm('');
            }
            else {
                setNoData(true);
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

    const getFeeReportData = async () => {
        try {
            const fileName = subCategory === 'daily' ? 'getFeePaymentsByDate.php' : 'getFeePaymentsByMonth.php';
            const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
            let dataToSend = {}
            
            if(subCategory === 'daily'){
                dataToSend = {
                    date: date
                }
            }

            if(subCategory === 'monthly'){
                dataToSend = {
                    sessionId: sessionId,
                    month: monthNumber
                }
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${fileName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await res.json();
            if (!data.error) {
                setNoData(false);
                setFeePaymentsData(data.feePaymentsData);
                setFilteredFeePaymentsData(data.feePaymentsData);
                setSearchTerm('');
            }
            else {
                setNoData(true);
                toast.error("Failed to fetch Payments Data");
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPageLoading(true);

        if (category === 'feePaid' || category === 'feeMaster') {
            const existingData = feeData.find((data) => data.sessionId === academicSelection.session && data.classId === academicSelection.class && data.section === academicSelection.section);
            if (existingData) {
                setNoData(false);
                setPageLoading(false);
                return;
            }
        }

        if (category === 'feeReport') {
            getFeeReportData();
        }
        else{
            getFeeData();
        }
    }

    const calCashAmount = () => {
        let sum = 0;
        feePaymentsData.forEach(data => {
            if(data.paymentMode === 'Cash'){
                sum += Number(data.amount);
            }
        })

        return sum;
    }

    const calOnlineAmount = () => {
        let sum = 0;
        feePaymentsData.forEach(data => {
            if(data.paymentMode === 'UPI' || data.paymentMode === 'Card'){
                sum += Number(data.amount);
            }
        })

        return sum;
    }

    const calTotalAmount = () => {
        let sum = 0;
        feePaymentsData.forEach(data => {
            sum += Number(data.amount);
        })

        return sum;
    }

    const months = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "long" })
    );

    const isLoading = pageLoading || classesLoading || sectionsLoading || sessionsLoading;
    if (isLoading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6 relative">
            {/* Back Button */}
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />

            {/* User Info */}
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

            {/* Header */}
            <Header title='Sapient Heights' info='Fees Management Portal for Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button icon={<GraduationCap />} text="Fee Master" onClick={() => handleCategoryClick('feeMaster')} setGreen={category === 'feeMaster'} />
                    <Button icon={<Receipt />} text="Fee Paid" onClick={() => handleCategoryClick('feePaid')} setGreen={category === 'feePaid'} />
                    <Button icon={<FileChartColumnIncreasing />} text="Fee Collection Report" onClick={() => handleCategoryClick('feeReport')} setGreen={category === 'feeReport'} />
                </div>
            </div>

            {category === 'feeReport' && (
                <div className="max-w-2xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                    <FormSection icon={<TrendingUpDown />} title="Select Payments Frequency" margin={false} >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button icon={<CalendarDays />} text="Daily" onClick={() => handleSubCategoryClick('daily')} setGreen={subCategory === 'daily'} />
                        <Button icon={<CalendarSearch />} text="Monthly" onClick={() => handleSubCategoryClick('monthly')} setGreen={subCategory === 'monthly'} />
                    </div>
                    </FormSection>
                </div>
            )}

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <form onSubmit={handleSubmit}>
                    <FormSection icon={<School size={18} />} title={category !== 'feeReport' ? "Academic Selections" : "Report Type Selections"} margin={false}>
                        {category !== 'feeReport' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SelectField label="Session" name="session" value={academicSelection.session} onChange={handleChange} options={sessions} />
                                <SelectField label="Class" name="class" value={academicSelection.class} onChange={handleChange} options={classes} />
                                <SelectField label="Section" name="section" value={academicSelection.section} onChange={handleChange} options={sections} />
                            </div>
                        )}

                        {category === 'feeReport' && (
                            <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {subCategory === 'daily' && (
                                    <InputField label="Select Date" name="date" value={date} onChange={handleReportFieldsChange} type="date" />
                                )}
                                {subCategory === 'monthly' && (
                                    <>
                                    <SelectField label="Select Session" name="sessionId" value={sessionId} options={sessions} onChange={handleReportFieldsChange} />
                                    <SelectField label="Select Month" name="month" value={month} options={months} onChange={handleReportFieldsChange} />
                                    </>
                                )}
                            </div>
                            </>
                        )}
                        
                        {category === 'feeReport' ? (
                            <FormFooterActions primaryLabel={'Get Fee Report'} reset={reset} />
                        ) : (
                            <FormFooterActions primaryLabel={'Get Fee Data'} reset={reset} />
                        )}
                    </FormSection>
                </form>
            </div>

            {noData === false && category === 'feeReport' && (
                <div className="max-w-5xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10 md:p-10">
                    <FormSection icon={<ClipboardList />} title="Collections" margin={false}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="max-w-md bg-green-600 text-white rounded-4xl shadow-xl p-6 md:p-10">
                                <div className="flex flex-row justify-between items-center gap-2">
                                    <span className=""><CreditCard size={40} /></span>
                                    <p>Online Collection:</p>
                                    <h3 className="text-2xl">{calOnlineAmount()}</h3>
                                </div>
                            </div>
                            <div className="max-w-md bg-green-600 text-white rounded-4xl shadow-xl p-6 md:p-10">
                                <div className="flex flex-row justify-between items-center gap-2">
                                    <span className=""><Banknote size={40} /></span>
                                    <p>Cash Collection:</p>
                                    <h3 className="text-2xl">{calCashAmount()}</h3>
                                </div>
                            </div>
                            <div className="max-w-md bg-green-600 text-white rounded-4xl shadow-xl p-6 md:p-10">
                                <div className="flex flex-row justify-between items-center gap-2">
                                    <span className=""><IndianRupee size={40} /></span>
                                    <p>Total Amount:</p>
                                    <h3 className="text-2xl">{calTotalAmount()}</h3>
                                </div>
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10">
                <FormSection icon={<Receipt size={18} />} title={category !== 'feeReport' ? "Session Fees" : "Fee Payments"} margin={false}>
                    {noData ? (
                        <NoDataSection />
                    ) : (
                        <>
                        <div className="mb-8">
                            <InputField label="Search by Name" name="search" value={searchTerm} onChange={handleSearchChange} />
                        </div>
                        {category === 'feeReport' ? (
                            <ShowPaymentsReport feePaymentsData = {filteredFeePaymentsData} subCategory={subCategory} />
                        ) : (
                            <FeeTable feeData={filteredData} category={category} setUpdateFee={setUpdateFee} setSelectedStd={setSelectedStd} getFeeData={getFeeData} />
                        )}
                        </>   
                        
                    )}
                </FormSection>
            </div>

            {updateFee && (
                <FeeUpdateDialog category={category} setUpdateFee={setUpdateFee} selectedStd={selectedStd} setSelectedStd={setSelectedStd} setPageLoading={setPageLoading} getFeeData={getFeeData} />
            )}

            <Footer />
        </div>
    )
}