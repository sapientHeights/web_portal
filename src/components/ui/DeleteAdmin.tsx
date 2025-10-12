import { Delete } from "lucide-react";
import FormFooterActions from "./FormFooterActions";
import FormSection from "./FormSection";
import { SetStateAction } from "react";
import { UserData } from "@/types/user";
import toast from "react-hot-toast";

type Props = {
    setShowDeleteDialog : React.Dispatch<SetStateAction<boolean>>;
    userData: UserData | null; 
    admins: UserData[] | null;
    fetchAdmins: () => void;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
}

export default function DeleteAdmin({setShowDeleteDialog, userData, admins, fetchAdmins, setLoading} : Props) {
    const deleteAdmin = async (e:React.FormEvent) => {
        e.preventDefault();
        if(admins?.length === 1){
            toast.error("Atleast one admin is needed");
            return;
        }
        setLoading(true);
        const sendData = {
            adminData : {
                email: userData?.email
            }
        };
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteAdmin.php`, {
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
                toast.success('Admin deleted successfully');
                fetchAdmins();
                setShowDeleteDialog(false);
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
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
                <FormSection title="Delete User" icon={<Delete />} margin={false} >
                    <form onSubmit={deleteAdmin}>
                        <p>Are you sure you want to delete the admin - {userData?.name} ?</p>
                        <FormFooterActions primaryLabel="Yes" cancel={() => setShowDeleteDialog(false)}/>
                    </form>
                </FormSection>
            </div>
        </div>
    )
}