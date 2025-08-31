'use client';

import { BadgeIndianRupee, Banknote, Camera, FileText, IdCard, ImagePlus, Landmark, ScrollText, StepBack, User } from "lucide-react";
import Header from "@/components/ui/Header";
import Button from "@/components/ui/Button";
import UserInfo from "@/components/ui/UserInfo";
import { useRouter } from "next/navigation";
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import RadioGroup from "@/components/ui/RadioGroup";
import FileUpload from "@/components/ui/FileUpload";
import Footer from "@/components/ui/Footer";
import { useState } from "react";
import FormFooterActions from "@/components/ui/FormFooterActions";
import { useUser } from "@/context/UserContext";

type TeacherDocs = {
    teacherPic: File | null; 
    birthCertificate: File | null; 
    tAadhar: File | null;
    casteCertificate: File | null;
    passbook: File | null;
    samagra: File | null;
}

export default function TeacherRegistration() {
    const router = useRouter();
    const {user} = useUser();

    const [formData, setFormData] = useState({
        teacherName: "", dob: "", gender: "", aadharNumber: "", caste: "", samagraId: "", address: "", fatherName: "", motherName: "",
        fatherMobile: "", motherMobile: "", fatherOccupation: "", studentClass: "", section: "", accountNumber: "", bankName: "",
        branchName: "", ifscCode: ""
    });

    const [documentsData, setDocumentsData] = useState<TeacherDocs>({
        teacherPic: null, birthCertificate: null, tAadhar: null, casteCertificate: null, passbook: null, samagra: null
    });

    const goBack = () => {
        router.back();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const file = e.target.files?.[0];

        if (file) {
            setDocumentsData((prevData) => ({
                ...prevData,
                [name]: file
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Student registration submitted successfully!");
        console.log(formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6">
            {/* Back Button */}
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />

            {/* User Info */}
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

            {/* Header */}
            <Header title='Sapient Heights' info='Add a new teacher to Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    {/* Section Component */}
                    <FormSection icon={<User size={18} />} title="Personal Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Teacher Name" name="teacherName" value={formData.teacherName} onChange={handleChange} required />
                            <InputField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" required />
                            <RadioGroup label="Gender" name="gender" options={["male", "female", "other"]} value={formData.gender} onChange={handleChange} required />
                            <InputField label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} maxLength={12} required />
                            <SelectField label="Caste" name="caste" value={formData.caste} onChange={handleChange} options={["General", "OBC", "SC", "ST", "Other"]} />
                            <InputField label="Samagra ID" name="samagraId" value={formData.samagraId} onChange={handleChange} />
                            <div className="md:col-span-2">
                                <TextAreaField label="Address" name="address" value={formData.address} onChange={handleChange} required />
                            </div>
                        </div>
                    </FormSection>

                    <FormSection icon={<Banknote size={18} />} title="Bank Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <InputField label="Bank Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required />
                            <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} required />
                            <InputField label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} required />
                            <InputField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required />
                        </div>
                    </FormSection>

                    <FormSection icon={<FileText size={18} />} title="Document Upload">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FileUpload label="Teacher's Photo" name="teacherPic" onChange={handleFileChange} icon={<Camera />} files={documentsData} required />
                            <FileUpload label="Birth Certificate" name="birthCertificate" onChange={handleFileChange} icon={<BadgeIndianRupee />} files={documentsData} required />
                            <FileUpload label="Teacher's Aadhar Card" name="tAadhar" onChange={handleFileChange} icon={<IdCard />} files={documentsData} required />
                            <FileUpload label="Caste Certificate" name="casteCertificate" onChange={handleFileChange} icon={<ScrollText />} files={documentsData} required />
                            <FileUpload label="Bank Passbook Front Page" name="passbook" onChange={handleFileChange} icon={<Landmark />} files={documentsData} required />
                            <FileUpload label="Samagra ID Document" name="samagra" onChange={handleFileChange} icon={<ImagePlus />} files={documentsData} required />
                        </div>
                    </FormSection>

                    <FormFooterActions primaryLabel={'Register Teacher'} />
                </form>
            </div>
            <Footer />
        </div>
    )
}