import { useEffect, useState } from "react";
import { fetchSubjectsByClass } from "@/lib/api";

export const useCommonSubjects = (classIds: string[]) => {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadSubjects = async () => {
            if (!classIds || classIds.length === 0) {
                setSubjects([]);
                return;
            }

            setIsLoading(true);

            try {
                const results = await Promise.all(
                    classIds.map(id => fetchSubjectsByClass(id))
                );

                const subjectsArray = results
                    .filter(res => res.success && res.subjects)
                    .map(res => res.subjects as string[]);

                if (subjectsArray.length === 0) {
                    setSubjects([]);
                    return;
                }

                const commonSubjects = subjectsArray.reduce((acc, curr) =>
                    acc.filter(sub => curr.includes(sub))
                );

                setSubjects(commonSubjects);
            } catch (err) {
                console.error(err);
                setSubjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadSubjects();
    }, [classIds]);

    return { subjects, isLoading };
};