import { ShieldUser } from "lucide-react";
import { SetStateAction } from "react";
import AdminDataDialog from "./AdminDataDialog";
import { toast } from "react-hot-toast";
import { UserData } from "@/types/user";

type Props = {
    userData: UserData | null;
    setUserData: React.Dispatch<SetStateAction<UserData | null>>;
    setShowDialog: React.Dispatch<SetStateAction<boolean>>;
    fetchAdmins: () => void;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
}

export default function EditAdmin({ userData, setUserData, setShowDialog, fetchAdmins, setLoading }: Props) {

    const removeEditAdmin = () => {
        setShowDialog(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData(prev => {
            if(prev === null){
                return {email : '', name: '', role: 'A', desc: '', firstLogin: 1}
            }
            return {...prev, [name]: value};
        });
    }

    const editAdmin = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        const sendData = {
            adminData : {
                email: userData?.email,
                name: userData?.name,
                desc: userData?.desc
            }
        };
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateAdmin.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendData),
            });

            const data = await res.json();
            if(data.error){
                toast.error(data.message);
            }
            else{
                toast.success('Admin updated successfully');
                fetchAdmins();
                setShowDialog(false);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <AdminDataDialog
            sectionTitle="Edit Admin"
            formSubmitFunction={editAdmin}
            userData={userData}
            handleChangeFunction={handleChange}
            icon={<ShieldUser />}
            footerPrimaryLabel="Update Admin"
            cancelFunction={removeEditAdmin}
            disableEmail={true}
        />
    )
}