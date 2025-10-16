import { Loader, User } from "lucide-react";
import FormSection from "./FormSection";
import InputField from "./InputField";
import { StudentData } from "@/types/student";
import RadioGroup from "./RadioGroup";
import SelectField from "./SelectField";
import TextAreaField from "./TextAreaField";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { useSessions } from "@/hooks/useSessions";
import { SetStateAction, useEffect, useState } from "react";
import FormFooterActions from "./FormFooterActions";
import { toast } from "react-hot-toast";

type Props = {
    studentData: StudentData;
    setEdit: React.Dispatch<SetStateAction<boolean>>;
    id: string | null;
    getData : () => Promise<void>;
    closeDialog: () => void;
}

export default function UpdateStudentData({ studentData, setEdit, id, getData, closeDialog }: Props) {
    const [stdData, setStdData] = useState<StudentData>(studentData);

    const [pageLoading, setPageLoading] = useState(false);
    const { classes, isLoading: classesLoading } = useClasses();
    const { sections, isLoading: sectionsLoading } = useSections(studentData.studentClass);
    const { sessions, isLoading: sessionsLoading } = useSessions();

    useEffect(() => {
        if(!studentData) return;
        const value = stdData.gender === 'm' ? "male" : stdData.gender === 'f' ? "female" : "other";
        setStdData(prev => ({ ...prev, gender: value }));
    }, [studentData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "aadharNumber" || name === "fatherMobile" || name === "motherMobile" || name === "studentMobile") {
            let currentValue = value;
            if (value.length > 1) {
                currentValue = value[value.length - 1].toLowerCase();
            }
            if (currentValue >= 'a' && currentValue <= 'z') {
                toast.error("Please enter number only");
                return;
            }
        }
        setStdData(prev => ({ ...prev, [name]: value }));
    };

    const closeEdit = () => {
        setEdit(false);
    }

    const updateStdData = async (e: React.FormEvent) => {
        e.preventDefault();
        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateStdData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stdData,
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

    const loading = pageLoading || sessionsLoading || classesLoading || sectionsLoading;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full overflow-y-auto max-h-[90vh]">
                {loading ? (
                    <div className="flex items-center justify-center">
                        <Loader className="animate-spin text-black text-9xl" />
                    </div>
                ) : (
                    <form onSubmit={updateStdData}>
                        <FormSection title="Update Student Data" icon={<User />}>
                            {/* Personal Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <InputField label="Student Name" name="studentName" value={stdData.studentName || ""} onChange={handleChange} required maxLength={75} />
                                <InputField label="Date of Birth" name="dob" value={stdData.dob || ""} onChange={handleChange} type="date" required />
                                <RadioGroup label="Gender" name="gender" options={["male", "female", "other"]} value={stdData.gender || "" } onChange={handleChange} required />
                                <InputField label="Aadhar Number" name="aadharNumber" value={stdData.aadharNumber || ""} onChange={handleChange} maxLength={12} required />
                                <SelectField label="Caste" name="caste" value={stdData.caste || ""} onChange={handleChange} required options={["General", "OBC", "SC", "ST", "Other"]} />
                                <InputField label="Samagra ID" name="samagraId" value={stdData.samagraId || ""} onChange={handleChange} maxLength={9} />
                            </div>

                            {/* Contact Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <InputField label="Student's Mobile Number" name="studentMobile" value={stdData.studentMobile || ""} onChange={handleChange} maxLength={10} minLength={10} />
                                <InputField label="Email ID" name="emailId" value={stdData.emailId || ""} onChange={handleChange} type="email" maxLength={255} />
                                <TextAreaField label="Address" name="address" value={stdData.address || ""} onChange={handleChange} required maxLength={100} />
                            </div>

                            {/* Parent Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <InputField label="Father's Name" name="fatherName" value={stdData.fatherName || ""} onChange={handleChange} required maxLength={75} />
                                <InputField label="Mother's Name" name="motherName" value={stdData.motherName || ""} onChange={handleChange} required maxLength={75} />
                                <InputField label="Father's Mobile Number" name="fatherMobile" value={stdData.fatherMobile || ""} onChange={handleChange} required maxLength={10} minLength={10} />
                                <InputField label="Mother's Mobile Number" name="motherMobile" value={stdData.motherMobile || ""} onChange={handleChange} maxLength={10} minLength={10} />
                                <InputField label="Father's Occupation" name="fatherOccupation" value={stdData.fatherOccupation || ""} onChange={handleChange} maxLength={100} />
                            </div>

                            {/* Academic Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <SelectField label="Session" name="sessionId" value={stdData.sessionId || ""} onChange={handleChange} options={sessions} required />
                                <SelectField label="Class" name="studentClass" value={stdData.studentClass || ""} onChange={handleChange} options={classes} required />
                                <SelectField label="Section" name="section" value={stdData.section || ""} onChange={handleChange} options={sections} required disabled={studentData.studentClass === ""} />
                            </div>

                            {/* Bank Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <InputField label="Bank Account Number" name="accountNumber" value={stdData.accountNumber || ""} onChange={handleChange} maxLength={30} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-center">
                                <InputField label="Bank Name" name="bankName" value={stdData.bankName || ""} onChange={handleChange} maxLength={50} />
                                <InputField label="Branch Name" name="branchName" value={stdData.branchName || ""} onChange={handleChange} maxLength={100} />
                                <InputField label="IFSC Code" name="ifscCode" value={stdData.ifscCode || ""} onChange={handleChange} maxLength={11} />
                            </div>
                        </FormSection>

                        <FormFooterActions primaryLabel="Update" cancel={closeEdit} />
                    </form>
                )}
            </div>
        </div>

    )
}