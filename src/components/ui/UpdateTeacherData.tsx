import { Loader, User } from "lucide-react";
import FormSection from "./FormSection";
import InputField from "./InputField";
import RadioGroup from "./RadioGroup";
import SelectField from "./SelectField";
import TextAreaField from "./TextAreaField";
import { SetStateAction, useEffect, useState } from "react";
import FormFooterActions from "./FormFooterActions";
import { toast } from "react-hot-toast";
import { TeacherData } from "@/types/teacher";

type Props = {
    teacherData: TeacherData;
    setEdit: React.Dispatch<SetStateAction<boolean>>;
    id: string | null;
    getData: () => Promise<void>;
    closeDialog: () => void;
}

export default function UpdateTeacherData({ teacherData, setEdit, id, getData, closeDialog }: Props) {
    const [tData, setTData] = useState<TeacherData>(teacherData);
    const [pageLoading, setPageLoading] = useState(false);

    useEffect(() => {
        if (!teacherData) return;
        const value = tData.gender === 'm' ? "male" : tData.gender === 'f' ? "female" : "other";
        setTData(prev => ({ ...prev, gender: value }));
    }, [teacherData])

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
        setTData(prev => ({ ...prev, [name]: value }));
    };

    const closeEdit = () => {
        setEdit(false);
    }

    const updateTeacherData = async (e: React.FormEvent) => {
        e.preventDefault();
        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateTeacherData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tData,
                    id
                }),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Data Updated Successfully");
                closeEdit();
                getData();
                closeDialog();
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
            setPageLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full overflow-y-auto max-h-[90vh]">
                {pageLoading ? (
                    <div className="flex items-center justify-center">
                        <Loader className="animate-spin text-black text-9xl" />
                    </div>
                ) : (
                    <form onSubmit={updateTeacherData}>
                        <FormSection title="Update Teacher Data" icon={<User />}>
                            {/* Personal Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <InputField label="Teacher Name" name="teacherName" value={tData.teacherName || ""} onChange={handleChange} required maxLength={75} />
                                <InputField label="Date of Birth" name="dob" value={tData.dob || ""} onChange={handleChange} type="date" required />
                                <RadioGroup label="Gender" name="gender" options={["male", "female", "other"]} value={tData.gender || ""} onChange={handleChange} required />
                                <InputField label="Aadhar Number" name="aadharNumber" value={tData.aadharNumber || ""} onChange={handleChange} maxLength={12} required />

                                <SelectField label="Caste" name="caste" value={tData.caste || ""} onChange={handleChange} required options={["General", "OBC", "SC", "ST", "Other"]} />
                                <SelectField label="Marital Status" name="maritalStatus" value={tData.maritalStatus || ""} onChange={handleChange} options={["Married", "Unmarried"]} required />

                                <InputField label="Samagra ID" name="samagraId" value={tData.samagraId || ""} onChange={handleChange} maxLength={9} />
                                <InputField label="Teacher's Mobile Number" name="teacherMobile" value={tData.teacherMobile || ""} onChange={handleChange} maxLength={10} minLength={10} required />
                                <InputField label="Email ID" name="emailId" value={tData.emailId || ""} onChange={handleChange} maxLength={255} required />

                                <SelectField label="Blood Group" name="bloodGroup" value={tData.bloodGroup || ""} onChange={handleChange} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
                                <SelectField label="Religion" name="religion" value={tData.religion || ""} onChange={handleChange} options={["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Parsis"]} />

                                <InputField label="PAN Number" name="panNumber" value={tData.panNumber || ""} onChange={handleChange} required maxLength={10} />

                                <div className="md:col-span-2">
                                    <TextAreaField label="Address" name="address" value={tData.address || ""} onChange={handleChange} maxLength={100} />
                                </div>
                            </div>

                            {/* Family Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <InputField label="Father's Name" name="fatherName" value={tData.fatherName || ""} onChange={handleChange} required maxLength={75} />
                                <InputField label="Mother's Name" name="motherName" value={tData.motherName || ""} onChange={handleChange} required maxLength={75} />
                                {tData.maritalStatus === 'Married' && (
                                    <InputField label="Spouse's Name" name="spouseName" value={tData.spouseName || ""} onChange={handleChange} required maxLength={75} />
                                )}
                            </div>

                            {/* Experience */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <InputField label="Qualification" name="qualification" value={tData.qualification || ""} onChange={handleChange} required maxLength={100} />
                                <InputField label="Years of Experience" name="experience" value={tData.experience || ""} onChange={handleChange} type="number" required />
                            </div>

                            {/* Joining Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <InputField label="Employee ID" name="empId" value={tData.empId || ""} onChange={handleChange} />
                                <SelectField label="Designation" name="designation" value={tData.designation || ""} onChange={handleChange} options={["Principal", "PGT", "TGT", "PRT", "PTI", "Music Teacher", "Peone", "Lower Staff", "Gurd"]} required />
                                <InputField label="Date of Joining" name="doj" value={tData.doj || ""} onChange={handleChange} type="date" required />
                            </div>

                            {/* Bank Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                                <InputField label="Bank Account Number" name="accountNumber" value={tData.accountNumber || ""} onChange={handleChange} maxLength={30} />
                                <InputField label="Bank Name" name="bankName" value={tData.bankName || ""} onChange={handleChange} maxLength={50} />
                                <InputField label="Branch Name" name="branchName" value={tData.branchName || ""} onChange={handleChange} maxLength={100} />
                                <InputField label="IFSC Code" name="ifscCode" value={tData.ifscCode || ""} onChange={handleChange} maxLength={11} />
                            </div>
                        </FormSection>

                        <FormFooterActions primaryLabel="Update" cancel={closeEdit} />
                    </form>

                )}
            </div>
        </div>

    )
}