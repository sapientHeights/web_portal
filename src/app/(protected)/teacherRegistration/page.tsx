'use client';

import { BadgeIndianRupee, Banknote, Camera, FileText, GraduationCap, IdCard, ImagePlus, Landmark, Merge, ScrollText, StepBack, User, Users } from "lucide-react";
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
import { TeacherData, TeacherDocs } from "@/types/teacher";
import toast from "react-hot-toast";
import FullPageLoader from "@/components/ui/FullPageLoader";

const initialFormData: TeacherData = {
    teacherName: "", dob: "", gender: "", aadharNumber: "", caste: "", maritalStatus: "", samagraId: "", teacherMobile: "", emailId: "",
    bloodGroup: "", religion: "", panNumber: "", address: "", fatherName: "", motherName: "", spouseName: "", qualification: "",
    experience: "", empId: "", designation: "", doj: "", accountNumber: "", bankName: "", branchName: "", ifscCode: ""
};

const initialDocsData: TeacherDocs = {
    teacherPic: null, birthCertificate: null, tAadhar: null, casteCertificate: null, passbook: null, samagra: null
}


export default function TeacherRegistration() {
    const router = useRouter();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<TeacherData>(initialFormData);
    const [documentsData, setDocumentsData] = useState<TeacherDocs>(initialDocsData);

    const goBack = () => {
        router.back();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "aadharNumber" || name === "teacherMobile") {
            let currentValue = value;
            if (value.length > 1) {
                currentValue = value[value.length - 1].toLowerCase();
            }
            if (currentValue >= 'a' && currentValue <= 'z') {
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

            if(file.name.length > 100){
                toast.error("File name is too long. Please use a shorter name.");
                return;
            }

            setDocumentsData((prevData) => ({
                ...prevData,
                [name]: file
            }));
        }
    };

    const reset = () => {
        if (formData === initialFormData && documentsData === initialDocsData) {
            toast.error("Nothing to clear.");
            return;
        }
        setFormData(initialFormData);
        setDocumentsData(initialDocsData);
        toast.success("Form fields cleared.")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // const isDataValid = Object.values(formData).every((value) => value !== "");
        // const isDocsValid = Object.values(documentsData).every((document) => document !== null);

        // if (!isDataValid || !isDocsValid) {
        //     toast.error("Please fill all the required data");
        //     return;
        // }

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
            const value = formData[key as keyof TeacherData];
            dataToSend.append(key, value);
        })
        Object.keys(documentsData).forEach((key) => {
            const file = documentsData[key as keyof TeacherDocs];
            if(file) dataToSend.append(key, file);
        })

        try{
            setIsLoading(true);
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const res = await fetch(`${backendUrl}/registerTeacher.php`, {
                method: 'POST',
                body: dataToSend
            })

            const data = await res.json();
            if(data.error){
                toast.error("Failed to register teacher");
            }
            else{
                toast.success("Teacher Registered successfully");
                reset();
            }
        }
        catch(err){
            toast.error("Failed to register teacher");
            console.error(err);
        }
        finally{
            setIsLoading(false);
        }
    };

    if(isLoading){
        return <FullPageLoader />
    }

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
                            <InputField label="Teacher Name" name="teacherName" value={formData.teacherName} onChange={handleChange} required maxLength={75} />
                            <InputField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" required />
                            <RadioGroup label="Gender" name="gender" options={["male", "female", "other"]} value={formData.gender} onChange={handleChange} required />
                            <InputField label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} maxLength={12} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField label="Caste" name="caste" value={formData.caste} onChange={handleChange} options={["General", "OBC", "SC", "ST", "Other"]} required />
                                <SelectField label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} options={["Married", "Unmarried"]} required />
                            </div>
                            <InputField label="Samagra ID" name="samagraId" value={formData.samagraId} onChange={handleChange} maxLength={9} />
                            <InputField label="Teacher's Mobile Number" name="teacherMobile" value={formData.teacherMobile} onChange={handleChange} maxLength={10} minLength={10} required />
                            <InputField label="Email Id" name="emailId" value={formData.emailId} onChange={handleChange} maxLength={255} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
                                <SelectField label="Religion" name="religion" value={formData.religion} onChange={handleChange} options={["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Parsis"]} />
                            </div>
                            <InputField label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} required maxLength={10} />
                            <div className="md:col-span-2">
                                <TextAreaField label="Address" name="address" value={formData.address} onChange={handleChange} maxLength={100} />
                            </div>
                        </div>
                    </FormSection>

                    <FormSection icon={<Users size={18} />} title="Family Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required maxLength={75} />
                            <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} required maxLength={75} />
                            {formData.maritalStatus === 'Married' && <InputField label="Spouse's Name" name="spouseName" value={formData.spouseName} onChange={handleChange} required maxLength={75} />}
                        </div>
                    </FormSection>

                    <FormSection icon={<GraduationCap size={18} />} title="Experience">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Qualification" name="qualification" value={formData.qualification} onChange={handleChange} required maxLength={100}/>
                            <InputField label="Years of Experience" name="experience" value={formData.experience} onChange={handleChange} type="number" required />
                        </div>
                    </FormSection>

                    <FormSection icon={<Merge size={18} />} title="Joining">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Employee Id" name="empId" value={formData.empId} onChange={handleChange} />
                            <SelectField label="Designation" name="designation" value={formData.designation} onChange={handleChange} options={["Principal", "PGT", "TGT", "PRT", "PTI", "Music Teacher", "Peone", "Lower Staff", "Gurd"]} required />
                            <InputField label="Date of Joining" name="doj" value={formData.doj} onChange={handleChange} type="date" required />
                        </div>
                    </FormSection>

                    <FormSection icon={<Banknote size={18} />} title="Bank Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <InputField label="Bank Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} maxLength={30} />
                            <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} maxLength={50} />
                            <InputField label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} maxLength={100} />
                            <InputField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} maxLength={11} />
                        </div>
                    </FormSection>

                    <FormSection icon={<FileText size={18} />} title="Document Upload">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FileUpload label="Teacher's Photo" name="teacherPic" onChange={handleFileChange} icon={<Camera />} files={documentsData} required />
                            <FileUpload label="Birth Certificate" name="birthCertificate" onChange={handleFileChange} icon={<BadgeIndianRupee />} files={documentsData} />
                            <FileUpload label="Teacher's Aadhar Card" name="tAadhar" onChange={handleFileChange} icon={<IdCard />} files={documentsData} required />
                            <FileUpload label="Caste Certificate" name="casteCertificate" onChange={handleFileChange} icon={<ScrollText />} files={documentsData} />
                            <FileUpload label="Bank Passbook Front Page" name="passbook" onChange={handleFileChange} icon={<Landmark />} files={documentsData} />
                            <FileUpload label="Samagra ID Document" name="samagra" onChange={handleFileChange} icon={<ImagePlus />} files={documentsData} />
                        </div>
                    </FormSection>

                    <FormFooterActions primaryLabel={'Register Teacher'} reset={reset} />
                </form>
            </div>
            <Footer />
        </div>
    )
}