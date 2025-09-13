import { fetchSectionsByClass } from "@/lib/api";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";

export const useSections = (classId: string) => {
    const [sections, setSections] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getSectionsData = async () => {
        if (!classId) return;
        setIsLoading(true);

        const result = await fetchSectionsByClass(classId);
        if (result.success && result.sections) {
            setSections(result.sections);
        }
        else {
            toast.error("Failed to get classes data");
        }

        setIsLoading(false);
    }

    useEffect(() => {
        getSectionsData();
    }, [classId]);

    return { sections, isLoading, refresh: getSectionsData }
}