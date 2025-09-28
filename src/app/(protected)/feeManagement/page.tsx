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
import { Receipt, School, StepBack, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import FeeUpdateDialog from "@/components/ui/FeeUpdateDialog";
import { FeeData } from "@/types/fee";

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
    const [noData, setNoData] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);
    const [feeData, setFeeData] = useState<FeeData[]>([]);
    const [updateFee, setUpdateFee] = useState(false);
    const [selectedStd, setSelectedStd] = useState<FeeData | null>(null);

    const goBack = () => {
        router.back();
    }

    const handleCategoryClick = (category: string) => {
        setNoData(true);
        setCategory(category);
    }

    const reset = () => {
        setNoData(true);
        setAcademicSelection(initialAcademicData);
        toast.success("Fields cleared");
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAcademicSelection(prev => ({ ...prev, [name]: value }));
    };

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
            setPageLoading(false);
            return;
        }

        getFeeData();
    }

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
                    {/* <Button icon={<FileChartColumnIncreasing />} text="Fee Collection Report" onClick={() => handleCategoryClick('feeReport')} setGreen={category === 'feeReport'} /> */}
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <form onSubmit={handleSubmit}>
                    <FormSection icon={<School size={18} />} title="Academic Selections" margin={false}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SelectField label="Session" name="session" value={academicSelection.session} onChange={handleChange} options={sessions} />
                            {category !== 'feeReport' && (
                                <>
                                    <SelectField label="Class" name="class" value={academicSelection.class} onChange={handleChange} options={classes} />
                                    <SelectField label="Section" name="section" value={academicSelection.section} onChange={handleChange} options={sections} />
                                </>
                            )}
                        </div>
                        {category === 'feeReport' ? (
                            <FormFooterActions primaryLabel={'Get Fee Report'} reset={reset} />
                        ) : (
                            <FormFooterActions primaryLabel={'Get Fee Data'} reset={reset} />
                        )}
                    </FormSection>
                </form>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10">
                <FormSection icon={<Receipt size={18} />} title="Session Fees" margin={false}>
                    {noData ? (
                        <NoDataSection />
                    ) : (
                        <FeeTable feeData={feeData} category={category} setUpdateFee={setUpdateFee} setSelectedStd={setSelectedStd} />
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