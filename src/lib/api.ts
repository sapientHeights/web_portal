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
            const classes = (data.classesData.map((item: { classId: string }) => item.classId));
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

export const fetchSectionsByClass = async (classId: string) => {
    try {
        const res = await fetch('/api/getSectionsByClass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                classId
            })
        });
        const data = await res.json();
        if (!data.error && data.sectionsData) {
            const sections = (data.sectionsData.map((item: { section: string }) => item.section));
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
            const activeSession = data.sessionsData.filter((session: {sessionId: string, isActive: number}) => session.isActive === 1)[0].sessionId;
            return { success: true, sessions, activeSession };
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

export const fetchSubjectsByClass = async (classId: string) => {
    try {
        const res = await fetch('/api/getSubjectsByClass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                classId
            })
        });
        const data = await res.json();
        if (!data.error && data.subjectsData) {
            const subjects = (data.subjectsData.map((item: { subjectId: string }) => item.subjectId));
            return {success: true, subjects};
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