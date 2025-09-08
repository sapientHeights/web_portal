import { Eye } from "lucide-react";

type Props = {
    required?: boolean;
    accept?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
    name: string;
    label: string;
    icon: React.ReactNode;
    files: {
        [key: string] : File | null;
    }
}

const openFile = (files: Props["files"], name: Props["name"]) => {
    const fileUrl = URL.createObjectURL(files[name] as File);
    window.open(fileUrl, '_blank');
}

export default function FileUpload({ required = false,
    accept = ".pdf,.jpg,.jpeg,.png",
    onChange,
    name,
    label,
    icon,
    files }: Props) {
    return (
        <div>
            <label className="block text-sm font-bold tracking-wide text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-5 text-center transition-all duration-300 cursor-pointer hover:border-indigo-500 hover:bg-indigo-100/10">
                <div className="text-2xl mb-2 flex justify-center">
                    <span role="img" className="bg-indigo-500 text-white p-3 rounded-md" aria-label="info">{icon}</span>
                </div>
                <span className="text-gray-600 text-sm">{!files[name] ? ('Click to upload (Max Size - 3 MB)') : (<>Uploaded {label} <Eye onClick={() => openFile(files, name)} className="inline-block w-4 h-4 hover:text-green-500" /> </>)}</span>
                <input
                    type="file"
                    required={required}
                    accept={accept}
                    onChange={(e) => onChange(e, name)}
                    className="opacity-0"
                />
            </label>
        </div>
    )
}