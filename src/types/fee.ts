export type FeeData = {
    sessionId: string;
    sId: string;
    classId: string;
    section: string;
    fee: number;
    discount: number;
    paid: number;
    studentName: string;
}

export type ClassFeeData = {
    classId: string;
    fee: number;
}