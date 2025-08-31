'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Users, BookOpen, Banknote, FileText, ImagePlus, Camera, BadgeIndianRupee, Landmark, IdCard, ScrollText, StepBack } from "lucide-react";
import toast from "react-hot-toast";
import Header from "@/components/ui/Header";
import Button from "@/components/ui/Button";
import UserInfo from "@/components/ui/UserInfo";
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import RadioGroup from "@/components/ui/RadioGroup";
import FileUpload from "@/components/ui/FileUpload";
import Footer from "@/components/ui/Footer";
import FullPageLoader from "@/components/ui/FullPageLoader";
import FormFooterActions from "@/components/ui/FormFooterActions";
import { useUser } from "@/context/UserContext";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import type { StudentData, StudentDocs } from "@/types/student";
import { useSessions } from "@/hooks/useSessions";


const initialFormData : StudentData = {
    studentName: "", dob: "", gender: "", aadharNumber: "", caste: "", samagraId: "", studentMobile: "", emailId: "", address: "", fatherName: "",
    motherName: "", fatherMobile: "", motherMobile: "", fatherOccupation: "", sessionId: "", studentClass: "", section: "",
    accountNumber: "", bankName: "", branchName: "", ifscCode: ""
};

const initialDocsData : StudentDocs = {
    studentPic: null, fatherPic: null, motherPic: null, birthCertificate: null, sAadhar: null, fAadhar: null, mAadhar: null,
    casteCertificate: null, passbook: null, samagra: null
}

export default function StudentRegistration() {
    const router = useRouter();
    const {user} = useUser();

    const [formData, setFormData] = useState<StudentData>(initialFormData);
    const [documentsData, setDocumentsData] = useState<StudentDocs>(initialDocsData);

    const [pageLoading, setPageLoading] = useState(false);
    const { classes, isLoading: classesLoading } = useClasses();
    const { sections, isLoading: sectionsLoading } = useSections(formData.studentClass);
    const { sessions, isLoading: sessionsLoading } = useSessions();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if(name === "aadharNumber" || name === "fatherMobile" || name === "motherMobile" || name === "studentMobile"){
            let currentValue = value;
            if(value.length > 1){
                currentValue = value[value.length - 1].toLowerCase();
            }
            if(currentValue >= 'a' && currentValue <= 'z'){
                toast.error("Please enter number only");
                return;
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const file = e.target.files?.[0];

        if (file) {
            const maxSizeInBytes = 3 * 1024 * 1024; //3 MB
            if (file.size > maxSizeInBytes) {
                toast.error("File Size exceeded 3MB");
                return;
            }

            setDocumentsData((prevData) => ({
                ...prevData,
                [name]: file
            }));
        }
    };

    const goBack = () => {
        router.back();
    }

    const reset = () => {
        if(formData === initialFormData && documentsData === initialDocsData){
            toast.error("Nothing to clear.");
            return;
        }
        setFormData(initialFormData);
        setDocumentsData(initialDocsData);
        toast.success("Form fields cleared.")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isDataValid = Object.values(formData).every((value) => value !== "");
        const isDocsValid = Object.values(documentsData).every((document) => document !== null);

        if (!isDataValid || !isDocsValid) {
            toast.error("Please fill all the required data");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const enteredDate = new Date(formData['dob']);
        enteredDate.setHours(0, 0, 0, 0);
        if(enteredDate > today){
            toast.error("Date cannot be in the future");
            return;
        }

        const dataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
            const value = formData[key as keyof StudentData];
            dataToSend.append(key, value);
        })
        Object.keys(documentsData).forEach((key) => {
            const file = documentsData[key as keyof StudentDocs];
            if(file) dataToSend.append(key, file);
        })

        try{
            setPageLoading(true);
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const res = await fetch(`${backendUrl}/registerStudent.php`, {
                method: 'POST',
                body: dataToSend
            })

            const data = await res.json();
            if(data.error){
                toast.error("Failed to register student");
            }
            else{
                reset();
                toast.success("Student Registered successfully");
            }
        }
        catch(err){
            toast.error("Failed to register student");
            console.error(err);
        }
        finally{
            setPageLoading(false);
        }
    };

    const isLoading = sessionsLoading || classesLoading || sectionsLoading || pageLoading;
    if (isLoading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6">
            {/* Back Button */}
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />

            {/* User Info */}
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />

            {/* Header */}
            <Header title='Sapient Heights' info='Add new student to Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    {/* Section Component */}
                    <FormSection icon={<User size={18} />} title="Personal Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} required maxLength={75} />
                            <InputField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" required />
                            <RadioGroup label="Gender" name="gender" options={["male", "female", "other"]} value={formData.gender} onChange={handleChange} required />
                            <InputField label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} maxLength={12} required />
                            <SelectField label="Caste" name="caste" value={formData.caste} onChange={handleChange} required options={["General", "OBC", "SC", "ST", "Other"]} />
                            <InputField label="Samagra ID" name="samagraId" value={formData.samagraId} onChange={handleChange} maxLength={9} required />
                            <InputField label="Student's Mobile Number" name="studentMobile" value={formData.studentMobile} onChange={handleChange} maxLength={10} minLength={10} required />
                            <InputField label="Email ID" name="emailId" value={formData.emailId} onChange={handleChange} type="email" maxLength={255} required />
                            <div className="md:col-span-2">
                                <TextAreaField label="Address" name="address" value={formData.address} onChange={handleChange} required maxLength={100} />
                            </div>
                        </div>
                    </FormSection>

                    <FormSection icon={<Users size={18} />} title="Family Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required maxLength={75} />
                            <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} required maxLength={75} />
                            <InputField label="Father's Mobile Number" name="fatherMobile" value={formData.fatherMobile} onChange={handleChange} required maxLength={10} minLength={10} />
                            <InputField label="Mother's Mobile Number" name="motherMobile" value={formData.motherMobile} onChange={handleChange} required maxLength={10} minLength={10} />
                            <InputField label="Father's Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} required maxLength={100} />
                        </div>
                    </FormSection>

                    <FormSection icon={<BookOpen size={18} />} title="Academic Information">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SelectField label="Session" name="sessionId" value={formData.sessionId} onChange={handleChange} options={sessions} required />
                            <SelectField
                                label="Class"
                                name="studentClass"
                                value={formData.studentClass}
                                onChange={handleChange}
                                options={classes}
                                required
                            />
                            <SelectField label="Section" name="section" value={formData.section} onChange={handleChange} options={sections} required disabled={formData.studentClass === ""} />
                        </div>
                    </FormSection>

                    <FormSection icon={<Banknote size={18} />} title="Bank Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <InputField label="Bank Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required maxLength={30} />
                            <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} required maxLength={50} />
                            <InputField label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} required maxLength={100} />
                            <InputField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required maxLength={11} />
                        </div>
                    </FormSection>

                    <FormSection icon={<FileText size={18} />} title="Document Upload">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FileUpload label="Student's Photo" name="studentPic" onChange={handleFileChange} icon={<Camera />} files={documentsData} required />
                            <FileUpload label="Father's Photo" name="fatherPic" onChange={handleFileChange} icon={<Camera />} files={documentsData} required />
                            <FileUpload label="Mother's Photo" name="motherPic" onChange={handleFileChange} icon={<Camera />} files={documentsData} required />
                            <FileUpload label="Birth Certificate" name="birthCertificate" onChange={handleFileChange} icon={<BadgeIndianRupee />} files={documentsData} required />
                            <FileUpload label="Student's Aadhar Card" name="sAadhar" onChange={handleFileChange} icon={<IdCard />} files={documentsData} required />
                            <FileUpload label="Father's Aadhar Card" name="fAadhar" onChange={handleFileChange} icon={<IdCard />} files={documentsData} required />
                            <FileUpload label="Mother's Aadhar Card" name="mAadhar" onChange={handleFileChange} icon={<IdCard />} files={documentsData} required />
                            <FileUpload label="Caste Certificate" name="casteCertificate" onChange={handleFileChange} icon={<ScrollText />} files={documentsData} required />
                            <FileUpload label="Bank Passbook Front Page" name="passbook" onChange={handleFileChange} icon={<Landmark />} files={documentsData} required />
                            <FileUpload label="Samagra ID Document" name="samagra" onChange={handleFileChange} icon={<ImagePlus />} files={documentsData} required />
                        </div>
                    </FormSection>

                    <FormFooterActions primaryLabel={'Register Student'} reset={reset} />
                </form>
            </div>
            <Footer />
        </div>
    );
};
