export const TERM_OPTIONS = ["Term 1", "Term 2", "Term 3"];
export const EXAM_TYPE_OPTIONS = ["Theory", "Conceptual Test", "Activity", "Attendance", "Dictation"];

export const SINGLE_MARK_SUBJECTS = ["GK", "Art", "Reading/Writing", "Dance/Music", "Sports", "Phonics Sound"];
export const SINGLE_MARK_EXAM_TYPE = "Quiz";

export const DEFAULT_MAX_MARKS: Record<string, string> = {
    Theory: "50",
    "Conceptual Test": "20",
    Activity: "10",
    Attendance: "10",
    Dictation: "10",
};

export const EXAM_TYPE_STYLES: Record<string, string> = {
    Theory: "bg-blue-100 text-blue-700",
    "Conceptual Test": "bg-purple-100 text-purple-700",
    Activity: "bg-green-100 text-green-700",
    Attendance: "bg-amber-100 text-amber-700",
    Dictation: "bg-pink-100 text-pink-700",
};

export const EXAM_TYPE_EXCEL_COLORS: Record<string, string> = {
    Theory: "DBEAFE",
    "Conceptual Test": "E9D5FF",
    Activity: "DCFCE7",
    Attendance: "FEF3C7",
    Dictation: "FCE7F3",
};

export const ATTENDANCE_OPTIONS = ["Present", "Absent", "Leave"];
export const ATTENDANCE_CODE: Record<string, string> = {
    Present: "P",
    Absent: "A",
    Leave: "L",
};

export const ATTENDANCE_LABEL: Record<string, string> = {
    P: "Present",
    A: "Absent",
    L: "Leave",
};