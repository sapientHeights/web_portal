export const fetchClasses = async () => {
    try {
        const res = await fetch('/api/getClasses', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await res.json();
        if (data.success && data.classesData) {
            const classes = (data.classesData.map((item: { class_id: string }) => item.class_id));
            return { success: true, classes };
        }
        else {
            return { success: false };
        }
    }
    catch (e) {
        console.log(e);
        return { success: false };
    }
}

export const fetchSectionsByClass = async (class_id: string) => {
    try {
        const res = await fetch('/api/getSectionsByClass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                class_id
            })
        });
        const data = await res.json();
        if (data.success && data.sectionsData) {
            const sections = (data.sectionsData.map((item: { section_id: string }) => item.section_id));
            return {success: true, sections};
        }
        else {
            return { success: false };
        }
    }
    catch (e) {
        console.log(e);
        return { success: false };
    }
}

export const fetchSessions = async () => {
    try {
        const res = await fetch('/api/getSessions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await res.json();
        if (data.success && data.sessionsData) {
            const sessions = (data.sessionsData.map((item: { sessionId: string }) => item.sessionId));
            return { success: true, sessions };
        }
        else {
            return { success: false };
        }
    }
    catch (e) {
        console.log(e);
        return { success: false };
    }
}