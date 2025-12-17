import { fetchSessions } from "@/lib/api";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";

export const useSessions = () => {
    const [sessions, setSessions] = useState<string[]>([]);
    const [activeSession, setActiveSession] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);

    const getSessionsData = async () => {
        const result = await fetchSessions();
        
        if (result.success && result.sessions && result.activeSession) {
            setSessions(result.sessions);
            setActiveSession(result.activeSession);
        }
        else {
            toast.error("Failed to get sessions");
        }

        setIsLoading(false);
    }

    useEffect(() => {
        getSessionsData();
    }, []);

    return { sessions, isLoading, activeSession, refresh: getSessionsData }
}