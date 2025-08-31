import { fetchSectionsByClass } from "@/lib/api";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";

export const useSections = (class_id: string) => {
    const [sections, setSections] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getSectionsData = async () => {
        if (!class_id) return;
        setIsLoading(true);

        const result = await fetchSectionsByClass(class_id);
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
    }, [class_id]);

    return { sections, isLoading, refresh: getSectionsData }
}