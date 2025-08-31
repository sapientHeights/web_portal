import { fetchSessions } from "@/lib/api";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";

export const useSessions = () => {
    const [sessions, setSessions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getSessionsData = async () => {
        const result = await fetchSessions();
        if (result.success && result.sessions) {
            setSessions(result.sessions);
        }
        else {
            toast.error("Failed to get classes data");
        }

        setIsLoading(false);
    }

    useEffect(() => {
        getSessionsData();
    }, []);

    return { sessions, isLoading, refresh: getSessionsData }
}