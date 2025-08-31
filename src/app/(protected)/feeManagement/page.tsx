'use client';

import Button from "@/components/ui/Button";
import Footer from "@/components/ui/Footer";
import FormSection from "@/components/ui/FormSection";
import Header from "@/components/ui/Header";
import SelectField from "@/components/ui/SelectField";
import Table from "@/components/ui/Table";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { Receipt, School, StepBack, GraduationCap, FileChartColumnIncreasing } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function FeeManagement() {
    const router = useRouter();
    const { user } = useUser();

    const [academicSelection, setAcademicSelection] = useState({
        session: "", class: "", section: ""
    });

    const goBack = () => {
        router.back();
    }

    const handleCategoryClick = () => {
        toast("Coming Soon...");
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAcademicSelection(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6">
            {/* Back Button */}
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />

            {/* User Info */}
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

            {/* Header */}
            <Header title='Sapient Heights' info='Fees Management Portal for Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button icon={<GraduationCap />} text="Fee Master" onClick={handleCategoryClick} />
                    <Button icon={<Receipt />} text="Fee Paid" onClick={handleCategoryClick} />
                    <Button icon={<FileChartColumnIncreasing />} text="Fee Collection Report" onClick={handleCategoryClick} />
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <FormSection icon={<School size={18} />} title="Academic Selections" margin={false}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SelectField label="Session" name="session" value={academicSelection.session} onChange={handleChange} options={["2024-25", "2023-2024"]} />
                        <SelectField label="Class" name="class" value={academicSelection.class} onChange={handleChange} options={["7", "8", "9", "10"]} />
                        <SelectField label="Section" name="section" value={academicSelection.section} onChange={handleChange} options={["A", "B", "C", "D"]} />
                    </div>
                </FormSection>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10">
                <FormSection icon={<Receipt size={18} />} title="Session Fees" margin={false}>
                    <Table />
                </FormSection>
            </div>

            <Footer />
        </div>
    )
}