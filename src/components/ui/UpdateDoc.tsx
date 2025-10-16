import { Camera, Upload } from "lucide-react";
import FileUpload from "./FileUpload";
import toast from "react-hot-toast";
import { SetStateAction, useState } from "react";
import FormSection from "./FormSection";
import FormFooterActions from "./FormFooterActions";

type Props = {
    id: string | null;
    fileLabel: string | null;
    fileName: string | null;
    displayName: string | null;
    setDocEdit: React.Dispatch<SetStateAction<boolean>>;
    type: string | null;
    getData : () => Promise<void>;
    closeDialog: () => void;
}

export default function UpdateDoc({ id, fileLabel, fileName, displayName, setDocEdit, type, getData, closeDialog }: Props) {
    const [doc, setDoc] = useState<{ [key: string]: File | null }>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const file = e.target.files?.[0];

        if (file) {
            const maxSizeInBytes = 3 * 1024 * 1024; //3 MB
            if (file.size > maxSizeInBytes) {
                toast.error("File Size exceeded 3MB");
                return;
            }

            if (file.name.length > 100) {
                toast.error("File name is too long. Please use a shorter name.");
                return;
            }

            setDoc((prev) => ({
                ...prev,
                [name]: file,
            }));
        }
    };

    const updateFile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !fileLabel || !type) {
            toast.error("Some error occurred: Missing ID or fileLabel");
            return;
        }

        const file = doc[fileLabel];
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        const dataToSend = new FormData();

        if(type === 'students'){
            dataToSend.append('sId', id);
        }
        else if(type === 'teachers'){
            dataToSend.append('tId', id);
        }

        dataToSend.append('fileLabel', fileLabel);
        if (fileName) {
            dataToSend.append('oldFileName', fileName);
        }
        dataToSend.append('file', file);

        const apiFileName = type === 'students' ? 'updateStudentDoc' : 'updateTeacherDoc';

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${apiFileName}.php`, {
                method: 'POST',
                body: dataToSend
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("File Updated Successfully");
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
    }

    if (id === null || fileLabel === null || displayName === null || type === null) {
        return;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full overflow-y-auto max-h-[90vh]">
                <form onSubmit={updateFile}>
                    <FormSection title="Upload File" icon={<Upload />} margin={false}>
                        <div className="grid grid-cols-1">
                            <FileUpload label={displayName} name={fileLabel} onChange={handleFileChange} icon={<Camera />} files={doc} required />
                        </div>
                        <FormFooterActions primaryLabel="Upload" cancel={() => setDocEdit(false)} />
                    </FormSection>
                </form>
            </div>
        </div>
    )
}