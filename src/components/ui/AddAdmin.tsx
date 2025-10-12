import { ShieldUser } from "lucide-react";
import { SetStateAction, useState } from "react";
import AdminDataDialog from "./AdminDataDialog";
import toast from "react-hot-toast";
import { UserData } from "@/types/user";

type Props = {
    setShowDialog: React.Dispatch<SetStateAction<boolean>>;
    fetchAdmins: () => void;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
}

export default function AddAdmin({ setShowDialog, fetchAdmins, setLoading }: Props) {
    const [userData, setUserData] = useState<UserData | null>(null);

    const removeAddAdmin = () => {
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

    const addAdmin = async (e: React.FormEvent) => {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addAdmin.php`, {
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
                toast.success('Admin added successfully');
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
            sectionTitle="Add Admin"
            formSubmitFunction={addAdmin}
            userData={userData}
            handleChangeFunction={handleChange}
            icon={<ShieldUser />}
            footerPrimaryLabel="Add Admin"
            cancelFunction={removeAddAdmin}
        />
    )
}