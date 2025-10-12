import { ShieldUser, ArrowRight, Delete } from "lucide-react";
import Button from "./Button";
import FormSection from "./FormSection";
import NoDataSection from "./NoDataSection";
import { SetStateAction, useState } from "react";
import AddAdmin from "./AddAdmin";
import EditAdmin from "./EditAdmin";
import { UserData } from "@/types/user";
import DeleteAdmin from "./DeleteAdmin";

type Props = {
    admins: UserData[] | null;
    fetchAdmins: () => void;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
}

export default function ShowAdmins({ admins, fetchAdmins, setLoading }: Props) {
    const [showDialog, setShowDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false); 
    const [selectedAdmin, setSelectedAdmin] = useState<UserData | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const openEditDialog = (admin : UserData) => {
        setSelectedAdmin(admin);
        setShowEditDialog(true);
    }

    const openDeleteDialog = (admin: UserData) => {
        setSelectedAdmin(admin);
        setShowDeleteDialog(true);
    }

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
            {admins && admins.length === 0 ? (
                <NoDataSection />
            ) : (
                <FormSection title="All Admins" icon={<ShieldUser />} margin={false} >
                    <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
                        <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                <tr>
                                    <th className="px-6 py-4">S.No.</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-1 py-4"></th>
                                    <th className="px-1 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-center">
                                {admins && admins.map((data, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4">{data.name}</td>
                                        <td className="px-6 py-4">{data.email}</td>
                                        <td className="px-6 py-4">{data.desc}</td>
                                        <td className="px-1 py-4 text-red-500 cursor-pointer" onClick={() => openDeleteDialog(data)}>{<Delete size={12} />}</td>
                                        <td className="px-1 py-4 text-green-500 cursor-pointer" onClick={() => openEditDialog(data)}>{<ArrowRight size={12} />}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6">
                        <Button text="Add Admin" icon={<ShieldUser />} setGreen={true} onClick={() => setShowDialog(true)} />
                    </div>
                </FormSection >
            )}

            {showDialog && (
                <AddAdmin setShowDialog={setShowDialog} fetchAdmins={fetchAdmins} setLoading={setLoading} />
            )}

            {selectedAdmin && showEditDialog && (
                <EditAdmin userData={selectedAdmin} setUserData={setSelectedAdmin} setShowDialog={setShowEditDialog} fetchAdmins={fetchAdmins} setLoading={setLoading} />
            )}

            {selectedAdmin && showDeleteDialog && (
                <DeleteAdmin setShowDeleteDialog={setShowDeleteDialog} userData={selectedAdmin} admins={admins} fetchAdmins={fetchAdmins} setLoading={setLoading} />
            )}
        </div >
    )
}