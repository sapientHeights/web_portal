import FormFooterActions from "./FormFooterActions";
import FormSection from "./FormSection";
import InputField from "./InputField";
import { ReactNode, SetStateAction, useEffect } from "react";

type NewSessionData = {
    startYear: string;
    endYear: string;
    sessionId: string;
    remark: string;
}

type Props = {
    sectionTitle: string;
    formSubmitFunction: (e: React.FormEvent) => void;
    sessionData: NewSessionData;
    setSessionData: React.Dispatch<SetStateAction<NewSessionData>>;
    icon: ReactNode;
    footerPrimaryLabel: string;
    cancelFunction: () => void;
}

export default function AddSessionDialog({ sectionTitle, formSubmitFunction, sessionData, setSessionData, icon, footerPrimaryLabel, cancelFunction }: Props) {
    const handleChangeFunction = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSessionData(prev => {
            return { ...prev, [name]: value };
        });
    }

    useEffect(() => {
        const createSessionId = () => {
            let sessionId = '';

            if(sessionData.startYear == '' || sessionData.endYear == ''){
                sessionId = '';
            }
            else sessionId = `${sessionData.startYear}-${sessionData.endYear}`;

            setSessionData(prev => {
                return {...prev, ['sessionId']: sessionId};
            });
        }

        createSessionId();
    }, [sessionData.startYear, sessionData.endYear]);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
                <FormSection title={sectionTitle} icon={icon} margin={false} >
                    <form onSubmit={formSubmitFunction}>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField label="Enter Session Year (Start)" type="number" name="startYear" value={sessionData.startYear} onChange={handleChangeFunction} required />
                            <InputField label="Enter Session Year (End)" type="number" name="endYear" value={sessionData.endYear} onChange={handleChangeFunction} required />

                            {(sessionData.startYear != '' && sessionData.endYear != '') && (
                                <p className="bg-green-600 text-white px-2 py-1 w-fit rounded-xl">Session Id: {`${sessionData.startYear}-${sessionData.endYear}`}</p>
                            )}

                            <InputField label="Enter Remark" name="remark" value={sessionData.remark} onChange={handleChangeFunction} />
                        </div>
                        <FormFooterActions primaryLabel={footerPrimaryLabel} cancel={cancelFunction} />
                    </form>
                </FormSection>
            </div>
        </div>
    )
}