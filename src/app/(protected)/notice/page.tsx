'use client';

import Button from "@/components/ui/Button";
import FormFooterActions from "@/components/ui/FormFooterActions";
import FormSection from "@/components/ui/FormSection";
import FullPageLoader from "@/components/ui/FullPageLoader";
import Header from "@/components/ui/Header";
import InputField from "@/components/ui/InputField";
import NoDataSection from "@/components/ui/NoDataSection";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { useSessions } from "@/hooks/useSessions";
import { Book, Newspaper, Pencil, StepBack } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type NoticeData = {
    sessionId: string;
    date: string;
    title: string;
    subject: string;
    message: string;
}

export default function Notice() {
    const router = useRouter();
    const { user } = useUser();
    const [pageLoading, setPageLoading] = useState(false);
    const [category, setCategory] = useState('add');
    const [noticesData, setNoticesData] = useState<NoticeData[]>([]);

    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();

    const initialSelectionData = {
        sessionId: "", date: "", title: "", subject: "", message: ""
    }

    const [selectionData, setSelectionData] = useState(initialSelectionData);
    const [showNotices, setShowNotices] = useState(false);

    useEffect(() => {
        if(activeSession){
            setSelectionData(prev => ({
                ...prev,
                sessionId: activeSession
            }))
        }
    }, [activeSession, category])

    const goBack = () => {
        setPageLoading(true);
        router.back();
    }

    const reset = (showToast?: boolean) => {
        if (category === 'add') {
            if (JSON.stringify(selectionData) === JSON.stringify(initialSelectionData)) {
                if (showToast == null) {
                    toast.error("Nothing to clear!");
                }
                return;
            }
            setSelectionData(initialSelectionData);
        }
        else {
            if (selectionData.sessionId === '' && selectionData.date === '') {
                if (showToast == null) {
                    toast.error("Nothing to clear!");
                }
                return;
            }
            setSelectionData(initialSelectionData);
        }

        if (showToast == null) {
            toast.success("Fields cleared!");
        }
    }

    const handleCategoryClick = (category: string) => {
        reset(false);
        setCategory(category);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSelectionData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (category === 'add') {
            if(new Date(selectionData.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)){
                toast.error("Invalid date");
                return;
            }
            const noticeData = {
                sessionId: selectionData.sessionId,
                date: selectionData.date,
                title: selectionData.title,
                subject: selectionData.subject,
                message: selectionData.message
            }
            setPageLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/saveNotice.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        noticeData
                    }),
                });

                const data = await res.json();
                if (!data.error) {
                    toast.success("Notice saved successfully");
                }
                else {
                    toast.error("Failed to fetch Notice Data");
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
        else if (category === 'view') {
            setPageLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getNotices.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId: selectionData.sessionId,
                        date: selectionData.date
                    }),
                });

                const data = await res.json();
                if (!data.error) {
                    setNoticesData(data.noticesData);
                    setShowNotices(true);
                }
                else {
                    toast.error("Failed to fetch Notice Data");
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
    }

    const isLoading = pageLoading || sessionsLoading;
    if (isLoading) {
        return <FullPageLoader />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6 relative">
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />
            <UserInfo name={user ? user.name : 'Name'} role={user ? user.desc : 'Position'} />
            <Header title='Sapient Heights' info='Manage Notices for Sapient Heights' />

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-15">
                    <Button icon={<Pencil />} text="Add Notice" onClick={() => handleCategoryClick('add')} setGreen={category === 'add'} />
                    <Button icon={<Newspaper />} text="View Notice" onClick={() => handleCategoryClick('view')} setGreen={category === 'view'} />
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                <form onSubmit={handleSubmit}>
                    <FormSection title="Enter Details" icon={<Book />} margin={false}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <SelectField label="Session" name="sessionId" value={selectionData.sessionId} onChange={handleChange} options={sessions} required />
                            <InputField label="Date" name="date" type="date" value={selectionData.date} onChange={handleChange} required />
                            {category === 'add' && (
                                <>
                                    <InputField label="Title" name="title" type="text" value={selectionData.title} onChange={handleChange} maxLength={500} required />
                                    <InputField label="Subject" name="subject" type="text" value={selectionData.subject} onChange={handleChange} maxLength={500} required />
                                    <TextAreaField label="Message" name="message" value={selectionData.message} onChange={handleChange} required maxLength={1000} />

                                </>
                            )}
                        </div>
                        <FormFooterActions primaryLabel={category === 'add' ? 'Add Notice' : 'View Notice'} reset={reset} />
                    </FormSection>
                </form>
            </div>

            {category === 'view' && showNotices && (
                <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
                    <FormSection title="Notices" icon={<Newspaper />}>
                        <div className="overflow-auto max-h-[500px] rounded-lg border border-gray-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr className="text-left text-gray-700">
                                        <th className="p-3 border-b">S.No</th>
                                        <th className="p-3 border-b">Title</th>
                                        <th className="p-3 border-b">Subject</th>
                                        <th className="p-3 border-b">Message</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {noticesData && noticesData.length > 0 && noticesData.map((s, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 border-b text-black">
                                            <td className="p-3">{idx + 1}</td>
                                            <td className="p-3">{s.title}</td>
                                            <td className="p-3">{s.subject}</td>
                                            <td className="p-3">{s.message}</td>
                                        </tr>
                                    ))}

                                    {noticesData && noticesData.length === 0 && (
                                        <tr>
                                            <td className="p-8" colSpan={4}><NoDataSection /></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </FormSection>
                </div>
            )}

        </div>
    )
}