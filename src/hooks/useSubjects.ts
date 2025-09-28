import { fetchSubjectsByClass } from "@/lib/api";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";

export const useSubjects = (classId: string) => {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getSubjectsData = async () => {
        if (!classId) return;
        setIsLoading(true);

        const result = await fetchSubjectsByClass(classId);
        if (result.success && result.subjects) {
            setSubjects(result.subjects);
        }
        else {
            toast.error("Failed to get sections data");
        }

        setIsLoading(false);
    }

    useEffect(() => {
        getSubjectsData();
    }, [classId]);

    return { subjects, isLoading, refresh: getSubjectsData }
}