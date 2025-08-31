import { fetchClasses } from "@/lib/api";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";

export const useClasses = () => {
    const [classes, setClasses] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
   
    const getClassesData = async () => {
        const result = await fetchClasses();
        if(result.success && result.classes){
            setClasses(result.classes);
        }
        else{
            toast.error("Failed to get classes data");
        }

        setIsLoading(false);
    }

    useEffect(() => {
        getClassesData();
    }, [])

    return { classes, isLoading, refresh: getClassesData };
}