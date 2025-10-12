import { UserData } from "@/types/user";
import FormFooterActions from "./FormFooterActions";
import FormSection from "./FormSection";
import InputField from "./InputField";
import { ReactNode } from "react";

type Props = {
    sectionTitle: string;
    formSubmitFunction: (e: React.FormEvent) => void;
    userData : UserData | null;
    handleChangeFunction: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: ReactNode;
    footerPrimaryLabel: string;
    cancelFunction: () => void;
    disableEmail? : boolean;
}

export default function AdminDataDialog({sectionTitle, formSubmitFunction, userData, handleChangeFunction, icon, footerPrimaryLabel, cancelFunction, disableEmail} : Props) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
                <FormSection title={sectionTitle} icon={icon} margin={false} >
                    <form onSubmit={formSubmitFunction}>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField label="Enter email" type="email" name="email" value={userData ? userData.email : ''} onChange={handleChangeFunction} disabled={disableEmail} required />
                            <InputField label="Enter name" name="name" value={userData ? userData.name : ''} onChange={handleChangeFunction} required />
                            <InputField label="Enter description" name="desc" value={userData ? userData.desc : ''} onChange={handleChangeFunction} />
                            <InputField label="Enter Role" name="role" value="A" onChange={() => { }} disabled />
                        </div>
                        <FormFooterActions primaryLabel={footerPrimaryLabel} cancel={cancelFunction} />
                    </form>
                </FormSection>
            </div>
        </div>
    )
}